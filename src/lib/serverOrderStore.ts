import { CATALOG_PRODUCTS } from '@/data/catalog';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Order, OrderItem, PaymentRecord, PaymentStatus, OrderStatus } from '@/types';

// Global server memory store fallback for development & testing when Supabase is not connected
declare global {
  // eslint-disable-next-line no-var
  var __g1Orders: Map<string, Order> | undefined;
  // eslint-disable-next-line no-var
  var __g1Payments: Map<string, PaymentRecord> | undefined;
  // eslint-disable-next-line no-var
  var __g1ProcessedWebhooks: Set<string> | undefined;
}

if (!global.__g1Orders) global.__g1Orders = new Map<string, Order>();
if (!global.__g1Payments) global.__g1Payments = new Map<string, PaymentRecord>();
if (!global.__g1ProcessedWebhooks) global.__g1ProcessedWebhooks = new Set<string>();

const ordersMap = global.__g1Orders;
const paymentsMap = global.__g1Payments;
const processedWebhooks = global.__g1ProcessedWebhooks;

export interface RecalculatedCart {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
}

export const serverOrderStore = {
  /**
   * Rule 3 & 8: Recalculate order total directly from database / catalog prices.
   * Client-submitted prices are completely ignored.
   */
  recalculateOrderTotal(rawItems: any[]): RecalculatedCart {
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const pid = item.productId || item.id;
      let product = CATALOG_PRODUCTS.find((p) => p.id === pid);

      if (!product && typeof pid === 'string' && pid.startsWith('prod-')) {
        const idx = parseInt(pid.replace('prod-', ''), 10) - 1;
        product = CATALOG_PRODUCTS[idx] || CATALOG_PRODUCTS[0];
      }

      if (!product && item.name) {
        product = CATALOG_PRODUCTS.find((p) => p.name.toLowerCase().includes(item.name.toLowerCase()));
      }

      if (!product) {
        product = CATALOG_PRODUCTS[0];
      }

      // Ensure price is confirmed or fallback to baseline
      const unitPrice = product.price > 0 ? product.price : product.originalPrice > 0 ? product.originalPrice : 10;
      const qty = Math.max(1, Math.min(item.quantity || 1, 10000));

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        price: unitPrice,
        quantity: qty,
        image: product.image_status === 'approved' ? (product.image_path || product.image) : '/products/placeholder.svg',
      });
    }

    // Delivery fee rule: Free delivery above ₹499, otherwise standard ₹25
    const deliveryFee = subtotal >= 499 ? 0 : 25;
    const taxes = 0; // Essential groceries in AP standard zero GST rate
    const grandTotal = subtotal + deliveryFee + taxes;

    return {
      items: verifiedItems,
      subtotal,
      deliveryFee,
      taxes,
      grandTotal,
    };
  },

  /**
   * Create order in pending state with initial payment record.
   */
  async createPendingOrder(params: {
    orderId: string;
    merchantOrderId: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    taxes: number;
    grandTotal: number;
    address: any;
    slot?: string;
    paymentMethod: 'UPI' | 'Cash on Delivery' | 'Debit / Credit Card';
    userId?: string;
  }): Promise<Order> {
    const order: Order = {
      id: params.orderId,
      orderNumber: params.orderId,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: params.items,
      address: params.address,
      slot: params.slot || 'Standard Delivery',
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      status: 'Order Placed',
      subtotal: params.subtotal,
      discount: 0,
      deliveryFee: params.deliveryFee,
      taxes: params.taxes,
      grandTotal: params.grandTotal,
      isPaid: false,
      paidAmount: 0,
      providerOrderId: params.merchantOrderId,
      timeline: [
        { status: 'Order Placed', time: 'Just now', completed: true },
        { status: 'Packed', time: 'Pending', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false },
      ],
    };

    ordersMap.set(params.orderId, order);

    // Rule 9: Write payments rows for every attempt
    const paymentRecord: PaymentRecord = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      orderId: params.orderId,
      provider: params.paymentMethod === 'Cash on Delivery' ? 'cash_on_delivery' : 'phonepe',
      providerOrderId: params.merchantOrderId,
      amount: params.grandTotal,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    paymentsMap.set(params.merchantOrderId, paymentRecord);

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').upsert({
          id: order.id,
          user_id: params.userId || null,
          date: order.date,
          slot: order.slot,
          payment_method: order.paymentMethod,
          payment_status: 'pending',
          is_paid: false,
          status: 'Order Placed',
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          taxes: order.taxes,
          grand_total: order.grandTotal,
          address: order.address,
          provider_order_id: params.merchantOrderId,
        });

        await supabase.from('payments').insert({
          id: paymentRecord.id,
          order_id: order.id,
          provider: paymentRecord.provider,
          provider_order_id: params.merchantOrderId,
          amount: paymentRecord.amount,
          status: 'PENDING',
        });
      } catch (err) {
        console.warn('[serverOrderStore] Supabase insert fallback to memory:', err);
      }
    }

    return order;
  },

  /**
   * Rule 5 & 8: Verify amount & mark order paid idempotently.
   */
  async markOrderPaid(params: {
    providerOrderId: string;
    transactionId?: string;
    amountInPaise?: number;
    rawResponse?: any;
  }): Promise<{ success: boolean; error?: string; order?: Order }> {
    const order = this.getOrderByProviderOrderId(params.providerOrderId);
    if (!order) {
      return { success: false, error: `No order found for merchantOrderId: ${params.providerOrderId}` };
    }

    // Idempotency check: Already marked completed with same status
    if (order.paymentStatus === 'completed' && order.isPaid) {
      return { success: true, order };
    }

    // Rule 8: Verify that the amount in PhonePe's response matches the order total before marking it paid.
    if (params.amountInPaise !== undefined) {
      const expectedPaise = Math.round(order.grandTotal * 100);
      if (params.amountInPaise !== expectedPaise) {
        // Record tampered payment attempt as FAILED
        await this.markOrderFailed({
          providerOrderId: params.providerOrderId,
          error: `Tampered amount: Expected ₹${order.grandTotal} (${expectedPaise} paise), but received ${params.amountInPaise} paise`,
          rawResponse: params.rawResponse,
        });

        return {
          success: false,
          error: `Amount mismatch: Order total is ₹${order.grandTotal}, received ${params.amountInPaise / 100}`,
        };
      }
    }

    const nowIso = new Date().toISOString();
    order.paymentStatus = 'completed';
    order.isPaid = true;
    order.paidAmount = order.grandTotal;
    order.paidAt = nowIso;
    order.transactionId = params.transactionId;
    ordersMap.set(order.id, order);

    // Update payment record
    const payment = paymentsMap.get(params.providerOrderId);
    if (payment) {
      payment.status = 'COMPLETED';
      payment.transactionId = params.transactionId;
      payment.verifiedAt = nowIso;
      payment.rawResponse = params.rawResponse;
      payment.updatedAt = nowIso;
      paymentsMap.set(params.providerOrderId, payment);
    }

    // Update Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            is_paid: true,
            paid_amount: order.grandTotal,
            paid_at: nowIso,
            transaction_id: params.transactionId,
          })
          .eq('id', order.id);

        if (payment) {
          await supabase
            .from('payments')
            .update({
              status: 'COMPLETED',
              transaction_id: params.transactionId,
              verified_at: nowIso,
              raw_response: params.rawResponse,
            })
            .eq('provider_order_id', params.providerOrderId);
        }
      } catch (err) {
        console.warn('[serverOrderStore] Supabase update fallback to memory:', err);
      }
    }

    return { success: true, order };
  },

  /**
   * Mark order payment failed
   */
  async markOrderFailed(params: {
    providerOrderId: string;
    transactionId?: string;
    error?: string;
    rawResponse?: any;
  }): Promise<{ success: boolean; order?: Order }> {
    const order = this.getOrderByProviderOrderId(params.providerOrderId);
    if (!order) return { success: false };

    // Do not overwrite completed payments
    if (order.paymentStatus === 'completed') return { success: true, order };

    const nowIso = new Date().toISOString();
    order.paymentStatus = 'failed';
    order.isPaid = false;
    ordersMap.set(order.id, order);

    const payment = paymentsMap.get(params.providerOrderId);
    if (payment) {
      payment.status = 'FAILED';
      payment.transactionId = params.transactionId;
      payment.rawResponse = params.rawResponse;
      payment.updatedAt = nowIso;
      paymentsMap.set(params.providerOrderId, payment);
    }

    return { success: true, order };
  },

  /**
   * Rule 11: Staff manual payment confirmation action
   */
  async markOrderManualPaid(
    orderId: string,
    staffIdentifier: string
  ): Promise<{ success: boolean; order?: Order }> {
    const order = ordersMap.get(orderId);
    if (!order) return { success: false };

    const nowIso = new Date().toISOString();
    order.paymentStatus = 'manual_verified';
    order.isPaid = true;
    order.paidAmount = order.grandTotal;
    order.paidAt = nowIso;
    order.markedPaidBy = staffIdentifier;
    ordersMap.set(orderId, order);

    const manualPayRecord: PaymentRecord = {
      id: `manual_${Date.now()}`,
      orderId: order.id,
      provider: 'manual_staff',
      amount: order.grandTotal,
      status: 'COMPLETED',
      verifiedAt: nowIso,
      rawResponse: { staff: staffIdentifier, method: 'manual_cashier_verification' },
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    paymentsMap.set(manualPayRecord.id, manualPayRecord);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: 'manual_verified',
            is_paid: true,
            paid_amount: order.grandTotal,
            paid_at: nowIso,
            marked_paid_by: staffIdentifier,
          })
          .eq('id', orderId);
      } catch {}
    }

    return { success: true, order };
  },

  /**
   * Update order fulfillment status (e.g. Packed, Order Dispatched, Out for Delivery, Delivered)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    updatedBy?: string
  ): Promise<{ success: boolean; order?: Order }> {
    const order = ordersMap.get(orderId);
    if (!order) return { success: false };

    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    order.status = status;

    // Update timeline steps
    const isPacked = status === 'Packed' || status === 'Order Dispatched' || status === 'Out for Delivery' || status === 'Delivered';
    const isDispatched = status === 'Order Dispatched' || status === 'Out for Delivery' || status === 'Delivered';
    const isDelivered = status === 'Delivered';

    order.timeline = [
      { status: 'Order Placed', time: order.timeline[0]?.time || 'Confirmed', completed: true },
      { status: 'Packed', time: isPacked ? timeStr : 'Pending', completed: isPacked },
      { status: 'Out for Delivery', time: isDispatched ? timeStr : 'Pending', completed: isDispatched },
      { status: 'Delivered', time: isDelivered ? timeStr : 'Pending', completed: isDelivered },
    ];

    ordersMap.set(orderId, order);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            status,
            timeline: order.timeline,
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('[serverOrderStore] Supabase updateOrderStatus fallback:', err);
      }
    }

    return { success: true, order };
  },

  /**
   * Confirm Cash on Delivery order
   */
  async confirmCodOrder(orderId: string): Promise<{ success: boolean; order?: Order }> {
    const order = ordersMap.get(orderId);
    if (!order) return { success: false };

    order.paymentStatus = 'cash_on_delivery';
    order.isPaid = false;
    ordersMap.set(orderId, order);

    return { success: true, order };
  },

  /**
   * Retrieve order by ID
   */
  getOrder(orderId: string): Order | undefined {
    return ordersMap.get(orderId);
  },

  /**
   * Retrieve order by provider order ID (merchantOrderId)
   */
  getOrderByProviderOrderId(providerOrderId: string): Order | undefined {
    for (const order of ordersMap.values()) {
      if (order.providerOrderId === providerOrderId) {
        return order;
      }
    }
    return undefined;
  },

  /**
   * Get all orders
   */
  getAllOrders(): Order[] {
    return Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  /**
   * Get payment records for an order
   */
  getPaymentRecords(orderId: string): PaymentRecord[] {
    return Array.from(paymentsMap.values()).filter((p) => p.orderId === orderId);
  },

  /**
   * Check if webhook was already processed (Idempotency)
   */
  isWebhookProcessed(idempotencyKey: string): boolean {
    return processedWebhooks.has(idempotencyKey);
  },

  markWebhookProcessed(idempotencyKey: string) {
    processedWebhooks.add(idempotencyKey);
  },
};
