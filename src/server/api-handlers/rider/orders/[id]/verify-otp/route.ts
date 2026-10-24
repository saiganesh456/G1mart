export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { verifyDeliveryOtp } from '@/lib/deliveryOtp';
import { verifyRiderOrAdminRequest } from '@/lib/authGuard';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyRiderOrAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Rider or admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { otp, riderIdentifier, cashCollected } = body;

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ success: false, error: 'Please enter 4-digit OTP' }, { status: 400 });
    }

    if (id.startsWith('SLIP-')) {
      const slip = await serverSlipOrders.getSlipOrderById(id);
      if (!slip) {
        return NextResponse.json({ success: false, error: 'Slip order not found' }, { status: 404 });
      }

      if (slip.status === 'DELIVERED') {
        return NextResponse.json({ success: true, message: 'Order already delivered', order: slip });
      }

      // Check max attempts
      if ((slip.otp_attempts || 0) >= 5) {
        return NextResponse.json({
          success: false,
          error: 'Too many incorrect attempts. Please contact Hub Manager for authorization.',
        }, { status: 429 });
      }

      const isValid = verifyDeliveryOtp(otp, slip.delivery_otp, slip.customer_phone);
      if (!isValid) {
        slip.otp_attempts = (slip.otp_attempts || 0) + 1;
        await serverSlipOrders.updateDeliveryStatus(id, 'OUT_FOR_DELIVERY', riderIdentifier || 'Rider');
        return NextResponse.json({
          success: false,
          error: `Incorrect OTP. ${5 - (slip.otp_attempts || 0)} attempts remaining.`,
        }, { status: 400 });
      }

      // Valid OTP -> Complete Delivery!
      slip.status = 'DELIVERED';
      slip.delivered_at = new Date().toISOString();
      if (slip.payment_status === 'COD_PENDING' || cashCollected) {
        slip.payment_status = 'completed';
      }

      serverSlipOrders.addStatusHistory(
        slip,
        'DELIVERED',
        `Doorstep delivery verified via OTP by ${riderIdentifier || 'Rider'}${cashCollected ? ' (Cash Collected)' : ''}`,
        riderIdentifier || 'Rider'
      );

      await serverSlipOrders.saveOrder(slip);
      const finalOrder = serverSlipOrders.convertToStandardOrder(slip, 'Delivered');
      serverOrderStore.registerOrder(finalOrder);

      // Trigger Web Push to customer
      try {
        const { serverPushService } = await import('@/lib/serverPushService');
        await serverPushService.sendCustomNotification({
          title: '✅ Order Delivered!',
          body: `Your G1mart order #${id} was delivered successfully. Enjoy your groceries!`,
          tag: `delivered-${id}`,
          url: `/orders/${id}`,
        });
      } catch (err) {}

      return NextResponse.json({
        success: true,
        message: 'Delivery verified successfully via OTP',
        order: finalOrder,
      });
    } else {
      let order = serverOrderStore.getOrder(id);
      if (!order) {
        serverOrderStore.loadFromDisk();
        order = serverOrderStore.getOrder(id);
      }

      if (!order && body.orderFallback) {
        serverOrderStore.cacheOrder(body.orderFallback);
        order = serverOrderStore.getOrder(id);
      }

      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      if (order.status === 'Delivered') {
        return NextResponse.json({ success: true, message: 'Order already delivered', order });
      }

      if ((order.otpAttempts || 0) >= 5) {
        return NextResponse.json({
          success: false,
          error: 'Too many incorrect attempts. Please contact Hub Manager for authorization.',
        }, { status: 429 });
      }

      const customerPhone = order.address?.mobileNumber || order.address?.phone;
      const isValid = verifyDeliveryOtp(otp, order.deliveryOtp, customerPhone);
      if (!isValid) {
        order.otpAttempts = (order.otpAttempts || 0) + 1;
        serverOrderStore.cacheOrder(order);
        return NextResponse.json({
          success: false,
          error: `Incorrect OTP. ${5 - (order.otpAttempts || 0)} attempts remaining.`,
        }, { status: 400 });
      }

      // Valid OTP -> Mark Delivered via updateOrderStatus (updates memory, disk, and Supabase)
      const updateRes = await serverOrderStore.updateOrderStatus(id, 'Delivered', riderIdentifier);
      const deliveredOrder = updateRes.order || order;
      if (!deliveredOrder.isPaid && (cashCollected || deliveredOrder.paymentMethod === 'Cash on Delivery')) {
        deliveredOrder.isPaid = true;
        deliveredOrder.paymentStatus = 'completed';
        deliveredOrder.paidAmount = deliveredOrder.grandTotal;
        deliveredOrder.paidAt = new Date().toISOString();
        serverOrderStore.cacheOrder(deliveredOrder);
      }

      // Trigger Web Push to customer
      try {
        const { serverPushService } = await import('@/lib/serverPushService');
        await serverPushService.sendCustomNotification({
          title: '✅ Order Delivered!',
          body: `Your G1mart order #${id} was delivered successfully. Enjoy your groceries!`,
          tag: `delivered-${id}`,
          url: `/orders/${id}`,
        });
      } catch (err) {}

      return NextResponse.json({
        success: true,
        message: 'Delivery verified successfully via OTP',
        order: deliveredOrder,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
