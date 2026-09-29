import React, { useState } from 'react';
import {
  Truck,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Store,
  Star,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderTrackingScreen: React.FC = () => {
  const { activeOrder, updateOrderStatus } = useApp();
  const [showItemDetails, setShowItemDetails] = useState(true);

  const order = activeOrder;

  if (!order) {
    return (
      <div className="flex-1 p-6 text-center">
        <p className="text-stone-500 text-sm">No order selected.</p>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', desc: 'Order received & confirmed', icon: Store },
    { label: 'Packed', desc: 'Packed fresh at G1 Mart Hub', icon: Package },
    { label: 'Out for Delivery', desc: 'Rider is on the way', icon: Truck },
    { label: 'Delivered', desc: 'Delivered to your doorstep', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Order Placed':
        return 0;
      case 'Packed':
        return 1;
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);

  // Quick simulation trigger for testing
  const advanceStep = () => {
    if (order.status === 'Order Placed') {
      updateOrderStatus(order.id, 'Packed', 'Order packed and handed to delivery partner.');
    } else if (order.status === 'Packed') {
      updateOrderStatus(order.id, 'Out for Delivery', 'Rider Raju is on his way on electric scooter.');
    } else if (order.status === 'Out for Delivery') {
      updateOrderStatus(order.id, 'Delivered', 'Order successfully delivered to your doorstep.');
    }
  };

  return (
    <div className="flex-1 pb-24 space-y-5 max-w-4xl mx-auto w-full">
      {/* Top Status Banner with ETA */}
      <div className="bg-[#2E7D32] text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
            Current Status
          </span>
          <h2 className="text-lg font-black tracking-tight">
            {order.status}
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            {order.status === 'Delivered'
              ? 'Delivered at your doorstep'
              : 'Arriving in approx. 12-18 mins'}
          </p>
        </div>

        {order.status !== 'Delivered' && (
          <button
            type="button"
            onClick={advanceStep}
            className="px-3 py-1.5 bg-white text-[#2E7D32] hover:bg-emerald-50 rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all"
            title="Simulate next delivery status"
          >
            Advance Status ⚡
          </button>
        )}
      </div>

      {/* Interactive Hyderabad Map Simulation Graphic */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-stone-300/80 shadow-xs flex flex-col justify-between p-3 select-none">
        {/* Background stylized roads pattern */}
        <div className="absolute inset-0 opacity-25">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#66BB6A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
              d="M 20 120 Q 120 40 240 100 T 400 30"
              fill="none"
              stroke="#FF9800"
              strokeWidth="4"
              strokeDasharray="6,4"
            />
          </svg>
        </div>

        {/* Top Map Location Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#66BB6A]" />
            <span>Live GPS · Hyderabad Hub to {order.address.type}</span>
          </span>
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            1.4 km away
          </span>
        </div>

        {/* Rider Marker Simulation */}
        <div className="relative z-10 flex items-center justify-between px-4">
          {/* Store Pin */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg ring-4 ring-white/20">
              <Store className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-white font-bold mt-1 bg-black/60 px-1.5 rounded">
              G1 Hub
            </span>
          </div>

          {/* Animated Rider */}
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-9 h-9 rounded-full bg-[#FF9800] text-black flex items-center justify-center shadow-lg ring-4 ring-amber-400/40">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-amber-300 font-extrabold mt-1 bg-black/70 px-1.5 rounded">
              Rider En Route
            </span>
          </div>

          {/* Home Pin */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg ring-4 ring-white/20">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-white font-bold mt-1 bg-black/60 px-1.5 rounded">
              Your Home
            </span>
          </div>
        </div>

        {/* Road status */}
        <div className="relative z-10 text-[10px] text-stone-300 font-medium">
          Route: Jubilee Hills Rd 36 via Metro Corridor · Traffic Light
        </div>
      </div>

      {/* Delivery Partner Details Card */}
      {order.deliveryBoy && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/30 flex items-center justify-center text-[#2E7D32] font-black text-sm shrink-0">
                {order.deliveryBoy.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#212121]">
                    {order.deliveryBoy.name}
                  </span>
                  <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>{order.deliveryBoy.rating}</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {order.deliveryBoy.vehicleNumber}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  {order.deliveryBoy.currentLocation}
                </p>
              </div>
            </div>

            {/* Call and Chat Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.deliveryBoy.phone}`}
                className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => alert(`Opening in-app chat with rider ${order.deliveryBoy?.name}`)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
                title="Chat with Rider"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Order Progress Timeline */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
          Order Progress Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {steps.map((st, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const StepIcon = st.icon;

            return (
              <div key={st.label} className="relative flex items-start gap-3">
                {/* Step indicator node */}
                <div
                  className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white transition-all ${
                    isCompleted
                      ? 'bg-[#2E7D32] ring-4 ring-emerald-100'
                      : 'bg-stone-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#2E7D32]'
                          : isCompleted
                          ? 'text-[#212121]'
                          : 'text-stone-400'
                      }`}
                    >
                      {st.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#FF9800] bg-[#FF9800]/10 px-1.5 py-0.2 rounded animate-pulse">
                        CURRENT STEP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Products Breakdown Accordion */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowItemDetails(!showItemDetails)}
          className="w-full px-4 py-3 flex items-center justify-between bg-stone-50/70 text-xs font-bold text-stone-800"
        >
          <span>
            Ordered Items ({order.items.length}) · ₹{order.grandTotal}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showItemDetails ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showItemDetails && (
          <div className="p-3.5 space-y-2.5 divide-y divide-stone-100 text-xs">
            {order.items.map((item) => (
              <div key={item.productId} className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-800 truncate block">
                      {item.productName}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {item.unit} · Qty {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-stone-900 tabular-nums ml-2">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}

            <div className="pt-3 space-y-1 text-[11px] text-stone-500">
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span className="font-bold text-stone-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Slot</span>
                <span className="font-bold text-stone-800">{order.slot}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
