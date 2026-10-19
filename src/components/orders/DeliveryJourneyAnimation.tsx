'use client';

import React, { useState } from 'react';
import { Package, CheckCircle2, Bike, Home, Check } from 'lucide-react';

export type JourneyStage = 'received' | 'reviewing' | 'packing' | 'out_for_delivery' | 'delivered';

export interface JourneyInfo {
  stage: JourneyStage;
  stepNumber: number; // 1 to 4
  title: string;
  description: string;
}

export function getJourneyStage(status: string, orderType?: string): JourneyInfo {
  const s = (status || '').toUpperCase();
  const isPickup = orderType === 'pickup';

  // 1. DELIVERED / COMPLETED
  if (s === 'DELIVERED') {
    return {
      stage: 'delivered',
      stepNumber: 4,
      title: isPickup ? 'Picked Up at Store 🎉' : 'Delivered at Doorstep 🎉',
      description: isPickup
        ? 'Your groceries have been safely handed over at G1mart counter. Thank you for shopping with G1mart!'
        : 'Your groceries have been safely handed over at your doorstep. Enjoy your fresh order!',
    };
  }

  // 2. STORE PICKUP WORKFLOW
  if (isPickup) {
    if (s === 'PACKED' || s === 'READY_FOR_PICKUP') {
      return {
        stage: 'packing',
        stepNumber: 3,
        title: 'Ready for Pickup at Store 🏬',
        description: 'Your groceries are packed and ready at G1mart Supermarket counter. Show your 4-digit PIN to collect!',
      };
    }
    if (s === 'PACKING') {
      return {
        stage: 'packing',
        stepNumber: 2,
        title: 'Packing Fresh Groceries 🛍️',
        description: 'Our store staff is picking and packing your items fresh for store pickup.',
      };
    }
    if (s === 'CONFIRMED') {
      return {
        stage: 'reviewing',
        stepNumber: 2,
        title: 'Order Confirmed by Store',
        description: 'Store manager confirmed your order. Items are queued for fresh packing.',
      };
    }
    return {
      stage: 'received',
      stepNumber: 1,
      title: 'Order Placed & Confirmed',
      description: 'We received your order. G1mart store team is preparing your items for store pickup.',
    };
  }

  // 3. HOME DELIVERY WORKFLOW
  if (
    s === 'OUT_FOR_DELIVERY' ||
    s === 'OUT FOR DELIVERY' ||
    s === 'ORDER DISPATCHED' ||
    s === 'RIDER_ASSIGNED' ||
    s === 'RIDER ASSIGNED'
  ) {
    return {
      stage: 'out_for_delivery',
      stepNumber: 3,
      title: 'Out for Express Delivery 🛵',
      description: 'Our delivery partner is on the way with your packed groceries.',
    };
  }

  if (s === 'PACKED') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Order Packed & Sealed 📦',
      description: 'Your order is securely packed into G1mart bags and waiting for delivery partner pickup.',
    };
  }

  if (s === 'PACKING') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Packing Fresh Groceries',
      description: 'Our store staff is carefully picking and packing fresh groceries into your G1mart box.',
    };
  }

  if (s === 'CONFIRMED') {
    return {
      stage: 'reviewing',
      stepNumber: 2,
      title: 'Order Confirmed by Store',
      description: 'Store manager confirmed your order. Items are queued for fresh packing.',
    };
  }

  // Slip Order specific statuses
  if (s === 'BILLING' || s === 'AWAITING_CUSTOMER_CONFIRMATION' || s === 'SLIP_RECEIVED') {
    return {
      stage: 'reviewing',
      stepNumber: 2,
      title: 'Store team reviewing your list',
      description: 'We are checking availability, pricing and packing your items with care.',
    };
  }

  if (s === 'AWAITING_PAYMENT' || s === 'COD_PENDING' || s === 'PAID') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Order Confirmed & Prepared',
      description: 'Items are verified and preparing for delivery handover.',
    };
  }

  // Default: Placed / Received
  return {
    stage: 'received',
    stepNumber: 1,
    title: 'Order Placed & Confirmed',
    description: 'We received your order. Our store team is preparing to pick your items.',
  };
}

