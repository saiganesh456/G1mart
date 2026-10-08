import { NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  try {
    const orders = serverOrderStore.getAllOrders();

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
              serverOrderStore.registerOrder({
                id: row.id,
                date: row.date || new Date(row.created_at).toLocaleDateString(),
                slot: row.slot || 'Standard',
                paymentMethod: row.payment_method,
                paymentStatus: row.payment_status || (row.is_paid ? 'completed' : 'pending'),
                isPaid: Boolean(row.is_paid),
                status: row.status,
                subtotal: Number(row.subtotal || 0),
                discount: Number(row.discount || 0),
                deliveryFee: Number(row.delivery_fee || 0),
                taxes: Number(row.taxes || 0),
                grandTotal: Number(row.grand_total || 0),
                items: Array.isArray(row.order_items)
                  ? row.order_items.map((oi: any) => ({
                      productId: oi.product_id,
                      productName: oi.product_name || 'Product',
                      unit: oi.unit || '1 unit',
                      price: Number(oi.unit_price || 0),
                      quantity: Number(oi.quantity || 1),
                      image: oi.image_url || '/products/placeholder.svg',
                    }))
                  : [],
                address: row.address,
                timeline: [
                  { status: 'Order Placed', time: 'Confirmed', completed: true },
                  {
                    status: 'Packed',
                    time: 'Pending',
                    completed:
                      row.status === 'Packed' ||
                      row.status === 'Out for Delivery' ||
                      row.status === 'Delivered',
                  },
                  {
                    status: 'Out for Delivery',
                    time: 'Pending',
                    completed: row.status === 'Out for Delivery' || row.status === 'Delivered',
                  },
                  { status: 'Delivered', time: 'Pending', completed: row.status === 'Delivered' },
                ],
              });
            }
          });
        }
      } catch (err) {
        console.warn('Failed to sync orders from Supabase:', err);
      }
    }

    const finalOrders = serverOrderStore.getAllOrders();
    return NextResponse.json({ success: true, orders: finalOrders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch admin orders' },
      { status: 500 }
    );
  }
}
