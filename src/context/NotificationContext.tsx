'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { soundAlerts } from '@/lib/soundAlerts';
import { useAuth } from './AuthContext';
import type { OrderStatus } from '@/types';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  badge?: string;
  type: 'welcome' | 'apk_download' | 'order_update' | 'promo' | 'general';
  statusKey?: string;
  iconType?: 'celebration' | 'package' | 'bike' | 'sparkle' | 'box' | 'alert' | 'app';
  orderId?: string;
  actionLabel?: string;
  actionUrl?: string;
  durationMs?: number;
  timestamp: number;
}

interface NotificationContextType {
  activeNotification: AppNotification | null;
  showNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id?: string) => void;
  notifyWelcome: (userName?: string) => void;
  notifyApkDownloaded: () => void;
  notifyOrderStatus: (orderId: string, status: OrderStatus | string, orderData?: any) => void;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  activeNotification: null,
  showNotification: () => {},
  dismissNotification: () => {},
  notifyWelcome: () => {},
  notifyApkDownloaded: () => {},
  notifyOrderStatus: () => {},
  requestPushPermission: async () => false,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotifiedStatusRef = useRef<Map<string, string>>(new Map());

  // Unlock Web Audio on first user interaction
  useEffect(() => {
    const handleUnlock = () => {
      soundAlerts.unlockAudio();
    };
    window.addEventListener('click', handleUnlock, { once: true, passive: true });
    window.addEventListener('touchstart', handleUnlock, { once: true, passive: true });
    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
    };
  }, []);

  const dismissNotification = useCallback((id?: string) => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setActiveNotification((current) => {
      if (!id || current?.id === id) {
        return null;
      }
      return current;
    });
  }, []);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    } catch {}
    return false;
  }, []);

  const showNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'timestamp'>) => {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const fullNotification: AppNotification = {
        ...notif,
        id,
        timestamp: Date.now(),
        durationMs: notif.durationMs ?? 6500,
      };

      // 1. In-App Notification display
      setActiveNotification(fullNotification);

      // Auto dismiss
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        dismissNotification(id);
      }, fullNotification.durationMs);

      // 2. Browser Native Notification (Heads-up / Tray)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('vibrate' in navigator) {
            navigator.vibrate([180, 80, 180]);
          }
          const nativeNotif = new Notification(fullNotification.title, {
            body: fullNotification.body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: fullNotification.orderId ? `order_${fullNotification.orderId}` : 'g1mart_alert',
          });
          nativeNotif.onclick = () => {
            window.focus();
            if (fullNotification.actionUrl) {
              window.location.href = fullNotification.actionUrl;
            }
            nativeNotif.close();
          };
        } catch {}
      }
    },
    [dismissNotification]
  );

  const notifyWelcome = useCallback(
    (userName?: string) => {
      const name = userName ? userName.split(' ')[0] : 'friend';
      soundAlerts.playWelcomeChime();
      showNotification({
        title: `🎉 Welcome to G1 Mart, ${name}!`,
        body: 'Your speed-pass to 10-minute grocery delivery is now active. Enjoy exclusive member deals!',
        badge: 'VIP WELCOME',
        type: 'welcome',
        iconType: 'celebration',
        actionLabel: 'Claim Welcome Deals 🎁',
        actionUrl: '/',
        durationMs: 7500,
      });
    },
    [showNotification]
  );

  const notifyApkDownloaded = useCallback(() => {
    soundAlerts.playApkInstallChime();
    showNotification({
      title: '⚡ G1 Mart APK Downloaded!',
      body: 'Tap to complete installation. Ultra-fast 10-min groceries, live order tracking & instant discounts ready for you.',
      badge: 'APP READY',
      type: 'apk_download',
      iconType: 'app',
      actionLabel: 'Open App 📱',
      actionUrl: '/',
      durationMs: 8000,
    });
  }, [showNotification]);

  const notifyOrderStatus = useCallback(
    (orderId: string, status: OrderStatus | string, orderData?: any) => {
      // Deduplicate so same status isn't pinged repeatedly in loop
      const lastKey = `${orderId}:${status}`;
      if (lastNotifiedStatusRef.current.get(orderId) === status) {
        return;
      }
      lastNotifiedStatusRef.current.set(orderId, status);

      const shortId = orderId.startsWith('G1-') ? orderId : `#${orderId.slice(-6)}`;

      switch (status) {
        case 'Order Placed':
        case 'New':
          soundAlerts.playOrderConfirmedChime();
          showNotification({
            title: '🚀 Order Placed Successfully!',
            body: `Order ${shortId} received. Our store team is prepping the freshest stock.`,
            badge: 'ORDER RECEIVED',
            type: 'order_update',
            statusKey: status,
            iconType: 'sparkle',
            orderId,
            actionLabel: 'Track Order 📍',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Confirmed':
          soundAlerts.playOrderConfirmedChime();
          showNotification({
            title: '👨‍🍳 Order Confirmed by Store!',
            body: `Store accepted Order ${shortId}. Your items are assigned to the express fulfillment counter.`,
            badge: 'CONFIRMED',
            type: 'order_update',
            statusKey: status,
            iconType: 'package',
            orderId,
            actionLabel: 'Track Live 📍',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Packing':
          soundAlerts.playPackedChime();
          showNotification({
            title: '🛍️ Packing Your Groceries!',
            body: `Items in Order ${shortId} are being carefully picked and inspected for peak freshness.`,
            badge: 'PACKING',
            type: 'order_update',
            statusKey: status,
            iconType: 'box',
            orderId,
            actionLabel: 'View Items 🛒',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Packed':
          soundAlerts.playPackedChime();
          showNotification({
            title: '📦 Packed with Care & Sealed!',
            body: `Order ${shortId} is securely bagged, sanitized, and ready at the dispatch dock.`,
            badge: 'PACKED',
            type: 'order_update',
            statusKey: status,
            iconType: 'box',
            orderId,
            actionLabel: 'Track Order 📍',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Rider Assigned':
          soundAlerts.playRiderAssignmentChime();
          const riderName = orderData?.assignedRider?.name || 'Express Rider';
          showNotification({
            title: '🛵 Delivery Partner Assigned!',
            body: `${riderName} is arriving at the store to pick up your package ${shortId}.`,
            badge: 'RIDER ASSIGNED',
            type: 'order_update',
            statusKey: status,
            iconType: 'bike',
            orderId,
            actionLabel: 'Track Partner 🛵',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Order Dispatched':
        case 'Out for Delivery':
          soundAlerts.playOutForDeliveryChime();
          showNotification({
            title: '⚡ Zooming Your Way!',
            body: `Our delivery partner is en route with Order ${shortId}. Keep your door ready!`,
            badge: 'OUT FOR DELIVERY',
            type: 'order_update',
            statusKey: status,
            iconType: 'bike',
            orderId,
            actionLabel: 'Live Map 🗺️',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Delivered':
          soundAlerts.playDeliveredChime();
          showNotification({
            title: '✨ Ding-Dong! Delivered to Your Door!',
            body: `Order ${shortId} is at your doorstep. We hope you love your fresh delivery!`,
            badge: 'DELIVERED',
            type: 'order_update',
            statusKey: status,
            iconType: 'celebration',
            orderId,
            actionLabel: 'Rate Delivery ⭐',
            actionUrl: `/orders/${orderId}`,
            durationMs: 8000,
          });
          break;

        case 'Cancelled':
          showNotification({
            title: '⚠️ Order Cancelled',
            body: `Order ${shortId} was cancelled. If you were charged, refund will initiate promptly.`,
            badge: 'CANCELLED',
            type: 'order_update',
            statusKey: status,
            iconType: 'alert',
            orderId,
            actionLabel: 'View Details 📄',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        default:
          break;
      }
    },
    [showNotification]
  );

  // 1. Welcome notification trigger on sign-up / first login
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    try {
      const welcomeKey = `g1mart_welcome_shown_${user.id || user.email || 'anon'}`;
      const alreadyShown = localStorage.getItem(welcomeKey);
      if (!alreadyShown) {
        localStorage.setItem(welcomeKey, 'true');
        const timer = setTimeout(() => {
          notifyWelcome(user.name);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isLoggedIn, user, notifyWelcome]);

  // 2. Listen for custom APK download events
  useEffect(() => {
    const handleApkDownloadedEvent = () => {
      notifyApkDownloaded();
    };
    window.addEventListener('g1mart:apk-downloaded', handleApkDownloadedEvent);
    return () => {
      window.removeEventListener('g1mart:apk-downloaded', handleApkDownloadedEvent);
    };
  }, [notifyApkDownloaded]);

  // 3. Listen for cross-tab BroadcastChannel order status events from Admin
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('g1mart_order_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDER_UPDATED' && event.data?.orderId && event.data?.status) {
          notifyOrderStatus(event.data.orderId, event.data.status, event.data.order);
        }
      };
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, [notifyOrderStatus]);

  return (
    <NotificationContext.Provider
      value={{
        activeNotification,
        showNotification,
        dismissNotification,
        notifyWelcome,
        notifyApkDownloaded,
        notifyOrderStatus,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
