'use client';

import React, { useState } from 'react';
import { Check, Package, Bike, Home, CheckCircle2 } from 'lucide-react';

export type JourneyStage = 'received' | 'reviewing' | 'packing' | 'out_for_delivery' | 'delivered';

export interface JourneyInfo {
  stage: JourneyStage;
  stepNumber: number; // 1 to 4
  title: string;
  description: string;
}

export function getJourneyStage(status: string, isSlipOrder = false): JourneyInfo {
  const s = (status || '').toUpperCase().trim();

  // Stage 4: Delivered
  if (s === 'DELIVERED') {
    return {
      stage: 'delivered',
      stepNumber: 4,
      title: 'Delivered at Doorstep 🎉',
      description: 'Your groceries have been safely handed over at your doorstep. Enjoy your fresh order!',
    };
  }

  // Stage 3: Out for Delivery / Dispatched / Rider Assigned
  if (
    s === 'OUT_FOR_DELIVERY' ||
    s === 'OUT FOR DELIVERY' ||
    s === 'ORDER DISPATCHED' ||
    s === 'ORDER_DISPATCHED' ||
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

  // Stage 2: Packing or Intermediate Review
  if (s === 'PACKING') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Packing Fresh Groceries',
      description: 'Our store staff is carefully picking and packing fresh groceries into your G1 Mart box.',
    };
  }

  if (s === 'PACKED' || s === 'AWAITING_PAYMENT' || s === 'PAID' || s === 'COD_PENDING') {
    return {
      stage: 'packing',
      stepNumber: 2,
      title: 'Groceries Packed & Weighed Fresh',
      description: 'Your items are weighed, verified, and safely packed in our G1 Mart delivery parcel.',
    };
  }

  if (s === 'BILLING' || s === 'AWAITING_CUSTOMER_CONFIRMATION' || s === 'CONFIRMED' || (isSlipOrder && s === 'SLIP_RECEIVED')) {
    return {
      stage: 'reviewing',
      stepNumber: 2,
      title: 'Store team reviewing your list',
      description: 'We are checking availability, pricing and packing your items with care.',
    };
  }

  // Stage 1: Order Placed (Default)
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
  isSlipOrder?: boolean;
}

