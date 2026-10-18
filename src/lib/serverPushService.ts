import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import type { Order, OrderStatus } from '@/types';
import { serverStaffStore } from '@/lib/serverStaffStore';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  role?: 'admin' | 'staff' | 'customer';
  isAdmin?: boolean;
  createdAt?: string;
}


const DATA_DIR = path.join(process.cwd(), 'data');
const VAPID_FILE = path.join(DATA_DIR, 'vapid.json');
const SUBS_FILE = path.join(DATA_DIR, 'push_subscriptions.json');

class ServerPushService {
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;
  private subscriptions: Map<string, PushSubscriptionData> = new Map();

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // 1. Load or generate VAPID keys
      if (fs.existsSync(VAPID_FILE)) {
        try {
          const raw = fs.readFileSync(VAPID_FILE, 'utf-8');
          this.vapidKeys = JSON.parse(raw);
        } catch {
          this.vapidKeys = null;
        }
      }

      if (!this.vapidKeys || !this.vapidKeys.publicKey || !this.vapidKeys.privateKey) {
        this.vapidKeys = webpush.generateVAPIDKeys();
        fs.writeFileSync(VAPID_FILE, JSON.stringify(this.vapidKeys, null, 2), 'utf-8');
      }

      // Configure web-push
      webpush.setVapidDetails(
        'mailto:orders@g1mart.com',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );

