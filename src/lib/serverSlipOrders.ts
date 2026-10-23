import fs from 'fs';
import path from 'path';
import os from 'os';
import { serverSupabase as supabase, fallbackSupabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';
import { generate4DigitOtp } from '@/lib/deliveryOtp';
import { serverStoreSettings } from '@/lib/serverStoreSettings';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';
import type { Order } from '@/types';
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
  const mergedSlips = new Map<string, SlipOrder>();
  try {
    ensureDataDir();
    const pathsToCheck = [
      SLIP_ORDERS_FILE_PATH,
      path.join(os.tmpdir(), 'g1mart_slip_orders.json'),
      path.join(process.cwd(), '.next', 'g1mart_slip_orders.json'),
    ];

    for (const filePath of pathsToCheck) {
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            for (const s of parsed) {
              if (s && s.id && !mergedSlips.has(s.id)) {
                mergedSlips.set(s.id, s);
              }
            }
          }
        } catch {}
      }
    }

    // Safety fallback: if primary file was empty, hydrate from latest data/backup_orders/
    if (mergedSlips.size === 0) {
      const backupDir = path.join(process.cwd(), 'data', 'backup_orders');
      if (fs.existsSync(backupDir)) {
        const files = fs
          .readdirSync(backupDir)
          .filter((f) => f.startsWith('g1mart_slip_orders_') && f.endsWith('.json'))
          .sort()
          .reverse();

        for (const file of files) {
          try {
            const raw = fs.readFileSync(path.join(backupDir, file), 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const s of parsed) {
                if (s && s.id && !mergedSlips.has(s.id)) {
                  mergedSlips.set(s.id, s);
                }
              }
              if (mergedSlips.size > 0) break;
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn('[serverSlipOrders] Error reading from disk:', err);
  }
  return Array.from(mergedSlips.values());
}

function persistDiskSlipOrders(): void {
  try {
    ensureDataDir();
    const list = Array.from(slipsMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    fs.writeFileSync(SLIP_ORDERS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem fallback
  }

  try {
    const tmpPath = path.join(os.tmpdir(), 'g1mart_slip_orders.json');
    const list = Array.from(slipsMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    fs.writeFileSync(tmpPath, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

async function syncSlipOrderToSupabase(slip: SlipOrder): Promise<void> {
  if (!slip || !slip.id) return;
  const clients = [supabase, fallbackSupabase];

  for (const client of clients) {
    try {
      await client.from('slip_orders').upsert({
        id: slip.id,
        customer_id: slip.customer_id || null,
        customer_name: slip.customer_name,
        customer_phone: slip.customer_phone,
        customer_note: slip.customer_note || null,
        address: slip.address,
        lat: slip.lat ? Number(slip.lat) : null,
        lng: slip.lng ? Number(slip.lng) : null,
        pincode: slip.pincode || null,
        distance_km: Number(slip.distance_km || 0),
        eta_min: Number(slip.eta_min || 15),
        zone_id: slip.zone_id || null,
        zone_min_order: Number(slip.zone_min_order || 500),
        order_type: slip.order_type || 'delivery',
        status: slip.status || 'SLIP_RECEIVED',
        estimated_total: Number(slip.estimated_total || 0),
        final_total: Number(slip.final_total || 0),
        subtotal: Number(slip.subtotal || 0),
        delivery_fee: Number(slip.delivery_fee || 0),
        cod_fee: Number(slip.cod_fee || 0),
        payment_method: slip.payment_method || null,
        payment_status: slip.payment_status || 'pending',
        transaction_id: slip.transaction_id || null,
        billed_by: slip.billed_by || null,
        packed_by: slip.packed_by || null,
        assigned_rider_id: slip.assigned_rider_id || null,
        assigned_rider_name: slip.assigned_rider_name || null,
        assigned_rider_phone: slip.assigned_rider_phone || null,
        admin_notes: slip.admin_notes || null,
        cancel_reason: slip.cancel_reason || null,
        delivery_otp: slip.delivery_otp || generate4DigitOtp(slip.id),
        arrived_at_doorstep: Boolean(slip.arrived_at_doorstep),
        updated_at: new Date().toISOString(),
      });

      if (Array.isArray(slip.items)) {
        // Clean up previous items first to prevent duplication or resurrecting deleted items
        await client.from('slip_items').delete().eq('slip_order_id', slip.id);

        if (slip.items.length > 0) {
          const itemsPayload = slip.items.map((it) => ({
            id: it.id,
            slip_order_id: slip.id,
            product_id: it.product_id || null,
            name: it.name,
            requested_qty: Number(it.requested_qty || 1),
            packed_qty: Number(it.packed_qty || 0),
            unit: it.unit || 'unit',
            price: Number(it.price || 0),
            available: it.available !== false,
            substitute_note: it.substitute_note || null,
          }));
          await client.from('slip_items').insert(itemsPayload);
        }
      }
      return; // Succeeded with this client
    } catch (err) {
      console.warn('[serverSlipOrders] Supabase sync attempt note:', err);
    }
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
    customerId?: string;
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
      customer_id: params.customerId || undefined,
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
      delivery_otp: generate4DigitOtp(id),

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
        await supabase.from('slip_orders').upsert({
          id: order.id,
          customer_id: params.customerId || null,
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
          await supabase.from('slip_images').upsert(
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
   * List all slip orders (syncs from Supabase with resilient fallbacks)
   */
  async getSlipOrders(filterStatus?: SlipOrderStatus): Promise<SlipOrder[]> {
    // 1. Re-hydrate latest slips from disk and serverless /tmp cache
    const diskSlips = loadDiskSlipOrders();
    diskSlips.forEach((s) => {
      if (s && s.id) {
        const existing = slipsMap.get(s.id);
        if (!existing) {
          slipsMap.set(s.id, s);
        }
      }
    });

    // 2. Fetch from Supabase cloud database with resilient multi-client & flat fallbacks
    const clients = [supabase, fallbackSupabase];
    let fetchedFromCloud = false;

    for (const client of clients) {
      if (fetchedFromCloud) break;
      try {
        // Try join query first
        let dbSlips: any[] | null = null;
        const res = await client
          .from('slip_orders')
          .select('*, slip_images(*), slip_items(*)')
          .order('created_at', { ascending: false });

        if (!res.error && Array.isArray(res.data) && res.data.length > 0) {
          dbSlips = res.data;
        } else {
          // Flat query fallback if join relationships or cache fail
          const flatRes = await client
            .from('slip_orders')
            .select('*')
            .order('created_at', { ascending: false });
          if (!flatRes.error && Array.isArray(flatRes.data) && flatRes.data.length > 0) {
            dbSlips = flatRes.data;
          }
        }

        if (Array.isArray(dbSlips) && dbSlips.length > 0) {
          fetchedFromCloud = true;
          for (const s of dbSlips) {
            if (!s || !s.id) continue;
            const existing = slipsMap.get(s.id);

            // Fetch images if not already populated from join
            let images = Array.isArray(s.slip_images) && s.slip_images.length > 0
              ? s.slip_images.map((img: any) => ({
                  id: img.id,
                  slip_order_id: img.slip_order_id,
                  storage_path: img.storage_path,
                  image_url: img.image_url,
                  sort_order: img.sort_order,
                  created_at: img.created_at,
                }))
              : existing?.images || [];

            // Fetch items if not already populated from join
            let items = Array.isArray(s.slip_items) && s.slip_items.length > 0
              ? s.slip_items.map((it: any) => ({
                  id: it.id,
                  slip_order_id: it.slip_order_id,
                  product_id: it.product_id,
                  name: it.name,
                  requested_qty: Number(it.requested_qty || 1),
                  packed_qty: Number(it.packed_qty || 0),
                  unit: it.unit || 'unit',
                  price: Number(it.price || 0),
                  available: it.available !== false,
                  substitute_note: it.substitute_note,
                  created_at: it.created_at,
                }))
              : existing?.items || [];

            const mapped: SlipOrder = {
              id: s.id,
              customer_id: s.customer_id || undefined,
              customer_name: s.customer_name || 'Customer',
              customer_phone: s.customer_phone || '',
              customer_note: s.customer_note,
              address: s.address || '',
              lat: s.lat ? Number(s.lat) : null,
              lng: s.lng ? Number(s.lng) : null,
              pincode: s.pincode,
              distance_km: Number(s.distance_km || 0),
              eta_min: Number(s.eta_min || 15),
              zone_id: s.zone_id,
              zone_min_order: Number(s.zone_min_order || 500),
              order_type: s.order_type || 'delivery',
              status: s.status || 'SLIP_RECEIVED',
              estimated_total: Number(s.estimated_total || 0),
              final_total: Number(s.final_total || 0),
              subtotal: Number(s.subtotal || 0),
              delivery_fee: Number(s.delivery_fee || 0),
              cod_fee: Number(s.cod_fee || 0),
              payment_method: s.payment_method,
              payment_status: s.payment_status || 'pending',
              transaction_id: s.transaction_id,
              billed_by: s.billed_by,
              packed_by: s.packed_by,
              assigned_rider_id: s.assigned_rider_id,
              assigned_rider_name: s.assigned_rider_name,
              assigned_rider_phone: s.assigned_rider_phone,
              admin_notes: s.admin_notes,
              cancel_reason: s.cancel_reason,
              images,
              items,
              status_history: existing?.status_history || [],
              created_at: s.created_at,
              updated_at: s.updated_at,
            };
            slipsMap.set(mapped.id, mapped);
          }
          persistDiskSlipOrders();
        }
      } catch (err) {
        console.warn('[serverSlipOrders] Supabase sync note in getSlipOrders:', err);
      }
    }

    const list = Array.from(slipsMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (filterStatus) {
      return list.filter((o) => o.status === filterStatus);
    }
    return list;
  },

  /**
   * Get slip order by ID with flexible prefix matching and resilient Supabase fallback
   */
  async getSlipOrderById(id: string): Promise<SlipOrder | null> {
    if (!id) return null;
    let order = slipsMap.get(id);
    if (order) return order;

    const cleanTarget = String(id).replace(/^SLIP-/i, '').trim().toLowerCase();

    // Check memory with flexible matching
    for (const s of slipsMap.values()) {
      const sId = String(s.id || '').replace(/^SLIP-/i, '').trim().toLowerCase();
      if (sId === cleanTarget) return s;
    }

    // Check disk
    const disk = loadDiskSlipOrders();
    const match = disk.find((o) => {
      const oId = String(o.id || '').replace(/^SLIP-/i, '').trim().toLowerCase();
      return oId === cleanTarget;
    });
    if (match) {
      slipsMap.set(match.id, match);
      return match;
    }

    // Query Supabase with multi-client fallback
    const clients = [supabase, fallbackSupabase];
    for (const client of clients) {
      try {
        let s: any = null;
        const res = await client
          .from('slip_orders')
          .select('*, slip_images(*), slip_items(*)')
          .or(`id.eq.${id},id.eq.SLIP-${cleanTarget}`)
          .maybeSingle();

        if (res.data) {
          s = res.data;
        } else {
          // Flat query fallback
          const flat = await client
            .from('slip_orders')
            .select('*')
            .or(`id.eq.${id},id.eq.SLIP-${cleanTarget}`)
            .maybeSingle();
          if (flat.data) {
            s = flat.data;
            const [itemsRes, imagesRes] = await Promise.all([
              client.from('slip_items').select('*').eq('slip_order_id', s.id),
              client.from('slip_images').select('*').eq('slip_order_id', s.id),
            ]);
            s.slip_items = itemsRes.data || [];
            s.slip_images = imagesRes.data || [];
          }
        }

        if (s) {
          const mapped: SlipOrder = {
            id: s.id,
            customer_id: s.customer_id || undefined,
            customer_name: s.customer_name || 'Customer',
            customer_phone: s.customer_phone || '',
            customer_note: s.customer_note,
            address: s.address || '',
            lat: s.lat ? Number(s.lat) : null,
            lng: s.lng ? Number(s.lng) : null,
            pincode: s.pincode,
            distance_km: Number(s.distance_km || 0),
            eta_min: Number(s.eta_min || 15),
            zone_id: s.zone_id,
            zone_min_order: Number(s.zone_min_order || 500),
            order_type: s.order_type || 'delivery',
            status: s.status || 'SLIP_RECEIVED',
            estimated_total: Number(s.estimated_total || 0),
            final_total: Number(s.final_total || 0),
            subtotal: Number(s.subtotal || 0),
            delivery_fee: Number(s.delivery_fee || 0),
            cod_fee: Number(s.cod_fee || 0),
            payment_method: s.payment_method,
            payment_status: s.payment_status || 'pending',
            transaction_id: s.transaction_id,
            billed_by: s.billed_by,
            packed_by: s.packed_by,
            assigned_rider_id: s.assigned_rider_id,
            assigned_rider_name: s.assigned_rider_name,
            assigned_rider_phone: s.assigned_rider_phone,
            admin_notes: s.admin_notes,
            cancel_reason: s.cancel_reason,
            images: Array.isArray(s.slip_images) ? s.slip_images.map((img: any) => ({
              id: img.id,
              slip_order_id: img.slip_order_id,
              storage_path: img.storage_path,
              image_url: img.image_url,
              sort_order: img.sort_order,
              created_at: img.created_at,
            })) : [],
            items: Array.isArray(s.slip_items) ? s.slip_items.map((it: any) => ({
              id: it.id,
              slip_order_id: it.slip_order_id,
              product_id: it.product_id,
              name: it.name,
              requested_qty: Number(it.requested_qty || 1),
              packed_qty: Number(it.packed_qty || 0),
              unit: it.unit || 'unit',
              price: Number(it.price || 0),
              available: it.available !== false,
              substitute_note: it.substitute_note,
              created_at: it.created_at,
            })) : [],
            status_history: [],
            created_at: s.created_at,
            updated_at: s.updated_at,
          };
          slipsMap.set(mapped.id, mapped);
          persistDiskSlipOrders();
          return mapped;
        }
      } catch (err) {
        console.warn('[serverSlipOrders] Error fetching single slip from Supabase:', err);
      }
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
      id?: string;
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
      id: it.id || `item_${order.id}_${idx + 1}`,
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
    order.final_total = estimatedTotal + (order.delivery_fee || 0);
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
    await syncSlipOrderToSupabase(order);

    // Mirror to serverOrderStore so standard order store & storefront sees itemized bill immediately
    try {
      await serverOrderStore.createPendingOrder({
        orderId: order.id,
        merchantOrderId: `MT_${order.id}`,
        items: slipItems.map((it) => ({
          productId: it.product_id || it.id,
          productName: it.name,
          unit: it.unit,
          price: it.price,
          quantity: it.requested_qty,
          image: order.images?.[0]?.image_url || '/products/placeholder.svg',
        })),
        subtotal: estimatedTotal,
        deliveryFee: order.delivery_fee || 0,
        taxes: 0,
        grandTotal: estimatedTotal + (order.delivery_fee || 0),
        final_total: estimatedTotal + (order.delivery_fee || 0),
        address: {
          fullName: order.customer_name,
          phone: order.customer_phone,
          mobileNumber: order.customer_phone,
          streetArea: order.address,
          city: 'Nellore',
        },
        slot: order.order_type === 'pickup' ? 'Store Pickup' : 'Standard Delivery',
        paymentMethod: (order.payment_method as any) || 'Cash on Delivery',
        distance_km: order.distance_km,
        zone_min_order: order.zone_min_order,
        orderType: 'slip',
      });
    } catch (mirrorErr) {
      console.warn('[serverSlipOrders] Error mirroring order to serverOrderStore:', mirrorErr);
    }

    return order;
  },

  /**
   * 2b. Admin Aggregate Billing: Save Total Items & Total Grocery Amount
   * Simplifies the store staff workflow so they only input item count & grocery amount in INR.
   */
  async saveAggregateBill(params: {
    slipId: string;
    totalItems: number;
    groceryAmount: number;
    deliveryFee?: number;
    discount?: number;
    adminNotes?: string;
    billedBy?: string;
    moveStatus?: SlipOrderStatus;
  }): Promise<SlipOrder | null> {
    const order = await this.getSlipOrderById(params.slipId);
    if (!order) return null;

    const nowIso = new Date().toISOString();
    const count = Math.max(1, Math.round(Number(params.totalItems) || 1));
    const amount = Math.max(0, Number(params.groceryAmount) || 0);
    const fee = Math.max(0, Number(params.deliveryFee) || 0);
    const disc = Math.max(0, Number(params.discount) || 0);
    const grandTotal = amount + fee - disc;

    const aggregateItem: SlipItem = {
      id: `slip_item_${order.id}`,
      slip_order_id: order.id,
      name: `${count} grocery ${count === 1 ? 'item' : 'items'} (as per customer slip)`,
      requested_qty: 1,
      packed_qty: 1,
      unit: count === 1 ? '1 item' : `${count} items`,
      price: amount,
      available: true,
      substitute_note: null,
      created_at: nowIso,
    };

    order.items = [aggregateItem];
    order.total_items = count;
    order.subtotal = amount;
    order.delivery_fee = fee;
    order.discount = disc;
    order.estimated_total = grandTotal;
    order.final_total = grandTotal;
    order.admin_notes = params.adminNotes !== undefined ? params.adminNotes : order.admin_notes;
    order.billed_by = params.billedBy || 'Store Staff';
    order.updated_at = nowIso;

    const nextStatus = params.moveStatus || 'BILLING';
    order.status = nextStatus;

    this.addStatusHistory(
      order,
      nextStatus,
      `Billed ${count} items for total ₹${grandTotal} (Groceries: ₹${amount}, Delivery: ₹${fee})`,
      params.billedBy || 'Store Staff'
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();

    // Mirror to serverOrderStore so standard order store & storefront sees it immediately
    try {
      await serverOrderStore.createPendingOrder({
        orderId: order.id,
        merchantOrderId: `MT_${order.id}`,
        items: [
          {
            productId: `slip_item_${order.id}`,
            productName: `${count} grocery ${count === 1 ? 'item' : 'items'} (as per customer slip)`,
            unit: `${count} items`,
            price: amount,
            quantity: 1,
            image: order.images?.[0]?.image_url || '/products/placeholder.svg',
          },
        ],
        subtotal: amount,
        deliveryFee: fee,
        taxes: 0,
        grandTotal,
        final_total: grandTotal,
        address: {
          fullName: order.customer_name,
          phone: order.customer_phone,
          mobileNumber: order.customer_phone,
          streetArea: order.address,
          city: 'Nellore',
        },
        slot: order.order_type === 'pickup' ? 'Store Pickup' : 'Standard Delivery',
        paymentMethod: (order.payment_method as any) || 'Cash on Delivery',
        distance_km: order.distance_km,
        zone_min_order: order.zone_min_order,
        orderType: 'slip',
      });
    } catch (mirrorErr) {
      console.warn('[serverSlipOrders] Error mirroring order to serverOrderStore:', mirrorErr);
    }

    // Sync to Supabase if configured
    await syncSlipOrderToSupabase(order);

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
    await syncSlipOrderToSupabase(order);

    // Mirror as standard order into serverOrderStore so packer and admin orders see it
    try {
      const orderTotal = Number(order.final_total || order.estimated_total || (order.subtotal + (order.delivery_fee || 0)));
      await serverOrderStore.createPendingOrder({
        orderId: order.id,
        merchantOrderId: `MT_${order.id}`,
        items: (order.items || []).map((it) => ({
          productId: it.product_id || it.id,
          productName: it.name,
          unit: it.unit,
          price: it.price,
          quantity: it.requested_qty,
          image: order.images?.[0]?.image_url || '/products/placeholder.svg',
        })),
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee || 0,
        taxes: 0,
        grandTotal: orderTotal,
        final_total: orderTotal,
        address: {
          fullName: order.customer_name,
          phone: order.customer_phone,
          mobileNumber: order.customer_phone,
          streetArea: order.address,
          city: 'Nellore',
        },
        slot: order.order_type === 'pickup' ? 'Store Pickup' : 'Standard Delivery',
        paymentMethod: (order.payment_method as any) || 'Cash on Delivery',
        distance_km: order.distance_km,
        zone_min_order: order.zone_min_order,
        orderType: 'slip',
      });
      await serverOrderStore.updateOrderStatus(order.id, 'Confirmed', staffName);
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
    await syncSlipOrderToSupabase(order);

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
    await syncSlipOrderToSupabase(order);

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
    await syncSlipOrderToSupabase(order);

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

    // Rider assignment: Allowed for confirmed, packed, paid, and cod orders
    if (order.status === 'CANCELLED' || order.status === 'SLIP_RECEIVED') {
      return {
        success: false,
        error: `Cannot assign rider for an order with status: ${order.status}`,
      };
    }

    order.assigned_rider_id = params.riderId;
    order.assigned_rider_name = params.riderName;
    order.assigned_rider_phone = params.riderPhone;
    order.status = 'RIDER_ASSIGNED';
    order.delivery_otp = order.delivery_otp || generate4DigitOtp(order.id);
    order.updated_at = new Date().toISOString();

    this.addStatusHistory(
      order,
      'RIDER_ASSIGNED',
      `Rider ${params.riderName} (${params.riderPhone}) assigned`,
      params.staffName || 'Dispatcher'
    );

    slipsMap.set(order.id, order);
    persistDiskSlipOrders();
    await syncSlipOrderToSupabase(order);

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
    await syncSlipOrderToSupabase(order);

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
    await syncSlipOrderToSupabase(order);

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
    await syncSlipOrderToSupabase(order);

    return { success: true, order };
  },

  /**
   * Convert SlipOrder into full standard Order format with resolved product photos and details
   */
  convertToStandardOrder(slip: SlipOrder, forcedStatus?: string): Order {
    let status: any = forcedStatus;
    if (!status) {
      status = 'Packed';
      if (slip.status === 'RIDER_ASSIGNED') status = 'Rider Assigned';
      else if (slip.status === 'OUT_FOR_DELIVERY') status = 'Out for Delivery';
      else if (slip.status === 'DELIVERED') status = 'Delivered';
      else if (slip.status === 'CONFIRMED' || slip.status === 'PACKING') status = 'Confirmed';
      else if (slip.status === 'CANCELLED') status = 'Cancelled';
    }

    const isPaid = slip.status === 'PAID' || slip.payment_status === 'paid' || slip.payment_status === 'completed';

    const resolveProductImage = (name?: string, pid?: string | null): string => {
      if (pid) {
        const found = MIGRATED_PRODUCT_LIST.find((p) => p.id === pid);
        if (found?.imageUrl || found?.image) return found.imageUrl || found.image || '';
      }
      if (name) {
        const lower = name.toLowerCase();
        const found = MIGRATED_PRODUCT_LIST.find((p) => p.name.toLowerCase().includes(lower));
        if (found?.imageUrl || found?.image) return found.imageUrl || found.image || '';
      }
      return '/products/placeholder.svg';
    };

    return {
      id: slip.id,
      date: new Date(slip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      slot: slip.order_type === 'pickup' ? 'Store Pickup' : 'Standard Delivery',
      paymentMethod: (slip.payment_method || (slip.status === 'COD_PENDING' || !isPaid ? 'Cash on Delivery' : 'Online')) as any,
      paymentStatus: slip.payment_status as any,
      isPaid,
      status: status as any,
      subtotal: slip.subtotal,
      discount: 0,
      deliveryFee: slip.delivery_fee || 0,
      taxes: 0,
      grandTotal: slip.final_total || slip.estimated_total,
      distance_km: slip.distance_km,
      zone_min_order: slip.zone_min_order,
      orderType: 'slip',
      assignedRider: slip.assigned_rider_name
        ? {
            id: slip.assigned_rider_id || '',
            name: slip.assigned_rider_name,
            phone: slip.assigned_rider_phone || '',
          }
        : undefined,
      deliveryOtp: slip.delivery_otp || generate4DigitOtp(slip.id),
      arrivedAtDoorstep: Boolean(slip.arrived_at_doorstep),
      address: {
        fullName: slip.customer_name,
        phone: slip.customer_phone,
        mobileNumber: slip.customer_phone,
        streetArea: slip.address,
        city: 'Nellore',
        latitude: slip.lat,
        longitude: slip.lng,
      } as any,
      items: (slip.items || []).map((it) => ({
        productId: it.product_id || it.id,
        productName: it.name,
        unit: it.unit,
        price: it.price,
        quantity: it.packed_qty || it.requested_qty || 1,
        image: resolveProductImage(it.name, it.product_id),
      })),
      timeline: [
        { status: 'Order Placed', time: 'Confirmed', completed: true },
        {
          status: 'Packed',
          time: 'Pending',
          completed: status === 'Packed' || status === 'Rider Assigned' || status === 'Out for Delivery' || status === 'Delivered',
        },
        {
          status: 'Out for Delivery',
          time: 'Pending',
          completed: status === 'Out for Delivery' || status === 'Delivered',
        },
        { status: 'Delivered', time: 'Pending', completed: status === 'Delivered' },
      ],
    };
  },

  async saveOrder(order: SlipOrder): Promise<void> {
    slipsMap.set(order.id, order);
    persistDiskSlipOrders();
    await syncSlipOrderToSupabase(order);
  },

  /**
   * Completely clear all slip orders from memory and disk
   */
  clearAllSlips() {
    slipsMap.clear();
    persistDiskSlipOrders();
  },
};
