'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Banknote, Smartphone, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function PaymentPage() {
  const { cartSubtotal, cartItemCount } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<'cod' | 'upi' | 'card'>('cod');

  const handlePay = () => {
    /**
     * TODO (Phase 2 — Payment Gateway Integration):
     * 1. Cash on Delivery (COD):
     *    - POST /api/checkout/confirm { method: 'cod' }
     *    - Server confirms order with paymentStatus = 'cash_on_delivery'
     *    - Redirect to /orders/[orderId]?placed=true
     *
     * 2. Online Payment (PhonePe PG):
     *    - POST /api/payment/initiate { orderId }
     *    - Server signs PhonePe request using PHONEPE_SALT_KEY and calls PhonePe Pay API
     *    - Returns PhonePe redirect URL
     *    - window.location.href = redirectUrl
     *    - PhonePe callback hits /api/payment/verify Route Handler to verify SHA-256 signature
     *    - Order marked paymentStatus = 'paid' ONLY after PhonePe server verification!
     *
     * NOTE: Fake setTimeout / client-side isPaid = true has been REMOVED per AUDIT.md.
     */
    alert(
      'Phase 1 Notice: Payment processing is stubbed until PhonePe credentials are provided in Phase 2.'
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/checkout"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">Select Payment Method</h1>
      </div>

      {/* Advisory Notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Payment Gateway Integration (Phase 2):</span> PhonePe integration will be activated once merchant credentials are added to environment variables.
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-2.5">
        {/* COD */}
        <label
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer flex items-center justify-between transition-all ${
            selectedMethod === 'cod'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#212121]">
                  Cash on Delivery (COD)
                </span>
                <span className="text-[10px] font-extrabold bg-[#FF9800] text-black px-1.5 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Pay cash or scan UPI QR upon arrival at your doorstep
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={selectedMethod === 'cod'}
            onChange={() => setSelectedMethod('cod')}
            className="accent-[#2E7D32]"
          />
        </label>

        {/* UPI */}
        <label
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer flex items-center justify-between transition-all ${
            selectedMethod === 'upi'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#212121]">
                UPI Instant Payment (PhonePe, GPay, Paytm)
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Direct bank transfer via secure UPI gateway
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={selectedMethod === 'upi'}
            onChange={() => setSelectedMethod('upi')}
            className="accent-[#2E7D32]"
          />
        </label>

        {/* Card */}
        <label
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer flex items-center justify-between transition-all ${
            selectedMethod === 'card'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#212121]">
                Debit / Credit Card / NetBanking
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Visa, MasterCard, RuPay, Maestro &amp; 40+ banks
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={selectedMethod === 'card'}
            onChange={() => setSelectedMethod('card')}
            className="accent-[#2E7D32]"
          />
        </label>
      </div>

      {/* Security Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>256-Bit SSL Encrypted &amp; RBI Compliant Payment Gateway</span>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200">
        <button
          type="button"
          onClick={handlePay}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all"
        >
          <span>
            {selectedMethod === 'cod'
              ? `Confirm Order with Cash on Delivery`
              : `Proceed to Pay with ${selectedMethod.toUpperCase()}`}
          </span>
        </button>
      </div>
    </div>
  );
}
