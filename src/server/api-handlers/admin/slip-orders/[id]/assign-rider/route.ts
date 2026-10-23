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
    const { riderId, riderName, riderPhone, staffName } = body;

    if (!riderId || !riderName) {
      return NextResponse.json(
        { success: false, error: 'Rider ID and Rider Name are required' },
        { status: 400 }
      );
    }

    const result = await serverSlipOrders.assignRider({
      slipId: id,
      riderId,
      riderName,
      riderPhone: riderPhone || '',
      staffName,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Rider assigned successfully',
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to assign rider' },
      { status: 500 }
    );
  }
}
