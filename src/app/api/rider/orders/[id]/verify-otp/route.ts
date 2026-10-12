import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { verifyDeliveryOtp } from '@/lib/deliveryOtp';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

      const isValid = verifyDeliveryOtp(otp, slip.delivery_otp);
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

      // Trigger Web Push to customer
      try {
        const { serverPushService } = await import('@/lib/serverPushService');
        await serverPushService.sendCustomNotification({
          title: '✅ Order Delivered!',
          body: `Your G1 Mart order #${id} was delivered successfully. Enjoy your groceries!`,
          tag: `delivered-${id}`,
          url: `/orders/${id}`,
        });
      } catch (err) {}

      return NextResponse.json({
        success: true,
        message: 'Delivery verified successfully via OTP',
        order: slip,
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

      const isValid = verifyDeliveryOtp(otp, order.deliveryOtp);
      if (!isValid) {
        order.otpAttempts = (order.otpAttempts || 0) + 1;
        serverOrderStore.cacheOrder(order);
        return NextResponse.json({
          success: false,
          error: `Incorrect OTP. ${5 - (order.otpAttempts || 0)} attempts remaining.`,
        }, { status: 400 });
      }

      // Valid OTP -> Mark Delivered
      order.status = 'Delivered';
      order.deliveredAt = new Date().toISOString();
      if (!order.isPaid && (cashCollected || order.paymentMethod === 'Cash on Delivery')) {
        order.isPaid = true;
        order.paymentStatus = 'completed';
        order.paidAmount = order.grandTotal;
        order.paidAt = new Date().toISOString();
      }

      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      order.timeline = (order.timeline || []).map((t) =>
        t.status === 'Delivered' ? { ...t, time: timeStr, completed: true } : t
      );

      serverOrderStore.cacheOrder(order);

      // Trigger Web Push to customer
      try {
        const { serverPushService } = await import('@/lib/serverPushService');
        await serverPushService.sendCustomNotification({
          title: '✅ Order Delivered!',
          body: `Your G1 Mart order #${id} was delivered successfully. Enjoy your groceries!`,
          tag: `delivered-${id}`,
          url: `/orders/${id}`,
        });
      } catch (err) {}

      return NextResponse.json({
        success: true,
        message: 'Delivery verified successfully via OTP',
        order,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
