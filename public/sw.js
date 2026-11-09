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

// Offline navigation fallback & HTTP 494 header overflow recovery:
// 1. If edge proxy returns 494/431 (REQUEST_HEADER_TOO_LARGE), return instant self-healing page to purge cookies.
// 2. If user loses internet connectivity while navigating, serve the cached /offline page.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          // Intercept Vercel 494 / 431 Request Header Too Large
          if (response.status === 494 || response.status === 431) {
            console.warn('[G1 Mart SW] Intercepted 494 Request Header Too Large. Triggering auto-recovery...');

            // Clear cookies via Service Worker cookieStore if available
            if ('cookieStore' in self && typeof (self as any).cookieStore?.getAll === 'function') {
              try {
                const allCookies = await (self as any).cookieStore.getAll();
                for (const c of allCookies) {
                  await (self as any).cookieStore.delete({ name: c.name, path: '/', domain: c.domain });
                  await (self as any).cookieStore.delete({ name: c.name, path: '/' });
                }
              } catch (e) {}
            }

            // Return an instant auto-healing HTML page that purges all cookies and reloads cleanly
            const recoveryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Refreshing G1 Mart...</title>
  <style>
    body { margin: 0; background: #FFFFFF; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; color: #212121; }
    .loader { width: 36px; height: 36px; border: 3px solid #E0E0E0; border-top-color: #2E7D32; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 16px; font-weight: 800; color: #1B5E20; margin: 0 0 6px; }
    p { font-size: 12px; color: #757575; margin: 0; }
  </style>
</head>
<body>
  <div>
    <div class="loader"></div>
    <h2>Optimizing G1 Mart...</h2>
    <p>Loading your supermarket catalog...</p>
  </div>
  <script>
    (async function() {
      try {
        var cookies = document.cookie.split(';');
        var domains = ['', '.g1mart.in', 'g1mart.in'];
        for (var i = 0; i < cookies.length; i++) {
          var name = cookies[i].split('=')[0].trim();
          if (name) {
            for (var d = 0; d < domains.length; d++) {
              var domStr = domains[d] ? '; domain=' + domains[d] : '';
              document.cookie = name + '=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT' + domStr;
              document.cookie = name + '=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT' + domStr + '; Secure';
            }
          }
        }
        if ('cookieStore' in window && window.cookieStore.getAll) {
          var all = await window.cookieStore.getAll();
          for (var j = 0; j < all.length; j++) {
            await window.cookieStore.delete({ name: all[j].name, path: '/' }).catch(function(){});
            if (all[j].domain) {
              await window.cookieStore.delete({ name: all[j].name, domain: all[j].domain, path: '/' }).catch(function(){});
            }
          }
        }
      } catch (err) {}
      setTimeout(function() {
        window.location.replace('/');
      }, 250);
    })();
  </script>
</body>
</html>`;

            return new Response(recoveryHtml, {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, max-age=0',
              },
            });
          }
          return response;
        })
        .catch(async () => {
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
