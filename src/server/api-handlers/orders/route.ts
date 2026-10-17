export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { serverPushService } from '@/lib/serverPushService';
import { sanitizeIndianPhone } from '@/lib/phone';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    // Enforce data isolation: Never dump all store orders on public customer endpoints
    if (!userId && !cleanPhone) {
      return NextResponse.json({
        success: true,
        orders: [],
        count: 0,
        message: 'Please provide userId or phone number to retrieve personal orders.',
      });
    }

    const standardOrders = serverOrderStore.getUserOrders(userId, cleanPhone);

    let slipOrdersFormatted: any[] = [];
    try {
      const allSlips = await serverSlipOrders.getSlipOrders();
      const matchedSlips = allSlips.filter((s) => {
        if (cleanPhone) {
          const sPhone = (s.customer_phone || '').replace(/\D/g, '').slice(-10);
          return sPhone === cleanPhone;
        }
        return false;
      });

      slipOrdersFormatted = matchedSlips.map((slipOrder) => ({
        id: slipOrder.id,
        orderNumber: slipOrder.id,
        date: new Date(slipOrder.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: slipOrder.status,
        type: 'slip',
        orderType: slipOrder.order_type,
        subtotal: slipOrder.subtotal,
        estimatedTotal: slipOrder.estimated_total,
        finalTotal: slipOrder.final_total,
        grandTotal: slipOrder.final_total || slipOrder.estimated_total,
        total: slipOrder.final_total || slipOrder.estimated_total,
        deliveryFee: slipOrder.delivery_fee,
        codFee: slipOrder.cod_fee,
        paymentMethod: slipOrder.payment_method || 'Cash on Delivery',
        paymentStatus: slipOrder.payment_status,
        isPaid: slipOrder.payment_status === 'paid' || slipOrder.payment_status === 'completed',
        items: (slipOrder.items || []).map((it) => ({
          id: it.id,
          productId: it.product_id,
          productName: it.name,
          unit: it.unit,
          price: it.price,
          quantity: it.packed_qty || it.requested_qty,
          requestedQty: it.requested_qty,
          packedQty: it.packed_qty,
          available: it.available,
          substituteNote: it.substitute_note,
          image: '/products/placeholder.svg',
        })),
        images: slipOrder.images,
        address: {
          fullName: slipOrder.customer_name,
          phone: slipOrder.customer_phone,
          mobileNumber: slipOrder.customer_phone,
          streetArea: slipOrder.address,
          city: 'Nellore',
        },
        distance_km: slipOrder.distance_km,
        eta_min: slipOrder.eta_min,
        zone_min_order: slipOrder.zone_min_order,
        customerNote: slipOrder.customer_note,
        assignedRider: slipOrder.assigned_rider_name
          ? {
              id: slipOrder.assigned_rider_id,
              name: slipOrder.assigned_rider_name,
              phone: slipOrder.assigned_rider_phone,
            }
          : undefined,
      }));
    } catch (slipErr) {
      console.warn('[api/orders] Slip orders fetch error:', slipErr);
    }

    const mergedMap = new Map<string, any>();
    for (const order of standardOrders) {
      if (order?.id) mergedMap.set(order.id, order);
    }
    for (const slip of slipOrdersFormatted) {
      if (slip?.id && !mergedMap.has(slip.id)) {
        mergedMap.set(slip.id, slip);
      }
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    return NextResponse.json({
      success: true,
      orders: merged,
      count: merged.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, error: 'Valid order data with id required' },
        { status: 400 }
      );
    }

    const registered = serverOrderStore.registerOrder(body);

    // Asynchronously notify all registered store managers / admins via Web Push
    // (Wakes up mobile phones even if screen is OFF or app is closed)
    try {
      serverPushService.notifyAdminsNewOrder(registered).catch((pushErr) => {
        console.warn('[api/orders] Admin push notify notice:', pushErr);
      });
      serverPushService.sendOrderPushNotification(registered, 'Order Placed').catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      order: registered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to register order' },
      { status: 500 }
    );
  }
}
