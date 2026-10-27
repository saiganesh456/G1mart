'use client';

import React, { useEffect, useState } from 'react';

/**
 * G1mart Professional Launch Experience
 * 
 * Addresses all user feedback:
 *   1. Eliminates split-second previous logo/storefront flash with instant paint & CSS guard.
 *   2. Extends Phase 1 (Professional Green Layout) to 1.4s for a confident, premium brand feel.
 *   3. Replaces all emojis with dedicated vector SVGs:
 *      - Left: Authentic G1mart Supermarket Storefront (striped green awning & grocery window — NOT a hospital).
 *      - Center: Accelerator road track with animated motion lines.
 *      - Vehicle: Custom Green Electric Scooter + Delivery Partner facing FORWARD (RIGHT ➔) accelerating smoothly.
 *      - Right: Clean, cozy modern home doorstep with porch light.
 *   4. Headline: "Everything you need, delivered at your doorstep".
 *   5. Smooth dissolve exit into the storefront home page at 2.8s.
 */

const SESSION_KEY = 'g1mart_launch_splash_seen';

export default function AnimatedSplashScreen() {
  // Start with visible = true so there is ZERO delay or flash on initial HTML render
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<'brand' | 'journey'>('brand');
  const [scooterAccelerating, setScooterAccelerating] = useState(false);
  const [scooterArrived, setScooterArrived] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If already seen in this session, immediately dismiss without displaying
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }

    // Mark as shown for the rest of the tab session
    sessionStorage.setItem(SESSION_KEY, 'true');

    // Phase 1 (Solid Green Brand Screen): holds for 1400ms (extended as requested)
    const tPhase2 = setTimeout(() => {
      setPhase('journey');

      // Trigger scooter launch on accelerator road 80ms after white screen appears
      const tScooter = setTimeout(() => {
        setScooterAccelerating(true);
      }, 80);

      // Scooter arrives at doorstep around 2450ms
      const tArrived = setTimeout(() => {
        setScooterArrived(true);
      }, 1250);

      return () => {
        clearTimeout(tScooter);
        clearTimeout(tArrived);
      };
    }, 1400);

    // Phase 3: Smooth dissolve fade out at 2800ms
    const tFade = setTimeout(() => {
      setFadeOut(true);
    }, 2800);

    // Completely unmount overlay from DOM at 3150ms
    const tUnmount = setTimeout(() => {
      setVisible(false);
    }, 3150);

    return () => {
      clearTimeout(tPhase2);
      clearTimeout(tFade);
      clearTimeout(tUnmount);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="g1-splash-overlay"
      aria-hidden="true"
      className="fixed inset-0 z-[99999] pointer-events-none select-none flex items-center justify-center transition-opacity duration-350 ease-out"
      style={{
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <style>{`
        /* Smooth Breathing Brand Pulse */
        @keyframes brandGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        /* Accelerator Road Flow */
        @keyframes roadDashFlow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }

        /* Scooter Tire Spin */
        @keyframes tireSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Scooter Subtle Road Suspension */
        @keyframes scooterVibrate {
          0% { transform: translateY(0); }
          100% { transform: translateY(-2px); }
        }

        /* Headline Soft Float Up */
        @keyframes headlineFloatUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Doorstep Arrival Glow */
        @keyframes porchPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 10px rgba(30,107,46,0.3)); }
        }

        .anim-brand-pulse { animation: brandGlow 1.4s ease-in-out infinite; }
        .anim-road-flow { animation: roadDashFlow 0.35s linear infinite; }
        .anim-tire-spin { transform-origin: center; animation: tireSpin 0.3s linear infinite; }
        .anim-scooter-vibe { animation: scooterVibrate 0.18s ease-in-out infinite alternate; }
        .anim-headline { animation: headlineFloatUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .anim-porch-pulse { animation: porchPulse 0.4s ease-in-out 2; }
      `}</style>

      {/* ====================================================================
          PHASE 1: PROFESSIONAL GREEN BRAND LAYOUT (0.0s – 1.4s)
          ==================================================================== */}
      <div
        className={`absolute inset-0 bg-[#1E6B2E] flex flex-col items-center justify-between py-16 px-6 transition-opacity duration-300 ease-out ${
          phase === 'brand' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top spacer */}
        <div />

        {/* Centered Brand Mark & Tagline */}
        <div className="flex flex-col items-center text-center space-y-4 anim-brand-pulse">
          {/* Crisp G1mart Typography */}
          <div className="flex items-center justify-center gap-1.5 drop-shadow-sm">
            <span className="text-5xl sm:text-6xl font-black text-[#F5B800] tracking-tight">G1</span>
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">mart</span>
          </div>

          {/* Clean Sub-tagline */}
          <p className="text-base sm:text-lg font-extrabold text-white/95 tracking-wide">
            India&apos;s Last Minute App
          </p>
        </div>

        {/* Bottom Location Indicator */}
        <div className="text-center">
          <p className="text-xs font-black tracking-widest text-white/60 uppercase">
            Nellore Express Delivery
          </p>
        </div>
      </div>

      {/* ====================================================================
          PHASE 2: WHITE DOORSTEP JOURNEY WITH ACCELERATOR ROAD (1.4s – 2.8s)
          ==================================================================== */}
      <div
        className={`absolute inset-0 bg-white flex flex-col items-center justify-center px-4 sm:px-8 transition-opacity duration-300 ease-out ${
          phase === 'journey' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          
          {/* Micro-Journey Vector Canvas */}
          <div className="relative w-full max-w-[340px] h-28 flex items-center justify-between px-1">
            
            {/* ── 1. G1MART SUPERMARKET STORE (LEFT) ── */}
            {/* Custom SVG: Authentic Grocery Storefront (No emojis, no hospital cross) */}
            <div className="flex flex-col items-center z-10 shrink-0">
              <svg width="58" height="58" viewBox="0 0 64 64" className="drop-shadow-sm">
                {/* Store Main Wall */}
                <rect x="8" y="24" width="48" height="36" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
                
                {/* Store Top Parapet Banner (G1 Green) */}
                <rect x="6" y="10" width="52" height="15" rx="3" fill="#1E6B2E" />
                <text x="32" y="21" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="system-ui,sans-serif" letterSpacing="0.5">
                  G1 MART
                </text>
                <circle cx="10" cy="17.5" r="2" fill="#F5B800" />
                <circle cx="54" cy="17.5" r="2" fill="#F5B800" />

                {/* Striped Storefront Awning (Green & White) */}
                <g>
                  <polygon points="6,25 14,25 12,32 4,32" fill="#155223" />
                  <polygon points="14,25 22,25 20,32 12,32" fill="#FFFFFF" />
                  <polygon points="22,25 30,25 28,32 20,32" fill="#155223" />
                  <polygon points="30,25 38,25 36,32 28,32" fill="#FFFFFF" />
                  <polygon points="38,25 46,25 44,32 36,32" fill="#155223" />
                  <polygon points="46,25 54,25 52,32 44,32" fill="#FFFFFF" />
                  <polygon points="54,25 60,25 58,32 52,32" fill="#155223" />
                </g>

                {/* Store Front Entrance & Display Window */}
                <rect x="14" y="38" width="16" height="22" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                <circle cx="27" cy="49" r="1.5" fill="#1E6B2E" /> {/* Door handle */}

                {/* Grocery Showcase Window */}
                <rect x="34" y="38" width="18" height="14" rx="2" fill="#BAE6FD" stroke="#94A3B8" strokeWidth="1.5" />
                {/* Fresh produce shelf items inside window */}
                <circle cx="39" cy="46" r="3" fill="#EF4444" /> {/* Apple */}
                <circle cx="46" cy="46" r="3" fill="#22C55E" /> {/* Greens */}
              </svg>
              <span className="text-[10px] font-black text-[#1E6B2E] mt-1 tracking-tight">G1mart Store</span>
            </div>

            {/* ── 2. ACCELERATOR ROAD TRACK (CENTER) ── */}
            <div className="flex-1 mx-2 relative h-9 flex items-center">
              {/* Road Asphalt Surface */}
              <div className="w-full h-8 bg-slate-800 rounded-full overflow-hidden relative shadow-inner flex items-center">
                {/* Road Curbs (Top & Bottom edge borders) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700" />

                {/* Animated Yellow Dashes (Moving Accelerator Road) */}
                <svg className="w-full h-2" preserveAspectRatio="none" viewBox="0 0 200 8">
                  <line
                    x1="0"
                    y1="4"
                    x2="200"
                    y2="4"
                    stroke="#F5B800"
                    strokeWidth="3.5"
                    strokeDasharray="14 10"
                    className="anim-road-flow"
                  />
                </svg>
              </div>

              {/* ── 3. GREEN SCOOTER + RIDER TRAVELING FORWARD (FACING RIGHT ➔) ── */}
              <div
                className="absolute z-20 top-1/2 -translate-y-1/2"
                style={{
                  left: scooterAccelerating ? 'calc(100% - 44px)' : '-8px',
                  transition: 'left 1.15s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div className="relative anim-scooter-vibe">
                  {/* Custom Vector Scooter & Rider (Faces RIGHT ➔) */}
                  <svg width="60" height="46" viewBox="0 0 68 52" className="overflow-visible drop-shadow-md">
                    {/* Wind Streaks Behind Scooter */}
                    <g opacity={scooterAccelerating && !scooterArrived ? 0.8 : 0} className="transition-opacity duration-200">
                      <line x1="-12" y1="28" x2="-2" y2="28" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="-18" y1="36" x2="-4" y2="36" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
                      <line x1="-10" y1="42" x2="-2" y2="42" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Rear Wheel (Spinning) */}
                    <g transform="translate(16, 42)">
                      <circle cx="0" cy="0" r="8" fill="#1F2937" />
                      <circle cx="0" cy="0" r="5" fill="#94A3B8" />
                      <circle cx="0" cy="0" r="2" fill="#334155" />
                      <g className="anim-tire-spin">
                        <line x1="-4" y1="0" x2="4" y2="0" stroke="#475569" strokeWidth="1.5" />
                        <line x1="0" y1="-4" x2="0" y2="4" stroke="#475569" strokeWidth="1.5" />
                      </g>
                    </g>

                    {/* Front Wheel (Spinning) */}
                    <g transform="translate(54, 42)">
                      <circle cx="0" cy="0" r="8" fill="#1F2937" />
                      <circle cx="0" cy="0" r="5" fill="#94A3B8" />
                      <circle cx="0" cy="0" r="2" fill="#334155" />
                      <g className="anim-tire-spin">
                        <line x1="-4" y1="0" x2="4" y2="0" stroke="#475569" strokeWidth="1.5" />
                        <line x1="0" y1="-4" x2="0" y2="4" stroke="#475569" strokeWidth="1.5" />
                      </g>
                    </g>

                    {/* Green Scooter Chassis (Facing Right ➔) */}
                    <path
                      d="M 16 42 L 30 42 L 40 37 L 48 30 L 54 42"
                      fill="none"
                      stroke="#1E6B2E"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M 30 42 L 36 30 L 46 30" fill="none" stroke="#155223" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Handlebar Stem & Handle Facing Forward Right */}
                    <path d="M 48 30 L 45 18 L 42 18" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

                    {/* G1 Express Thermal Delivery Box Mounted on Rear Rack */}
                    <rect x="10" y="21" width="14" height="17" rx="2" fill="#155223" />
                    <rect x="12" y="23" width="10" height="6" rx="1" fill="#FFFFFF" />
                    <text x="17" y="28" fill="#1E6B2E" fontSize="5" fontWeight="900" textAnchor="middle" fontFamily="system-ui,sans-serif">G1</text>

                    {/* Headlight Beam (Glowing to the Right) */}
                    <polygon points="53,28 67,23 67,33 53,30" fill="rgba(254, 240, 138, 0.4)" />

                    {/* Delivery Partner Body / Uniform */}
                    <path d="M 32 32 L 38 22 L 44 24" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Arm Reaching Forward to Handlebar */}
                    <path d="M 38 22 L 46 20" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
                    {/* Helmet Head Facing Right */}
                    <circle cx="36" cy="14" r="7" fill="#1E6B2E" />
                    {/* Yellow Visor (Facing Right ➔) */}
                    <path d="M 38 13 L 43 14" stroke="#F5B800" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── 4. MODERN DOORSTEP / HOME (RIGHT) ── */}
            {/* Custom SVG: Clean, Cozy Home Porch */}
            <div className={`flex flex-col items-center z-10 shrink-0 ${scooterArrived ? 'anim-porch-pulse' : ''}`}>
              <svg width="58" height="58" viewBox="0 0 64 64" className="drop-shadow-sm">
                {/* Pitched Roof (Slate Blue) */}
                <polygon points="32,8 6,28 58,28" fill="#334155" />
                {/* Chimney */}
                <rect x="42" y="10" width="6" height="12" fill="#64748B" />

                {/* House Wall (Clean Cream White) */}
                <rect x="12" y="28" width="40" height="32" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />

                {/* Front Door (Warm Amber/Wood) */}
                <rect x="24" y="34" width="16" height="26" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="36" cy="48" r="1.5" fill="#78350F" /> {/* Brass doorknob */}

                {/* Porch Welcome Light (Lantern Glowing Warm Yellow) */}
                <circle cx="18" cy="38" r="3" fill="#FBBF24" />
                <circle cx="18" cy="38" r="5" fill="#FEF08A" opacity="0.4" />

                {/* Small Green Shrub / Plant Pot Beside Door */}
                <polygon points="46,58 52,58 50,50 48,50" fill="#B45309" />
                <circle cx="49" cy="47" r="4.5" fill="#22C55E" />
                <circle cx="48" cy="44" r="3.5" fill="#16A34A" />
              </svg>
              <span className="text-[10px] font-black text-slate-800 mt-1 tracking-tight">Doorstep</span>
            </div>
          </div>

          {/* Animated Headline Typography (Exact wording from user) */}
          <div className="text-center px-4 anim-headline">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug tracking-tight">
              Everything you need, delivered at your doorstep
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
