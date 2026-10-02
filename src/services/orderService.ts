import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/mockData';

export const orderService = {
  /**
   * Fetch customer or rider orders from Supabase (with fallback to mock data)
   */
  async getOrders(userId?: string): Promise<Order[]> {
    if (!isSupabaseConfigured()) {
      return INITIAL_ORDERS;
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

      if (error || !data || data.length === 0) {
        return INITIAL_ORDERS;
      }

      return data.map((row: any) => ({
        id: row.id,
        date: row.date,
        items: (row.order_items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          unit: item.unit,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image,
        })),
        address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
        slot: row.slot,
        paymentMethod: row.payment_method,
        isPaid: row.is_paid,
        status: row.status as OrderStatus,
        subtotal: Number(row.subtotal),
        discount: Number(row.discount),
        deliveryFee: Number(row.delivery_fee),
        taxes: Number(row.taxes),
        grandTotal: Number(row.grand_total),
        couponApplied: row.coupon_applied || undefined,
        deliveryBoy: {
          name: 'Raju Varma',
          phone: '+91 94401 23456',
          vehicleNumber: 'AP 26 EQ 4421 (Hero Splendor)',
          rating: 4.9,
          currentLocation: 'G1 Mart Central Hub, Pogathota, Nellore',
        },
        timeline: [
          { status: 'Order Placed', time: 'Just now', completed: true },
          { status: 'Packed', time: 'In 5-10 mins', completed: row.status !== 'Order Placed' },
          { status: 'Out for Delivery', time: 'In 15 mins', completed: row.status === 'Out for Delivery' || row.status === 'Delivered' },
          { status: 'Delivered', time: 'Doorstep arrival', completed: row.status === 'Delivered' },
        ],
      }));
    } catch (err) {
      console.warn('[G1 Mart OrderService] Failed to fetch orders from Supabase, using mock data:', err);
      return INITIAL_ORDERS;
    }
  },

  /**
   * Save newly created order to Supabase
   */
  async createOrder(order: Order, userId?: string): Promise<{ success: boolean; id: string; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true, id: order.id };
    }

    try {
      // 1. Insert order record
      const { error: orderError } = await supabase.from('orders').insert({
        id: order.id,
        user_id: userId || null,
        date: order.date,
        slot: order.slot,
        payment_method: order.paymentMethod,
        is_paid: order.isPaid,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        delivery_fee: order.deliveryFee,
        taxes: order.taxes,
        grand_total: order.grandTotal,
        coupon_applied: order.couponApplied || null,
        address: order.address as any,
      });

      if (orderError) {
        return { success: false, id: order.id, error: orderError.message };
      }

      // 2. Insert line items
      const itemsToInsert = order.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        unit: item.unit,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) {
        console.warn('[G1 Mart OrderService] Warning saving order items:', itemsError.message);
      }

      return { success: true, id: order.id };
    } catch (err: any) {
      return { success: false, id: order.id, error: err.message || 'Failed to place order' };
    }
  },

  /**
   * Update order status (Admin or Rider)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          is_paid: status === 'Delivered' ? true : undefined,
        })
        .eq('id', orderId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Record in status history
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status,
        note: note || `Status updated to ${status}`,
        completed: true,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update order status' };
    }
  },
};
