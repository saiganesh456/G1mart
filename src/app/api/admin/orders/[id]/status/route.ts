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
