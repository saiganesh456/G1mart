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
  iconType?: 'package' | 'bike' | 'box' | 'alert' | 'app' | 'check' | 'bag';
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
  isPermissionGranted: boolean;
  showPermissionPrompt: boolean;
  dismissPermissionPrompt: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  activeNotification: null,
  showNotification: () => {},
  dismissNotification: () => {},
  notifyWelcome: () => {},
  notifyApkDownloaded: () => {},
  notifyOrderStatus: () => {},
  requestPushPermission: async () => false,
  isPermissionGranted: false,
  showPermissionPrompt: false,
  dismissPermissionPrompt: () => {},
});

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotifiedStatusRef = useRef<Map<string, string>>(new Map());

  // Unlock audio on first user touch or click
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

  // Register Service Worker and subscribe to Background Web Push
  const registerServiceWorkerAndSubscribe = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      // 1. Register sw.js
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // 2. Fetch VAPID public key
      const keyRes = await fetch('/api/notifications/vapid-key');
      const keyData = await keyRes.json();
      if (!keyData.success || !keyData.publicKey) return false;

      // 3. Subscribe to PushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      // 4. Send subscription to server with user account credentials
      const isOnAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const normalizedEmail = (user?.email || '').toLowerCase().trim();
      const isAdminUser =
        user?.role === 'admin' ||
        isOnAdminRoute ||
        normalizedEmail === 'g1mart@gmail.com' ||
        normalizedEmail === 'lingalamahendra0@gmail.com' ||
        normalizedEmail === 'orders@g1mart.com' ||
        normalizedEmail === 'admin@g1mart.com';

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userId: user?.id,
          userEmail: user?.email,
          userPhone: user?.phone,
          isAdmin: isAdminUser,
          role: isAdminUser ? 'admin' : 'customer',
        }),
      });

      return true;
    } catch (err) {
      console.warn('[NotificationContext] Push registration notice:', err);
      return false;
    }
  }, [user]);

  // Check initial notification permission and automatically sync subscription
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setIsPermissionGranted(true);
        registerServiceWorkerAndSubscribe();
      }
    }
  }, [registerServiceWorkerAndSubscribe]);

  // Request Push Permission from Browser
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setIsPermissionGranted(true);
        setShowPermissionPrompt(false);
        await registerServiceWorkerAndSubscribe();
        return true;
      }
    } catch {}
    setShowPermissionPrompt(false);
    return false;
  }, [registerServiceWorkerAndSubscribe]);

  const dismissPermissionPrompt = () => {
    setShowPermissionPrompt(false);
    try {
      localStorage.setItem('g1mart_notif_prompt_dismissed', 'true');
    } catch {}
  };

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

  const showNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'timestamp'>) => {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const fullNotification: AppNotification = {
        ...notif,
        id,
        timestamp: Date.now(),
        durationMs: notif.durationMs ?? 6000,
      };

      // In-app white premium notification
      setActiveNotification(fullNotification);

      // Auto dismiss
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        dismissNotification(id);
      }, fullNotification.durationMs);

      // System notification & vibration
      if (typeof window !== 'undefined') {
        try {
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }

          if ('Notification' in window && Notification.permission === 'granted') {
            const currentPath = window.location.pathname;
            const isViewingThisOrder =
              Boolean(fullNotification.orderId &&
              (currentPath === `/orders/${fullNotification.orderId}` ||
               currentPath.startsWith(`/orders/${fullNotification.orderId}/`)));

            // Never show duplicate system notification if user is already looking right at this order
            if (!isViewingThisOrder || document.visibilityState !== 'visible') {
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
            }
          }
        } catch {}
      }
    },
    [dismissNotification]
  );

  const notifyWelcome = useCallback(
    (userName?: string) => {
      const name = userName ? userName.split(' ')[0] : 'there';
      soundAlerts.playWelcomeChime();
      showNotification({
        title: `Welcome to G1 Mart, ${name}!`,
        body: 'Your account is verified. 10-minute grocery delivery is now active in your area.',
        badge: 'G1 MART',
        type: 'welcome',
        iconType: 'bag',
        actionLabel: 'Start Shopping',
        actionUrl: '/',
        durationMs: 7000,
      });
    },
    [showNotification]
  );

  const notifyApkDownloaded = useCallback(() => {
    soundAlerts.playApkInstallChime();
    showNotification({
      title: 'G1 Mart App Ready',
      body: 'Installation file downloaded. Complete setup to track live orders with 1-tap checkout.',
      badge: 'APP DOWNLOAD',
      type: 'apk_download',
      iconType: 'app',
      actionLabel: 'Open & Install',
      actionUrl: '/',
      durationMs: 7500,
    });
  }, [showNotification]);

  /**
   * Helper: Check whether an order strictly belongs to THIS device/user.
   * If it does NOT belong to this user, returns false so we never disturb anyone else.
   */
  const isOrderOwnedByCurrentAccount = useCallback(
    (orderId: string, orderData?: any): boolean => {
      // 1. Direct user ID match
      if (user?.id && orderData?.userId && user.id === orderData.userId) {
        return true;
      }

      // 2. Email match
      if (user?.email && orderData?.userEmail) {
        if (user.email.toLowerCase().trim() === orderData.userEmail.toLowerCase().trim()) {
          return true;
        }
      }

      // 3. Mobile number match
      const orderPhoneRaw =
        orderData?.address?.mobileNumber ||
        orderData?.address?.phone ||
        orderData?.customer_phone ||
        orderData?.customerPhone ||
        '';
      if (user?.phone && orderPhoneRaw) {
        const uPhone = user.phone.replace(/\D/g, '').slice(-10);
        const oPhone = orderPhoneRaw.replace(/\D/g, '').slice(-10);
        if (uPhone && oPhone && uPhone === oPhone) {
          return true;
        }
      }

      // 4. Check local customer orders cache on this device
      try {
        const cleanOrderId = String(orderId).replace(/^SLIP-/i, '');
        const checkMatch = (idCandidate: any) => {
          if (!idCandidate) return false;
          const cleanCand = String(idCandidate).replace(/^SLIP-/i, '');
          return cleanCand === cleanOrderId || idCandidate === orderId;
        };

        const recent = localStorage.getItem('g1mart_recent_order');
        if (recent) {
          const parsed = JSON.parse(recent);
          if (checkMatch(parsed.id) || checkMatch(parsed.orderNumber)) return true;
        }

        const latest = sessionStorage.getItem('g1mart_latest_order');
        if (latest) {
          const parsed = JSON.parse(latest);
          if (checkMatch(parsed.id) || checkMatch(parsed.orderNumber)) return true;
        }

        const accOrders = localStorage.getItem('g1mart_account_orders');
        if (accOrders) {
          const list = JSON.parse(accOrders);
          if (Array.isArray(list) && list.some((o: any) => checkMatch(o.id) || checkMatch(o.orderNumber))) {
            return true;
          }
        }
      } catch {}

      return false;
    },
    [user]
  );

  const notifyOrderStatus = useCallback(
    (orderId: string, status: OrderStatus | string, orderData?: any) => {
      // STRICT FILTER 1: Only notify if the order belongs to THIS account/device!
      if (!isOrderOwnedByCurrentAccount(orderId, orderData)) {
        return;
      }

      // STRICT FILTER 2: If customer is ALREADY on the live tracking page for this order,
      // DO NOT pop up a redundant "Track Order" notification banner!
      // The tracking screen already displays the live animated journey and updates in real-time.
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname === `/orders/${orderId}` || pathname.startsWith(`/orders/${orderId}/`)) {
          return;
        }
      }

      // Deduplicate status triggers for the same order (in-memory + sessionStorage)
      const dedupeKey = `g1mart_notif_seen_${orderId}_${status}`;
      if (lastNotifiedStatusRef.current.get(orderId) === status) {
        return;
      }
      try {
        if (typeof window !== 'undefined') {
          if (sessionStorage.getItem(dedupeKey)) {
            return;
          }
          sessionStorage.setItem(dedupeKey, 'true');
        }
      } catch {}
      lastNotifiedStatusRef.current.set(orderId, status);

      const isSlip = String(orderId).toUpperCase().startsWith('SLIP') || orderData?.type === 'slip';
      const cleanNum = String(orderId).replace(/^SLIP-/i, '');
      const shortId = isSlip ? `#SLIP-${cleanNum}` : (orderId.startsWith('G1-') ? orderId : `#${orderId.slice(-6)}`);
      const billTotal = orderData?.finalTotal || orderData?.final_total || orderData?.grandTotal || orderData?.subtotal || 5000;

      const normStatus = (status || '').toUpperCase();

      switch (normStatus) {
        case 'ORDER PLACED':
        case 'NEW':
        case 'SLIP_RECEIVED':
          soundAlerts.playOrderConfirmedChime();
          showNotification({
            title: isSlip ? 'Grocery List Received' : 'Order Placed Successfully',
            body: isSlip
              ? `We received your grocery list (${shortId}). Store team will call to confirm.`
              : `Order ${shortId} received. Store team is preparing your items.`,
            badge: isSlip ? 'SLIP RECEIVED' : 'ORDER PLACED',
            type: 'order_update',
            statusKey: status,
            iconType: 'bag',
            orderId,
            actionLabel: 'Track Order',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'CONFIRMED':
        case 'BILLING':
        case 'AWAITING_PAYMENT':
        case 'AWAITING_CUSTOMER_CONFIRMATION':
          soundAlerts.playOrderConfirmedChime();
          showNotification({
            title: isSlip ? `Order ${shortId} Confirmed on Call! 🎉` : 'Order Confirmed',
            body: isSlip
              ? `Store verified your grocery list. Bill of ₹${Number(billTotal).toLocaleString('en-IN')} is ready. Tap to pay & dispatch.`
              : `Store accepted Order ${shortId}. Item packaging has started.`,
            badge: 'CONFIRMED',
            type: 'order_update',
            statusKey: status,
            iconType: 'package',
            orderId,
            actionLabel: isSlip ? 'Review & Pay' : 'Track Order',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'PACKING':
          soundAlerts.playPackedChime();
          showNotification({
            title: 'Packing Your Items',
            body: `Order ${shortId} is being assembled at the fulfillment station.`,
            badge: 'PACKING',
            type: 'order_update',
            statusKey: status,
            iconType: 'box',
            orderId,
            actionLabel: 'View Items',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'PACKED':
          soundAlerts.playPackedChime();
          showNotification({
            title: 'Order Packed & Sealed',
            body: `Order ${shortId} is securely packed and waiting for delivery partner.`,
            badge: 'PACKED',
            type: 'order_update',
            statusKey: status,
            iconType: 'box',
            orderId,
            actionLabel: 'Track Order',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Rider Assigned':
          soundAlerts.playRiderAssignmentChime();
          const riderName = orderData?.assignedRider?.name || 'Delivery Partner';
          showNotification({
            title: 'Delivery Partner Assigned',
            body: `${riderName} is arriving at the store for pickup of order ${shortId}.`,
            badge: 'RIDER ASSIGNED',
            type: 'order_update',
            statusKey: status,
            iconType: 'bike',
            orderId,
            actionLabel: 'Track Partner',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Order Dispatched':
        case 'Out for Delivery':
          soundAlerts.playOutForDeliveryChime();
          showNotification({
            title: 'Out for Delivery',
            body: `Your delivery partner is on the way with order ${shortId}.`,
            badge: 'OUT FOR DELIVERY',
            type: 'order_update',
            statusKey: status,
            iconType: 'bike',
            orderId,
            actionLabel: 'Live Map',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        case 'Delivered':
          soundAlerts.playDeliveredChime();
          showNotification({
            title: 'Order Delivered',
            body: `Order ${shortId} has arrived at your address. Enjoy your groceries!`,
            badge: 'DELIVERED',
            type: 'order_update',
            statusKey: status,
            iconType: 'check',
            orderId,
            actionLabel: 'View Receipt',
            actionUrl: `/orders/${orderId}`,
            durationMs: 8000,
          });
          break;

        case 'Cancelled':
          showNotification({
            title: 'Order Cancelled',
            body: `Order ${shortId} has been cancelled.`,
            badge: 'CANCELLED',
            type: 'order_update',
            statusKey: status,
            iconType: 'alert',
            orderId,
            actionLabel: 'View Details',
            actionUrl: `/orders/${orderId}`,
          });
          break;

        default:
          break;
      }
    },
    [showNotification, isOrderOwnedByCurrentAccount]
  );

  // 1. Welcome trigger on new sign-up
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

  // 2. Listen for APK downloaded event
  useEffect(() => {
    const handleApkDownloadedEvent = () => {
      notifyApkDownloaded();
      // Browser notification prompt omitted: native permissions are handled directly in the Android app.
    };
    window.addEventListener('g1mart:apk-downloaded', handleApkDownloadedEvent);
    return () => {
      window.removeEventListener('g1mart:apk-downloaded', handleApkDownloadedEvent);
    };
  }, [notifyApkDownloaded]);

  // 3. Listen for cross-tab BroadcastChannel order status events
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
        isPermissionGranted,
        showPermissionPrompt,
        dismissPermissionPrompt,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
