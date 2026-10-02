import React from 'react';
import {
  MapPin,
  Clock,
  CreditCard,
  Tag,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliverySlot } from '../../types';

export const CheckoutScreen: React.FC = () => {
  const {
    cart,
    selectedAddress,
    selectedSlot,
    setSelectedSlot,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    cartSubtotal,
    cartDiscount,
    deliveryFee,
    cartTaxes,
    cartGrandTotal,
    appliedCoupon,
    placeOrder,
    navigate,
    currentDeliveryZone,
  } = useApp();

  const expressSlotText: DeliverySlot = currentDeliveryZone?.type === 'rural_extended'
    ? 'Extended Delivery (~2 hours)'
    : 'Express Delivery (30-60 mins)';

  const slots: DeliverySlot[] = [
    expressSlotText,
    'Today Evening (5 PM - 8 PM)',
    'Tomorrow Morning (7 AM - 10 AM)',
    'Tomorrow Evening (5 PM - 8 PM)',
  ];

  const handlePlaceOrder = () => {
    if (selectedPaymentMethod === 'Cash on Delivery') {
      placeOrder();
    } else {
      navigate('payment');
    }
  };

  return (
    <div className="flex-1 pb-28 space-y-6 select-none max-w-5xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#212121]">
          Checkout &amp; Delivery Details
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Select delivery slot, verify address and choose payment option
        </p>
      </div>

      {/* 2-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Delivery Address, Slot, Payment Methods */}
        <div className="lg:col-span-7 space-y-5">
          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
                <span>Delivering To</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('address_list')}
                className="text-xs font-bold text-[#2E7D32] hover:underline"
              >
                Change Address
              </button>
            </div>

            {selectedAddress ? (
              <div className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                <div className="flex items-center gap-2 font-bold text-stone-800 mb-1">
                  <span>{selectedAddress.fullName}</span>
                  <span className="text-[10px] bg-[#2E7D32]/10 text-[#2E7D32] px-2 py-0.5 rounded font-bold">
                    {selectedAddress.type}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {selectedAddress.houseFlat}, {selectedAddress.streetArea}, {selectedAddress.city} - {selectedAddress.pincode}
                </p>
                <p className="text-stone-500 mt-1 font-medium">
                  Phone: +91 {selectedAddress.mobileNumber}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('add_address')}
                className="w-full py-3 border border-dashed border-[#2E7D32] text-[#2E7D32] rounded-xl text-xs font-bold hover:bg-[#2E7D32]/5"
              >
                + Add Delivery Address
              </button>
            )}
          </div>

          {/* Delivery Slot Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Clock className="w-4 h-4 text-[#2E7D32]" />
              <span>Choose Delivery Speed / Slot</span>
            </div>

            <div className="space-y-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                const isExpress = slot.includes('Express');
                return (
                  <div
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#2E7D32]' : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#2E7D32]" />}
                      </div>
                      <div>
                        <span className="font-bold text-stone-800">{slot}</span>
                        {isExpress && (
                          <span className="text-[10px] text-[#2E7D32] font-semibold block">
                            Direct hub dispatch · {currentDeliveryZone?.name || 'Nellore'} Active
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpress && (
                      <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        FASTEST
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <CreditCard className="w-4 h-4 text-[#2E7D32]" />
              <span>Payment Option</span>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => setSelectedPaymentMethod('Cash on Delivery')}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  selectedPaymentMethod === 'Cash on Delivery'
                    ? 'border-[#2E7D32] bg-[#2E7D32]/5'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-[#2E7D32]" />
                  <div>
                    <span className="font-bold text-stone-800">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-stone-500 block">
                      Pay via Cash or UPI QR at your doorstep
                    </span>
                  </div>
                </div>
                {selectedPaymentMethod === 'Cash on Delivery' && (
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                )}
              </div>

              <div
                onClick={() => setSelectedPaymentMethod('UPI')}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  selectedPaymentMethod === 'UPI'
                    ? 'border-[#2E7D32] bg-[#2E7D32]/5'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#2E7D32]" />
                  <div>
                    <span className="font-bold text-stone-800">Online Payment / UPI / Cards</span>
                    <span className="text-[10px] text-stone-500 block">
                      Google Pay, PhonePe, Paytm, RuPay, Cards
                    </span>
                  </div>
                </div>
                {selectedPaymentMethod === 'UPI' && (
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review, Bill Summary, Place Order Button */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
          {/* Order Review List */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
              <span className="text-xs font-bold text-stone-800">
                Order Review ({cart.length} items)
              </span>
              <button
                type="button"
                onClick={() => navigate('cart')}
                className="text-xs font-bold text-[#2E7D32] hover:underline"
              >
                Edit Cart
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 text-stone-400 font-bold tabular-nums">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-stone-800 truncate">
                      {item.product.name}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums ml-2">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-2.5 text-xs">
            <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] pb-1 border-b border-stone-100">
              Payment Summary
            </h3>

            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-stone-900 tabular-nums">₹{cartSubtotal}</span>
            </div>

            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Savings &amp; Coupons</span>
                <span className="tabular-nums">-₹{cartDiscount}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Taxes &amp; Packaging</span>
              <span className="font-semibold text-stone-900 tabular-nums">₹{cartTaxes}</span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-black text-sm text-[#212121]">
              <span>Total Payable</span>
              <span className="text-xl text-[#2E7D32] tabular-nums">₹{cartGrandTotal}</span>
            </div>

            {/* Desktop Place Order CTA Button */}
            <div className="pt-2 hidden lg:block">
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/25 active:scale-98 transition-all"
              >
                <span>Place Order · ₹{cartGrandTotal}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>100% Secure Checkout Guaranteed by G1 Mart</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200">
        <button
          type="button"
          onClick={handlePlaceOrder}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-between px-4 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-white/80 uppercase font-bold">
              {selectedPaymentMethod}
            </span>
            <span className="text-base font-black tabular-nums leading-none">
              Pay ₹{cartGrandTotal}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Place Order</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
