export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';
import { verifyAdminRequest } from '@/lib/authGuard';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const orders = await serverOrderStore.getAllOrdersAsync();

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })
          .limit(100);

        if (data && Array.isArray(data)) {
          data.forEach((row: any) => {
            if (row && row.id && !orders.some((o) => o.id === row.id)) {
              const rawAddr = row.address;
              const addr = typeof rawAddr === 'string' ? (() => { try { return JSON.parse(rawAddr); } catch { return {}; } })() : (rawAddr || {});
              const realStatus = addr._status || row.status || 'Order Placed';
              serverOrderStore.registerOrder({
                id: row.id,
                date: row.date || new Date(row.created_at).toLocaleDateString(),
                slot: row.slot || 'Standard',
                paymentMethod: row.payment_method,
                paymentStatus: row.payment_status || (row.is_paid ? 'completed' : 'pending'),
                isPaid: Boolean(row.is_paid),
                status: realStatus,
                subtotal: Number(row.subtotal || 0),
                discount: Number(row.discount || 0),
                deliveryFee: Number(row.delivery_fee || 0),
                taxes: Number(row.taxes || 0),
                grandTotal: Number(row.grand_total || 0),
                items: Array.isArray(row.order_items) && row.order_items.length > 0
                  ? row.order_items.map((oi: any) => ({
                      productId: oi.product_id,
                      productName: oi.product_name || 'Product',
                      unit: oi.unit || '1 unit',
                      price: Number(oi.unit_price || 0),
                      quantity: Number(oi.quantity || 1),
                      image: oi.image_url || '/products/placeholder.svg',
                    }))
                  : (addr._items || []),
                address: addr,
                orderType: addr.orderType || (row.slot?.toLowerCase().includes('pickup') ? 'pickup' : 'standard'),
                assignedRider: addr._assignedRider,
                deliveryOtp: addr._deliveryOtp,
                timeline: addr._timeline || [
                  { status: 'Order Placed', time: 'Confirmed', completed: true },
                  {
                    status: 'Packed',
                    time: 'Pending',
                    completed:
                      realStatus === 'Packed' ||
                      realStatus === 'Rider Assigned' ||
                      realStatus === 'Out for Delivery' ||
                      realStatus === 'Delivered',
                  },
                  {
                    status: 'Out for Delivery',
                    time: 'Pending',
                    completed: realStatus === 'Out for Delivery' || realStatus === 'Delivered',
                  },
                  { status: 'Delivered', time: 'Pending', completed: realStatus === 'Delivered' },
                ],
              });
            }
          });
        }
      } catch (err) {
        console.warn('Failed to sync orders from Supabase:', err);
      }
    }

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

    const finalOrders = await serverOrderStore.getAllOrdersAsync();
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
      try {
        await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('order_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('payments').delete().neq('id', '');
        await supabase.from('orders').delete().neq('id', '');
        await supabase.from('slip_items').delete().neq('id', '');
        await supabase.from('slip_images').delete().neq('id', '');
        await supabase.from('slip_orders').delete().neq('id', '');
      } catch (err) {
        console.warn('Supabase orders delete notice:', err);
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
