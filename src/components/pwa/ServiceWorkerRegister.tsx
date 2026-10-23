'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker Registration
 * Ensures sw.js is registered on every initial storefront load for:
 * 1. Offline navigation fallback (/offline)
 * 2. Instant static asset caching
 * 3. Meeting Google Play TWA installability & Lighthouse PWA criteria
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            // Periodic update check
            if (registration) {
              registration.update().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
