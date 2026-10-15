'use client';

import React, { useState } from 'react';
import { Package, CheckCircle2, Bike, Home } from 'lucide-react';

export type JourneyStage = 'received' | 'reviewing' | 'packing' | 'out_for_delivery' | 'delivered';

export interface JourneyInfo {
  stage: JourneyStage;
  stepNumber: number; // 1 to 4
  title: string;
  description: string;
}

export function getJourneyStage(status: string): JourneyInfo {
  const s = (status || '').toUpperCase();

  if (s === 'DELIVERED') {
    return {
      stage: 'delivered',
      stepNumber: 4,
      title: 'Delivered at Doorstep 🎉',
      description: 'Your groceries have been safely handed over at your doorstep. Enjoy your fresh order!',
    };
  }

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

  if (s === 'PACKED' || s === 'AWAITING_PAYMENT' || s === 'COD_PENDING' || s === 'PAID') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Store team reviewing your list',
      description: 'We are checking availability, pricing and packing your items with care.',
    };
  }

  if (s === 'PACKING') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Packing Fresh Groceries',
      description: 'Our store staff is carefully picking and packing fresh groceries into your G1 Mart box.',
    };
  }

  if (s === 'BILLING' || s === 'AWAITING_CUSTOMER_CONFIRMATION' || s === 'CONFIRMED' || s === 'SLIP_RECEIVED') {
    return {
      stage: 'reviewing',
      stepNumber: 2,
      title: 'Store team reviewing your list',
      description: 'We are checking availability, pricing and packing your items with care.',
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
  const journey = getJourneyStage(status);

  return (
    <section aria-label="Order tracking journey" className="w-full space-y-3">
      {/* 1. EXACT MASTER HERO BANNER — Matching User's Approved Reference Image */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs bg-white">
        {!imgError ? (
          <div className="relative w-full aspect-[475/274] overflow-hidden select-none bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/g1_delivery_banner_clean.png"
              alt="G1 Mart illustrated delivery journey: store, employee packing fresh items, express scooter delivery, and doorstep handover"
              className="w-full h-full object-contain object-center"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="w-full p-6 text-center bg-emerald-50/70 space-y-2">
            <Package className="w-10 h-10 text-[#1E6B2E] mx-auto animate-pulse" />
            <p className="text-xs font-bold text-emerald-950">G1 Mart Fresh Grocery Journey</p>
          </div>
        )}
      </div>

      {/* 2. ACTIVE STAGE HIGHLIGHT CARD — Reference Image Pale Mint Surface */}
      <div className="bg-[#EAF6ED] border border-[#DCFCE7] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-white/90 text-[#1E6B2E] flex items-center justify-center shrink-0 mt-0.5 border border-[#86EFAC]/40 shadow-xs">
          {journey.stepNumber === 1 && <CheckCircle2 className="w-5 h-5 text-[#1E6B2E]" />}
          {journey.stepNumber === 2 && <Package className="w-5 h-5 text-[#1E6B2E]" />}
          {journey.stepNumber === 3 && <Bike className="w-5 h-5 text-[#1E6B2E]" />}
          {journey.stepNumber === 4 && <Home className="w-5 h-5 text-[#1E6B2E]" />}
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
