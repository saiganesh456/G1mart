import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import type { SlipOrderStatus } from '@/types/slipOrder';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as SlipOrderStatus | null;

    const orders = await serverSlipOrders.getSlipOrders(status || undefined);

    // Calculate badge counts
    const newCount = orders.filter((o) => o.status === 'SLIP_RECEIVED').length;
    const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length;
    const packingCount = orders.filter((o) => o.status === 'PACKING').length;
    const packedCount = orders.filter((o) => o.status === 'PACKED' || o.status === 'AWAITING_PAYMENT').length;

    return NextResponse.json({
      success: true,
      orders,
      counts: {
        new: newCount,
        confirmed: confirmedCount,
        packing: packingCount,
        packed: packedCount,
        total: orders.length,
      },
    });
  } catch (err: any) {
    console.error('[API/Admin/SlipOrders] GET error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list slip orders' },
      { status: 500 }
    );
  }
}
