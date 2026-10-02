'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { STORE_CONFIG } from '@/config/store';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartItemCount, cartSubtotal } =
    useCart();

  if (cartItemCount === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
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
          className="inline-block px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 pt-2 sm:pt-4 px-3 sm:px-0">
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
      <div className="bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-4 shadow-2xs divide-y divide-stone-100">
        {cart.map(({ product, quantity }) => (
          <div key={product.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-contain rounded-xl bg-stone-50 p-1 border border-stone-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-[#212121] truncate">{product.name}</h3>
              <p className="text-[11px] text-stone-500">{product.unit}</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                {product.price > 0 ? (
                  <span className="text-xs sm:text-sm font-extrabold text-[#212121] tabular-nums">
                    ₹{product.price * quantity}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
                    Price TBD
                  </span>
                )}
                {product.price > 0 && quantity > 1 && (
                  <span className="text-[10px] text-stone-400">
                    (₹{product.price} each)
                  </span>
                )}
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-8 flex items-center bg-stone-100 rounded-xl px-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(product.id, quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg active:scale-95 transition-all"
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
                  className="w-6 h-6 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg active:scale-95 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeFromCart(product.id)}
                className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-50 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200">
        <Link
          href="/checkout"
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-between px-4 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.99] transition-all"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-white/80 font-medium">TOTAL (EST.)</span>
            <span className="text-sm font-black tabular-nums">₹{cartSubtotal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
