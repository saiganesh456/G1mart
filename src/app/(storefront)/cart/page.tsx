'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, Bookmark, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import ProductImage from '@/components/storefront/ProductImage';
import InnerPageHeader from '@/components/layout/InnerPageHeader';
import type { CartItem } from '@/types';

const MONTHLY_LIST_KEY = 'g1mart_monthly_essentials';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartItemCount, cartSubtotal } = useCart();
  const { isLoggedIn } = useAuth();
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem('g1mart_latest_order') ||
        localStorage.getItem('g1mart_recent_order');
      if (raw) {
        setRecentOrder(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const handleSaveAsMonthlyList = () => {
    try {
      const listData = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        addedAt: new Date().toISOString(),
      }));
      localStorage.setItem(MONTHLY_LIST_KEY, JSON.stringify(listData));
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch {}
  };

  const groupedCart = useMemo(() => {
    const groups: Record<string, { categoryTitle: string; items: CartItem[] }> = {};

    cart.forEach((item) => {
      const catKey = item.product.category || 'other';
      let title = 'Grocery & Essentials';
      if (catKey === 'grocery-staples') title = 'Atta, Rice, Dals & Staples';
      else if (catKey === 'snacks-beverages') title = 'Snacks, Chai & Confectionery';
      else if (catKey === 'household-cleaning') title = 'Household & Cleaning Care';
      else if (catKey === 'personal-care') title = 'Personal Care & Soaps';
      else if (catKey === 'pooja-essentials') title = 'Pooja Needs';

      if (!groups[catKey]) {
        groups[catKey] = { categoryTitle: title, items: [] };
      }
      groups[catKey].items.push(item);
    });

    return Object.entries(groups);
  }, [cart]);

  if (cartItemCount === 0) {
    return (
      <>
        <InnerPageHeader title="Review Cart" />
        <div className="w-full max-w-md mx-auto py-12 sm:py-20 text-center space-y-4 px-4 pb-28">
          {recentOrder && (
            <div
              className="p-4 rounded-[var(--g1-r-card)] text-left space-y-3 mb-6"
              style={{ backgroundColor: 'var(--g1-primary-tint)', border: '1px solid var(--g1-border)' }}
            >
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--g1-primary)' }}>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Active Order #{recentOrder.id} Placed!</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--g1-text)' }}>
                Your order is confirmed and shipping to {recentOrder.address?.streetArea || recentOrder.address?.city || 'your address'}.
              </p>
              <div
                className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs"
                style={{ borderTop: '1px solid var(--g1-border)' }}
              >
                <span className="font-bold" style={{ color: 'var(--g1-text)' }}>
                  {recentOrder.paymentMethod} · ₹{recentOrder.grandTotal || recentOrder.total}
                </span>
                <Link
                  href={`/orders/${recentOrder.id}`}
                  className="inline-flex items-center gap-1 font-bold"
                  style={{ color: 'var(--g1-primary)' }}
                >
                  <span>Track Live Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)' }}
          >
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bold" style={{ fontSize: 18, color: 'var(--g1-text)' }}>Your cart is empty</h1>
            <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--g1-text-secondary)' }}>
              Add groceries, staples, snacks, and personal care products to start shopping.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all g1-press"
              style={{ backgroundColor: 'var(--g1-primary)' }}
            >
              Start Shopping
            </Link>
            <Link
              href="/order-again"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold transition-all g1-press"
              style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)', color: 'var(--g1-text)' }}
            >
              ↺ Reorder Past Baskets
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <InnerPageHeader title="Review Cart" />
      <div className="w-full max-w-2xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 pb-28 pt-2 sm:pt-4 px-4 sm:px-6 box-border">
        {/* Desktop Breadcrumbs & Title */}
        <div className="hidden lg:block pb-2 border-b border-stone-200/80">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1 font-medium">
            <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-stone-900 font-bold">Cart</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Shopping Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left Column: Cart Items (8 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Quick action bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold" style={{ fontSize: 16, color: 'var(--g1-text)' }}>
              Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--g1-text-secondary)' }}>
              Nellore supermarket in-store fulfillment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAsMonthlyList}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all g1-press"
              style={{
                backgroundColor: 'var(--g1-primary-tint)',
                border: '1px solid var(--g1-border)',
                color: 'var(--g1-primary)',
              }}
              title="Save these items as your recurring monthly grocery list"
            >
              {savedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save as List</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] font-semibold px-2 py-1 transition-colors"
              style={{ color: 'var(--g1-text-secondary)' }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Grouped Cart Items */}
        <div className="space-y-4">
          {groupedCart.map(([catKey, group]) => (
            <div
              key={catKey}
              className="rounded-[var(--g1-r-card)] border p-3 sm:p-4 bg-[var(--g1-bg)] overflow-hidden"
              style={{ borderColor: 'var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
            >
              {/* Group Header */}
              <div
                className="pb-2.5 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--g1-border)' }}
              >
                <span className="text-xs font-bold tracking-tight" style={{ color: 'var(--g1-text)' }}>
                  {group.categoryTitle}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--g1-text-secondary)' }}>
                  {group.items.length} items
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y" style={{ borderColor: 'var(--g1-border)' }}>
                {group.items.map(({ product, quantity, variant }) => {
                  const unitPrice = variant?.price
                    ? variant.price
                    : product.price > 0
                      ? product.price
                      : (product.originalPrice || 0);
                  const sizeLabel = variant?.size_label || product.unit;
                  const variantId = variant?.id;

                  return (
                    <div key={`${product.id}::${variantId ?? 'base'}`} className="py-3 flex items-center gap-3">
                      {/* 1:1 Packshot */}
                      <Link
                        href={`/product/${product.id}`}
                        className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center p-0.5 rounded-xl hover:opacity-90 transition-opacity block cursor-pointer"
                        style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}
                        title={`View ${product.name}`}
                      >
                        <ProductImage
                          imageUrl={product.image_url || (product as any).imageUrl || product.image}
                          imageStatus={product.image_status}
                          alt={product.name}
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/product/${product.id}`}
                              className="text-xs font-bold line-clamp-2 leading-snug hover:text-[var(--g1-primary)] transition-colors block cursor-pointer"
                              style={{ color: 'var(--g1-text)' }}
                              title={`View ${product.name}`}
                            >
                              {product.name}
                            </Link>
                            {sizeLabel && (
                              <span
                                className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)' }}
                              >
                                {sizeLabel}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id, variantId)}
                            className="p-1 rounded-lg transition-colors shrink-0"
                            style={{ color: 'var(--g1-text-secondary)' }}
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-2">
                          <div className="flex items-baseline gap-1">
                            {unitPrice > 0 ? (
                              <>
                                <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--g1-text)' }}>
                                  ₹{unitPrice * quantity}
                                </span>
                                {quantity > 1 && (
                                  <span className="text-[10px]" style={{ color: 'var(--g1-text-secondary)' }}>
                                    (₹{unitPrice})
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] font-bold px-1 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                Price TBA
                              </span>
                            )}
                          </div>

                          {/* Stepper with tap-to-type */}
                          <div
                            className="flex items-center rounded-lg p-0.5"
                            style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}
                          >
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, quantity - 1, variantId)}
                              className="w-6 h-6 flex items-center justify-center rounded transition-all active:scale-90"
                              style={{ color: 'var(--g1-text)' }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" strokeWidth={2.5} />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= 99) {
                                  updateCartQuantity(product.id, val, variantId);
                                }
                              }}
                              className="w-7 text-center text-xs font-bold tabular-nums bg-transparent outline-none p-0"
                              aria-label={`Quantity for ${product.name}`}
                            />

                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, quantity + 1, variantId)}
                              className="w-6 h-6 flex items-center justify-center rounded transition-all active:scale-90"
                              style={{ color: 'var(--g1-text)' }}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

          </div>

          {/* Right Column: Order Summary & Checkout Action (4 cols on desktop sticky) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4 mt-4 lg:mt-0">
            {/* Bill Summary Card */}
            <div
              className="rounded-[var(--g1-r-card)] border p-4 sm:p-5 space-y-3 bg-[var(--g1-bg)] shadow-sm"
              style={{ borderColor: 'var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
            >
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--g1-text-secondary)' }}>
            Bill Details (Estimated)
          </h2>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between" style={{ color: 'var(--g1-text)' }}>
              <span>Items Subtotal ({cartItemCount} items)</span>
              <span className="font-bold tabular-nums">₹{cartSubtotal}</span>
            </div>
            <div className="flex items-center justify-between" style={{ color: 'var(--g1-text)' }}>
              <span>Store Packing &amp; Handling</span>
              <span className="font-bold" style={{ color: 'var(--g1-primary)' }}>FREE</span>
            </div>
            <div className="flex items-center justify-between" style={{ color: 'var(--g1-text-secondary)' }}>
              <span>Delivery Fee</span>
              <span className="text-[11px]">Calculated at checkout</span>
            </div>
          </div>
          <div
            className="pt-2 flex items-center justify-between text-base font-bold"
            style={{ borderTop: '1px solid var(--g1-border)', color: 'var(--g1-text)' }}
          >
            <span>Estimated Total</span>
            <span className="tabular-nums text-lg font-black" style={{ color: 'var(--g1-primary)' }}>₹{cartSubtotal}</span>
          </div>

          {/* Desktop Checkout Action inside the bill card */}
          <div className="hidden lg:block pt-2">
            <Link
              href="/checkout"
              className="w-full h-12 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 g1-press shadow-md transition-all hover:opacity-95 cursor-pointer"
              style={{ backgroundColor: 'var(--g1-primary)' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>


          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: 'var(--g1-text-secondary)' }}>
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--g1-primary)' }} strokeWidth={1.75} />
          <span>Authentic Supermarket Fulfilled Delivery</span>
        </div>

        {/* Sticky Bottom Checkout Bar (Mobile only) */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-t px-4 py-3"
          style={{
            borderColor: 'var(--g1-border)',
            boxShadow: 'var(--g1-e2)',
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--g1-text-secondary)' }}>
                TOTAL (EST.)
              </span>
              <span className="text-lg font-bold tabular-nums truncate" style={{ color: 'var(--g1-text)' }}>
                ₹{cartSubtotal}
              </span>
            </div>
            <Link
              href="/checkout"
              className="h-12 px-6 rounded-xl font-bold text-sm text-white flex items-center gap-2 g1-press transition-transform"
              style={{ backgroundColor: 'var(--g1-primary)' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
