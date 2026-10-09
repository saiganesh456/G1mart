'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LocationProvider } from '@/context/LocationContext';
import { NotificationProvider } from '@/context/NotificationContext';
import GlobalNotificationBanner from '@/components/common/GlobalNotificationBanner';

/**
 * Root client-side providers wrapper.
 * Combines Auth, Notification, Location, and Cart providers.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LocationProvider>
          <CartProvider>
            {children}
            <GlobalNotificationBanner />
          </CartProvider>
        </LocationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

