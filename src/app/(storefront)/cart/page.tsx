'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, Bookmark, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import ProductImage from '@/components/storefront/ProductImage';
import type { CartItem } from '@/types';

const MONTHLY_LIST_KEY = 'g1mart_monthly_essentials';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartItemCount, cartSubtotal } =
    useCart();
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

  // Save current cart as Monthly Essentials List
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

  // Group items by category for big basket clarity (40–100 items)
  const groupedCart = useMemo(() => {
    const groups: Record<string, { categoryTitle: string; items: CartItem[] }> = {};

    cart.forEach((item) => {
      const catKey = item.product.category || 'other';
      let title = 'Grocery & Essentials';
      if (catKey === 'grocery-staples') title = '🌾 Atta, Rice, Dals & Staples';
      else if (catKey === 'snacks-beverages') title = '🍪 Snacks, Chai & Confectionery';
      else if (catKey === 'household-cleaning') title = '🧼 Household & Cleaning Care';
      else if (catKey === 'personal-care') title = '✨ Personal Care & Soaps';
      else if (catKey === 'pooja-essentials') title = '🪔 Pooja Needs';

      if (!groups[catKey]) {
        groups[catKey] = { categoryTitle: title, items: [] };
      }
      groups[catKey].items.push(item);
    });

    return Object.entries(groups);
  }, [cart]);

  if (cartItemCount === 0) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20 text-center space-y-4 px-4">
        {/* Active Order Banner if order was placed */}
        {recentOrder && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-3 mb-6 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
              <span>Active Order #{recentOrder.id} Placed!</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your order is confirmed and shipping to {recentOrder.address?.streetArea || recentOrder.address?.city || 'your address'}.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 text-xs">
              <span className="font-bold text-stone-700">
                {recentOrder.paymentMethod} · ₹{recentOrder.grandTotal || recentOrder.total}
              </span>
              <Link
                href={`/orders/${recentOrder.id}`}
                className="inline-flex items-center gap-1 font-bold text-[#2E7D32] hover:underline"
              >
                <span>Track Live Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-lg font-black text-[#212121]">Your cart is empty</h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Add groceries, staples, snacks, and personal care products to start shopping.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Start Shopping
          </Link>
          <Link
            href="/order-again"
            className="inline-block px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
          >
            ↺ Reorder Past Baskets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 pt-2 px-1 sm:px-0">
      {/* Header with Title and Big Basket Quick Actions */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121]">
            Review Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-[11px] text-stone-500">Supermarket in-store fulfillment</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAsMonthlyList}
            className="flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl hover:bg-emerald-100 active:scale-95 transition-all"
            title="Save these items as your recurring monthly grocery list"
          >
            {savedNotification ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved List!</span>
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
            className="text-[11px] text-stone-400 hover:text-rose-600 font-semibold px-2 py-1 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Cart Items Grouped by Department */}
      <div className="space-y-4">
        {groupedCart.map(([catKey, group]) => (
          <div key={catKey} className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
            {/* Department Group Header */}
            <div className="bg-stone-50/90 px-3.5 py-2 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-black text-stone-800 tracking-tight">
                {group.categoryTitle}
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded-full">
                {group.items.length} items
              </span>
            </div>

            {/* Department Items List */}
            <div className="divide-y divide-stone-100">
              {group.items.map(({ product, quantity }) => {
                const unitPrice = product.price > 0 ? product.price : (product.originalPrice || 0);
                return (
                  <div key={product.id} className="p-3 flex items-center gap-3">
                    {/* Fixed 1:1 Packshot Box */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center p-1">
                      <ProductImage
                        imageUrl={product.image_url || (product as any).imageUrl || product.image}
                        imageStatus={product.image_status}
                        alt={product.name}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-50 transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1.5">
                        <div className="min-w-0">
                          <span className="text-[11px] text-stone-500 block leading-none">{product.unit}</span>
                          <div className="mt-1 flex items-baseline gap-1">
                            {unitPrice > 0 ? (
                              <>
                                <span className="text-xs sm:text-sm font-black text-stone-900 tabular-nums">
                                  ₹{unitPrice * quantity}
                                </span>
                                {quantity > 1 && (
                                  <span className="text-[10px] text-stone-400">
                                    (₹{unitPrice})
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                                Price TBA
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stepper with tap-to-type number support */}
                        <div className="h-7 flex items-center bg-stone-100 rounded-xl px-1 border border-stone-200 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-700 hover:bg-white rounded-md active:scale-95 transition-all cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          
                          {/* Tap-to-type quantity input for large baskets */}
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1 && val <= 99) {
                                updateCartQuantity(product.id, val);
                              }
                            }}
                            className="w-6 text-center text-xs font-black tabular-nums bg-transparent outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label={`Quantity for ${product.name}`}
                          />

                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-700 hover:bg-white rounded-md active:scale-95 transition-all cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
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

      {/* Bill Summary (Display Only) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        <h2 className="text-xs font-black text-stone-700 uppercase tracking-wider">
          Bill Details (Estimated)
        </h2>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span>Items Subtotal ({cartItemCount} items)</span>
            <span className="font-bold text-[#212121] tabular-nums">₹{cartSubtotal}</span>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <span>Store Packing &amp; Handling</span>
            <span className="font-bold text-[#2E7D32]">FREE</span>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <span>Delivery Fee</span>
            <span className="font-medium text-stone-500 text-[11px]">Calculated at checkout</span>
          </div>
        </div>
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm font-black text-[#212121]">
          <span>Estimated Total</span>
          <span className="tabular-nums">₹{cartSubtotal}</span>
        </div>
        <p className="text-[10px] text-stone-400 italic leading-snug">
          * Final pricing, delivery fee, and applicable taxes are verified securely on the server upon checkout.
        </p>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>Safe &amp; Authentic Storefront Checkout</span>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 sm:px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TOTAL (EST.)</span>
            <span className="text-base sm:text-lg font-black text-[#212121] tabular-nums truncate">₹{cartSubtotal}</span>
          </div>
          <Link
            href="/checkout"
            className="h-11 sm:h-12 px-5 sm:px-6 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
