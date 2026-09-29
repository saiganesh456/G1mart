import React from 'react';
import {
  CheckCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
  Clock,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderSuccessScreen: React.FC = () => {
  const { activeOrder, navigate } = useApp();

  const order = activeOrder;

  return (
    <div className="flex-1 pb-16 flex flex-col justify-between p-6 bg-gradient-to-b from-[#E8F5E9]/50 via-white to-white select-none max-w-lg mx-auto w-full my-auto py-8">
      {/* Top Celebration */}
      <div className="flex flex-col items-center text-center pt-4">
        <img
          src="/assets/images/g1_mart_banner_transparent.png"
          alt="G1 Mart"
          className="h-10 w-auto object-contain mb-4"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }}
        />

        <div className="w-16 h-16 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg shadow-[#2E7D32]/30 mb-3 animate-bounce">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-[#2E7D32] bg-[#2E7D32]/10 px-3 py-1 rounded-full mb-1">
          ORDER CONFIRMED
        </span>

        <h1 className="text-2xl font-extrabold text-[#212121] tracking-tight">
          Thank you for ordering!
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Order ID: <strong className="text-stone-800 font-mono">{order?.id || 'GM-8921'}</strong>
        </p>

        {/* ETA Highlight Card */}
        <div className="w-full bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm mt-6 text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Estimated Delivery
              </span>
              <span className="text-sm font-black text-[#212121]">
                15 - 25 Minutes
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-start gap-2.5 text-xs text-stone-600">
            <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            <p className="line-clamp-2">
              Delivering to: <strong className="text-stone-800">{order?.address.houseFlat}</strong>, {order?.address.streetArea}, Hyderabad
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Payment Mode</span>
            <span className="font-bold text-[#212121]">
              {order?.paymentMethod} ({order?.isPaid ? 'Paid' : 'Pay on Delivery'})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Grand Total</span>
            <span className="font-black text-sm text-[#2E7D32] tabular-nums">
              ₹{order?.grandTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-6">
        <button
          type="button"
          onClick={() => navigate('order_tracking', { orderId: order?.id })}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Live</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate('home')}
          className="w-full h-11 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
};