interface Props {
  status: string;
  orderType?: 'delivery' | 'pickup';
  orderId?: string;
  etaMin?: number;
}

export default function DeliveryJourneyAnimation({ status, orderType }: Props) {
  const [imgError, setImgError] = useState(false);
  const journey = getJourneyStage(status, orderType);
  const isPickup = orderType === 'pickup';

  return (
    <section aria-label="Order tracking journey" className="w-full space-y-3">
      {/* 1. MASTER HERO BANNER WITH CURVED TRACKING SYSTEM */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs bg-white">
        {!imgError ? (
          <div className="relative w-full select-none bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/g1_delivery_master_banner.png"
              alt="G1mart illustrated delivery journey: store, employee packing fresh groceries, express scooter delivery, and doorstep handover"
              className="w-full h-auto object-cover object-top block"
              onError={() => setImgError(true)}
            />

            {/* CURVED TRACKING SYSTEM — Flowing naturally along the bottom plain background */}
            <div className="relative w-full px-1 sm:px-3 pt-2 pb-3.5 bg-gradient-to-b from-white/70 via-white to-white -mt-4 sm:-mt-7 z-10">
              {/* SVG Curved Wave Track */}
              <div className="relative w-full h-11 sm:h-14 overflow-visible">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 1000 80"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <style>{`
                      @keyframes dashFlow {
                        from { stroke-dashoffset: 24; }
                        to { stroke-dashoffset: 0; }
                      }
                      .animate-dash-flow {
                        animation: dashFlow 1.2s linear infinite;
                      }
                    `}</style>
                  </defs>

                  {/* Base Inactive Track (Full Wave) */}
                  <path
                    d="M 170 38 C 240 18, 320 16, 390 20 C 480 24, 570 52, 660 44 C 730 38, 810 24, 880 30"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="2.5"
                    strokeDasharray="6 5"
                  />

                  {/* Segment 1: Store -> Packing Station */}
                  <path
                    d="M 170 38 C 240 18, 320 16, 390 20"
                    fill="none"
                    stroke="#1E6B2E"
                    strokeWidth="3"
                    strokeDasharray="6 5"
                    className={journey.stepNumber === 1 ? "animate-dash-flow" : ""}
                    strokeOpacity={journey.stepNumber >= 1 ? 1 : 0}
                  />

                  {/* Segment 2: Packing Station -> Scooter */}
                  <path
                    d="M 390 20 C 480 24, 570 52, 660 44"
                    fill="none"
                    stroke="#1E6B2E"
                    strokeWidth="3"
                    strokeDasharray="6 5"
                    className={journey.stepNumber === 2 ? "animate-dash-flow" : ""}
                    strokeOpacity={journey.stepNumber >= 2 ? 1 : 0}
                  />

                  {/* Segment 3: Scooter -> Doorstep Handover */}
                  <path
                    d="M 660 44 C 730 38, 810 24, 880 30"
                    fill="none"
                    stroke="#1E6B2E"
                    strokeWidth="3"
                    strokeDasharray="6 5"
                    className={journey.stepNumber === 3 ? "animate-dash-flow" : ""}
                    strokeOpacity={journey.stepNumber >= 3 ? 1 : 0}
                  />
                </svg>

                {/* 4 Milestone Interactive Badges placed along the curve */}
                {/* Node 1: Storefront (17%, y ~ 38) */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                  style={{ left: '17%', top: '48%' }}
                >
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      journey.stepNumber >= 1
                        ? 'bg-[#1E6B2E] text-white shadow-xs ring-4 ring-[#DCFCE7]/90'
                        : 'bg-white border-2 border-stone-200 text-stone-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Node 2: Packing Station (39%, y ~ 20) */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                  style={{ left: '39%', top: '25%' }}
                >
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      journey.stepNumber > 2
                        ? 'bg-[#1E6B2E] text-white shadow-xs'
                        : journey.stepNumber === 2
                        ? 'bg-[#1E6B2E] text-white shadow-md ring-4 ring-[#DCFCE7] animate-pulse'
                        : 'bg-white border-2 border-stone-200 text-stone-400'
                    }`}
                  >
                    {journey.stepNumber > 2 ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    ) : (
                      <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    )}
                  </div>
                </div>

                {/* Node 3: Out for Delivery (66%, y ~ 44) */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                  style={{ left: '66%', top: '55%' }}
                >
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      journey.stepNumber > 3
                        ? 'bg-[#1E6B2E] text-white shadow-xs'
                        : journey.stepNumber === 3
                        ? 'bg-[#1E6B2E] text-white shadow-md ring-4 ring-[#DCFCE7] animate-pulse'
                        : 'bg-white border-2 border-stone-200 text-stone-400'
                    }`}
                  >
                    {journey.stepNumber > 3 ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    ) : (
                      <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    )}
                  </div>
                </div>

                {/* Node 4: Delivered at Doorstep (88%, y ~ 30) */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                  style={{ left: '88%', top: '38%' }}
                >
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                      journey.stepNumber === 4
                        ? 'bg-[#1E6B2E] text-white shadow-md ring-4 ring-[#DCFCE7]'
                        : 'bg-white border-2 border-stone-200 text-stone-400'
                    }`}
                  >
                    {journey.stepNumber === 4 ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    ) : (
                      <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Milestone Labels Row */}
              <div className="relative w-full flex justify-between mt-2.5 px-0.5 text-center select-none">
                <div className="w-[23%] flex flex-col items-center">
                  <p
                    className={`text-[10px] sm:text-xs leading-tight ${
                      journey.stepNumber >= 1 ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                    }`}
                  >
                    Order<br />Placed
                  </p>
                </div>
                <div className="w-[25%] flex flex-col items-center">
                  <p
                    className={`text-[10px] sm:text-xs leading-tight ${
                      journey.stepNumber >= 2 ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                    }`}
                  >
                    {isPickup ? <>Packing<br />in Store</> : <>Packing<br />Fresh Items</>}
                  </p>
                </div>
                <div className="w-[25%] flex flex-col items-center">
                  <p
                    className={`text-[10px] sm:text-xs leading-tight ${
                      journey.stepNumber >= 3 ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                    }`}
                  >
                    {isPickup ? <>Ready for<br />Pickup</> : <>Out for<br />Delivery</>}
                  </p>
                </div>
                <div className="w-[23%] flex flex-col items-center">
                  <p
                    className={`text-[10px] sm:text-xs leading-tight ${
                      journey.stepNumber >= 4 ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                    }`}
                  >
                    {isPickup ? <>Picked Up<br />at Store</> : <>Delivered<br />at Doorstep</>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-6 text-center bg-emerald-50/70 space-y-2">
            <Package className="w-10 h-10 text-[#1E6B2E] mx-auto animate-pulse" />
            <p className="text-xs font-bold text-emerald-950">G1mart Fresh Grocery Journey</p>
          </div>
        )}
      </div>

      {/* 2. ACTIVE STAGE HIGHLIGHT CARD — Reference Image Pale Mint Surface */}
      <div className="bg-[#EAF6ED] border border-[#DCFCE7] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-white/90 text-[#1E6B2E] flex items-center justify-center shrink-0 mt-0.5 border border-[#86EFAC]/40 shadow-xs">
          {journey.stepNumber === 1 && <CheckCircle2 className="w-5 h-5 text-[#1E6B2E]" />}
          {journey.stepNumber === 2 && <Package className="w-5 h-5 text-[#1E6B2E]" />}
          {journey.stepNumber === 3 && (isPickup ? <Package className="w-5 h-5 text-[#1E6B2E]" /> : <Bike className="w-5 h-5 text-[#1E6B2E]" />)}
          {journey.stepNumber === 4 && (isPickup ? <Check className="w-5 h-5 text-[#1E6B2E]" /> : <Home className="w-5 h-5 text-[#1E6B2E]" />)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
              {journey.title}
            </h3>
            <span className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/60 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
              Step {journey.stepNumber} of 4
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed mt-0.5">
            {journey.description}
          </p>
        </div>
      </div>
    </section>
  );
}
