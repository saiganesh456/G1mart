import React from 'react';
import {
  Bike,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DeliveryDashboard: React.FC = () => {
  const { orders, updateOrderStatus, setRole, navigate } = useApp();

  const assignedOrders = orders.filter(
    (o) => o.status !== 'Cancelled'
  );

  const activeDeliveries = assignedOrders.filter((o) => o.status !== 'Delivered');

  return (
    <div className="flex-1 pb-20 space-y-5 max-w-5xl mx-auto w-full">
      {/* Top Rider Header */}
      <div className="bg-[#2E7D32] text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/g1_mart_banner_transparent.png"
            alt="G1 Mart"
            className="h-8 w-auto object-contain brightness-125"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black leading-tight">
                Rider Console
              </h1>
              <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-emerald-100">
              Raju Varma · Nellore Hub Express Rider
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRole('customer')}
          className="px-3.5 py-2 bg-white text-[#2E7D32] hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          Customer View →
        </button>
      </div>

      {/* Today's Earnings and Deliveries Stat */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs">
          <span className="text-[11px] text-stone-500 font-bold uppercase block">
            Today's Payout
          </span>
          <span className="text-xl font-black text-[#2E7D32] tabular-nums mt-0.5 block">
            ₹680.00
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">
            ₹45 per delivery + ₹150 incentive
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs">
          <span className="text-[11px] text-stone-500 font-bold uppercase block">
            Completed Trips
          </span>
          <span className="text-xl font-black text-[#212121] tabular-nums mt-0.5 block">
            8 Deliveries
          </span>
          <span className="text-[10px] text-stone-400 font-semibold">
            100% on-time record today
          </span>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Assigned Nellore Tasks ({activeDeliveries.length} Active)
          </h2>
        </div>

        {activeDeliveries.length > 0 ? (
          activeDeliveries.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3"
            >
              {/* Order Info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#212121]">
                      #{order.id}
                    </span>
                    <span className="text-[10px] font-bold bg-[#FF9800]/15 text-[#FF9800] px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-0.5 block">
                    Slot: {order.slot}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#212121] tabular-nums">
                    ₹{order.grandTotal}
                  </span>
                  <span className="text-[10px] font-bold text-stone-600 block">
                    {order.paymentMethod === 'Cash on Delivery'
                      ? '💵 Collect Cash'
                      : '✅ Pre-Paid'}
                  </span>
                </div>
              </div>

              {/* Delivery Address & Customer Contact */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800">
                        {order.address.fullName}
                      </span>
                      <p className="text-stone-600 mt-0.5 leading-snug">
                        {order.address.houseFlat}, {order.address.streetArea}, {order.address.city} - {order.address.pincode}
                      </p>
                      {order.address.deliveryInstructions && (
                        <p className="text-[11px] text-amber-800 italic mt-1 bg-amber-50 p-1 rounded">
                          Note: "{order.address.deliveryInstructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`tel:${order.address.mobileNumber}`}
                    className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 hover:bg-emerald-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Action Buttons for Delivery Steps */}
              <div className="pt-1 flex items-center gap-2">
                {order.status === 'Order Placed' && (
                  <button
                    type="button"
                    onClick={() =>
                      updateOrderStatus(order.id, 'Packed', 'Order picked and verified from hub')
                    }
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs active:scale-95 transition-all"
                  >
                    Accept & Mark Packed
                  </button>
                )}

                {order.status === 'Packed' && (
                  <button
                    type="button"
                    onClick={() =>
                      updateOrderStatus(order.id, 'Out for Delivery', 'Raju is en route')
                    }
                    className="flex-1 py-2.5 rounded-xl bg-[#FF9800] text-black font-bold text-xs active:scale-95 transition-all"
                  >
                    Start Trip (Out for Delivery)
                  </button>
                )}

                {order.status === 'Out for Delivery' && (
                  <button
                    type="button"
                    onClick={() =>
                      updateOrderStatus(order.id, 'Delivered', 'Delivered at customer doorstep')
                    }
                    className="flex-1 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                  >
                    Mark Delivered (Collect ₹{order.grandTotal})
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200/80">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">
              All deliveries completed!
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              New customer orders from Jubilee Hills & Madhapur will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
