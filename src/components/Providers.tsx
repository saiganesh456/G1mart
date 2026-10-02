'use client';

import { CartProvider } from '@/context/CartContext';
import { LocationProvider } from '@/context/LocationContext';

/**
 * Root client-side providers wrapper.
 * Combines Cart and Location providers.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <CartProvider>{children}</CartProvider>
    </LocationProvider>
  );
}
