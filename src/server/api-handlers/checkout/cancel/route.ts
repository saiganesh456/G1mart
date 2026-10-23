export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid orderId is required' },
        { status: 400 }
      );
    }

    const result = await serverOrderStore.cancelOrder(orderId, reason || 'Cancelled by customer');
    return NextResponse.json({
      success: true,
      message: `Checkout attempt ${orderId} marked as cancelled.`,
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error cancelling order' },
      { status: 500 }
    );
  }
}
