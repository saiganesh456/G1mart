'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * MascotPopUp
 * 
 * 3D character pop-up rising smoothly from the top of the banner on app open.
 * 
 * Key Visual Fixes:
 * 1. Ample vertical headroom so the red cap and face are 100% visible, NEVER touched by header text.
 * 2. Status text floats cleanly with high-contrast, frosted backdrop.
 * 3. After scan, grocery badges & "Order Placed" appear DOWN below his hands/receipt,
 *    never obscuring his face, hands, or phone.
 * 4. Smooth slow entrance animation rising up from the banner top edge on load.
 * 5. Bottom animated banner: "⚡ Upload your slip and save your time! →"
 */

const STEPS = [
  { id: 1, label: '⚡ Smart Slip Scanner' },
  { id: 2, label: '📸 Clicking slip photo...' },
  { id: 3, label: '⚡ Scanning items...' },
  { id: 4, label: '🎉 Order Placed in 1-Click!' },
  { id: 5, label: '⚡ Upload your slip and save your time!' },
];

export default function MascotPopUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cameraFlash, setCameraFlash] = useState(false);

  // Synchronized cycle across 5 animation stages
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev % 5) + 1);
    }, 1300);

    return () => clearInterval(stepInterval);
  }, []);

  // Trigger camera shutter flash on step 2
  useEffect(() => {
    if (currentStep === 2) {
      setCameraFlash(true);
      const timer = setTimeout(() => setCameraFlash(false), 450);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleOpenScanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('g1mart:open-slip-scan'));
  };

  return (
    <div className="w-full max-w-[360px] mx-auto select-none px-2 sm:px-0 flex flex-col items-center gap-1 mascot-slow-rise-entrance">
      {/* Interactive Click Anchor (Blended directly into screen, zero box look) */}
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
        className="w-full flex flex-col items-center cursor-pointer group focus:outline-none"
        title="Upload your slip and save your time!"
        aria-label="3D Mascot Pop-Up — Upload your slip and save your time"
      >
        {/* ============================================================== */}
        {/* 1. TOP HEADER: High-contrast, clean pill ABOVE the character  */}
        {/* Ample bottom margin so it NEVER covers or touches his red cap  */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 mb-2 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/70 shadow-sm transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-black tracking-tight text-gray-900">
              {STEPS[currentStep - 1].label}
            </span>
          </div>
          <span className="text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            AUTO-SCAN
          </span>
        </div>

        {/* ============================================================== */}
        {/* 2. CENTER ARENA: Full Height Character, Cap & Face 100% Clear  */}
        {/* Phone is aimed directly at receipt, flash & laser aligned      */}
        {/* ============================================================== */}
        <div className="relative w-full h-[185px] sm:h-[200px] flex items-end justify-center overflow-visible">
          {/* Ambient 3D green glow behind character */}
          <div className="absolute inset-x-8 bottom-0 h-24 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          {/* 3D Character Container (Rises slowly from top of the banner) */}
          <div className={`relative mascot-bob-anim ${currentStep === 1 ? 'mascot-pop-in' : ''} flex items-end justify-center`}>
            <div
              className="relative w-[130px] sm:w-[145px] aspect-[480/684] overflow-visible"
              style={{
                // Soft bottom gradient fade into screen
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              }}
            >
              <Image
                src="/images/character_scanning.webp"
                alt="3D Character photographing grocery list with smartphone camera"
                width={480}
                height={684}
                priority
                className="w-full h-auto object-contain drop-shadow-xl select-none pointer-events-none transition-transform group-hover:scale-105"
              />

              {/* Camera Shutter Flash Effect at Phone Camera (Step 2) */}
              {cameraFlash && (
                <div className="absolute top-[48%] left-[42%] w-12 h-12 rounded-full bg-white shadow-[0_0_35px_20px_rgba(255,255,255,0.98)] animate-ping pointer-events-none z-30" />
              )}

              {/* Green Laser Scanning Beam on the Grocery List (Step 3) */}
              {currentStep === 3 && (
                <div className="absolute left-[10%] w-[32%] h-[2.5px] bg-emerald-400 shadow-[0_0_10px_#10b981,0_0_20px_#34d399] rounded-full laser-beam-sweep-slip pointer-events-none z-30" />
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* Step 4: Flying Grocery Items & Order Placed Checkmark          */}
          {/* Brought DOWN below his hands & receipt so nothing is covered!  */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 z-30">
              {/* Flying Items Badges */}
              <div className="flex gap-1 animate-bounce">
                <span className="text-xs bg-white rounded-full p-1 shadow-md border border-amber-200">🌾</span>
                <span className="text-xs bg-white rounded-full p-1 shadow-md border border-amber-300">🛢️</span>
                <span className="text-xs bg-white rounded-full p-1 shadow-md border border-sky-200">🥛</span>
                <span className="text-xs bg-white rounded-full p-1 shadow-md border border-emerald-200">🥕</span>
              </div>
              {/* Order Placed Checkmark Pill */}
              <div className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-1 animate-pulse whitespace-nowrap">
                <span>✓ Order Placed in 1-Click!</span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM ROW: Animated Callout Banner                         */}
        {/* "⚡ Upload your slip and save your time! →"                    */}
        {/* ============================================================== */}
        <div className="w-full mt-1.5">
          <div
            className={`w-full py-2 px-3 rounded-xl transition-all duration-300 flex items-center justify-between shadow-xs ${
              currentStep === 5
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md animate-pulse scale-[1.02]'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-black tracking-tight">
              <span className={currentStep === 5 ? 'text-amber-300' : 'text-emerald-600'}>⚡</span>
              <span>Upload your slip and save your time!</span>
            </div>
            <div
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 transition-colors ${
                currentStep === 5
                  ? 'bg-white/25 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <span>Upload</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized CSS Animations */}
      <style jsx>{`
        /* Slow, smooth entrance on app open: character rises from top of the banner */
        .mascot-slow-rise-entrance {
          animation: popUpSlowRise 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes popUpSlowRise {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.92);
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        /* Smooth gentle bobbing for character */
        .mascot-bob-anim {
          animation: characterBob 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes characterBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .mascot-pop-in {
          animation: characterPop 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes characterPop {
          0% {
            transform: translateY(16px) scale(0.96);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
        }

        /* Laser sweep animation specifically down the paper slip */
        .laser-beam-sweep-slip {
          animation: laserSweepSlip 1.1s ease-in-out infinite alternate;
        }
        @keyframes laserSweepSlip {
          0% {
            top: 52%;
            opacity: 0.4;
          }
          100% {
            top: 72%;
            opacity: 1;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .mascot-slow-rise-entrance,
          .mascot-bob-anim,
          .mascot-pop-in,
          .laser-beam-sweep-slip {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
