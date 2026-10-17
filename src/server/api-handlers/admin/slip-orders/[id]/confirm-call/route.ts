export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const staffName = body.staffName || 'Staff Admin';
    const notes = body.notes || 'Customer confirmed items and bill over phone';

    const order = await serverSlipOrders.markConfirmedByCall(id, staffName, notes);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Slip order #${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slip order confirmed by call and sent to packer queue',
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to confirm slip order' },
      { status: 500 }
    );
  }
}
