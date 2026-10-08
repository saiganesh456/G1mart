import fs from 'fs';
import path from 'path';
import { CATALOG_PRODUCTS as PILOT_PRODUCTS } from '@/data/catalog';
import { CATALOG_PRODUCTS as CANONICAL_PRODUCTS } from '@/data/productsCatalog';

const ALL_CATALOG_PRODUCTS = [...CANONICAL_PRODUCTS, ...PILOT_PRODUCTS];
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Order, OrderItem, PaymentRecord, PaymentStatus, OrderStatus } from '@/types';

const ORDERS_FILE_PATH = path.join(process.cwd(), 'data', 'g1mart_orders.json');
const LEGACY_CACHE_PATH = path.join(process.cwd(), '.next', 'g1mart_orders_dev.json');

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

export const STATUS_RANK: Record<string, number> = {
  'Order Placed': 1,
  'Confirmed': 2,
  'Packing': 3,
  'Packed': 4,
  'Rider Assigned': 5,
  'Order Dispatched': 6,
  'Out for Delivery': 6,
  'Delivered': 7,
  'Cancelled': 8,
};

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
    // Lazy load migrated variants JSON for server-side price verification
    let migratedVariants: Array<{ id: string; product_id: string; size_label: string; price: number; mrp: number; stock: number }> = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      migratedVariants = require('../../data/migrated_product_variants.json');
    } catch {}
    const variantById = new Map(migratedVariants.map((v) => [v.id, v]));

    // Lazy load migrated products for server-side price verification
    let migratedProducts: Array<{ id: string; name: string; brand_id?: string; category_id?: string; image_url?: string }> = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      migratedProducts = require('../../data/migrated_products.json');
    } catch {}
    const migratedProductById = new Map(migratedProducts.map((p) => [p.id, p]));

    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const pid = item.productId || item.id;
      const vid = item.variantId || item.variant_id;

      // --- Try variant price first (most accurate) ---
      if (vid) {
        const variant = variantById.get(vid);
        if (variant && variant.product_id === pid) {
          const qty = Math.max(1, Math.min(item.quantity || 1, 10000));
          const unitPrice = variant.price > 0 ? variant.price : 10;
          const lineTotal = unitPrice * qty;
          subtotal += lineTotal;

          // Try to get product image
          const mp = migratedProductById.get(pid);
          verifiedItems.push({
            productId: pid,
            productName: item.productName || item.name || variant.product_id,
            unit: variant.size_label,
            price: unitPrice,
            quantity: qty,
            image: mp?.image_url || '/products/placeholder.svg',
            variantId: vid,
            sizeLabel: variant.size_label,
          });
          continue;
        }
      }

      // --- Fallback: catalog product lookup ---
      let product = ALL_CATALOG_PRODUCTS.find((p) => p.id === pid);

      if (!product && typeof pid === 'string' && pid.startsWith('prod-')) {
        const idx = parseInt(pid.replace('prod-', ''), 10) - 1;
        product = ALL_CATALOG_PRODUCTS[idx] || ALL_CATALOG_PRODUCTS[0];
      }

      if (!product && item.name) {
        product = ALL_CATALOG_PRODUCTS.find((p) => p.name.toLowerCase().includes(item.name.toLowerCase()));
      }

      if (!product) {
        product = ALL_CATALOG_PRODUCTS[0];
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
        image: (product.image_status === 'VERIFIED' || product.image_status === 'approved')
          ? (product.image_url || product.image_path || product.image || '/products/placeholder.svg')
          : '/products/placeholder.svg',
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
    userEmail?: string;
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
      userId: params.userId,
      userEmail: params.userEmail,
      timeline: [
        { status: 'Order Placed', time: 'Just now', completed: true },
        { status: 'Packed', time: 'Pending', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: 'Pending', completed: false },
      ],
    };

    ordersMap.set(params.orderId, order);
    this.persistToDisk();

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
    providerOrderId?: string;
    orderId?: string;
    transactionId?: string;
    amountInPaise?: number;
    rawResponse?: any;
  }): Promise<{ success: boolean; error?: string; order?: Order }> {
    let order: Order | undefined;
    if (params.orderId) {
      order = this.getOrder(params.orderId);
    }
    if (!order && params.providerOrderId) {
      order = this.getOrderByProviderOrderId(params.providerOrderId);
    }
    if (!order && params.orderId) {
      order = ordersMap.get(params.orderId);
    }
    if (!order) {
      return { success: false, error: `No order found for order #${params.orderId || params.providerOrderId}` };
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
    this.persistToDisk();

    // Update payment record
    const pId = params.providerOrderId || order.providerOrderId;
    let payment: PaymentRecord | undefined;
    if (pId) {
      payment = paymentsMap.get(pId);
      if (payment) {
        payment.status = 'COMPLETED';
        payment.transactionId = params.transactionId;
        payment.verifiedAt = nowIso;
        payment.rawResponse = params.rawResponse;
        payment.updatedAt = nowIso;
        paymentsMap.set(pId, payment);
      }
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

        if (payment && pId) {
          await supabase
            .from('payments')
            .update({
              status: 'COMPLETED',
              transaction_id: params.transactionId,
              verified_at: nowIso,
              raw_response: params.rawResponse,
            })
            .eq('provider_order_id', pId);
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
    providerOrderId?: string;
    orderId?: string;
    transactionId?: string;
    error?: string;
    rawResponse?: any;
  }): Promise<{ success: boolean; order?: Order }> {
    let order: Order | undefined;
    if (params.orderId) {
      order = this.getOrder(params.orderId);
    }
    if (!order && params.providerOrderId) {
      order = this.getOrderByProviderOrderId(params.providerOrderId);
    }
    if (!order && params.orderId) {
      order = ordersMap.get(params.orderId);
    }
    if (!order) return { success: false };

    // Do not overwrite completed payments
    if (order.paymentStatus === 'completed') return { success: true, order };

    const nowIso = new Date().toISOString();
    order.paymentStatus = 'failed';
    order.isPaid = false;
    ordersMap.set(order.id, order);
    this.persistToDisk();

    const pId = params.providerOrderId || order.providerOrderId;
    if (pId) {
      const payment = paymentsMap.get(pId);
      if (payment) {
        payment.status = 'FAILED';
        payment.transactionId = params.transactionId;
        payment.rawResponse = params.rawResponse;
        payment.updatedAt = nowIso;
        paymentsMap.set(pId, payment);
      }
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
    this.persistToDisk();

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
    updatedBy?: string,
    assignedRider?: {
      id?: string;
      name: string;
      phone?: string;
      vehicleNumber?: string;
      assignedAt?: string;
    }
  ): Promise<{ success: boolean; order?: Order }> {
    this.loadFromDisk();
    let order = ordersMap.get(orderId);

    // Fallback: If order not in memory, try to load from Supabase
    if (!order && isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
        if (data) {
          const loadedOrder: Order = {
            id: data.id,
            date: data.date,
            slot: data.slot,
            paymentMethod: data.payment_method,
            paymentStatus: data.is_paid ? 'completed' : (data.payment_method === 'Cash on Delivery' ? 'cash_on_delivery' : 'pending'),
            isPaid: data.is_paid,
            status: data.status,
            subtotal: Number(data.subtotal),
            discount: Number(data.discount),
            deliveryFee: Number(data.delivery_fee),
            taxes: Number(data.taxes),
            grandTotal: Number(data.grand_total),
            items: [],
            address: data.address as any,
            timeline: [
              { status: 'Order Placed', time: 'Confirmed', completed: true },
              { status: 'Packed', time: 'Pending', completed: false },
              { status: 'Out for Delivery', time: 'Pending', completed: false },
              { status: 'Delivered', time: 'Pending', completed: false },
            ],
          };
          order = loadedOrder;
          ordersMap.set(orderId, loadedOrder);
        }
      } catch (err) {
        console.warn('[serverOrderStore] Error loading order from Supabase:', err);
      }
    }

    if (!order) return { success: false };

    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    order.status = status;
    if (assignedRider) {
      order.assignedRider = {
        ...assignedRider,
        assignedAt: assignedRider.assignedAt || new Date().toISOString(),
      };
    }

    // Update timeline steps
    const isPacked =
      status === 'Packed' ||
      status === 'Rider Assigned' ||
      status === 'Order Dispatched' ||
      status === 'Out for Delivery' ||
      status === 'Delivered';
    const isDispatched =
      status === 'Order Dispatched' || status === 'Out for Delivery' || status === 'Delivered';
    const isDelivered = status === 'Delivered';

    const prevFirstTime = (order.timeline && order.timeline[0]?.time) || 'Confirmed';
    order.timeline = [
      { status: 'Order Placed', time: prevFirstTime, completed: true },
      { status: 'Packed', time: isPacked ? timeStr : 'Pending', completed: isPacked },
      { status: 'Out for Delivery', time: isDispatched ? timeStr : 'Pending', completed: isDispatched },
      { status: 'Delivered', time: isDelivered ? timeStr : 'Pending', completed: isDelivered },
    ];

    ordersMap.set(orderId, order);
    this.persistToDisk();

    if (isSupabaseConfigured()) {
      try {
        // Map status to valid database enum ('Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled')
        let dbStatus: 'Order Placed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled' = 'Order Placed';
        if (status === 'Delivered') {
          dbStatus = 'Delivered';
        } else if (status === 'Out for Delivery' || status === 'Order Dispatched') {
          dbStatus = 'Out for Delivery';
        } else if (status === 'Packed' || status === 'Rider Assigned') {
          dbStatus = 'Packed';
        } else if (status === 'Cancelled') {
          dbStatus = 'Cancelled';
        } else {
          dbStatus = 'Order Placed';
        }

        const updatePayload: any = {
          status: dbStatus,
          updated_at: new Date().toISOString(),
        };

        if (order.assignedRider?.id && order.assignedRider.id.includes('-') && order.assignedRider.id.length > 20) {
          updatePayload.assigned_rider_id = order.assignedRider.id;
        }

        await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', orderId);
      } catch (err) {
        console.warn('[serverOrderStore] Supabase updateOrderStatus fallback:', err);
      }
    }

    return { success: true, order };
  },

  /**
   * Cache or update an existing order in memory and persist
   */
  cacheOrder(order: Order) {
    if (order && order.id) {
      ordersMap.set(order.id, order);
      this.persistToDisk();
    }
  },

  /**
   * Confirm Cash on Delivery order
   */
  async confirmCodOrder(orderId: string): Promise<{ success: boolean; order?: Order }> {
    this.loadFromDisk();
    const order = ordersMap.get(orderId);
    if (!order) return { success: false };

    order.paymentStatus = 'cash_on_delivery';
    order.isPaid = false;
    ordersMap.set(orderId, order);
    this.persistToDisk();

    return { success: true, order };
  },

  persistToDisk() {
    try {
      const orders = Array.from(ordersMap.values());
      const dir = path.dirname(ORDERS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[serverOrderStore] persistToDisk error:', err);
    }
  },

  loadFromDisk() {
    try {
      let filePathToRead = ORDERS_FILE_PATH;
      if (!fs.existsSync(filePathToRead) && fs.existsSync(LEGACY_CACHE_PATH)) {
        filePathToRead = LEGACY_CACHE_PATH;
      }

      if (fs.existsSync(filePathToRead)) {
        const raw = fs.readFileSync(filePathToRead, 'utf-8');
        const diskOrders: Order[] = JSON.parse(raw);
        if (Array.isArray(diskOrders)) {
          for (const d of diskOrders) {
            if (d && d.id) {
              const current = ordersMap.get(d.id);
              if (!current) {
                ordersMap.set(d.id, d);
              } else {
                const curRank = STATUS_RANK[current.status] || 0;
                const diskRank = STATUS_RANK[d.status] || 0;
                const winningStatus = curRank >= diskRank ? current.status : d.status;
                const winningIsPaid = Boolean(current.isPaid || d.isPaid);
                const winningTimeline = (current.timeline && current.timeline.some((t: any) => t.completed && t.status !== 'Order Placed'))
                  ? current.timeline
                  : (d.timeline || current.timeline);

                ordersMap.set(d.id, {
                  ...d,
                  ...current,
                  status: winningStatus,
                  isPaid: winningIsPaid,
                  paymentStatus: winningIsPaid
                    ? (current.paymentStatus === 'manual_verified' ? 'manual_verified' : 'completed')
                    : (current.paymentStatus || d.paymentStatus),
                  timeline: winningTimeline,
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[serverOrderStore] loadFromDisk error:', err);
    }
  },

  registerOrder(order: Order): Order {
    if (!order || !order.id) return order;
    this.loadFromDisk();
    const existing = ordersMap.get(order.id);

    if (!existing) {
      ordersMap.set(order.id, order);
      this.persistToDisk();
      return order;
    }

    // Strict status rank protection: Never allow a stale client payload to demote status!
    const existingRank = STATUS_RANK[existing.status] || 0;
    const newRank = STATUS_RANK[order.status] || 0;
    const finalStatus = existingRank > newRank ? existing.status : (order.status || existing.status);
    const finalIsPaid = Boolean(existing.isPaid || order.isPaid);
    const finalPaymentStatus = (existing.isPaid || existing.paymentStatus === 'completed' || existing.paymentStatus === 'manual_verified')
      ? existing.paymentStatus
      : (order.paymentStatus || existing.paymentStatus);
    const finalTimeline = (existing.timeline && existing.timeline.some((t: any) => t.completed && t.status !== 'Order Placed'))
      ? existing.timeline
      : (order.timeline || existing.timeline);

    const merged: Order = {
      ...order,
      ...existing,
      items: (order.items && order.items.length > 0) ? order.items : existing.items,
      address: order.address || existing.address,
      status: finalStatus,
      isPaid: finalIsPaid,
      paymentStatus: finalPaymentStatus,
      paidAmount: Math.max(existing.paidAmount || 0, order.paidAmount || 0),
      timeline: finalTimeline,
      providerOrderId: existing.providerOrderId || order.providerOrderId || `MT_${order.id}`,
    };
    ordersMap.set(order.id, merged);
    this.persistToDisk();
    return merged;
  },

  /**
   * Retrieve orders for a specific user (by ID or phone)
   */
  getUserOrders(userId?: string, phone?: string): Order[] {
    const all = this.getAllOrders();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    return all.filter((o) => {
      if (userId && o.userId && o.userId === userId) return true;
      if (cleanPhone) {
        const oPhone = (o.address?.phone || o.address?.mobileNumber || '').replace(/\D/g, '').slice(-10);
        if (oPhone && oPhone === cleanPhone) return true;
      }
      return false;
    });
  },

  /**
   * Retrieve order by ID
   */
  getOrder(orderId: string): Order | undefined {
    this.loadFromDisk();
    return ordersMap.get(orderId);
  },

  /**
   * Retrieve order by provider order ID (merchantOrderId)
   */
  getOrderByProviderOrderId(providerOrderId: string): Order | undefined {
    this.loadFromDisk();
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
    this.loadFromDisk();
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
