'use client';

import { CartProvider } from '@/context/CartContext';

/**
 * Root client-side providers wrapper.
 * Wrap with additional providers here as the app grows (auth, toast, etc.).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
