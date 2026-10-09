import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import type { Order, OrderStatus } from '@/types';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  userEmail?: string;
  userPhone?: string;
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

  saveSubscription(sub: PushSubscriptionData): boolean {
    if (!sub || !sub.endpoint || !sub.keys) return false;
    this.subscriptions.set(sub.endpoint, {
      ...sub,
      createdAt: new Date().toISOString(),
    });
    this.persistSubscriptions();
    return true;
  }

  removeSubscription(endpoint: string) {
    this.subscriptions.delete(endpoint);
    this.persistSubscriptions();
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
    let title = 'G1 Mart Order Update';
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
}

export const serverPushService = new ServerPushService();
