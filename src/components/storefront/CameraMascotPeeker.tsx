'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * CameraMascotPeeker
 * 
 * 3D Mascot positioned directly above the camera button in the search bar,
 * faithfully replicating the user's reference photo (media_1792111887353.jpg).
 * 
 * True Hide-and-Peek Choreography (8-second continuous loop):
 * - Phase 1 (0.0s - 1.0s): Tucked completely behind the search bar (hidden by z-20 input).
 * - Phase 2 (1.0s - 2.0s): Sneak peek! Only red cap and eyes emerge, glancing around.
 * - Phase 3 (2.0s - 2.8s): Full rise! Pops up to rest elbows and chest flush on search bar rim.
 * - Phase 4 (2.8s - 3.8s): Aims phone at slip, green laser sweeps receipt, camera shutter flash pulses (📸).
 * - Phase 5 (3.8s - 6.8s): Resting on search bar with gentle bob, acoustic pulse lines ((( by cap, pointer arrow 👇.
 * - Phase 6 (6.8s - 8.0s): Playfully ducks back down behind the search bar, then repeats.
 */
export default function CameraMascotPeeker() {
  const [phase, setPhase] = useState<'hidden' | 'peek' | 'rise' | 'scan' | 'rest' | 'duck'>('hidden');
  const [shutterFlash, setShutterFlash] = useState(false);

  // Synchronized 8-second cycle with React state for laser, flash, and soundwaves
  useEffect(() => {
    let tPeek: NodeJS.Timeout;
    let tRise: NodeJS.Timeout;
    let tScan: NodeJS.Timeout;
    let tFlash: NodeJS.Timeout;
    let tFlashEnd: NodeJS.Timeout;
    let tRest: NodeJS.Timeout;
    let tDuck: NodeJS.Timeout;
    let tLoop: NodeJS.Timeout;

    const runCycle = () => {
      // 0.0s: Hidden behind search bar
      setPhase('hidden');

      // 1.0s: Sneak peek cap & eyes
      tPeek = setTimeout(() => setPhase('peek'), 1000);

      // 2.0s: Rise up and rest elbows on rim
      tRise = setTimeout(() => setPhase('rise'), 2000);

      // 2.8s: Aim phone & start laser scan
      tScan = setTimeout(() => setPhase('scan'), 2800);

      // 3.3s: Shutter flash pulse
      tFlash = setTimeout(() => setShutterFlash(true), 3300);
      tFlashEnd = setTimeout(() => setShutterFlash(false), 3700);

      // 3.8s: Resting pose with sparkle waves
      tRest = setTimeout(() => setPhase('rest'), 3800);

      // 6.8s: Duck down behind search bar
      tDuck = setTimeout(() => setPhase('duck'), 6800);

      // 8.0s: Loop
      tLoop = setTimeout(() => runCycle(), 8000);
    };

    runCycle();

    return () => {
      clearTimeout(tPeek);
      clearTimeout(tRise);
      clearTimeout(tScan);
      clearTimeout(tFlash);
      clearTimeout(tFlashEnd);
      clearTimeout(tRest);
      clearTimeout(tDuck);
      clearTimeout(tLoop);
    };
  }, []);

  const handleOpenScanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('g1mart:open-slip-scan'));
  };

  return (
    <div
      aria-hidden="true"
      className="absolute right-2 bottom-[18px] pointer-events-none select-none z-10 overflow-visible"
      style={{ width: 56, height: 80 }}
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
        className="relative w-full h-full pointer-events-auto cursor-pointer group flex flex-col items-center justify-end focus:outline-none"
        title="Tap camera to scan handwritten grocery slip"
        aria-label="3D Mascot — Scan grocery slip"
      >
        {/* ============================================================== */}
        {/* GREEN ACOUSTIC / MOTION RIPPLE LINES ((( (as in reference photo) */}
        {/* ============================================================== */}
        {(phase === 'scan' || phase === 'rest') && (
          <div className="absolute top-1 left-[-10px] flex items-center pointer-events-none z-20">
            <svg
              className="w-4 h-6 text-emerald-500 drop-shadow-xs peeker-soundwave-anim"
              viewBox="0 0 24 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 12 C 3 15, 3 21, 6 24" />
              <path d="M11 8 C 7 13, 7 23, 11 28" />
              <path d="M16 4 C 11 11, 11 25, 16 32" />
            </svg>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3D CARTOON CHARACTER (Emerging from behind search bar top rim) */}
        {/* ============================================================== */}
        <div
          className={`relative w-[56px] aspect-[480/684] flex items-end justify-center peeker-cycle-motion phase-${phase}`}
        >
          {/* Ambient soft glow */}
          <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full pointer-events-none" />

          {/* Character Render (No gradient mask: lower body is physically behind search bar) */}
          <div className="relative w-full h-full overflow-visible">
            <Image
              src="/images/character_scanning.webp"
              alt="3D mascot peeking above camera button scanning slip"
              width={480}
              height={684}
              priority
              className="w-full h-auto object-contain drop-shadow-md select-none pointer-events-none transition-transform group-hover:scale-105"
            />

            {/* Camera Shutter Flash Lens Pulse */}
            {shutterFlash && (
              <div className="absolute top-[48%] left-[44%] w-7 h-7 rounded-full bg-white shadow-[0_0_22px_12px_rgba(255,255,255,0.98)] animate-ping pointer-events-none z-30" />
            )}

            {/* Green Laser Scan down receipt */}
            {phase === 'scan' && (
              <div className="absolute left-[8%] w-[34%] h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981] rounded-full peeker-laser-sweep pointer-events-none z-30" />
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TINY BOUNCING GREEN POINTER ARROW TO CAMERA BUTTON             */}
        {/* ============================================================== */}
        {(phase === 'scan' || phase === 'rest') && (
          <div className="absolute -bottom-2 right-4 z-30 pointer-events-none animate-bounce">
            <svg className="w-3.5 h-3.5 text-emerald-600 drop-shadow-xs fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Synchronized Cycle Styles */}
      <style jsx>{`
        /* Continuous 8-second motion mapping */
        .peeker-cycle-motion {
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.5s ease;
          transform-origin: bottom center;
        }

        /* Phase 1: Hidden completely behind search bar */
        .phase-hidden {
          transform: translateY(52px) scale(0.85);
          opacity: 0;
        }

        /* Phase 2: Sneak peek (cap and eyes only) */
        .phase-peek {
          transform: translateY(28px) rotate(-4deg) scale(0.92);
          opacity: 1;
        }

        /* Phase 3: Rises up and rests elbows on rim */
        .phase-rise {
          transform: translateY(0px) rotate(0deg) scale(1);
          opacity: 1;
        }

        /* Phase 4: Aims phone at slip to scan */
        .phase-scan {
          transform: translateY(-2px) rotate(-3deg) scale(1.02);
          opacity: 1;
        }

        /* Phase 5: Resting state with gentle breathing bob */
        .phase-rest {
          animation: gentleRestBob 2.5s ease-in-out infinite;
          opacity: 1;
        }

        /* Phase 6: Ducks back down */
        .phase-duck {
          transform: translateY(52px) scale(0.85);
          opacity: 0;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.6s ease;
        }

        @keyframes gentleRestBob {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-2px) rotate(1deg);
          }
        }

        /* Laser sweep down receipt */
        .peeker-laser-sweep {
          animation: laserSweep 0.9s ease-in-out infinite alternate;
        }
        @keyframes laserSweep {
          0% {
            top: 48%;
            opacity: 0.3;
          }
          100% {
            top: 74%;
            opacity: 1;
          }
        }

        /* Soundwave ripple */
        .peeker-soundwave-anim {
          animation: soundPulse 1.2s ease-in-out infinite;
        }
        @keyframes soundPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .peeker-cycle-motion,
          .peeker-laser-sweep,
          .peeker-soundwave-anim {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
