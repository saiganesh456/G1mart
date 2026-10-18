export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const order = await serverSlipOrders.getSlipOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Slip order #${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch slip order' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { items, adminNotes, billedBy, action, cancelReason } = body;

    if (action === 'cancel') {
      const cancelResult = await serverSlipOrders.cancelSlipOrder(
        id,
        cancelReason || 'Cancelled by store staff',
        billedBy || 'Staff Admin'
      );
      if (!cancelResult.success) {
        return NextResponse.json({ success: false, error: cancelResult.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: cancelResult.order });
    }

    // Save Billing Items (Phase 6 Rule 3)
    if (items && Array.isArray(items)) {
      const updated = await serverSlipOrders.saveBillingItems({
        slipId: id,
        items,
        adminNotes,
        billedBy: billedBy || 'Staff Admin',
        moveStatus: body.moveStatus || 'BILLING',
      });

      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Failed to update billing items for slip order' },
          { status: 404 }
        );
      }

      // Notify customer if moved to awaiting confirmation or bill updated
      try {
        const { serverPushService } = await import('@/lib/serverPushService');
        await serverPushService.sendSlipPushNotification(updated, 'BILL_READY');
      } catch {}

      return NextResponse.json({
        success: true,
        order: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action or missing items' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating slip order' },
      { status: 500 }
    );
  }
}
