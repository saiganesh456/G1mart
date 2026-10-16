'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * CameraMascotPeeker
 * 
 * 3D Mascot peeking out from behind the search bar's camera scan button,
 * exactly matching the user's reference photo.
 * 
 * Animation & Customer Education Flow:
 * 1. Hide & Rise: Mascot starts tucked behind the camera button and rises up on app open.
 * 2. Snap Photo: Phone camera flashes (📸) and green laser sweeps down the handwritten slip.
 * 3. Fast Delivery Cue: Speed pill flashes "⚡ 15-Min Delivery" + flying grocery items
 *    zipping into the cart, proving that slip scanning is the fastest way to get groceries packed!
 * 4. Bouncing Pointer: Animated green cue pointing directly down at the Camera button.
 */
export default function CameraMascotPeeker() {
  const [step, setStep] = useState(1);
  const [cameraFlash, setCameraFlash] = useState(false);

  // 6-second synchronized cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev % 4) + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Shutter flash on step 2
  useEffect(() => {
    if (step === 2) {
      setCameraFlash(true);
      const timer = setTimeout(() => setCameraFlash(false), 400);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleOpenScanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('g1mart:open-slip-scan'));
  };

  return (
    <div
      aria-hidden="true"
      className="absolute right-0 bottom-[44px] sm:bottom-[46px] pointer-events-none select-none z-20 overflow-visible peeker-entrance-rise"
      style={{ width: 105 }}
    >
      {/* Clickable interactive wrapper */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenScanner}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenScanner(e as unknown as React.MouseEvent);
          }
        }}
        className="relative pointer-events-auto cursor-pointer group flex flex-col items-center focus:outline-none"
        title="Tap camera to scan handwritten grocery slip"
        aria-label="3D Mascot — Scan your grocery slip for 15-min delivery"
      >
        {/* ============================================================== */}
        {/* 1. FAST PROCESS EDUCATION CUE (Floating pill above mascot)     */}
        {/* Teaches customer: Scan Slip -> 15-Min Delivery!                */}
        {/* ============================================================== */}
        <div className="absolute -top-6 right-0 z-30 transition-all duration-300">
          {step === 1 && (
            <div className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md border border-white/80 whitespace-nowrap flex items-center gap-1 animate-pulse">
              <span>⚡ 15-Min Delivery</span>
            </div>
          )}
          {step === 2 && (
            <div className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md border border-white/80 whitespace-nowrap flex items-center gap-1 animate-bounce">
              <span>📸 Snap Slip</span>
            </div>
          )}
          {step === 3 && (
            <div className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md border border-white/80 whitespace-nowrap flex items-center gap-1">
              <span>⚡ Auto-Pack!</span>
            </div>
          )}
          {step === 4 && (
            <div className="bg-gray-900/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md border border-emerald-400/60 whitespace-nowrap flex items-center gap-1">
              <span className="text-amber-300">👇</span>
              <span>Tap Camera</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. 3D CARTOON CHARACTER PEEKING FROM BEHIND THE CAMERA BUTTON  */}
        {/* ============================================================== */}
        <div className="relative peeker-bob-anim flex items-end justify-center">
          {/* Subtle Ambient green glow */}
          <div className="absolute inset-0 bg-emerald-400/20 blur-lg rounded-full pointer-events-none" />

          {/* Character Render (Masked at bottom to emerge cleanly from behind search bar) */}
          <div
            className="relative w-[92px] sm:w-[102px] aspect-[480/684] overflow-visible"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent 98%)',
              maskImage: 'linear-gradient(to bottom, black 78%, transparent 98%)',
            }}
          >
            <Image
              src="/images/character_scanning.webp"
              alt="3D mascot peeking above camera button photographing grocery slip"
              width={480}
              height={684}
              priority
              className="w-full h-auto object-contain drop-shadow-lg select-none pointer-events-none transition-transform group-hover:scale-105"
            />

            {/* Camera Shutter Flash (Step 2) */}
            {cameraFlash && (
              <div className="absolute top-[48%] left-[42%] w-10 h-10 rounded-full bg-white shadow-[0_0_28px_16px_rgba(255,255,255,0.98)] animate-ping pointer-events-none z-30" />
            )}

            {/* Green Laser Scan on Slip (Step 3) */}
            {step === 3 && (
              <div className="absolute left-[10%] w-[32%] h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981,0_0_16px_#34d399] rounded-full peeker-laser-sweep pointer-events-none z-30" />
            )}

            {/* Flying Mini Groceries Zipping to Cart (Step 3 & 4) */}
            {step >= 3 && (
              <div className="absolute -top-3 left-0 pointer-events-none flex gap-0.5 peeker-zip-cart z-30">
                <span className="text-[10px] bg-white rounded-full p-0.5 shadow-sm border border-amber-200">🌾</span>
                <span className="text-[10px] bg-white rounded-full p-0.5 shadow-sm border border-sky-200">🥛</span>
                <span className="text-[10px] bg-white rounded-full p-0.5 shadow-sm border border-emerald-200">🥕</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. SUBTLE GREEN POINTER ARROW TO CAMERA BUTTON                 */}
        {/* Guides customer eyes directly to the camera button below       */}
        {/* ============================================================== */}
        <div className="absolute -bottom-1 right-3 z-30 pointer-events-none animate-bounce">
          <svg className="w-3.5 h-3.5 text-emerald-600 drop-shadow-sm fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Synchronized Keyframes */}
      <style jsx>{`
        /* Slow entrance rise: rises from behind search bar on load */
        .peeker-entrance-rise {
          animation: peekerRise 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes peekerRise {
          0% {
            opacity: 0;
            transform: translateY(35px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        /* Gentle idle bobbing */
        .peeker-bob-anim {
          animation: peekerBob 3.5s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes peekerBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        /* Laser sweep down receipt */
        .peeker-laser-sweep {
          animation: laserSweep 1.1s ease-in-out infinite alternate;
        }
        @keyframes laserSweep {
          0% {
            top: 52%;
            opacity: 0.4;
          }
          100% {
            top: 72%;
            opacity: 1;
          }
        }

        /* Mini items zipping upward towards cart */
        .peeker-zip-cart {
          animation: zipCart 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        @keyframes zipCart {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.5);
          }
          40% {
            opacity: 1;
            transform: translate(6px, -12px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(14px, -24px) scale(0.3);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .peeker-entrance-rise,
          .peeker-bob-anim,
          .peeker-laser-sweep,
          .peeker-zip-cart {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
