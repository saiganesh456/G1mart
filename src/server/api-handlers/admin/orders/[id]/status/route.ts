export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { verifyRiderOrAdminRequest } from '@/lib/authGuard';
import type { OrderStatus } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyRiderOrAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Authorization required' },
        { status: auth.status || 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, staffIdentifier, assignedRider, otp } = body;

    const validStatuses: OrderStatus[] = [
      'Order Placed',
      'Confirmed',
      'Packing',
      'Packed',
      'Rider Assigned',
      'Order Dispatched',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // STRICT RULE: Marking an order as Delivered REQUIRES customer delivery OTP confirmation!
    // The admin panel cannot arbitrarily mark as delivered without the customer's OTP.
    if (status === 'Delivered') {
      if (!otp || typeof otp !== 'string' || !otp.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Customer Delivery OTP is required to mark this order as Delivered. Please enter the 4-digit OTP provided by the customer.',
          },
          { status: 400 }
        );
      }

      let expectedOtp: string | undefined | null = null;
      if (id.startsWith('SLIP-')) {
        const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
        const slip = await serverSlipOrders.getSlipOrderById(id);
        expectedOtp = slip?.delivery_otp;
      } else {
        let order = serverOrderStore.getOrder(id);
        if (!order) {
          serverOrderStore.loadFromDisk();
          order = serverOrderStore.getOrder(id);
        }
        if (!order) {
          order = await serverOrderStore.getOrderAsync(id);
        }
        if (!order && body.orderFallback) {
          expectedOtp = body.orderFallback.deliveryOtp || body.orderFallback.address?._deliveryOtp;
        } else {
          expectedOtp = order?.deliveryOtp || (order?.address as any)?._deliveryOtp;
        }
      }

      const { verifyDeliveryOtp } = await import('@/lib/deliveryOtp');
      if (!expectedOtp || !verifyDeliveryOtp(otp, expectedOtp)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid Customer Delivery OTP. Delivery can only be confirmed with the matching 4-digit OTP from the customer.',
          },
          { status: 400 }
        );
      }
    }

    const effectiveRider = assignedRider || body.orderFallback?.assignedRider;

    let result = await serverOrderStore.updateOrderStatus(
      id,
      status as OrderStatus,
      staffIdentifier || 'Store Admin',
      effectiveRider
    );

    // If order was missing from server cache but client sent orderFallback, hydrate and retry
    if ((!result.success || !result.order) && body.orderFallback) {
      try {
        serverOrderStore.cacheOrder(body.orderFallback);
        result = await serverOrderStore.updateOrderStatus(
          id,
          status as OrderStatus,
          staffIdentifier || 'Store Admin',
          effectiveRider
        );
      } catch {}
    }

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (status === 'Delivered' && result.order) {
      result.order.deliveredAt = new Date().toISOString();
      if (!result.order.isPaid && (result.order.paymentMethod === 'Cash on Delivery' || body.cashCollected)) {
        result.order.isPaid = true;
        result.order.paymentStatus = 'completed';
        result.order.paidAmount = result.order.grandTotal;
        result.order.paidAt = new Date().toISOString();
      }
      serverOrderStore.cacheOrder(result.order);
    }

    // If this is a slip order, mirror to serverSlipOrders
    if (id.startsWith('SLIP-')) {
      try {
        const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
        if ((status === 'Rider Assigned' || status === 'Out for Delivery') && assignedRider) {
          await serverSlipOrders.assignRider({
            slipId: id,
            riderId: assignedRider.id || 'rider-1',
            riderName: assignedRider.name || 'Express Rider',
            riderPhone: assignedRider.phone || '',
            staffName: staffIdentifier || 'Rider',
          });
        }
        if (status === 'Out for Delivery' || status === 'Order Dispatched') {
          await serverSlipOrders.updateDeliveryStatus(id, 'OUT_FOR_DELIVERY', staffIdentifier || 'Rider');
        } else if (status === 'Delivered') {
          await serverSlipOrders.updateDeliveryStatus(id, 'DELIVERED', staffIdentifier || 'Rider');
        }
      } catch (slipSyncErr) {
        console.warn('[OrderStatus] Slip status sync notice:', slipSyncErr);
      }
    }

    // Trigger targeted background Web Push notification directly to the customer (even when app is closed)
    try {
      const { serverPushService } = await import('@/lib/serverPushService');
      await serverPushService.sendOrderPushNotification(result.order, status as OrderStatus);
    } catch (pushErr) {
      console.warn('[Admin Order Status] Push dispatch notice:', pushErr);
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: `Order status updated to "${status}"`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
