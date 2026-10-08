'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product, CartItem, ProductVariant } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;

  // Wishlist
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Query helpers
  getItemQuantity: (productId: string, variantId?: string) => number;

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
// Helpers
// ---------------------------------------------------------------------------

/** Unique key for a cart line: product + optional variant */
function cartKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate cart and wishlist from localStorage on mount
  React.useEffect(() => {
    try {
      const savedCart = localStorage.getItem('g1mart_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
      const savedWishlist = localStorage.getItem('g1mart_wishlist');
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          setWishlistIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.error('Error hydrating cart/wishlist from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage on change (after initial hydration)
  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('g1mart_cart', JSON.stringify(cart));
    } catch {}
  }, [cart, isHydrated]);

  // Save wishlist to localStorage on change (after initial hydration)
  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('g1mart_wishlist', JSON.stringify(Array.from(wishlistIds)));
    } catch {}
  }, [wishlistIds, isHydrated]);

  // -- Cart actions ----------------------------------------------------------

  const addToCart = useCallback((product: Product, quantity = 1, variant?: ProductVariant) => {
    setCart((prev) => {
      const key = cartKey(product.id, variant?.id);
      const existing = prev.find((i) => cartKey(i.product.id, i.variant?.id) === key);
      if (existing) {
        return prev.map((i) =>
          cartKey(i.product.id, i.variant?.id) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, variant: variant ?? undefined, variantId: variant?.id }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    const key = cartKey(productId, variantId);
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => cartKey(i.product.id, i.variant?.id) !== key));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          cartKey(i.product.id, i.variant?.id) === key ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    const key = cartKey(productId, variantId);
    setCart((prev) => prev.filter((i) => cartKey(i.product.id, i.variant?.id) !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem('g1mart_cart');
    } catch {}
  }, []);

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

  // -- Query helpers ---------------------------------------------------------

  const getItemQuantity = useCallback(
    (productId: string, variantId?: string): number => {
      const key = cartKey(productId, variantId);
      const item = cart.find((i) => cartKey(i.product.id, i.variant?.id) === key);
      return item?.quantity ?? 0;
    },
    [cart]
  );

  // -- Derived values --------------------------------------------------------

  const cartItemCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart]
  );

  /**
   * Client-side subtotal for display purposes only.
   * Uses variant price if available, otherwise product baseline price.
   * Authoritative totals are recalculated server-side on checkout.
   */
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, i) => {
        const unitPrice =
          i.variant?.price
            ? i.variant.price
            : i.product.price > 0
              ? i.product.price
              : (i.product.originalPrice || 0);
        return sum + unitPrice * i.quantity;
      }, 0),
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
      getItemQuantity,
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
      getItemQuantity,
      cartItemCount,
      cartSubtotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
