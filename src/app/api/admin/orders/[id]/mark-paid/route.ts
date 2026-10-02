import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id: orderId } = await params;
    const body = await req.json().catch(() => ({}));
    const staffIdentifier = body.staffIdentifier || 'Store Staff (Admin)';

    const result = await serverOrderStore.markOrderManualPaid(orderId, staffIdentifier);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: `Order ${orderId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: `Order #${orderId} marked paid by ${staffIdentifier}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error marking order paid' },
      { status: 500 }
    );
  }
}
