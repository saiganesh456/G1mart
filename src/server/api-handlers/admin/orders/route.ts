export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import { serverOrderStore, getOrderTimestamp } from '@/lib/serverOrderStore';
import { serverSupabase, fallbackSupabase, supabaseClients, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';
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
    const orders = await serverOrderStore.getAllOrdersAsync();

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

    // 3. Retrieve complete list sorted newest first
    const finalOrders = await serverOrderStore.getAllOrdersAsync();
    finalOrders.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

    return NextResponse.json(
      { success: true, orders: finalOrders },
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

    serverOrderStore.clearAllOrders();
    const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
    serverSlipOrders.clearAllSlips();

    if (isSupabaseConfigured()) {
      for (const client of supabaseClients) {
        try {
          await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await client.from('order_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await client.from('payments').delete().neq('id', '');
          await client.from('orders').delete().neq('id', '');
          await client.from('slip_items').delete().neq('id', '');
          await client.from('slip_images').delete().neq('id', '');
          await client.from('slip_orders').delete().neq('id', '');
        } catch (err) {
          console.warn('Supabase orders delete notice:', err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All test orders cleared from server and database. Store pipeline is 100% fresh.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear orders' },
      { status: 500 }
    );
  }
}
