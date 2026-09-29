import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Bookmark,
  ShoppingBag,
  Tag,
  CheckCircle2,
  X,
  Truck,
  AlertCircle,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartScreen: React.FC = () => {
  const {
    cart,
    savedForLater,
    updateCartQuantity,
    removeFromCart,
    saveForLaterAction,
    moveToCartFromSaved,
    cartSubtotal,
    cartDiscount,
    deliveryFee,
    cartTaxes,
    cartGrandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    availableCoupons,
    navigate,
    selectedAddress,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ text: res.message, error: !res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleApplyPresetCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponMessage({ text: res.message, error: !res.success });
  };

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="flex-1 pb-20 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-24 h-24 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] mb-4">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-black text-[#212121]">
          Your G1 Mart cart is empty
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mt-2 leading-relaxed">
          Looks like you haven't added fresh fruits, dairy, or daily essentials yet. Add items to enjoy 15-minute delivery!
        </p>
        <button
          type="button"
          onClick={() => navigate('home')}
          className="mt-6 px-6 py-3 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all"
        >
          Start Shopping Groceries
        </button>
      </div>
    );
  }

  const freeDeliveryThreshold = 499;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  return (
    <div className="flex-1 pb-24 flex flex-col space-y-6 select-none">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#212121]">
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Delivering to {selectedAddress ? `${selectedAddress.houseFlat}, ${selectedAddress.streetArea}` : 'Hyderabad'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('home')}
          className="text-xs font-bold text-[#2E7D32] hover:underline"
        >
          + Add more items
        </button>
      </div>

      {/* Free Delivery Incentive Bar */}
      {amountNeededForFreeDelivery > 0 ? (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-900">
              Add ₹{amountNeededForFreeDelivery} more for FREE delivery
            </p>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>Congratulations! You have unlocked FREE Express Delivery on this order.</span>
        </div>
      )}

      {/* Responsive 2-Column Grid on Desktop / Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (Items List & Saved for Later) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Cart Items Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
            <div className="px-4 py-3 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Items in Bag ({cart.length})</span>
              <span>15-30 Min Delivery</span>
            </div>

            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 flex items-center gap-3.5 hover:bg-stone-50/40 transition-colors">
                <div
                  onClick={() => navigate('product_details', { productId: product.id })}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-100 overflow-hidden shrink-0 cursor-pointer border border-stone-100"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://placehold.co/200x200/e8f5e9/2e7d32?text=G1';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#2E7D32] tracking-wider block">
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => navigate('product_details', { productId: product.id })}
                    className="text-xs sm:text-sm font-bold text-[#212121] truncate cursor-pointer hover:text-[#2E7D32] transition-colors"
                  >
                    {product.name}
                  </h3>
                  <span className="text-[11px] text-stone-400 font-medium block mt-0.5">
                    {product.unit}
                  </span>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm sm:text-base font-black text-[#212121] tabular-nums">
                      ₹{product.price * quantity}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-stone-400 line-through tabular-nums">
                        ₹{product.originalPrice * quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Quantity Stepper & Save for Later */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="h-8 flex items-center bg-[#2E7D32] text-white rounded-xl shadow-2xs px-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded transition-colors active:scale-90"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateCartQuantity(product.id, quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded transition-colors active:scale-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => saveForLaterAction(product.id)}
                      className="text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      Save
                    </button>
                    <span className="text-stone-300">·</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saved For Later Section */}
          {savedForLater.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>Saved for Later ({savedForLater.length})</span>
              </h3>
              <div className="divide-y divide-stone-100">
                {savedForLater.map(({ product }) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-800 truncate">{product.name}</p>
                        <p className="text-[11px] text-stone-500">₹{product.price}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToCartFromSaved(product.id)}
                      className="text-xs font-bold text-[#2E7D32] hover:underline shrink-0"
                    >
                      Move to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Coupons, Bill Details, Sticky CTA) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-28">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Apply Coupons & Offers
              </h3>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#2E7D32] block">
                    '{appliedCoupon.code}' Applied!
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Saved ₹{appliedCoupon.discountAmount} on this order
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter Promo Code"
                  className="flex-1 h-9 px-3 bg-stone-50 rounded-xl border border-stone-200 text-xs uppercase font-bold focus:border-[#2E7D32] outline-hidden"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMessage && (
              <p
                className={`text-[11px] font-semibold ${
                  couponMessage.error ? 'text-rose-600' : 'text-[#2E7D32]'
                }`}
              >
                {couponMessage.text}
              </p>
            )}

            {/* Quick Available Promo Badges */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                Suggested Coupons
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableCoupons.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleApplyPresetCoupon(c.code)}
                    className="text-[11px] bg-stone-100 hover:bg-[#2E7D32]/10 hover:text-[#2E7D32] px-2 py-1 rounded-lg border border-stone-200 font-bold transition-colors"
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-100">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800 tabular-nums">₹{cartSubtotal}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Product Discount</span>
                  <span className="tabular-nums">- ₹{cartDiscount}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">- ₹{appliedCoupon.discountAmount}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Delivery Charge</span>
                {deliveryFee === 0 ? (
                  <span className="text-[#2E7D32] font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-stone-800 tabular-nums">₹{deliveryFee}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Handling &amp; Taxes</span>
                <span className="font-semibold text-stone-800 tabular-nums">₹{cartTaxes}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 uppercase font-bold block">
                  Grand Total
                </span>
                <span className="text-xl font-black text-[#212121] tabular-nums">
                  ₹{cartGrandTotal}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Saved ₹{cartDiscount + (appliedCoupon?.discountAmount || 0)}
              </span>
            </div>

            {/* Proceed to Checkout CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('checkout')}
                className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-sm rounded-xl shadow-md shadow-[#2E7D32]/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Safe &amp; Secure Checkout · 100% Genuine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
