export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { generate4DigitOtp } from '@/lib/deliveryOtp';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const riderName = body.riderName || 'Express Rider';

    let deliveryOtp = generate4DigitOtp();
    let updatedOrder: any = null;

    if (id.startsWith('SLIP-')) {
      const slip = await serverSlipOrders.getSlipOrderById(id);
      if (!slip) {
        return NextResponse.json({ success: false, error: 'Slip order not found' }, { status: 404 });
      }

      deliveryOtp = slip.delivery_otp || generate4DigitOtp();
      slip.delivery_otp = deliveryOtp;
      slip.arrived_at_doorstep = true;
      slip.arrived_at = new Date().toISOString();

      if (slip.status !== 'DELIVERED') {
        slip.status = 'OUT_FOR_DELIVERY';
      }

      serverSlipOrders.addStatusHistory(
        slip,
        'OUT_FOR_DELIVERY',
        `Rider ${riderName} reached destination (Delivery PIN: ${deliveryOtp})`,
        riderName
      );

      await serverSlipOrders.saveOrder(slip);
      updatedOrder = serverSlipOrders.convertToStandardOrder(slip, 'Out for Delivery');
      serverOrderStore.registerOrder(updatedOrder);
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

      deliveryOtp = order.deliveryOtp || generate4DigitOtp();
      order.deliveryOtp = deliveryOtp;
      order.arrivedAtDoorstep = true;
      order.arrivedAt = new Date().toISOString();

      if (order.status !== 'Delivered') {
        order.status = 'Out for Delivery';
      }

      serverOrderStore.cacheOrder(order);
      updatedOrder = order;
    }

    // Trigger customer push notification if available
    try {
      const { serverPushService } = await import('@/lib/serverPushService');
      await serverPushService.sendRiderArrivedCustomerNotification({
        order: updatedOrder,
        riderName,
        deliveryOtp,
      });
    } catch (pushErr) {
      console.warn('[Arrived API] Push notice:', pushErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Rider marked reached destination',
      deliveryOtp,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