      // 2. Load existing subscriptions
      if (fs.existsSync(SUBS_FILE)) {
        try {
          const rawSubs = fs.readFileSync(SUBS_FILE, 'utf-8');
          const list: PushSubscriptionData[] = JSON.parse(rawSubs);
          list.forEach((sub) => {
            if (sub && sub.endpoint) {
              this.subscriptions.set(sub.endpoint, sub);
            }
          });
        } catch {}
      }
    } catch (err) {
      console.warn('[ServerPushService] Init warning:', err);
    }
  }

  getPublicKey(): string {
    return this.vapidKeys?.publicKey || '';
  }

  async syncSubscriptionsFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase.from('push_subscriptions').select('*');
      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          if (row?.endpoint && row?.keys) {
            this.subscriptions.set(row.endpoint, {
              endpoint: row.endpoint,
              keys: row.keys,
              userId: row.user_id,
              userEmail: row.user_email,
              userPhone: row.user_phone,
              role: row.role,
              isAdmin: Boolean(row.is_admin),
              createdAt: row.created_at,
            });
          }
        });
      }
    } catch (err) {
      console.warn('[ServerPushService] Supabase sync note:', err);
    }
  }

  saveSubscription(sub: PushSubscriptionData): boolean {
    if (!sub || !sub.endpoint || !sub.keys) return false;
    this.subscriptions.set(sub.endpoint, {
      ...sub,
      createdAt: new Date().toISOString(),
    });
    this.persistSubscriptions();

    if (isSupabaseConfigured()) {
      try {
        supabase
          .from('push_subscriptions')
          .upsert({
            endpoint: sub.endpoint,
            keys: sub.keys,
            user_id: sub.userId || null,
            user_email: sub.userEmail || null,
            user_phone: sub.userPhone || null,
            role: sub.role || 'customer',
            is_admin: Boolean(sub.isAdmin),
            created_at: new Date().toISOString(),
          })
          .then(() => {})
          .catch(() => {});
      } catch {}
    }

    return true;
  }

  removeSubscription(endpoint: string) {
    this.subscriptions.delete(endpoint);
    this.persistSubscriptions();

    if (isSupabaseConfigured()) {
      try {
        supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).then(() => {}).catch(() => {});
      } catch {}
    }
  }

  private persistSubscriptions() {
    try {
      const list = Array.from(this.subscriptions.values());
      fs.writeFileSync(SUBS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch {}
  }

  /**
   * Send a background Web Push notification ONLY to the customer who placed the order.
   * Completely ignores all other users and devices!
   */
  async sendOrderPushNotification(order: Order, status: OrderStatus): Promise<number> {
    if (!order || !order.id) return 0;
    await this.syncSubscriptionsFromSupabase();

    // Identify target customer credentials
    const targetUserId = order.userId;
    const targetEmail = (order.userEmail || '').toLowerCase().trim();
    const rawPhone = order.address?.mobileNumber || order.address?.phone || '';
    const targetPhone = rawPhone.replace(/\D/g, '').slice(-10);

    // Filter subscriptions for ONLY this specific customer
    const matchingSubs: PushSubscriptionData[] = [];
    for (const sub of this.subscriptions.values()) {
      let isMatch = false;

      if (targetUserId && sub.userId && sub.userId === targetUserId) {
        isMatch = true;
      } else if (targetEmail && sub.userEmail && sub.userEmail.toLowerCase().trim() === targetEmail) {
        isMatch = true;
      } else if (targetPhone && sub.userPhone) {
        const subCleanPhone = sub.userPhone.replace(/\D/g, '').slice(-10);
        if (subCleanPhone && subCleanPhone === targetPhone) {
          isMatch = true;
        }
      }

      if (isMatch) {
        matchingSubs.push(sub);
      }
    }

    if (matchingSubs.length === 0) {
      return 0;
    }

    // Prepare human-written, professional notification content
    const shortId = order.id.startsWith('G1-') ? order.id : `#${order.id.slice(-6)}`;
    let title = 'G1mart Order Update';
    let body = `Your order ${shortId} status is now ${status}.`;

    switch (status) {
      case 'Confirmed':
        title = 'Order Confirmed';
        body = `Store accepted order ${shortId}. Items are being prepared.`;
        break;
      case 'Packing':
        title = 'Order Being Packed';
        body = `Items for order ${shortId} are being carefully packed.`;
        break;
      case 'Packed':
        title = 'Order Packed & Ready';
        body = `Order ${shortId} is safely packed and ready for delivery partner.`;
        break;
      case 'Rider Assigned':
        title = 'Delivery Partner Assigned';
        body = `${order.assignedRider?.name || 'A delivery partner'} is picking up order ${shortId}.`;
        break;
      case 'Out for Delivery':
      case 'Order Dispatched':
        title = 'Out for Delivery';
        body = `Your order ${shortId} is on the way to your doorstep.`;
        break;
      case 'Delivered':
        title = 'Order Delivered';
        body = `Order ${shortId} has arrived at your address. Enjoy your items!`;
        break;
      case 'Cancelled':
        title = 'Order Cancelled';
        body = `Order ${shortId} was cancelled.`;
        break;
    }

    const payload = JSON.stringify({
      title,
      body,
      orderId: order.id,
      url: `/orders/${order.id}`,
    });

    let sentCount = 0;
    const sendPromises = matchingSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: 'high',
          }
        );
        sentCount++;
      } catch (err: any) {
        // If subscription is expired or unsubscribed (410 / 404), prune it
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          this.removeSubscription(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
    return sentCount;
  }

  async sendCustomNotification(params: {
    title: string;
    body: string;
    tag?: string;
    url?: string;
    orderId?: string;
  }): Promise<number> {
    if (!this.vapidKeys) return 0;
    const subs = Array.from(this.subscriptions.values());
    if (subs.length === 0) return 0;

    const payload = JSON.stringify({
      title: params.title,
      body: params.body,
      tag: params.tag || 'g1mart-update',
      url: params.url || '/',
      orderId: params.orderId,
    });

    let sentCount = 0;
    const sendPromises = subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 60 * 60 * 24, urgency: 'high' }
        );
        sentCount++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          this.removeSubscription(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
    return sentCount;
  }

  /**
   * Broadcast high-priority background Web Push notification to all logged-in store Admins / Managers
   * when any customer places a new order (even if phone screen is off or another app is running).
   */
  async notifyAdminsNewOrder(order: Order): Promise<number> {
    if (!order || !order.id || !this.vapidKeys) return 0;
    await this.syncSubscriptionsFromSupabase();

    const knownAdminEmails = new Set([
      'g1mart@gmail.com',
      'lingalamahendra0@gmail.com',
      'orders@g1mart.com',
    ]);

    const adminSubs = Array.from(this.subscriptions.values()).filter((sub) => {
      if (sub.isAdmin || sub.role === 'admin') return true;
      if (sub.userEmail) {
        const cleanEmail = sub.userEmail.toLowerCase().trim();
        if (knownAdminEmails.has(cleanEmail)) return true;
        if (serverStaffStore.isAdmin(cleanEmail)) return true;
      }
      return false;
    });

    if (adminSubs.length === 0) return 0;

    const shortId = order.id.startsWith('G1-') ? order.id : `#${order.id.slice(-6)}`;
    const itemCount = order.items?.length || 1;
    const area = order.address?.streetArea || order.address?.city || 'Nellore';

    const payload = JSON.stringify({
      title: `🚨 NEW ORDER RECEIVED: ${shortId}`,
      body: `₹${order.grandTotal} • ${itemCount} items • ${area} • Tap to accept & pack`,
      tag: `admin_new_order_${order.id}`,
      url: `/admin?tab=orders&orderId=${order.id}`,
      orderId: order.id,
      tab: 'orders',
      timestamp: Date.now(),
      isAdminOrder: true,
      sound: '/new_order_voice.wav',
    });

    let sentCount = 0;
    const sendPromises = adminSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: 'high',
          }
        );
        sentCount++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          this.removeSubscription(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
    return sentCount;
  }

  /**
   * Broadcast alert to store Admins / Managers when any customer uploads a new slip order
   */
  async notifyAdminsNewSlip(slipOrder: any): Promise<number> {
    if (!slipOrder || !slipOrder.id || !this.vapidKeys) return 0;
    await this.syncSubscriptionsFromSupabase();

    const knownAdminEmails = new Set([
      'g1mart@gmail.com',
      'lingalamahendra0@gmail.com',
      'orders@g1mart.com',
    ]);

    const adminSubs = Array.from(this.subscriptions.values()).filter((sub) => {
      if (sub.isAdmin || sub.role === 'admin') return true;
      if (sub.userEmail) {
        const cleanEmail = sub.userEmail.toLowerCase().trim();
        if (knownAdminEmails.has(cleanEmail)) return true;
        if (serverStaffStore.isAdmin(cleanEmail)) return true;
      }
      return false;
    });

    if (adminSubs.length === 0) return 0;

    const shortId = String(slipOrder.id).startsWith('SLIP-') ? slipOrder.id : `SLIP-${slipOrder.id}`;
    const custName = slipOrder.customer_name || slipOrder.customerName || 'Customer';
    const custPhone = slipOrder.customer_phone || slipOrder.customerPhone || '';
    const imgCount = slipOrder.images?.length || 1;

    const payload = JSON.stringify({
      title: `📸 NEW GROCERY SLIP: ${shortId}`,
      body: `${custName} (${custPhone}) uploaded ${imgCount} photo slip(s). Tap to view & call customer.`,
      tag: `admin_new_slip_${slipOrder.id}`,
      url: `/admin?tab=slips&slipId=${slipOrder.id}`,
      orderId: slipOrder.id,
      tab: 'slips',
      timestamp: Date.now(),
      isAdminOrder: true,
      sound: '/new_order_voice.wav',
    });

    let sentCount = 0;
    const sendPromises = adminSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: 'high',
          }
        );
        sentCount++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          this.removeSubscription(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
    return sentCount;
  }

  /**
   * Send high-priority push notification to the customer who uploaded the slip order
   * when the store manager confirms the order over call or prepares the bill.
   * Stored in push queue with 24h TTL so it pops up immediately when the customer turns their phone on!
   */
  async sendSlipPushNotification(
    slipOrder: any,
    eventType: 'CONFIRMED' | 'BILL_READY' | 'PACKED' | 'DISPATCHED' | 'CANCELLED' = 'CONFIRMED'
  ): Promise<number> {
    if (!slipOrder || !slipOrder.id) return 0;
    await this.syncSubscriptionsFromSupabase();

    const targetUserId = slipOrder.customer_id || slipOrder.customerId;
    const rawPhone = slipOrder.customer_phone || slipOrder.customerPhone || '';
    const targetPhone = rawPhone.replace(/\D/g, '').slice(-10);

    const matchingSubs: PushSubscriptionData[] = [];
    for (const sub of this.subscriptions.values()) {
      let isMatch = false;
      if (targetUserId && sub.userId && sub.userId === targetUserId) {
        isMatch = true;
      } else if (targetPhone && sub.userPhone) {
        const subCleanPhone = sub.userPhone.replace(/\D/g, '').slice(-10);
        if (subCleanPhone && subCleanPhone === targetPhone) {
          isMatch = true;
        }
      }
      if (isMatch) matchingSubs.push(sub);
    }

    // Determine short order ID and bill total
    const cleanId = String(slipOrder.id).replace(/^SLIP-/i, '');
    const displayId = `Order #SLIP-${cleanId}`;
    const billTotal = Number(slipOrder.final_total || slipOrder.finalTotal || slipOrder.subtotal || slipOrder.estimated_total || 5000);

    let title = `${displayId} Update`;
    let body = `Your slip order has been updated. Tap to view status.`;

    switch (eventType) {
      case 'CONFIRMED':
      case 'BILL_READY':
        title = `Order #${cleanId} Confirmed! 🎉`;
        body = `Store verified your slip on call. Total bill: ₹${billTotal.toLocaleString('en-IN')}. Tap to review items & pay.`;
        break;
      case 'PACKED':
        title = `Order #${cleanId} Packed & Sealed 📦`;
        body = `Your items are securely packed and ready for delivery partner.`;
        break;
      case 'DISPATCHED':
        title = `Order #${cleanId} Out for Delivery 🛵`;
        body = `Delivery partner is on the way to your doorstep.`;
        break;
      case 'CANCELLED':
        title = `Order #${cleanId} Cancelled`;
        body = `Your slip order was cancelled. Tap to view details.`;
        break;
    }

    const payload = JSON.stringify({
      title,
      body,
      orderId: String(slipOrder.id),
      url: `/orders/${slipOrder.id}`,
      tag: `slip_order_${slipOrder.id}`,
      timestamp: Date.now(),
    });

    let sentCount = 0;
    const sendPromises = matchingSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          {
            TTL: 60 * 60 * 24, // 24 hours - delivers when device turns on
            urgency: 'high',
          }
        );
        sentCount++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          this.removeSubscription(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);

    // If Supabase is configured, record notification in database for persistence
    if (isSupabaseConfigured()) {
      try {
        supabase
          .from('notifications')
          .insert({
            user_phone: targetPhone || null,
            user_id: targetUserId || null,
            title,
            body,
            order_id: String(slipOrder.id),
            status: eventType,
            created_at: new Date().toISOString(),
          })
          .then(() => {})
          .catch(() => {});
      } catch {}
    }

    return sentCount;
  }
}

export const serverPushService = new ServerPushService();
