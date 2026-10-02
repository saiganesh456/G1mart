import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Order, OrderStatus } from '../types';

export const orderService = {
  /**
   * Fetch customer orders from Supabase (clean fallback to empty array)
   */
  async getOrders(userId?: string): Promise<Order[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number,
        date: new Date(row.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: (row.order_items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          unit: item.unit || '1 unit',
          price: Number(item.unit_price),
          quantity: item.quantity,
          image: item.image_url || '/products/prod-1.jpg',
        })),
        address: row.delivery_address || {
          fullName: 'Customer',
          mobileNumber: '',
          houseFlat: '',
          streetArea: '',
          landmark: '',
          city: 'Store Area',
          state: '',
          pincode: '',
          type: 'Home',
          isDefault: true,
        },
        slot: row.delivery_slot || 'Standard Delivery',
        paymentMethod: row.payment_method || 'Cash on Delivery',
        paymentStatus: row.payment_status || 'pending',
        status: row.status as OrderStatus,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount_amount || 0),
        deliveryFee: Number(row.delivery_fee || 0),
        taxes: Number(row.taxes || 0),
        grandTotal: Number(row.total_amount),
        timeline: [
          { status: 'Order Placed', time: 'Placed', completed: true },
        ],
      }));
    } catch (err) {
      console.warn('[G1 Mart OrderService] getOrders error:', err);
      return [];
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return !error;
    } catch {
      return false;
    }
  },
};
