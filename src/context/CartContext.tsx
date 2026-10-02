'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product, CartItem } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Wishlist
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Derived read-only values
  cartItemCount: number;
  cartSubtotal: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextType | null>(null);

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // -- Cart actions ----------------------------------------------------------

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // -- Wishlist actions ------------------------------------------------------

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  // -- Derived values --------------------------------------------------------

  const cartItemCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart]
  );

  /**
   * Client-side subtotal for display purposes only.
   * Authoritative totals are calculated server-side in the checkout
   * Route Handler (TODO Phase 2 — see /api/checkout/route.ts).
   */
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [cart]
  );

  // -- Context value ---------------------------------------------------------

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      cartItemCount,
      cartSubtotal,
    }),
    [
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      cartItemCount,
      cartSubtotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
