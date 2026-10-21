/**
 * G1 Mart Background Push & Service Worker
 * Handles notifications even when the browser or app window is completely closed.
 */

const CACHE_NAME = 'g1mart-offline-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    }).catch((err) => {
      console.warn('[G1 Mart SW] Failed to pre-cache offline page:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

// Offline navigation fallback: If user loses internet connectivity while navigating,
// serve the cached /offline page instead of Chrome's ugly network error dinosaur
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse || new Response('Offline - G1mart', {
          headers: { 'Content-Type': 'text/html' },
        });
      })
    );
  }
});

// Handle Background Push Messages from G1 Mart Server
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'G1 Mart';
    const body = data.body || 'Order status updated';
    const orderId = data.orderId;
    let url = data.url;
    const isAdminAlert = Boolean(
      url === '/admin' ||
      url?.startsWith('/admin') ||
      data.tag?.includes('admin_new_order') ||
      data.tag?.includes('admin_new_slip') ||
      data.isAdminOrder
    );

    // If it's an admin alert with orderId, ensure it routes to the order interface
    if (isAdminAlert && orderId) {
      if (!url || url === '/admin' || url === '/admin/') {
        const isSlip = Boolean(data.tag?.includes('admin_new_slip') || String(orderId).startsWith('SLIP'));
        url = isSlip ? `/admin?tab=slips&slipId=${encodeURIComponent(orderId)}` : `/admin?tab=orders&orderId=${encodeURIComponent(orderId)}`;
      }
    } else if (!url) {
      url = orderId ? `/orders/${encodeURIComponent(orderId)}` : '/';
    }

    const options = {
      body: body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      sound: isAdminAlert ? '/new_order_voice.wav' : undefined,
      vibrate: isAdminAlert ? [600, 200, 600, 200, 600, 200, 600] : [200, 100, 200, 100, 200],
      tag: orderId ? `g1mart_order_${orderId}` : 'g1mart_notification',
      renotify: true,
      requireInteraction: isAdminAlert, // Keeps the new order notification on screen until admin responds
      data: {
        url: url,
        orderId: orderId,
        tab: data.tab || (isAdminAlert ? (String(orderId).startsWith('SLIP') ? 'slips' : 'orders') : undefined),
        isAdminAlert: isAdminAlert,
      },
      actions: [
        {
          action: 'open_order',
          title: isAdminAlert ? 'Open Order' : (orderId ? 'Track Order' : 'Open G1 Mart'),
        },
      ],
    };

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If an admin has /admin open, notify the page so it can also trigger in-app sound
        if (isAdminAlert) {
          clientList.forEach((client) => {
            if (client.url && client.url.includes('/admin')) {
              client.postMessage({
                type: 'NEW_ORDER_PUSH_RECEIVED',
                orderId: orderId,
                targetUrl: url,
                data: data,
              });
            }
          });
        }

        // If customer is already actively viewing this order's live tracking page in a focused tab,
        // do not display redundant background push notification
        if (!isAdminAlert) {
          const isViewingThisOrder = clientList.some((client) => {
            return client.focused && orderId && client.url && client.url.includes(`/orders/${orderId}`);
          });

          if (isViewingThisOrder) {
            return;
          }
        }

        return self.registration.showNotification(title, options);
      })
    );
  } catch (err) {
    console.warn('[G1 Mart SW] Push parse error:', err);
  }
});

// Handle Notification Clicks (Opens the app directly to the order tracking or admin order interface)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/';
  const orderId = notifData.orderId;
  const isAdminAlert = Boolean(notifData.isAdminAlert);

  // Safety fallback: ensure admin order alerts point directly to order interface
  if (isAdminAlert && orderId && (targetUrl === '/admin' || targetUrl === '/admin/')) {
    const isSlip = Boolean(String(orderId).startsWith('SLIP'));
    targetUrl = isSlip ? `/admin?tab=slips&slipId=${encodeURIComponent(orderId)}` : `/admin?tab=orders&orderId=${encodeURIComponent(orderId)}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an admin tab is open, focus it and notify/navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && client.url.includes('/admin')) {
          if ('focus' in client) {
            client.focus();
          }
          client.postMessage({
            type: 'NOTIFICATION_ORDER_CLICKED',
            url: targetUrl,
            orderId: orderId,
            tab: notifData.tab || 'orders',
            isAdminAlert: isAdminAlert,
          });
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }

      // 2. If any other G1 Mart tab is open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_ORDER_CLICKED',
            url: targetUrl,
            orderId: orderId,
            tab: notifData.tab || 'orders',
            isAdminAlert: isAdminAlert,
          });
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }

      // 3. If closed (phone was off or in another app), open window directly to targetUrl
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
