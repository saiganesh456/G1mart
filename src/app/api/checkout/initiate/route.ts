import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { razorpayAdapter } from '@/lib/payment/razorpayAdapter';
import { phonePeAdapter } from '@/lib/payment/phonepeAdapter';
import { sanitizeIndianPhone } from '@/lib/phone';
import { serverDistanceService } from '@/lib/serverDistanceService';
import { serverStoreSettings } from '@/lib/serverStoreSettings';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, address, paymentMethod = 'UPI', slot, userId, userEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty or missing items' },
        { status: 400 }
      );
    }

    const addressData = body.address || body.deliveryAddress;
    const rawPhone = addressData?.phone || addressData?.mobileNumber || body.userPhone;

    if (!addressData || !rawPhone) {
      return NextResponse.json(
        { success: false, error: 'Delivery address with contact phone is required' },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeIndianPhone(rawPhone);
    const fullName = addressData.fullName || addressData.name || body.userName || 'G1 Mart Customer';

    // Rule 3: Server recalculates the total from database prices (never trust client)
    let calculated;
    try {
      calculated = serverOrderStore.recalculateOrderTotal(items);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }

    // Distance, Serviceability & Distance-Based Zone Minimum Order Check
    const isPickup =
      body.orderType === 'pickup' ||
      addressData?.orderType === 'pickup' ||
      slot === 'Store Pickup' ||
      addressData?.id === 'store-pickup';

    let distanceKm = 0;
    let zoneMinOrder = 0;

    if (!isPickup) {
      const lat = addressData?.latitude ?? addressData?.lat ?? body.lat;
      const lng = addressData?.longitude ?? addressData?.lng ?? body.lng;

      if (typeof lat === 'number' && typeof lng === 'number') {
        const distResult = await serverDistanceService.calculateDistance(lat, lng);
        if (!distResult.serviceable) {
          return NextResponse.json(
            {
              success: false,
              error: 'Your delivery location is beyond our 30 km serviceable radius. Please select Store Pickup.',
            },
            { status: 400 }
          );
        }
        distanceKm = distResult.distance_km;
        zoneMinOrder = distResult.min_order;

        // Strict server minimum order validation against item subtotal
        if (calculated.subtotal < zoneMinOrder) {
          const diff = zoneMinOrder - calculated.subtotal;
          return NextResponse.json(
            {
              success: false,
              error: `Minimum order for your delivery zone (${distanceKm} km) is ₹${zoneMinOrder}. Please add ₹${diff} more.`,
            },
            { status: 400 }
          );
        }
      }
    }

    const orderId = `G1-${Math.floor(100000 + Math.random() * 900000)}`;
    const merchantOrderId = `MT_${orderId}_${Date.now()}`;
    const isCod =
      paymentMethod === 'Cash on Delivery' ||
      paymentMethod === 'Pay on delivery' ||
      paymentMethod?.toLowerCase() === 'cod';

    // Fetch server store settings to get configured COD fee (Rule 3: never trust client amounts)
    const storeSettings = await serverStoreSettings.getStoreSettings();
    const configuredCodFee = Number(storeSettings.cod_fee ?? 50);

    // Option 1: Pay on Delivery (adds server-configured COD handling fee)
    if (isCod) {
      const codFee = configuredCodFee;
      const finalGrandTotal = calculated.subtotal + codFee; // Delivery is FREE (0)

      const order = await serverOrderStore.createPendingOrder({
        orderId,
        merchantOrderId,
        items: calculated.items,
        subtotal: calculated.subtotal,
        deliveryFee: 0,
        taxes: calculated.taxes,
        grandTotal: finalGrandTotal,
        final_total: finalGrandTotal,
        cod_fee: codFee,
        address: { ...addressData, fullName, mobileNumber: cleanPhone, phone: cleanPhone },
        slot: slot || 'Standard Delivery',
        paymentMethod: 'Cash on Delivery',
        userId: userId || undefined,
        userEmail: userEmail || undefined,
        distance_km: distanceKm,
        zone_min_order: zoneMinOrder,
      });

      // Status becomes PLACED with payment_status = COD_PENDING (Phase 5 Rule 1)
      await serverOrderStore.confirmCodOrder(orderId);

      return NextResponse.json({
        success: true,
        orderId,
        providerOrderId: merchantOrderId,
        merchantOrderId,
        amountInPaise: Math.round(finalGrandTotal * 100),
        subtotal: calculated.subtotal,
        codFee,
        grandTotal: finalGrandTotal,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'COD_PENDING',
        redirectUrl: `/orders/${orderId}?placed=true`,
      });
    }

    // Option 2: Pay Online (UPI / Card via Razorpay TEST mode adapter)
    // Online payment adds NO fee (codFee = 0, deliveryFee = 0)
    const finalGrandTotal = calculated.subtotal;
    const amountInPaise = Math.round(finalGrandTotal * 100);

    const order = await serverOrderStore.createPendingOrder({
      orderId,
      merchantOrderId,
      items: calculated.items,
      subtotal: calculated.subtotal,
      deliveryFee: 0,
      taxes: calculated.taxes,
      grandTotal: finalGrandTotal,
      final_total: finalGrandTotal,
      cod_fee: 0,
      address: { ...addressData, fullName, mobileNumber: cleanPhone, phone: cleanPhone },
      slot: slot || 'Standard Delivery',
      paymentMethod: 'UPI',
      userId: userId || undefined,
      userEmail: userEmail || undefined,
      distance_km: distanceKm,
      zone_min_order: zoneMinOrder,
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const redirectUrl = `${baseUrl}/orders/${encodeURIComponent(orderId)}?paid=true`;
    const callbackUrl = `${baseUrl}/api/payment/callback?orderId=${encodeURIComponent(orderId)}`;

    const paymentResult = await razorpayAdapter.createPayment({
      orderId,
      merchantOrderId,
      amountInPaise,
      customerPhone: cleanPhone,
      customerName: fullName,
      redirectUrl,
      callbackUrl,
    });

    const activeKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Check payment initiation result
    if (!paymentResult.success || !paymentResult.providerOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || 'Failed to initialize payment gateway. Please retry or choose Cash on Delivery.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      providerOrderId: paymentResult.providerOrderId,
      merchantOrderId,
      amountInPaise,
      subtotal: calculated.subtotal,
      codFee: 0,
      grandTotal: finalGrandTotal,
      keyId: activeKeyId || 'rzp_test_simulated',
      currency: 'INR',
      redirectUrl: paymentResult.redirectUrl,
      paymentMethod: 'Pay Online',
      paymentStatus: 'pending',
      isTestFallback: paymentResult.isTestFallback || false,
      authNotice: paymentResult.authFailed
        ? 'Razorpay Merchant API credentials returned Authentication Failed. Test simulator active.'
        : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error initiating checkout' },
      { status: 500 }
    );
  }
}
