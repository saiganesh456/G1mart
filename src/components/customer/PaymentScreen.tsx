import React, { useState } from 'react';
import {
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';

export const PaymentScreen: React.FC = () => {
  const {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    cartGrandTotal,
    user,
    placeOrder,
    goBack,
  } = useApp();

  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [customUpi, setCustomUpi] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentOptions: {
    id: PaymentMethod;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'Cash on Delivery',
      title: 'Cash on Delivery (COD)',
      subtitle: 'Pay cash or UPI scan on doorstep arrival',
      icon: Banknote,
      badge: 'RECOMMENDED',
    },
    {
      id: 'UPI (Google Pay, PhonePe, Paytm)',
      title: 'UPI Instant Payment',
      subtitle: 'Google Pay, PhonePe, Paytm, or BHIM UPI',
      icon: Smartphone,
    },
    {
      id: 'Debit / Credit Card',
      title: 'Debit / Credit Card',
      subtitle: 'Visa, MasterCard, RuPay, Maestro',
      icon: CreditCard,
    },
    {
      id: 'Net Banking',
      title: 'Net Banking',
      subtitle: 'HDFC, SBI, ICICI, Axis and 40+ banks',
      icon: Building2,
    },
    {
      id: 'G1 Mart Wallet',
      title: 'G1 Mart Wallet',
      subtitle: `Current balance: ₹${user.walletBalance}`,
      icon: Wallet,
    },
  ];

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      placeOrder();
    }, 600);
  };

  return (
    <div className="flex-1 pb-28 p-3.5 space-y-4">
      {/* Order Summary Strip */}
      <div className="bg-[#2E7D32]/10 border border-[#2E7D32]/25 rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-stone-500 uppercase">
            Order Total
          </span>
          <h2 className="text-xl font-black text-[#212121] tabular-nums">
            ₹{cartGrandTotal}
          </h2>
        </div>
        <span className="text-xs font-bold text-[#2E7D32] bg-white px-2.5 py-1 rounded-lg shadow-2xs">
          Hyderabad Express
        </span>
      </div>

      {/* Payment Options Selection */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block px-1">
          Choose Payment Option
        </span>

        {paymentOptions.map((opt) => {
          const isSelected = selectedPaymentMethod === opt.id;
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedPaymentMethod(opt.id)}
              className={`bg-white rounded-2xl border p-3.5 shadow-2xs transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#212121]">
                        {opt.title}
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] font-black bg-[#FF9800] text-black px-1.5 py-0.2 rounded">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'border-[#2E7D32] bg-[#2E7D32]'
                      : 'border-stone-300'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Sub-panels for selected method */}
              {isSelected && opt.id === 'Cash on Delivery' && (
                <div className="mt-3 pt-3 border-t border-stone-200/80 text-xs text-stone-700 bg-white/80 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span>Cash on Delivery is available for this Hyderabad order</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Keep exact cash handy (₹{cartGrandTotal}) or scan the delivery partner's UPI QR code upon arrival at your doorstep.
                  </p>
                </div>
              )}

              {isSelected && opt.id === 'UPI (Google Pay, PhonePe, Paytm)' && (
                <div className="mt-3 pt-3 border-t border-stone-200/80 text-xs space-y-2">
                  <span className="font-bold text-stone-700 block text-[11px]">
                    Select UPI App:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpiOption('gpay');
                      }}
                      className={`p-2 rounded-xl border ${
                        upiOption === 'gpay'
                          ? 'border-[#2E7D32] bg-[#2E7D32]/10 font-bold'
                          : 'border-stone-200'
                      }`}
                    >
                      Google Pay
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpiOption('phonepe');
                      }}
                      className={`p-2 rounded-xl border ${
                        upiOption === 'phonepe'
                          ? 'border-[#2E7D32] bg-[#2E7D32]/10 font-bold'
                          : 'border-stone-200'
                      }`}
                    >
                      PhonePe
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpiOption('paytm');
                      }}
                      className={`p-2 rounded-xl border ${
                        upiOption === 'paytm'
                          ? 'border-[#2E7D32] bg-[#2E7D32]/10 font-bold'
                          : 'border-stone-200'
                      }`}
                    >
                      Paytm
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>256-Bit SSL Encrypted & RBI Compliant Payments</span>
      </div>

      {/* Sticky Bottom Place Order CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200">
        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all disabled:opacity-75"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {selectedPaymentMethod === 'Cash on Delivery'
                  ? `Confirm Order with COD (₹${cartGrandTotal})`
                  : `Pay ₹${cartGrandTotal} Now`}
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
