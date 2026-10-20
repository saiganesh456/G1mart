import fs from 'fs';
import path from 'path';
import os from 'os';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';
import { resolveLegacyId } from '@/lib/legacyIdMap';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';
import { serverProductOverrides } from '@/lib/serverProductOverrides';
import type { Order, OrderItem, PaymentRecord, PaymentStatus, OrderStatus } from '@/types';
import migratedVariantsData from '../../data/migrated_product_variants.json';
import { formatToIST, formatTimeToIST } from '@/lib/dateUtils';

const PRIMARY_ORDERS_PATH = path.join(process.cwd(), 'src', 'data', 'orders_store.json');
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

const toValidUuidOrNull = (val?: string | null): string | null => {
  if (!val || typeof val !== 'string') return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) ? val : null;
};

export const STATUS_RANK: Record<string, number> = {
  'Order Placed': 1,
  'New': 1,
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
  async recalculateOrderTotal(rawItems: any[]): Promise<RecalculatedCart> {
    // Ensure overrides are synced from database / cloud KV
    let overridesMap = global.__g1ProductOverrides;
    try {
      overridesMap = await serverProductOverrides.getOverrides();
    } catch (err) {
      console.warn('[serverOrderStore] Failed to load product overrides:', err);
    }

    // Use imported variants and product list for server-side price verification
    const variantById = new Map((migratedVariantsData as any[]).map((v) => [v.id, v]));
    const migratedProductById = new Map(MIGRATED_PRODUCT_LIST.map((p) => [p.id, p]));

    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const pid = item.productId || item.id;
      const canonicalPid = resolveLegacyId(pid) || pid;
      const vid = item.variantId || item.variant_id;

      // Check if this product has dynamic price overrides from admin
      const override = overridesMap?.get(pid) || (canonicalPid ? overridesMap?.get(canonicalPid) : undefined);

      // --- Try variant price first (most accurate) ---
      if (vid) {
        const variant = variantById.get(vid);
        if (variant && (variant.product_id === pid || variant.product_id === canonicalPid)) {
          const qty = Math.max(1, Math.min(item.quantity || 1, 10000));
          let unitPrice = variant.price > 0 ? variant.price : 10;
          if (override) {
            if (override.variants && Array.isArray(override.variants)) {
              const ov = override.variants.find((v: any) => v.id === vid || v.size_label === variant.size_label || v.unit === variant.size_label);
              if (ov && ov.price !== undefined && Number(ov.price) > 0) {
                unitPrice = Number(ov.price);
              } else if (override.price !== undefined && Number(override.price) > 0) {
                unitPrice = Number(override.price);
              }
            } else if (override.price !== undefined && Number(override.price) > 0) {
              unitPrice = Number(override.price);
            }
          }
          const lineTotal = unitPrice * qty;
          subtotal += lineTotal;

          // Try to get product name and image
          const mp = migratedProductById.get(pid) || (canonicalPid ? migratedProductById.get(canonicalPid) : undefined);
          const resolvedName = item.productName || item.name || override?.name || mp?.name || 'Grocery Item';
          const resolvedImg =
            item.image ||
            override?.imageUrl ||
            mp?.imageUrl ||
            mp?.image ||
            (mp as any)?.image_url ||
            '/products/placeholder.svg';

          verifiedItems.push({
            productId: pid,
            productName: resolvedName,
            unit: variant.size_label || override?.unit || mp?.unit || '1 unit',
            price: unitPrice,
            quantity: qty,
            image: resolvedImg,
            variantId: vid,
            sizeLabel: variant.size_label,
          });
          continue;
        }
      }

      // --- Fallback: catalog product lookup ---
      let product = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalPid || p.id === pid);

      if (!product && item.name) {
        product = MIGRATED_PRODUCT_LIST.find((p) => p.name.toLowerCase().includes(item.name.toLowerCase()));
      }

      if (!product) {
        product = MIGRATED_PRODUCT_LIST[0];
      }

      // Ensure price is confirmed or fallback to baseline
      const basePrice = product.price > 0 ? product.price : product.originalPrice > 0 ? product.originalPrice : 10;
      const unitPrice = override?.price !== undefined && Number(override.price) > 0 ? Number(override.price) : basePrice;
      const qty = Math.max(1, Math.min(item.quantity || 1, 10000));

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      const fallbackImg =
        item.image ||
        product.imageUrl ||
        product.image ||
        (product as any).image_url ||
        (product as any).image_path ||
        '/products/placeholder.svg';

      verifiedItems.push({
        productId: product.id,
        productName: item.productName || product.name,
        unit: product.unit,
        price: unitPrice,
        quantity: qty,
        image: fallbackImg,
      });
    }

    // Business Rule: Delivery is free in all zones. No delivery fee.
    const deliveryFee = 0;
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
    distance_km?: number;
    distanceKm?: number;
    zone_min_order?: number;
    zoneMinOrder?: number;
    cod_fee?: number;
    codFee?: number;
    final_total?: number;
    finalTotal?: number;
    type?: 'standard' | 'slip';
    orderType?: 'standard' | 'slip' | 'pickup' | 'delivery';
  }): Promise<Order> {
    const distanceKm = params.distance_km ?? params.distanceKm;
    const zoneMinOrder = params.zone_min_order ?? params.zoneMinOrder;
    const codFee = params.cod_fee ?? params.codFee ?? 0;
    const finalTotal = params.final_total ?? params.finalTotal ?? params.grandTotal;
    const orderType = params.orderType ?? params.type ?? 'standard';

    const order: Order = {
      id: params.orderId,
      orderNumber: params.orderId,
      date: formatToIST(),
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
      finalTotal,
      final_total: finalTotal,
      distanceKm,
      distance_km: distanceKm,
      zoneMinOrder,
      zone_min_order: zoneMinOrder,
      codFee,
      cod_fee: codFee,
      orderType,
      type: params.type || (orderType === 'slip' ? 'slip' : 'standard'),
      isPaid: false,
      paidAmount: 0,
      providerOrderId: params.merchantOrderId,
      userId: params.userId,
      userEmail: params.userEmail,
      deliveryOtp: '1234',
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

    // Persist to Supabase if configured (valid schema columns only)
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').upsert({
          id: order.id,
          user_id: params.userId || null,
          date: order.date,
          slot: order.slot,
          payment_method: order.paymentMethod,
          is_paid: false,
          status: 'Order Placed',
          subtotal: order.subtotal,
          discount: 0,
          delivery_fee: order.deliveryFee,
          taxes: order.taxes,
          grand_total: order.grandTotal,
          address: {
            ...order.address,
            _status: 'Order Placed',
            _deliveryOtp: order.deliveryOtp,
            _items: order.items,
            _paymentStatus: 'pending',
            _providerOrderId: params.merchantOrderId,
            _userId: params.userId,
            _userEmail: params.userEmail,
            _distanceKm: distanceKm,
            _zoneMinOrder: zoneMinOrder,
            _codFee: codFee,
            _finalTotal: finalTotal,
          },
          updated_at: new Date().toISOString(),
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

    // Update Supabase if configured (valid schema columns only)
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            is_paid: true,
            address: {
              ...(order.address || {}),
              _items: order.items,
              _paymentStatus: 'completed',
              _paidAmount: order.grandTotal,
              _paidAt: nowIso,
              _transactionId: params.transactionId,
            },
            updated_at: nowIso,
          })
          .eq('id', order.id);
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
            is_paid: true,
            address: {
              ...(order.address || {}),
              _items: order.items,
              _paymentStatus: 'manual_verified',
              _paidAmount: order.grandTotal,
              _paidAt: nowIso,
              _markedPaidBy: staffIdentifier,
            },
            updated_at: nowIso,
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
          const rawAddr = data.address;
          const addr = typeof rawAddr === 'string' ? (() => { try { return JSON.parse(rawAddr); } catch { return {}; } })() : (rawAddr || {});
          const realStatus = (addr._status || data.status || 'Order Placed') as OrderStatus;
          const loadedOrder: Order = {
            id: data.id,
            date: data.date,
            slot: data.slot,
            paymentMethod: data.payment_method,
            paymentStatus: data.is_paid ? 'completed' : (addr._paymentStatus || (data.payment_method === 'Cash on Delivery' ? 'cash_on_delivery' : 'pending')),
            isPaid: data.is_paid,
            status: realStatus,
            subtotal: Number(data.subtotal),
            discount: Number(data.discount),
            deliveryFee: Number(data.delivery_fee),
            taxes: Number(data.taxes),
            grandTotal: Number(data.grand_total),
            items: (addr._items && Array.isArray(addr._items) && addr._items.length > 0)
              ? addr._items
              : [],
            address: addr,
            assignedRider: addr._assignedRider,
            deliveryOtp: addr._deliveryOtp,
            timeline: addr._timeline || [
              { status: 'Order Placed', time: 'Confirmed', completed: true },
              { status: 'Packed', time: 'Pending', completed: realStatus === 'Packed' || realStatus === 'Rider Assigned' || realStatus === 'Out for Delivery' || realStatus === 'Delivered' },
              { status: 'Out for Delivery', time: 'Pending', completed: realStatus === 'Out for Delivery' || realStatus === 'Delivered' },
              { status: 'Delivered', time: 'Pending', completed: realStatus === 'Delivered' },
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

    const timeStr = formatTimeToIST();

    order.status = status;
    if (!order.deliveryOtp) {
      order.deliveryOtp = '1234';
    }
    if (assignedRider) {
      order.assignedRider = {
        ...assignedRider,
        assignedAt: assignedRider.assignedAt || new Date().toISOString(),
      };
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date().toISOString();
      if (!order.isPaid && (order.paymentMethod === 'Cash on Delivery' || (order as any).cashCollected)) {
        order.isPaid = true;
        order.paymentStatus = 'completed';
        order.paidAmount = order.grandTotal;
        order.paidAt = new Date().toISOString();
      }
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

    const isPickup = Boolean(
      order.orderType === 'pickup' ||
      order.slot?.toLowerCase().includes('pickup') ||
      order.address?.streetArea?.toLowerCase().includes('pickup') ||
      (order.address as any)?.orderType === 'pickup'
    );

    const prevFirstTime = (order.timeline && order.timeline[0]?.time) || 'Confirmed';
    order.timeline = [
      { status: 'Order Placed', time: prevFirstTime, completed: true },
      {
        status: isPickup ? ('Ready for Pickup' as any) : 'Packed',
        time: isPacked ? timeStr : (status === 'Confirmed' ? 'Confirmed' : status === 'Packing' ? 'Packing' : 'Pending'),
        completed: isPacked,
      },
      {
        status: isPickup ? ('Ready for Pickup' as any) : 'Out for Delivery',
        time: isDispatched ? timeStr : (isPickup && isPacked ? timeStr : 'Pending'),
        completed: isPickup ? isPacked : isDispatched,
      },
      {
        status: isPickup ? ('Picked Up' as any) : 'Delivered',
        time: isDelivered ? timeStr : 'Pending',
        completed: isDelivered,
      },
    ];

    const rawAddr = order.address;
    const existingAddr = typeof rawAddr === 'string' ? (() => { try { return JSON.parse(rawAddr); } catch { return {}; } })() : (rawAddr || {});
    order.address = {
      ...existingAddr,
      _items: (order.items && order.items.length > 0) ? order.items : (existingAddr._items || []),
      _status: status,
      _timeline: order.timeline,
      _deliveryOtp: order.deliveryOtp,
      _assignedRider: order.assignedRider,
      _paymentStatus: order.paymentStatus,
    };

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
          is_paid: Boolean(order.isPaid),
          updated_at: new Date().toISOString(),
          address: order.address,
        };

        const validRiderUuid = toValidUuidOrNull(order.assignedRider?.id);
        if (validRiderUuid) {
          updatePayload.assigned_rider_id = validRiderUuid;
        }

        const { error: updateErr } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', orderId);

        if (updateErr) {
          console.warn('[serverOrderStore] Supabase updateOrderStatus notice:', updateErr);
          if (updatePayload.assigned_rider_id) {
            delete updatePayload.assigned_rider_id;
            const { error: retryErr } = await supabase
              .from('orders')
              .update(updatePayload)
              .eq('id', orderId);
            if (retryErr) {
              console.warn('[serverOrderStore] Supabase updateOrderStatus retry error:', retryErr);
            }
          }
        }
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

    order.paymentStatus = 'COD_PENDING';
    order.isPaid = false;
    ordersMap.set(orderId, order);
    this.persistToDisk();

    if (isSupabaseConfigured()) {
      supabase
        .from('orders')
        .update({
          is_paid: false,
          status: 'Order Placed',
          address: {
            ...(order.address || {}),
            _items: (order.items && order.items.length > 0) ? order.items : ((order.address as any)?._items || []),
            _paymentStatus: 'COD_PENDING',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .then(() => {})
        .catch(() => {});
    }

    return { success: true, order };
  },

  persistToDisk() {
    try {
      const orders = Array.from(ordersMap.values());
      const dataStr = JSON.stringify(orders, null, 2);

      // Primary repository path (src/data/orders_store.json)
      try {
        const pDir = path.dirname(PRIMARY_ORDERS_PATH);
        if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });
        fs.writeFileSync(PRIMARY_ORDERS_PATH, dataStr, 'utf-8');
      } catch {}

      // Secondary root data path (data/g1mart_orders.json)
      try {
        const dir = path.dirname(ORDERS_FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(ORDERS_FILE_PATH, dataStr, 'utf-8');
      } catch {}

      // Ephemeral OS /tmp fallback for serverless
      try {
        const tmpPath = path.join(os.tmpdir(), 'g1mart_orders.json');
        fs.writeFileSync(tmpPath, dataStr, 'utf-8');
      } catch {}
    } catch (err) {
      console.warn('[serverOrderStore] persistToDisk error:', err);
    }
  },

  loadFromDisk() {
    try {
      const pathsToCheck = [
        PRIMARY_ORDERS_PATH,
        ORDERS_FILE_PATH,
        LEGACY_CACHE_PATH,
        path.join(os.tmpdir(), 'g1mart_orders.json'),
      ];

      for (const filePathToRead of pathsToCheck) {
        if (fs.existsSync(filePathToRead)) {
          try {
            const raw = fs.readFileSync(filePathToRead, 'utf-8');
            const diskOrders: Order[] = JSON.parse(raw);
            if (Array.isArray(diskOrders) && diskOrders.length > 0) {
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
                      items: (current.items && current.items.length > 0) ? current.items : (d.items || []),
                      address: current.address || d.address,
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
          } catch {}
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

    const items = (order.items && order.items.length > 0) ? order.items : (existing?.items || []);
    const itemsSum = items.reduce((sum: number, it: any) => sum + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0);
    const resolvedDeliveryFee = order.deliveryFee ?? existing?.deliveryFee ?? 0;
    const resolvedCodFee = (order as any).codFee ?? (order as any).cod_fee ?? (existing as any)?.codFee ?? (existing as any)?.cod_fee ?? 0;
    const resolvedDiscount = order.discount ?? existing?.discount ?? 0;
    const resolvedTaxes = order.taxes ?? existing?.taxes ?? 0;

    const resolvedSubtotal = itemsSum > 0 ? itemsSum : (order.subtotal || existing?.subtotal || order.grandTotal || 0);
    const calculatedGrand = resolvedSubtotal + resolvedDeliveryFee - resolvedDiscount + resolvedTaxes + resolvedCodFee;
    const resolvedGrandTotal = itemsSum > 0 && Math.abs(calculatedGrand - (order.grandTotal || existing?.grandTotal || 0)) > 1
      ? calculatedGrand
      : (order.grandTotal || existing?.grandTotal || calculatedGrand);

    if (!existing) {
      const newOrder: Order = {
        ...order,
        items,
        subtotal: resolvedSubtotal,
        grandTotal: resolvedGrandTotal,
        finalTotal: resolvedGrandTotal,
      };
      ordersMap.set(order.id, newOrder);
      this.persistToDisk();
      return newOrder;
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
      ...existing,
      ...order,
      items,
      address: order.address || existing?.address,
      subtotal: resolvedSubtotal,
      grandTotal: resolvedGrandTotal,
      finalTotal: resolvedGrandTotal,
      status: finalStatus,
      isPaid: finalIsPaid,
      paymentStatus: finalPaymentStatus,
      paidAmount: Math.max(existing?.paidAmount || 0, order.paidAmount || 0),
      timeline: finalTimeline,
      providerOrderId: existing?.providerOrderId || order.providerOrderId || `MT_${order.id}`,
    };
    ordersMap.set(order.id, merged);
    this.persistToDisk();
    return merged;
  },

  async registerOrderAsync(order: Order): Promise<Order> {
    const merged = this.registerOrder(order);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').upsert({
          id: merged.id,
          user_id: merged.userId || null,
          date: merged.date,
          slot: merged.slot || 'Standard Delivery',
          payment_method: merged.paymentMethod || 'Cash on Delivery',
          is_paid: Boolean(merged.isPaid),
          status: merged.status || 'Order Placed',
          subtotal: merged.subtotal || merged.grandTotal || 0,
          discount: merged.discount || 0,
          delivery_fee: merged.deliveryFee || 0,
          taxes: merged.taxes || 0,
          grand_total: merged.grandTotal || 0,
          address: {
            ...merged.address,
            _items: merged.items,
            _paymentStatus: merged.paymentStatus,
            _userId: merged.userId,
            _userEmail: merged.userEmail,
          },
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[serverOrderStore] Supabase async register note:', err);
      }
    }

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

  async getUserOrdersAsync(userId?: string, phone?: string): Promise<Order[]> {
    const all = await this.getAllOrdersAsync();
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
   * Retrieve order by ID with flexible prefix and orderNumber matching
   */
  getOrder(orderId: string): Order | undefined {
    this.loadFromDisk();
    if (!orderId) return undefined;

    let order = ordersMap.get(orderId);
    if (order) return order;

    const cleanTarget = String(orderId).replace(/^SLIP-/i, '').trim().toLowerCase();
    for (const o of ordersMap.values()) {
      const oId = String(o.id || '').replace(/^SLIP-/i, '').trim().toLowerCase();
      const oNum = String(o.orderNumber || '').replace(/^SLIP-/i, '').trim().toLowerCase();
      if (oId === cleanTarget || oNum === cleanTarget || o.providerOrderId === orderId) {
        return o;
      }
    }
    return undefined;
  },

  async getOrderAsync(orderId: string): Promise<Order | undefined> {
    this.loadFromDisk();
    let order = this.getOrder(orderId);
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
        if (data) {
          const addr = data.address || {};
          const existing = order;
          const realStatus = (addr._status || data.status || 'Order Placed') as OrderStatus;
          const items = (existing?.items && existing.items.length > 0) ? existing.items : (addr._items || []);
          const rawSubtotal = Number(data.subtotal || 0);
          const rawGrand = Number(data.grand_total || 0);
          const itemsSum = items.reduce((acc: number, it: any) => acc + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0);
          const effectiveSubtotal = itemsSum > 0 ? itemsSum : rawSubtotal;
          const codFee = Number(addr._codFee || addr.codFee || (data.payment_method === 'Cash on Delivery' && !data.slot?.toLowerCase().includes('pickup') ? 50 : 0));
          const effectiveGrandTotal = itemsSum > 0 && (rawGrand < itemsSum || Math.abs((itemsSum + codFee) - rawGrand) > 5)
            ? itemsSum + Number(data.delivery_fee || 0) + codFee
            : rawGrand;

          order = {
            id: data.id,
            orderNumber: data.id,
            date: data.date,
            slot: data.slot,
            paymentMethod: data.payment_method,
            paymentStatus: data.is_paid ? 'completed' : (addr._paymentStatus || (data.payment_method === 'Cash on Delivery' ? 'cash_on_delivery' : 'pending')),
            isPaid: Boolean(data.is_paid),
            paidAmount: addr._paidAmount || (data.is_paid ? effectiveGrandTotal : 0),
            paidAt: addr._paidAt,
            status: realStatus,
            subtotal: effectiveSubtotal,
            discount: Number(data.discount || 0),
            deliveryFee: Number(data.delivery_fee || 0),
            taxes: Number(data.taxes || 0),
            grandTotal: effectiveGrandTotal,
            codFee,
            orderType: addr.orderType || existing?.orderType || (data.slot?.toLowerCase().includes('pickup') ? 'pickup' : 'standard'),
            items,
            address: addr,
            userId: data.user_id || addr._userId,
            userEmail: addr._userEmail,
            deliveryOtp: addr._deliveryOtp || existing?.deliveryOtp || '1234',
            assignedRider: addr._assignedRider || existing?.assignedRider,
            timeline: addr._timeline || existing?.timeline || [
              { status: 'Order Placed', time: 'Confirmed', completed: true },
              { status: 'Packed', time: 'Pending', completed: realStatus === 'Packed' || realStatus === 'Rider Assigned' || realStatus === 'Out for Delivery' || realStatus === 'Delivered' },
              { status: 'Out for Delivery', time: 'Pending', completed: realStatus === 'Out for Delivery' || realStatus === 'Delivered' },
              { status: 'Delivered', time: 'Pending', completed: realStatus === 'Delivered' },
            ],
          };
          ordersMap.set(data.id, order);
          this.persistToDisk();

          if (isSupabaseConfigured() && (effectiveSubtotal !== rawSubtotal || effectiveGrandTotal !== rawGrand)) {
            supabase.from('orders').update({
              subtotal: effectiveSubtotal,
              grand_total: effectiveGrandTotal,
              updated_at: new Date().toISOString(),
            }).eq('id', data.id).then(() => {}).catch(() => {});
          }
        }
      } catch {}
    }
    return order;
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
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
  },

  /**
   * Get all orders with async Supabase remote database synchronization
   */
  async getAllOrdersAsync(): Promise<Order[]> {
    this.loadFromDisk();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('date', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          for (const row of data) {
            if (!row || !row.id) continue;
            const existing = ordersMap.get(row.id);
            const rawAddr = row.address;
            const addr = typeof rawAddr === 'string' ? (() => { try { return JSON.parse(rawAddr); } catch { return {}; } })() : (rawAddr || {});
            const items = existing?.items?.length ? existing.items : (addr._items || []);
            const realStatus = (addr._status || row.status || 'Order Placed') as OrderStatus;
            const curRank = STATUS_RANK[existing?.status || ''] || 0;
            const remoteRank = STATUS_RANK[realStatus] || 0;
            const winningStatus = curRank > remoteRank ? existing!.status : realStatus;
            const winningRider = curRank > remoteRank ? (existing?.assignedRider || addr._assignedRider) : (addr._assignedRider || existing?.assignedRider);
            const rawSubtotal = Number(row.subtotal || existing?.subtotal || 0);
            const rawGrand = Number(row.grand_total || existing?.grandTotal || 0);
            const itemsSum = items.reduce((acc: number, it: any) => acc + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0);
            const effectiveSubtotal = itemsSum > 0 ? itemsSum : rawSubtotal;
            const codFee = Number(addr._codFee || addr.codFee || (row.payment_method === 'Cash on Delivery' && !row.slot?.toLowerCase().includes('pickup') ? 50 : 0));
            const effectiveGrandTotal = itemsSum > 0 && (rawGrand < itemsSum || Math.abs((itemsSum + codFee) - rawGrand) > 5)
              ? itemsSum + Number(row.delivery_fee || 0) + codFee
              : rawGrand;

            const syncedOrder: Order = {
              id: row.id,
              orderNumber: existing?.orderNumber || row.id,
              date: row.date || existing?.date || new Date().toISOString(),
              slot: row.slot || existing?.slot || 'Standard Delivery',
              orderType: addr.orderType || existing?.orderType || (row.slot?.toLowerCase().includes('pickup') ? 'pickup' : 'standard'),
              paymentMethod: (row.payment_method as any) || existing?.paymentMethod || 'Cash on Delivery',
              paymentStatus: row.is_paid
                ? 'completed'
                : (addr._paymentStatus || existing?.paymentStatus || (row.payment_method === 'Cash on Delivery' ? 'cash_on_delivery' : 'pending')),
              isPaid: Boolean(row.is_paid ?? existing?.isPaid ?? false),
              status: winningStatus,
              subtotal: effectiveSubtotal,
              discount: Number(row.discount || existing?.discount || 0),
              deliveryFee: Number(row.delivery_fee || existing?.deliveryFee || 0),
              taxes: Number(row.taxes || existing?.taxes || 0),
              grandTotal: effectiveGrandTotal,
              codFee,
              items: items,
              address: { ...addr, ...(existing?.address || {}), _status: winningStatus, _assignedRider: winningRider },
              userId: row.user_id || existing?.userId || addr._userId,
              userEmail: existing?.userEmail || addr._userEmail,
              deliveryOtp: addr._deliveryOtp || existing?.deliveryOtp || '1234',
              assignedRider: winningRider,
              timeline: addr._timeline || existing?.timeline || [
                { status: 'Order Placed', time: 'Confirmed', completed: true },
                { status: 'Packed', time: 'Pending', completed: winningStatus === 'Packed' || winningStatus === 'Rider Assigned' || winningStatus === 'Out for Delivery' || winningStatus === 'Delivered' },
                { status: 'Out for Delivery', time: 'Pending', completed: winningStatus === 'Out for Delivery' || winningStatus === 'Delivered' },
                { status: 'Delivered', time: 'Pending', completed: winningStatus === 'Delivered' },
              ],
            };

            ordersMap.set(row.id, syncedOrder);

            if (isSupabaseConfigured() && (effectiveSubtotal !== rawSubtotal || effectiveGrandTotal !== rawGrand)) {
              supabase.from('orders').update({
                subtotal: effectiveSubtotal,
                grand_total: effectiveGrandTotal,
                updated_at: new Date().toISOString(),
              }).eq('id', row.id).then(() => {}).catch(() => {});
            }
          }
          this.persistToDisk();
        }
      } catch (err) {
        console.warn('[serverOrderStore] Supabase remote sync note in getAllOrdersAsync:', err);
      }
    }

    return Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
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

  /**
   * Completely clear all orders, payments, and webhooks from memory and disk
   */
  clearAllOrders() {
    ordersMap.clear();
    paymentsMap.clear();
    processedWebhooks.clear();
    this.persistToDisk();
  },
};
