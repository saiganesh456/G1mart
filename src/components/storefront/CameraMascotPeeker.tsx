'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * CameraMascotPeeker
 * 
 * Compact 3D mascot peeking out from behind the search bar's camera button.
 * Scaled down to prevent any overlap with the Cart and Account icons in Row 1.
 * 
 * Animation Choreography:
 * 1. Hide: Tucked behind search bar rim on initial load.
 * 2. Sneak Peek: Eyes and backwards red cap emerge first, glancing around.
 * 3. Pop Up & Aim: Mascot springs up playfully, holds out the handwritten slip
 *    and tilts the phone camera to scan it.
 * 4. Scan & Flash: Green laser sweeps the receipt followed by a camera shutter flash.
 * 5. Educational micro-pill docked cleanly to the left in the empty Row 2 space.
 */
export default function CameraMascotPeeker() {
  const [hasEntered, setHasEntered] = useState(false);
  const [cycleStep, setCycleStep] = useState(1);
  const [cameraFlash, setCameraFlash] = useState(false);

  // Entrance sequence: start sneak-peek then full emerge
  useEffect(() => {
    const entranceTimer = setTimeout(() => {
      setHasEntered(true);
    }, 2400);
    return () => clearTimeout(entranceTimer);
  }, []);

  // Recurring 4.5s cycle for laser, shutter flash & education pill
  useEffect(() => {
    if (!hasEntered) return;

    const interval = setInterval(() => {
      setCycleStep((prev) => (prev % 3) + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [hasEntered]);

  // Trigger camera shutter flash on cycleStep 2
  useEffect(() => {
    if (cycleStep === 2) {
      setCameraFlash(true);
      const timer = setTimeout(() => setCameraFlash(false), 350);
      return () => clearTimeout(timer);
    }
  }, [cycleStep]);

  const handleOpenScanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('g1mart:open-slip-scan'));
  };

  return (
    <div
      aria-hidden="true"
      className="absolute right-1 bottom-[42px] pointer-events-none select-none z-20 overflow-visible"
      style={{ width: 46 }}
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
        aria-label="3D Mascot — Scan handwritten grocery slip"
      >
        {/* ============================================================== */}
        {/* 1. COMPACT MICRO-PILL CUE (Docked to the left in Row 2 space)  */}
        {/* Keeps Row 1 (Cart & Account) 100% free and unobstructed       */}
        {/* ============================================================== */}
        <div className="absolute right-[50px] top-2 pointer-events-none whitespace-nowrap z-20">
          {cycleStep === 1 && (
            <div className="bg-emerald-600/95 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-emerald-400/50 flex items-center gap-1 animate-pulse">
              <span>⚡ 15m Delivery</span>
            </div>
          )}
          {cycleStep === 2 && (
            <div className="bg-amber-500/95 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-amber-300/60 flex items-center gap-1 animate-bounce">
              <span>📸 Snap Slip</span>
            </div>
          )}
          {cycleStep === 3 && (
            <div className="bg-gray-900/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-emerald-400/50 flex items-center gap-1">
              <span className="text-emerald-400">⚡</span>
              <span>Auto-Pack!</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. 3D CARTOON CHARACTER (Peek from behind camera button)       */}
        {/* ============================================================== */}
        <div
          className={`relative ${
            hasEntered ? 'peeker-idle-bob' : 'peeker-curious-entrance'
          } flex items-end justify-center`}
        >
          {/* Ambient soft glow */}
          <div className="absolute inset-0 bg-emerald-400/15 blur-md rounded-full pointer-events-none" />

          {/* Masked character (emerging from behind search bar top border) */}
          <div
            className="relative w-[44px] aspect-[480/684] overflow-visible"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            }}
          >
            <Image
              src="/images/character_scanning.webp"
              alt="3D mascot peeking above camera button scanning slip"
              width={480}
              height={684}
              priority
              className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none transition-transform group-hover:scale-105"
            />

            {/* Camera Shutter Flash Lens Pulse */}
            {cameraFlash && (
              <div className="absolute top-[48%] left-[44%] w-6 h-6 rounded-full bg-white shadow-[0_0_18px_10px_rgba(255,255,255,0.95)] animate-ping pointer-events-none z-30" />
            )}

            {/* Green Laser Scan on Slip */}
            {cycleStep === 1 && (
              <div className="absolute left-[8%] w-[34%] h-[1.5px] bg-emerald-400 shadow-[0_0_6px_#10b981] rounded-full peeker-laser-sweep pointer-events-none z-30" />
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. TINY BOUNCING GREEN POINTER ARROW TO CAMERA BUTTON          */}
        {/* ============================================================== */}
        <div className="absolute -bottom-1.5 right-2.5 z-30 pointer-events-none animate-bounce">
          <svg className="w-3 h-3 text-emerald-600 drop-shadow-xs fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        /* Multi-step entrance:
           1. Hidden behind camera rim (0-15%)
           2. Peeks cap & eyes looking around (25-45%)
           3. Playfully springs up into view (60-75%)
           4. Aims phone at slip to scan (80-100%)
        */
        .peeker-curious-entrance {
          animation: peekerCurious 2.4s cubic-bezier(0.2, 0.8, 0.25, 1) forwards;
          transform-origin: bottom center;
        }

        @keyframes peekerCurious {
          0% {
            opacity: 0;
            transform: translateY(42px) scale(0.75);
          }
          15% {
            opacity: 1;
            transform: translateY(28px) scale(0.82);
          }
          30% {
            opacity: 1;
            transform: translateY(22px) rotate(-5deg) scale(0.88);
          }
          45% {
            opacity: 1;
            transform: translateY(20px) rotate(4deg) scale(0.9);
          }
          65% {
            opacity: 1;
            transform: translateY(-4px) rotate(-2deg) scale(1.05);
          }
          80% {
            opacity: 1;
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(-2px) rotate(-3deg) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) rotate(0deg) scale(1);
          }
        }

        /* Gentle breathing idle float after entrance completes */
        .peeker-idle-bob {
          animation: peekerBob 3.5s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes peekerBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2.5px);
          }
        }

        /* Laser sweep down receipt */
        .peeker-laser-sweep {
          animation: laserSweep 1s ease-in-out infinite alternate;
        }
        @keyframes laserSweep {
          0% {
            top: 50%;
            opacity: 0.3;
          }
          100% {
            top: 74%;
            opacity: 1;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .peeker-curious-entrance,
          .peeker-idle-bob,
          .peeker-laser-sweep {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
