import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { items, staffName = 'Store Packer', action = 'mark_packed' } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Missing packed items checklist data' },
        { status: 400 }
      );
    }

    if (action === 'update') {
      const order = await serverSlipOrders.updatePackerChecklist(id, items, staffName);
      if (!order) {
        return NextResponse.json({ success: false, error: `Slip #${id} not found` }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    // Action: Mark Packed (Phase 6 Rule 4)
    // Recalculates final_total from actual quantities, moves to PACKED -> AWAITING_PAYMENT
    const order = await serverSlipOrders.markPacked(id, items, staffName);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Slip order #${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order marked packed. Customer notified to review final bill & pay.',
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing packing update' },
      { status: 500 }
    );
  }
}
