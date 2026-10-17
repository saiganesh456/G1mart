/**
 * G1 Mart Background Push & Service Worker
 * Handles notifications even when the browser or app window is completely closed.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle Background Push Messages from G1 Mart Server
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'G1 Mart';
    const body = data.body || 'Order status updated';
    const orderId = data.orderId;
    const url = data.url || (orderId ? `/orders/${orderId}` : '/');
    const isAdminAlert = Boolean(
      url === '/admin' ||
      url?.startsWith('/admin') ||
      data.tag?.includes('admin_new_order') ||
      data.isAdminOrder
    );

    const options = {
      body: body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: isAdminAlert ? [600, 200, 600, 200, 600, 200, 600] : [200, 100, 200, 100, 200],
      tag: orderId ? `g1mart_order_${orderId}` : 'g1mart_notification',
      renotify: true,
      requireInteraction: isAdminAlert, // Keeps the new order notification on screen until admin responds
      data: {
        url: url,
        orderId: orderId,
        isAdminAlert: isAdminAlert,
      },
      actions: [
        {
          action: 'open_order',
          title: isAdminAlert ? 'Open Admin Order' : (orderId ? 'Track Order' : 'Open G1 Mart'),
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

// Handle Notification Clicks (Opens the app directly to the order tracking page)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If G1 Mart is already open in a tab, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // If closed, open a new window directly to the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
