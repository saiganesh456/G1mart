export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { verifyAdminRequest } from '@/lib/authGuard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { items, staffName = `Store Packer (${auth.email || 'Staff'})`, action = 'mark_packed' } = body;

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
      { success: false, error: err.message || 'Failed to update packed items' },
      { status: 500 }
    );
  }
}
