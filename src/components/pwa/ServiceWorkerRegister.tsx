'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker Registration
 * Ensures sw.js is registered immediately on both initial load and subsequent navigation.
 * Compliant with Google Play TWA installability and PWABuilder reportcard criteria.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          if (registration) {
            registration.update().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    };

    // If page is already loaded (common in React hydration), register immediately!
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  return null;
}
