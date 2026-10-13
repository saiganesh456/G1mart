import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { serverStoreSettings } from '@/lib/serverStoreSettings';
import { serverOrderStore } from '@/lib/serverOrderStore';
import type {
  SlipOrder,
  SlipOrderStatus,
  SlipImage,
  SlipItem,
  OrderStatusHistoryItem,
} from '@/types/slipOrder';

const SLIP_ORDERS_FILE_PATH = path.join(process.cwd(), 'data', 'g1mart_slip_orders.json');

declare global {
  // eslint-disable-next-line no-var
  var __g1SlipOrdersMap: Map<string, SlipOrder> | undefined;
}

if (!global.__g1SlipOrdersMap) {
  global.__g1SlipOrdersMap = new Map<string, SlipOrder>();
}

const slipsMap = global.__g1SlipOrdersMap;

function ensureDataDir(): void {
  try {
    const dir = path.dirname(SLIP_ORDERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem in serverless environments
  }
}

function loadDiskSlipOrders(): SlipOrder[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SLIP_ORDERS_FILE_PATH)) {
      const raw = fs.readFileSync(SLIP_ORDERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[serverSlipOrders] Error reading from disk:', err);
  }
  return [];
}

function persistDiskSlipOrders(): void {
  try {
    ensureDataDir();
    const list = Array.from(slipsMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    fs.writeFileSync(SLIP_ORDERS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[serverSlipOrders] Error writing to disk:', err);
  }
}

// Initial hydration from disk
if (slipsMap.size === 0) {
  const disk = loadDiskSlipOrders();
  disk.forEach((o) => slipsMap.set(o.id, o));
}

export const serverSlipOrders = {
  /**
   * Helper: Add status change event to history
   */
  addStatusHistory(
    slip: SlipOrder,
    status: SlipOrderStatus | string,
    notes?: string | null,
    changedBy: string = 'system'
  ): OrderStatusHistoryItem {
    const historyItem: OrderStatusHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_id: slip.id,
      status,
      notes: notes || null,
      changed_by: changedBy,
      created_at: new Date().toISOString(),
    };

    if (!slip.status_history) slip.status_history = [];
    slip.status_history.push(historyItem);

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      supabase
        .from('order_status_history')
        .insert({
          id: historyItem.id,
          order_id: historyItem.order_id,
          status: historyItem.status,
          notes: historyItem.notes,
          changed_by: historyItem.changed_by,
          created_at: historyItem.created_at,
        })
        .then(() => {})
        .catch(() => {});
    }

    return historyItem;
  },

  /**
   * 1. Customer Uploads New Slip
   * Status begins at SLIP_RECEIVED. Copies saved location, distance, zone.
   */
  async createSlipOrder(params: {
    customerName: string;
    customerPhone: string;
    customerNote?: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
    pincode?: string | null;
    distanceKm: number;
    etaMin: number;
    zoneId?: string | null;
    zoneMinOrder: number;
    orderType?: 'delivery' | 'pickup';
    images: Array<{ storagePath: string; imageUrl: string }>;
  }): Promise<SlipOrder> {
    const id = `SLIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const slipImages: SlipImage[] = params.images.map((img, idx) => ({
      id: `img_${id}_${idx + 1}`,
      slip_order_id: id,
      storage_path: img.storagePath,
      image_url: img.imageUrl,
      sort_order: idx,
      created_at: nowIso,
    }));

    const order: SlipOrder = {
      id,
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      customer_note: params.customerNote?.trim() || null,

      address: params.address,
      lat: params.lat ?? null,
      lng: params.lng ?? null,
      pincode: params.pincode ?? null,
      distance_km: params.distanceKm,
      eta_min: params.etaMin,
      zone_id: params.zoneId ?? null,
      zone_min_order: params.zoneMinOrder,
      order_type: params.orderType || 'delivery',

      status: 'SLIP_RECEIVED',
      estimated_total: 0,
      final_total: 0,
      subtotal: 0,
      delivery_fee: 0,
      cod_fee: 0,

      payment_method: null,
      payment_status: 'pending',
      transaction_id: null,

      billed_by: null,
      packed_by: null,
      assigned_rider_id: null,
      assigned_rider_name: null,
      assigned_rider_phone: null,

      admin_notes: null,
      cancel_reason: null,

      images: slipImages,
      items: [],
      status_history: [],

      created_at: nowIso,
      updated_at: nowIso,
    };

    // Log initial history
    this.addStatusHistory(
      order,
      'SLIP_RECEIVED',
      `Customer uploaded slip with ${slipImages.length} image(s)`,
      params.customerName
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    // Mirror to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('slip_orders').insert({
          id: order.id,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_note: order.customer_note,
          address: order.address,
          lat: order.lat,
          lng: order.lng,
          pincode: order.pincode,
          distance_km: order.distance_km,
          eta_min: order.eta_min,
          zone_id: order.zone_id,
          zone_min_order: order.zone_min_order,
          order_type: order.order_type,
          status: order.status,
          estimated_total: order.estimated_total,
          final_total: order.final_total,
          subtotal: order.subtotal,
          delivery_fee: order.delivery_fee,
          cod_fee: order.cod_fee,
          payment_status: order.payment_status,
          created_at: order.created_at,
          updated_at: order.updated_at,
        });

        if (slipImages.length > 0) {
          await supabase.from('slip_images').insert(
            slipImages.map((img) => ({
              id: img.id,
              slip_order_id: img.slip_order_id,
              storage_path: img.storage_path,
              image_url: img.image_url,
              sort_order: img.sort_order,
              created_at: img.created_at,
            }))
          );
        }
      } catch (err) {
        console.warn('[serverSlipOrders] Supabase sync note:', err);
      }
    }

    return order;
  },

  /**
   * List all slip orders
   */
  async getSlipOrders(filterStatus?: SlipOrderStatus): Promise<SlipOrder[]> {
    const list = Array.from(slipsMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (filterStatus) {
      return list.filter((o) => o.status === filterStatus);
    }
    return list;
  },

  /**
   * Get slip order by ID
   */
  async getSlipOrderById(id: string): Promise<SlipOrder | null> {
    const order = slipsMap.get(id);
    if (order) return order;

    // Check disk
    const disk = loadDiskSlipOrders();
    const match = disk.find((o) => o.id === id);
    if (match) {
      slipsMap.set(match.id, match);
      return match;
    }
    return null;
  },

  /**
   * 2. Admin Bill Builder: Save Billed Items & Estimated Total
   * Moves status to BILLING or AWAITING_CUSTOMER_CONFIRMATION
   */
  async saveBillingItems(params: {
    slipId: string;
    items: Array<{
      productId?: string | null;
      name: string;
      requestedQty: number;
      unit: string;
      price: number;
      available?: boolean;
      substituteNote?: string | null;
    }>;
    adminNotes?: string;
    billedBy?: string;
    moveStatus?: 'BILLING' | 'AWAITING_CUSTOMER_CONFIRMATION';
  }): Promise<SlipOrder | null> {
    const order = await this.getSlipOrderById(params.slipId);
    if (!order) return null;

    const nowIso = new Date().toISOString();

    const slipItems: SlipItem[] = params.items.map((it, idx) => ({
      id: `item_${order.id}_${idx + 1}`,
      slip_order_id: order.id,
      product_id: it.productId || null,
      name: it.name.trim(),
      requested_qty: Number(it.requestedQty) || 1,
      packed_qty: 0,
      unit: it.unit || 'unit',
      price: Number(it.price) || 0,
      available: it.available !== false,
      substitute_note: it.substituteNote || null,
      created_at: nowIso,
    }));

    const estimatedTotal = slipItems.reduce(
      (sum, item) => (item.available ? sum + item.price * item.requested_qty : sum),
      0
    );

    order.items = slipItems;
    order.estimated_total = estimatedTotal;
    order.subtotal = estimatedTotal;
    order.admin_notes = params.adminNotes !== undefined ? params.adminNotes : order.admin_notes;
    order.billed_by = params.billedBy || 'Staff Admin';
    order.updated_at = nowIso;

    const nextStatus = params.moveStatus || 'BILLING';
    order.status = nextStatus;

    this.addStatusHistory(
      order,
      nextStatus,
      `Billed ${slipItems.length} items (Est. Total: ₹${estimatedTotal})`,
      params.billedBy || 'Staff Admin'
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return order;
  },

  /**
   * 3. Admin "Mark Confirmed by Call"
   * Moves status to CONFIRMED (ready for packer checklist)
   */
  async markConfirmedByCall(slipId: string, staffName: string = 'Staff Admin', notes?: string): Promise<SlipOrder | null> {
    const order = await this.getSlipOrderById(slipId);
    if (!order) return null;

    order.status = 'CONFIRMED';
    order.updated_at = new Date().toISOString();

    this.addStatusHistory(
      order,
      'CONFIRMED',
      notes || 'Confirmed with customer by telephone call',
      staffName
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    // Mirror as standard order into serverOrderStore so packer and admin orders see it
    try {
      await serverOrderStore.createPendingOrder({
        orderId: order.id,
        merchantOrderId: `MT_${order.id}`,
        items: (order.items || []).map((it) => ({
          productId: it.product_id || it.id,
          productName: it.name,
          unit: it.unit,
          price: it.price,
          quantity: it.requested_qty,
          image: '/products/placeholder.svg',
        })),
        subtotal: order.subtotal,
        deliveryFee: 0,
        taxes: 0,
        grandTotal: order.subtotal,
        final_total: order.subtotal,
        address: {
          fullName: order.customer_name,
          phone: order.customer_phone,
          mobileNumber: order.customer_phone,
          streetArea: order.address,
          city: 'Nellore',
        },
        slot: order.order_type === 'pickup' ? 'Store Pickup' : 'Standard Delivery',
        paymentMethod: 'Cash on Delivery',
        distance_km: order.distance_km,
        zone_min_order: order.zone_min_order,
        orderType: 'slip',
      });
    } catch {}

    return order;
  },

  /**
   * 4. Packer Updates Checklist & Ticks Items
   */
  async updatePackerChecklist(
    slipId: string,
    itemsUpdate: Array<{
      id: string;
      packedQty: number;
      available: boolean;
      substituteNote?: string | null;
    }>,
    staffName: string = 'Packer'
  ): Promise<SlipOrder | null> {
    const order = await this.getSlipOrderById(slipId);
    if (!order) return null;

    const itemMap = new Map((order.items || []).map((i) => [i.id, i]));
    for (const update of itemsUpdate) {
      const it = itemMap.get(update.id);
      if (it) {
        it.packed_qty = Number(update.packedQty) || 0;
        it.available = update.available;
        if (update.substituteNote !== undefined) it.substitute_note = update.substituteNote;
      }
    }

    if (order.status === 'CONFIRMED') {
      order.status = 'PACKING';
      this.addStatusHistory(order, 'PACKING', 'Packing started by store staff', staffName);
    }

    order.updated_at = new Date().toISOString();
    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return order;
  },

  /**
   * 5. Packer "Mark Packed"
   * Recalculates final_total from actual quantities, moves to PACKED -> AWAITING_PAYMENT.
   */
  async markPacked(
    slipId: string,
    packedItems: Array<{
      id: string;
      packedQty: number;
      available: boolean;
      substituteNote?: string | null;
    }>,
    staffName: string = 'Packer'
  ): Promise<SlipOrder | null> {
    const order = await this.getSlipOrderById(slipId);
    if (!order) return null;

    // Apply actual packed quantities and availability
    const itemMap = new Map((order.items || []).map((i) => [i.id, i]));
    for (const update of packedItems) {
      const it = itemMap.get(update.id);
      if (it) {
        it.packed_qty = Number(update.packedQty) || 0;
        it.available = update.available;
        if (update.substituteNote !== undefined) it.substitute_note = update.substituteNote;
      }
    }

    // Recalculate final subtotal from actual packed quantities of available items
    const actualSubtotal = (order.items || []).reduce(
      (sum, item) => (item.available ? sum + item.price * (item.packed_qty || item.requested_qty) : sum),
      0
    );

    order.subtotal = actualSubtotal;
    order.delivery_fee = 0; // FREE in all zones
    order.final_total = actualSubtotal;
    order.packed_by = staffName;
    order.updated_at = new Date().toISOString();

    // Move to PACKED then AWAITING_PAYMENT
    this.addStatusHistory(order, 'PACKED', `Packed and verified (Final Subtotal: ₹${actualSubtotal})`, staffName);
    order.status = 'AWAITING_PAYMENT';
    this.addStatusHistory(order, 'AWAITING_PAYMENT', 'Customer notified to review bill & pay', staffName);

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return order;
  },

  /**
   * 6. Customer Final Bill Payment (Pay Online or Pay on Delivery)
   * Re-validates distance/zone minimum order before allowing payment.
   */
  async processCustomerPayment(params: {
    slipId: string;
    paymentMethod: 'online' | 'cod';
    transactionId?: string;
  }): Promise<{ success: boolean; order?: SlipOrder; error?: string }> {
    const order = await this.getSlipOrderById(params.slipId);
    if (!order) return { success: false, error: 'Slip order not found' };

    const isPickup = order.order_type === 'pickup';

    // Zone Minimum Check on Final Subtotal
    if (!isPickup && order.subtotal < order.zone_min_order) {
      const shortfall = order.zone_min_order - order.subtotal;
      return {
        success: false,
        error: `Final bill subtotal (₹${order.subtotal}) is below the ₹${order.zone_min_order} zone minimum. Please add ₹${shortfall} more items.`,
      };
    }

    const nowIso = new Date().toISOString();

    if (params.paymentMethod === 'cod') {
      const settings = await serverStoreSettings.getStoreSettings();
      const codFee = Number(settings.cod_fee ?? 50);

      order.cod_fee = codFee;
      order.final_total = order.subtotal + codFee;
      order.payment_method = 'Cash on Delivery';
      order.payment_status = 'COD_PENDING';
      order.status = 'COD_PENDING';
      order.updated_at = nowIso;

      this.addStatusHistory(
        order,
        'COD_PENDING',
        `Pay on delivery selected (+₹${codFee} fee). Total: ₹${order.final_total}`,
        order.customer_name
      );
    } else {
      // Pay Online via Razorpay
      order.cod_fee = 0;
      order.final_total = order.subtotal;
      order.payment_method = 'Razorpay UPI/Card';
      order.payment_status = 'paid';
      order.transaction_id = params.transactionId || `pay_${Date.now()}`;
      order.status = 'PAID';
      order.updated_at = nowIso;

      this.addStatusHistory(
        order,
        'PAID',
        `Online payment verified successfully (Txn: ${order.transaction_id})`,
        order.customer_name
      );
    }

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return { success: true, order };
  },

  /**
   * 7. Assign Delivery Partner / Rider
   * Rider is assigned only AFTER payment (PAID or COD_PENDING).
   */
  async assignRider(params: {
    slipId: string;
    riderId: string;
    riderName: string;
    riderPhone: string;
    staffName?: string;
  }): Promise<{ success: boolean; order?: SlipOrder; error?: string }> {
    const order = await this.getSlipOrderById(params.slipId);
    if (!order) return { success: false, error: 'Slip order not found' };

    // Rider assignment restriction: only after payment
    if (order.status !== 'PAID' && order.status !== 'COD_PENDING' && order.status !== 'RIDER_ASSIGNED') {
      return {
        success: false,
        error: `Cannot assign rider until customer confirms payment. Current status: ${order.status}`,
      };
    }

    order.assigned_rider_id = params.riderId;
    order.assigned_rider_name = params.riderName;
    order.assigned_rider_phone = params.riderPhone;
    order.status = 'RIDER_ASSIGNED';
    if (!order.delivery_otp) {
      order.delivery_otp = Math.floor(1000 + Math.random() * 9000).toString();
    }
    order.updated_at = new Date().toISOString();

    this.addStatusHistory(
      order,
      'RIDER_ASSIGNED',
      `Rider ${params.riderName} (${params.riderPhone}) assigned`,
      params.staffName || 'Dispatcher'
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return { success: true, order };
  },

  /**
   * 8. Update Delivery Status (Out for Delivery -> Delivered)
   */
  async updateDeliveryStatus(
    slipId: string,
    status: 'OUT_FOR_DELIVERY' | 'DELIVERED',
    staffOrRider: string = 'Rider'
  ): Promise<{ success: boolean; order?: SlipOrder; error?: string }> {
    const order = await this.getSlipOrderById(slipId);
    if (!order) return { success: false, error: 'Slip order not found' };

    order.status = status;
    order.updated_at = new Date().toISOString();

    if (status === 'DELIVERED' && order.payment_status === 'COD_PENDING') {
      order.payment_status = 'completed';
    }

    this.addStatusHistory(
      order,
      status,
      status === 'DELIVERED' ? 'Order delivered and COD cash collected' : 'Out for doorstep delivery',
      staffOrRider
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return { success: true, order };
  },

  /**
   * 9. Cancel Order with Reason
   */
  async cancelSlipOrder(
    slipId: string,
    cancelReason: string,
    staffName: string = 'Staff Admin'
  ): Promise<{ success: boolean; order?: SlipOrder; error?: string }> {
    const order = await this.getSlipOrderById(slipId);
    if (!order) return { success: false, error: 'Slip order not found' };

    order.status = 'CANCELLED';
    order.cancel_reason = cancelReason;
    order.updated_at = new Date().toISOString();

    this.addStatusHistory(order, 'CANCELLED', `Order cancelled: ${cancelReason}`, staffName);

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return { success: true, order };
  },

  /**
   * 10. Customer adds top-up items to meet zone minimum (Phase 6 Rule 5)
   */
  async addCustomerItems(
    slipId: string,
    itemsToAdd: Array<{
      productId?: string | null;
      name: string;
      unit: string;
      price: number;
      quantity: number;
    }>
  ): Promise<{ success: boolean; order?: SlipOrder; error?: string }> {
    const order = await this.getSlipOrderById(slipId);
    if (!order) return { success: false, error: 'Slip order not found' };

    const nowIso = new Date().toISOString();
    const newItems: SlipItem[] = itemsToAdd.map((it, idx) => ({
      id: `item_${order.id}_add_${Date.now()}_${idx + 1}`,
      slip_order_id: order.id,
      product_id: it.productId || null,
      name: it.name,
      requested_qty: Number(it.quantity) || 1,
      packed_qty: Number(it.quantity) || 1,
      unit: it.unit || 'unit',
      price: Number(it.price) || 0,
      available: true,
      substitute_note: null,
      created_at: nowIso,
    }));

    if (!order.items) order.items = [];
    order.items.push(...newItems);

    const actualSubtotal = order.items.reduce(
      (sum, item) => (item.available ? sum + item.price * (item.packed_qty || item.requested_qty) : sum),
      0
    );

    order.subtotal = actualSubtotal;
    order.final_total = actualSubtotal;
    order.estimated_total = actualSubtotal;
    order.updated_at = nowIso;

    this.addStatusHistory(
      order,
      order.status,
      `Customer added ${newItems.length} item(s) to meet minimum. New subtotal: ₹${actualSubtotal}`,
      order.customer_name
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    return { success: true, order };
  },
};
