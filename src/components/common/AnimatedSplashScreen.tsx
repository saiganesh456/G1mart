'use client';

import React, { useEffect, useState } from 'react';

/**
 * G1mart Professional Launch Experience
 * 
 * Implements the approved 2-phase quick-commerce launch animation:
 *   - Phase 1 (0.0s – 1.0s) : Solid G1mart Brand Splash (Blinkit style) with centered logo & taglines.
 *   - Phase 2 (1.0s – 2.2s) : Clean White Screen Micro-Journey (Store 🏬 ── 🛵 ── 🏡 Doorstep)
 *                             with animated headline "Everything you need, delivered at your doorstep".
 *   - Phase 3 (2.2s – 2.5s) : Smooth crossfade dissolve into the Storefront home page.
 *
 * Lifecycle:
 *   - Plays once per session using sessionStorage ('g1mart_launch_splash_seen').
 *   - Never blocks or interrupts existing pages or order tracking.
 */

const SESSION_KEY = 'g1mart_launch_splash_seen';

export default function AnimatedSplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<'brand' | 'journey'>('brand');
  const [scooterMoved, setScooterMoved] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if splash has already been shown in this session
    const hasSeenSplash = sessionStorage.getItem(SESSION_KEY);
    if (hasSeenSplash) return;

    // Mark as shown for this session
    sessionStorage.setItem(SESSION_KEY, 'true');
    setMounted(true);

    // Transition from Phase 1 (Brand) -> Phase 2 (White Doorstep Journey) at 1000ms
    const tPhase2 = setTimeout(() => {
      setPhase('journey');

      // Trigger scooter drive across the track 50ms after entering Phase 2
      const tDrive = setTimeout(() => {
        setScooterMoved(true);
      }, 50);

      return () => clearTimeout(tDrive);
    }, 1000);

    // Trigger smooth fade out at 2200ms
    const tFade = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    // Completely unmount splash overlay at 2500ms
    const tUnmount = setTimeout(() => {
      setMounted(false);
    }, 2550);

    return () => {
      clearTimeout(tPhase2);
      clearTimeout(tFade);
      clearTimeout(tUnmount);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[99999] pointer-events-none select-none flex items-center justify-center transition-opacity duration-300 ease-out"
      style={{
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <style>{`
        @keyframes g1LogoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes g1TextFloatUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes g1DoorstepPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .anim-logo-pulse { animation: g1LogoPulse 1.2s ease-in-out infinite; }
        .anim-text-float { animation: g1TextFloatUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .anim-arrival-pulse { animation: g1DoorstepPulse 0.4s ease-in-out 2; }
      `}</style>

      {/* =========================================================
          PHASE 1: SOLID BRAND SPLASH (0.0s – 1.0s)
          ========================================================= */}
      <div
        className={`absolute inset-0 bg-[#1E6B2E] flex flex-col items-center justify-between py-16 px-6 transition-opacity duration-300 ease-out ${
          phase === 'brand' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top spacer */}
        <div />

        {/* Centered Brand Mark & Taglines */}
        <div className="flex flex-col items-center text-center space-y-3.5 anim-logo-pulse">
          {/* Logo Typography */}
          <div className="flex items-center justify-center gap-1.5 drop-shadow-sm">
            <span className="text-4xl sm:text-5xl font-black text-[#F5B800] tracking-tight">G1</span>
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">mart</span>
          </div>

          {/* Primary Tagline */}
          <p className="text-base sm:text-lg font-extrabold text-white/95 tracking-wide">
            India&apos;s Last Minute App
          </p>
        </div>

        {/* Bottom Subtext */}
        <div className="text-center">
          <p className="text-[11px] font-black tracking-widest text-white/60 uppercase">
            Nellore Express Delivery
          </p>
        </div>
      </div>

      {/* =========================================================
          PHASE 2: WHITE DOORSTEP MICRO-JOURNEY (1.0s – 2.2s)
          ========================================================= */}
      <div
        className={`absolute inset-0 bg-white flex flex-col items-center justify-center px-6 transition-opacity duration-300 ease-out ${
          phase === 'journey' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-sm flex flex-col items-center space-y-8">
          
          {/* Micro-Journey Vector Track (Store 🏬 ── 🛵 ── 🏡 Doorstep) */}
          <div className="relative w-full max-w-[280px] h-20 flex items-center">
            
            {/* Store Icon (Left) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs flex items-center justify-center text-2xl">
                🏬
              </div>
              <span className="text-[10px] font-bold text-[#1E6B2E] mt-1 tracking-tight">G1mart</span>
            </div>

            {/* Connecting Track Road */}
            <svg
              className="w-full h-8 overflow-visible"
              viewBox="0 0 240 32"
              preserveAspectRatio="none"
            >
              {/* Background Inactive Track */}
              <line
                x1="48"
                y1="16"
                x2="192"
                y2="16"
                stroke="#E2E8F0"
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
              {/* Completed Track Progress Line */}
              <line
                x1="48"
                y1="16"
                x2="192"
                y2="16"
                stroke="#1E6B2E"
                strokeWidth="3"
                strokeDasharray="144"
                style={{
                  strokeDashoffset: scooterMoved ? 0 : 144,
                  transition: 'stroke-dashoffset 1.1s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              />
            </svg>

            {/* Micro Delivery Scooter */}
            <div
              className="absolute top-1/2 -translate-y-1/2 z-20 text-3xl"
              style={{
                left: scooterMoved ? 'calc(100% - 70px)' : '48px',
                transition: 'left 1.1s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <div className="relative">
                🛵
                {/* Wind motion trail */}
                <div
                  className={`absolute -left-3 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${
                    scooterMoved ? 'opacity-80' : 'opacity-0'
                  }`}
                >
                  <span className="text-xs text-emerald-400 font-bold">💨</span>
                </div>
              </div>
            </div>

            {/* Doorstep Icon (Right) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div
                className={`w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs flex items-center justify-center text-2xl transition-all duration-300 ${
                  scooterMoved ? 'ring-4 ring-emerald-200 anim-arrival-pulse' : ''
                }`}
              >
                🏡
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 tracking-tight">Doorstep</span>
            </div>
          </div>

          {/* Animated Headline Typography (Exact wording from Blinkit reference) */}
          <div className="text-center px-4 anim-text-float">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
              Everything you need, delivered at your doorstep
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
