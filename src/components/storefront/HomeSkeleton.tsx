'use client';

import React, { useState, useEffect } from 'react';

/**
 * Grey skeleton placeholder matching the Home Page layout exactly:
 * - Header (Row 1: Logo + profile/cart; Row 2: Delivery ETA pill; Row 3: Search bar)
 * - Hero Banner Carousel (2.2:1 aspect ratio, rounded 16px)
 * - Category Grid 1: 'Grocery & Kitchen' 8-tile grid (4 cols x 2 rows)
 * - Category Grid 2: 4-tile grid (4 cols x 1 row)
 * 
 * Features:
 * - Sized pixel-for-pixel to ensure ZERO Cumulative Layout Shift (CLS = 0)
 * - 6-second timeout fallback: shows "Taking longer than usual" with Retry
 * - Offline handling: shows clear offline message with Retry
 */
export default function HomeSkeleton() {
  const [tookLonger, setTookLonger] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      window.location.reload();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    const timer = setTimeout(() => {
      setTookLonger(true);
    }, 6000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={3} />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">No Internet Connection</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
          Please check your mobile data or Wi-Fi connection and try again.
        </p>
        <button
          type="button"
          onClick={() => {
            if (navigator.onLine) {
              window.location.reload();
            } else {
              alert('Still offline. Please connect to the internet first.');
            }
          }}
          className="px-6 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-xl shadow-xs hover:bg-[#155223] active:scale-95 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tookLonger) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-[#1E6B2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">Taking longer than usual</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
          Your connection might be slow. Tap retry to refresh the store.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-xl shadow-xs hover:bg-[#155223] active:scale-95 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="w-full bg-[var(--g1-bg)] pb-28 sm:pb-16 lg:pb-8 pt-0 space-y-4 sm:space-y-5 px-4 sm:px-0 animate-pulse select-none pointer-events-none"
    >
      {/* 1. Mobile Header Skeleton (lg:hidden) */}
      <div className="lg:hidden w-full pt-2 pb-1 space-y-2.5">
        {/* Row 1: Logo + avatar placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-28 bg-[#E8EAED] rounded-lg" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#E8EAED]" />
          </div>
        </div>

        {/* Row 2: Delivery address pill placeholder */}
        <div className="h-5 w-44 bg-[#E8EAED] rounded-md" />

        {/* Row 3: Search bar placeholder (52px, radius 14) */}
        <div className="h-[52px] w-full bg-[#F1F3F5] rounded-[14px] border border-[#E8EAED]" />
      </div>

      {/* 2. Hero Banner Carousel Skeleton (2.2:1 aspect ratio, rounded 16px) */}
      <div className="w-full aspect-[2.2/1] min-h-[140px] max-h-[220px] bg-[#E8EAED] rounded-2xl relative overflow-hidden" />

      {/* 3. Category Section 1: Grocery & Kitchen (8 tiles: 4x2 grid) */}
      <div className="pt-1 pb-2 space-y-3">
        {/* Section title placeholder */}
        <div className="h-5 w-36 bg-[#E8EAED] rounded-md" />

        {/* 4-column category grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {/* Tile box (1:1 square, radius 16) */}
              <div className="w-full aspect-square bg-[#F6F7F8] border border-[#E8EAED] rounded-2xl" />
              {/* Label placeholder */}
              <div className="mt-1.5 w-3/4 h-3 bg-[#E8EAED] rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Category Section 2: Snacks & Household (4 tiles: 4x1 grid) */}
      <div className="pt-2 pb-2 space-y-3">
        {/* Section title placeholder */}
        <div className="h-5 w-32 bg-[#E8EAED] rounded-md" />

        {/* 4-column category grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-[#F6F7F8] border border-[#E8EAED] rounded-2xl" />
              <div className="mt-1.5 w-3/4 h-3 bg-[#E8EAED] rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
