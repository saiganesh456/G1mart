export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import { serverOrderStore, getOrderTimestamp } from '@/lib/serverOrderStore';
import { verifyAdminRequest, verifyRiderOrAdminRequest } from '@/lib/authGuard';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyRiderOrAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Authorization required' },
        { status: auth.status || 401 }
      );
    }

    // 1. Sync and fetch all regular/standard orders from database and store
    await serverOrderStore.getAllOrdersAsync();

    // 2. Sync slip orders
    try {
      const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
      const slipOrders = await serverSlipOrders.getSlipOrders();
      for (const slip of slipOrders) {
        if (slip.status === 'CANCELLED' || slip.status === 'SLIP_RECEIVED') continue;
        const converted = serverSlipOrders.convertToStandardOrder(slip);
        serverOrderStore.registerOrder(converted);
      }
    } catch (slipErr) {
      console.warn('[Admin Orders] Slip sync notice:', slipErr);
    }

    // 3. Retrieve complete list sorted newest first.
    // Include all orders (including Payment Pending and Cancelled) so admin tabs display all queues.
    const finalOrders = await serverOrderStore.getAllOrdersAsync();
    finalOrders.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

    const orphanPayments = serverOrderStore.getOrphanPayments();

    return NextResponse.json(
      {
        success: true,
        orders: finalOrders,
        orphanPayments,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch admin orders' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    // Safely delete ONLY test orders (ID starts with TEST, address._isTest = true, or phone 9876543210).
    // Genuine customer orders are strictly protected and never touched.
    const result = await serverOrderStore.clearTestOrders();

    return NextResponse.json({
      success: true,
      message: `Test orders cleared safely. Removed ${result.clearedLocal} local and ${result.clearedSupabase} database test records. Genuine customer orders preserved.`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear test orders' },
      { status: 500 }
    );
  }
}
