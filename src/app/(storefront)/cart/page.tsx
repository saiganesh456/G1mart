'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, Truck, UserCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartItemCount, cartSubtotal } =
    useCart();
  const { isLoggedIn } = useAuth();
  const [recentOrder, setRecentOrder] = useState<any>(null);

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
          <p className="text-xs text-stone-500 mt-1">
            Browse our grocery catalog and add your daily essentials!
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-36 sm:pb-40 pt-2 sm:pt-4 px-3 sm:px-0">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121]">Shopping Bag</h1>
          <p className="text-xs text-stone-500">
            {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-4 shadow-2xs divide-y divide-stone-100 overflow-hidden w-full max-w-full">
        {cart.map(({ product, quantity }) => (
          <div key={product.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-contain rounded-xl bg-stone-50 p-1 border border-stone-100 shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
              {/* Row 1: Product Name & Delete */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-bold text-[#212121] line-clamp-2 leading-snug break-words">
                  {product.name}
                </h3>
                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="p-1 -mr-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-50 transition-colors shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Row 2: Unit, Price & Stepper */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div>
                  <span className="text-[11px] text-stone-500 block leading-none">{product.unit}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    {product.price > 0 ? (
                      <span className="text-xs sm:text-sm font-black text-[#212121] tabular-nums">
                        ₹{product.price * quantity}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
                        Price TBD
                      </span>
                    )}
                    {product.price > 0 && quantity > 1 && (
                      <span className="text-[10px] text-stone-400">
                        (₹{product.price}/pc)
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper */}
                <div className="h-7 sm:h-8 flex items-center bg-stone-100 rounded-xl px-1 border border-stone-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(product.id, quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg active:scale-95 transition-all cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(product.id, quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg active:scale-95 transition-all cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Verification Nudge */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-200 p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold text-xs shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 truncate">Account Required to Book</p>
              <p className="text-[11px] text-stone-500 truncate">Sign in with Google or Phone to complete your order</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs ml-2"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Bill Summary (Display Only) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-2.5">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Bill Details (Estimated)
        </h2>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span>Item Subtotal</span>
            <span className="font-bold text-[#212121] tabular-nums">₹{cartSubtotal}</span>
          </div>
          <div className="flex items-center justify-between text-stone-600">
            <span>Delivery Fee</span>
            <span className="font-medium text-stone-500">Calculated at checkout</span>
          </div>
        </div>
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#212121]">
          <span>Estimated Total</span>
          <span className="tabular-nums">₹{cartSubtotal}</span>
        </div>
        <p className="text-[10px] text-stone-400 italic">
          * Final pricing, delivery fee, and applicable taxes are verified securely on the server upon checkout.
        </p>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>Safe &amp; Secure Checkout</span>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TOTAL (EST.)</span>
            <span className="text-base sm:text-lg font-black text-[#212121] tabular-nums truncate">₹{cartSubtotal}</span>
          </div>
          <Link
            href="/checkout"
            className="h-12 px-6 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
