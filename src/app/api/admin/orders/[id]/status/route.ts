import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import type { OrderStatus } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, staffIdentifier, assignedRider } = body;

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

    let result = await serverOrderStore.updateOrderStatus(
      id,
      status as OrderStatus,
      staffIdentifier || 'Store Admin',
      assignedRider
    );

    // If order was missing from server cache but client sent orderFallback, hydrate and retry
    if ((!result.success || !result.order) && body.orderFallback) {
      try {
        serverOrderStore.cacheOrder(body.orderFallback);
        result = await serverOrderStore.updateOrderStatus(
          id,
          status as OrderStatus,
          staffIdentifier || 'Store Admin',
          assignedRider
        );
      } catch {}
    }

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
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
