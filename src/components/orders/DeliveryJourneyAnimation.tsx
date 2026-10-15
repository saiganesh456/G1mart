'use client';

import React, { useState } from 'react';
import { Check, Package, Bike, Home, CheckCircle2, Sparkles, Clock } from 'lucide-react';

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
      title: 'Groceries Packed & Weighed Fresh',
      description: 'Your items are weighed, verified, and safely packed in our G1 Mart delivery parcel.',
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

  if (s === 'BILLING' || s === 'AWAITING_CUSTOMER_CONFIRMATION' || s === 'CONFIRMED') {
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

export default function DeliveryJourneyAnimation({ status, orderType, etaMin }: Props) {
  const [imgError, setImgError] = useState(false);
  const journey = getJourneyStage(status);
  const isPickup = orderType === 'pickup';

  // Explicit stages
  const isStep1Active = journey.stepNumber === 1;
  const isStep1Done = journey.stepNumber > 1;

  const isStep2Active = journey.stepNumber === 2;
  const isStep2Done = journey.stepNumber > 2;

  const isStep3Active = journey.stepNumber === 3;
  const isStep3Done = journey.stepNumber > 3;

  const isStep4Active = journey.stepNumber === 4;

  return (
    <section aria-label="Order tracking journey" className="w-full space-y-3">
      {/* 1. VISUAL PANORAMA ILLUSTRATION — Reference C Approved Delivery Journey */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-900/10 shadow-xs bg-gradient-to-b from-[#eaf6ed] to-[#f7fcf8]">
        {/* Master Panoramic Artwork */}
        {!imgError ? (
          <div className="relative w-full aspect-[312/115] max-h-[220px] overflow-hidden select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/g1_delivery_journey_art@2x.png"
              alt="G1 Mart delivery journey: store, employee packing fresh groceries, delivery rider, and doorstep delivery"
              className="w-full h-full object-cover object-center"
              onError={() => setImgError(true)}
            />

            {/* SVG Connecting Curved Green Route */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 624 220"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1E6B2E" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#22c55e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1E6B2E" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Base route */}
              <path
                d="M 120 185 C 200 195, 240 180, 320 190 C 400 200, 470 185, 540 180"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="3.5"
                strokeDasharray="7 5"
                className="g1-dash-anim"
              />
            </svg>

            {/* OVERLAY SCENE 1: G1 Mart Storefront (Left) */}
            <div
              className={`absolute top-[18%] left-[4%] w-[25%] transition-opacity duration-300 ${
                isStep1Active ? 'opacity-100' : 'opacity-85'
              }`}
            >
              {isStep1Active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E6B2E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-bounce">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  <span>Order Placed</span>
                </div>
              )}
            </div>

            {/* OVERLAY SCENE 2: Packing Action (Mandatory Visible Packing Animation) */}
            <div
              className={`absolute top-[14%] left-[26%] w-[33%] transition-opacity duration-300 ${
                isStep2Active ? 'opacity-100' : 'opacity-85'
              }`}
            >
              {/* Visibly animated grocery items falling/placed into the G1 Mart box when packing */}
              {(journey.stage === 'packing' || journey.stage === 'reviewing') && (
                <div className="absolute -top-2 left-[38%] pointer-events-none">
                  {/* Grocery packet 1: Atta / flour pack dipping into box */}
                  <div className="g1-pack-item-1 w-5 h-6 bg-red-600 rounded-xs shadow-xs border border-white flex items-center justify-center text-[7px] text-white font-black">
                    A
                  </div>
                  {/* Grocery packet 2: Spice / Masala pouch dipping into box */}
                  <div className="g1-pack-item-2 w-4 h-5 bg-amber-500 rounded-xs shadow-xs border border-white flex items-center justify-center text-[6px] text-white font-black">
                    G1
                  </div>
                </div>
              )}

              {isStep2Active && (
                <div className="absolute -top-3 left-[48%] -translate-x-1/2 bg-[#1E6B2E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Package className="w-2.5 h-2.5" />
                  <span>{journey.stage === 'reviewing' ? 'Reviewing' : 'Packing Fresh'}</span>
                </div>
              )}
            </div>

            {/* OVERLAY SCENE 3: Delivery Rider (Scooter along Route) */}
            <div
              className={`absolute top-[28%] left-[58%] w-[22%] transition-opacity duration-300 ${
                isStep3Active ? 'opacity-100' : 'opacity-85'
              }`}
            >
              {isStep3Active && (
                <>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1E6B2E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                    <Bike className="w-2.5 h-2.5" />
                    <span>On Route</span>
                  </div>
                  {/* Animated speed / motion lines behind scooter */}
                  <div className="absolute top-1/2 -left-3 flex flex-col gap-1 pointer-events-none opacity-80">
                    <span className="w-3 h-0.5 bg-emerald-600 rounded-full animate-pulse" />
                    <span className="w-2 h-0.5 bg-emerald-500 rounded-full" />
                  </div>
                </>
              )}
            </div>

            {/* OVERLAY SCENE 4: Doorstep Delivery Handover */}
            <div
              className={`absolute top-[18%] right-[2%] w-[24%] transition-opacity duration-300 ${
                isStep4Active ? 'opacity-100' : 'opacity-85'
              }`}
            >
              {isStep4Active && (
                <div className="absolute -top-3 right-2 bg-[#1E6B2E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-bounce">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                  <span>Delivered!</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* High-quality SVG Fallback if image fails to load */
          <div className="w-full p-6 text-center bg-emerald-50/70 space-y-2">
            <Package className="w-10 h-10 text-[#1E6B2E] mx-auto animate-pulse" />
            <p className="text-xs font-bold text-emerald-950">
              G1 Mart Fresh Grocery Journey
            </p>
          </div>
        )}
      </div>

      {/* 2. 4-STAGE HORIZONTAL TRACKING TIMELINE — Reference C */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs">
        <div className="flex items-center justify-between relative px-2">
          {/* Connector Line behind steps */}
          <div className="absolute top-[16px] left-[12%] right-[12%] h-[2px] bg-stone-200 -z-0">
            <div
              className="h-full bg-[#1E6B2E] transition-all duration-500"
              style={{
                width:
                  journey.stepNumber === 1
                    ? '10%'
                    : journey.stepNumber === 2
                    ? '40%'
                    : journey.stepNumber === 3
                    ? '75%'
                    : '100%',
              }}
            />
          </div>

          {/* Step 1: Order Placed */}
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isStep1Done || isStep1Active
                  ? 'bg-[#1E6B2E] text-white shadow-2xs ring-3 ring-emerald-100'
                  : 'bg-white border-2 border-stone-300 text-stone-400'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight ${
                isStep1Active || isStep1Done ? 'font-bold text-stone-900' : 'text-stone-400'
              }`}
            >
              Order Placed
            </span>
          </div>

          {/* Step 2: Packing Fresh Items */}
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isStep2Done
                  ? 'bg-[#1E6B2E] text-white shadow-2xs'
                  : isStep2Active
                  ? 'bg-[#1E6B2E] text-white shadow-xs ring-4 ring-emerald-100'
                  : 'bg-white border-2 border-stone-300 text-stone-400'
              }`}
            >
              {isStep2Done ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Package className="w-4 h-4" />
              )}
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight ${
                isStep2Active ? 'font-bold text-[#1E6B2E]' : isStep2Done ? 'font-bold text-stone-900' : 'text-stone-400'
              }`}
            >
              Packing Fresh Items
            </span>
          </div>

          {/* Step 3: Out for Delivery */}
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isStep3Done
                  ? 'bg-[#1E6B2E] text-white shadow-2xs'
                  : isStep3Active
                  ? 'bg-[#1E6B2E] text-white shadow-xs ring-4 ring-emerald-100 animate-pulse'
                  : 'bg-white border-2 border-stone-300 text-stone-400'
              }`}
            >
              {isStep3Done ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Bike className="w-4 h-4" />
              )}
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight ${
                isStep3Active ? 'font-bold text-[#1E6B2E]' : isStep3Done ? 'font-bold text-stone-900' : 'text-stone-400'
              }`}
            >
              Out for Delivery
            </span>
          </div>

          {/* Step 4: Delivered at Doorstep */}
          <div className="flex flex-col items-center relative z-10 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isStep4Active
                  ? 'bg-[#1E6B2E] text-white shadow-xs ring-4 ring-emerald-100'
                  : 'bg-white border-2 border-stone-300 text-stone-400'
              }`}
            >
              <Home className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight ${
                isStep4Active ? 'font-bold text-[#1E6B2E]' : 'text-stone-400'
              }`}
            >
              {isPickup ? 'Ready for Pickup' : 'Delivered at Doorstep'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE STAGE HIGHLIGHT CARD — Reference C Pale Mint Surface */}
      <div className="bg-[#f2faf4] border border-emerald-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1E6B2E] flex items-center justify-center shrink-0 mt-0.5">
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
            <span className="bg-white text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              Step {journey.stepNumber} of 4
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed mt-0.5">
            {journey.description}
          </p>
        </div>
      </div>

      {/* CSS Keyframes for Subtle Micro-Animations */}
      <style jsx>{`
        @keyframes packDrop {
          0% {
            transform: translateY(-8px) scale(0.9);
            opacity: 0;
          }
          40% {
            transform: translateY(2px) scale(1);
            opacity: 1;
          }
          70% {
            transform: translateY(6px) scale(0.95);
            opacity: 0.9;
          }
          100% {
            transform: translateY(12px) scale(0.85);
            opacity: 0;
          }
        }

        @keyframes dashMove {
          to {
            stroke-dashoffset: -24;
          }
        }

        .g1-dash-anim {
          animation: dashMove 1.8s linear infinite;
        }

        .g1-pack-item-1 {
          animation: packDrop 2s ease-in-out infinite;
        }

        .g1-pack-item-2 {
          animation: packDrop 2s ease-in-out 0.8s infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .g1-dash-anim,
          .g1-pack-item-1,
          .g1-pack-item-2 {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