export default function DeliveryJourneyAnimation({
  status,
  orderType,
  isSlipOrder = false,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const journey = getJourneyStage(status, isSlipOrder);
  const isPickup = orderType === 'pickup';
  const step = journey.stepNumber; // 1, 2, 3, 4

  const isStep1Done = step > 1;
  const isStep1Active = step === 1;

  const isStep2Done = step > 2;
  const isStep2Active = step === 2;

  const isStep3Done = step > 3;
  const isStep3Active = step === 3;

  const isStep4Active = step === 4;

  // SVG curved path segments between nodes (x: 125, 375, 625, 875; y: 30)
  // Segment 1 (Order Placed to Packing): M 125 30 C 185 45, 315 15, 375 30
  // Segment 2 (Packing to Out for Delivery): C 435 45, 565 15, 625 30
  // Segment 3 (Out for Delivery to Doorstep): C 685 45, 815 15, 875 30
  const getActiveGreenPath = () => {
    if (step === 2) {
      return 'M 125 30 C 185 45, 315 15, 375 30';
    }
    if (step === 3) {
      return 'M 125 30 C 185 45, 315 15, 375 30 C 435 45, 565 15, 625 30';
    }
    if (step === 4) {
      return 'M 125 30 C 185 45, 315 15, 375 30 C 435 45, 565 15, 625 30 C 685 45, 815 15, 875 30';
    }
    return '';
  };

  const getUpcomingMutedPath = () => {
    if (step === 1) {
      return 'M 125 30 C 185 45, 315 15, 375 30 C 435 45, 565 15, 625 30 C 685 45, 815 15, 875 30';
    }
    if (step === 2) {
      return 'M 375 30 C 435 45, 565 15, 625 30 C 685 45, 815 15, 875 30';
    }
    if (step === 3) {
      return 'M 625 30 C 685 45, 815 15, 875 30';
    }
    return '';
  };

  const activeGreenPath = getActiveGreenPath();
  const upcomingMutedPath = getUpcomingMutedPath();

  return (
    <section aria-label="Order tracking journey" className="w-full space-y-3">
      {/* 1. SINGLE UNIFIED COMPONENT — Illustration + 4-Stage Connected Tracker in One Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
        {/* Top Illustration: Clean master artwork without floating badges or overlays */}
        <div className="relative w-full aspect-[312/116] max-h-[220px] overflow-hidden bg-[#eef7f0] select-none">
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/assets/images/g1_delivery_journey_art@2x.png"
              alt="G1 Mart delivery journey: store, employee packing fresh groceries, delivery rider, and doorstep delivery"
              className="w-full h-full object-cover object-center"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 text-xs font-bold">
              G1 Mart Express Delivery Journey
            </div>
          )}

          {/* Seamless Bottom Gradient Blend into Tracker Area */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        {/* Integrated Connected 4-Stage Timeline — Sits directly beneath illustration */}
        <div className="relative px-2 sm:px-3 pt-2 pb-4">
          {/* SVG Connecting Curved Route (Green for completed/active, Muted for upcoming) */}
          <svg
            className="absolute top-[22px] sm:top-[24px] left-0 w-full h-7 pointer-events-none z-0"
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
          >
            {/* Upcoming / Inactive dotted route */}
            {upcomingMutedPath && (
              <path
                d={upcomingMutedPath}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="3.5"
                strokeDasharray="6 4"
              />
            )}

            {/* Active / Completed green dotted route */}
            {activeGreenPath && (
              <path
                d={activeGreenPath}
                fill="none"
                stroke="#15803D"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                className="g1-dash-anim"
              />
            )}
          </svg>

          {/* 4 Evenly Distributed Stage Indicators with 2-Line Labels */}
          <div className="grid grid-cols-4 relative z-10">
            {/* Step 1: Order Placed */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isStep1Done || isStep1Active
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-50'
                    : 'bg-white border-2 border-stone-200 text-stone-400'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="mt-1.5 text-center px-0.5">
                <span className="block text-[11px] sm:text-xs font-bold text-stone-900 leading-tight">
                  Order
                </span>
                <span className="block text-[11px] sm:text-xs font-bold text-stone-900 leading-tight">
                  Placed
                </span>
              </div>
            </div>

            {/* Step 2: Packing Fresh Items */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isStep2Done
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-50'
                    : isStep2Active
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-white border-2 border-stone-200 text-stone-400'
                }`}
              >
                {isStep2Done ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Package className="w-4 h-4 stroke-[2.2]" />
                )}
              </div>
              <div className="mt-1.5 text-center px-0.5">
                <span
                  className={`block text-[11px] sm:text-xs leading-tight ${
                    isStep2Active || isStep2Done ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                  }`}
                >
                  Packing
                </span>
                <span
                  className={`block text-[11px] sm:text-xs leading-tight ${
                    isStep2Active || isStep2Done ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                  }`}
                >
                  Fresh Items
                </span>
              </div>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isStep3Done
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-50'
                    : isStep3Active
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-white border-2 border-stone-200 text-stone-400'
                }`}
              >
                {isStep3Done ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Bike className="w-4 h-4 stroke-[2]" />
                )}
              </div>
              <div className="mt-1.5 text-center px-0.5">
                <span
                  className={`block text-[11px] sm:text-xs leading-tight ${
                    isStep3Active || isStep3Done ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                  }`}
                >
                  Out for
                </span>
                <span
                  className={`block text-[11px] sm:text-xs leading-tight ${
                    isStep3Active || isStep3Done ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                  }`}
                >
                  Delivery
                </span>
              </div>
            </div>

            {/* Step 4: Delivered at Doorstep */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isStep4Active
                    ? 'bg-[#15803D] text-white ring-4 ring-emerald-100'
                    : 'bg-white border-2 border-stone-200 text-stone-400'
                }`}
              >
                <Home className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="mt-1.5 text-center px-0.5">
                <span
                  className={`block text-[11px] sm:text-xs leading-tight ${
                    isStep4Active ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                  }`}
                >
                  Delivered
                </span>
                <span
                  className={`block text-[11px] sm:text-xs leading-tight ${
                    isStep4Active ? 'font-bold text-stone-900' : 'font-medium text-stone-500'
                  }`}
                >
                  {isPickup ? 'at Store' : 'at Doorstep'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE STAGE HIGHLIGHT CARD — Matches Image 2 */}
      <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
        <div className="w-11 h-11 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
          {journey.stepNumber === 1 && <CheckCircle2 className="w-5 h-5 text-[#15803D]" />}
          {journey.stepNumber === 2 && <Package className="w-5 h-5 text-[#15803D]" />}
          {journey.stepNumber === 3 && <Bike className="w-5 h-5 text-[#15803D]" />}
          {journey.stepNumber === 4 && <Home className="w-5 h-5 text-[#15803D]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-[#15803D] truncate">
              {journey.title}
            </h3>
            <span className="bg-white/90 text-[#15803D] border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
              Step {journey.stepNumber} of 4
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
            {journey.description}
          </p>
        </div>
      </div>

      {/* Micro-Animation Styles */}
      <style jsx>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -20;
          }
        }

        .g1-dash-anim {
          animation: flowDash 2.5s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .g1-dash-anim {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
