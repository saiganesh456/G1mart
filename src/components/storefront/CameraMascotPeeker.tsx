'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * CameraMascotPeeker
 * 
 * Living 3D mascot peeking directly above the search bar's camera button.
 * 
 * Storyboard & Choreography (8-second continuous loop):
 * - Act 1 (0.0s - 1.2s): Sneak up! Slowly peeks over the search bar rim, hands gripping the top edge. (anim_look.webp)
 * - Act 2 (1.2s - 2.2s): Playful Wink! Winks at the customer ("beat an eye on eye" 😉) while gripping the bar. (anim_wink.webp)
 * - Act 3 (2.2s - 3.2s): 3D Phone Flip & Catch! Spins phone into view and catches the handwritten slip. (anim_hold.webp)
 * - Act 4 (3.2s - 4.2s): Laser Scan & Shutter Flash! Green laser sweeps receipt items, phone flash fires (📸).
 * - Act 5 (4.2s - 6.8s): Resting Pose! Gentle idle breathing, green acoustic waves ((( pulse, bouncing arrow 👇.
 * - Act 6 (6.8s - 8.0s): Smooth Duck! Slides smoothly down behind the search bar (strictly clipped at rim: zero bleed below!).
 */
export default function CameraMascotPeeker() {
  const [phase, setPhase] = useState<'hidden' | 'look' | 'wink' | 'hold' | 'scan' | 'rest' | 'duck'>('hidden');
  const [shutterFlash, setShutterFlash] = useState(false);
  const [textStep, setTextStep] = useState(1);

  useEffect(() => {
    let tLook: NodeJS.Timeout;
    let tWink: NodeJS.Timeout;
    let tHold: NodeJS.Timeout;
    let tScan: NodeJS.Timeout;
    let tFlash: NodeJS.Timeout;
    let tFlashEnd: NodeJS.Timeout;
    let tRest: NodeJS.Timeout;
    let tDuck: NodeJS.Timeout;
    let tLoop: NodeJS.Timeout;

    const runStory = () => {
      // 0.0s: Hidden behind rim
      setPhase('hidden');

      // 0.8s: Hands on search bar, peeking at customer
      tLook = setTimeout(() => {
        setPhase('look');
        setTextStep(1);
      }, 800);

      // 1.8s: Winks at customer 😉
      tWink = setTimeout(() => setPhase('wink'), 1800);

      // 2.6s: Phone flip & slip catch
      tHold = setTimeout(() => {
        setPhase('hold');
        setTextStep(2);
      }, 2600);

      // 3.4s: Laser scan down slip
      tScan = setTimeout(() => setPhase('scan'), 3400);

      // 3.8s: Camera shutter flash
      tFlash = setTimeout(() => setShutterFlash(true), 3800);
      tFlashEnd = setTimeout(() => setShutterFlash(false), 4200);

      // 4.3s: Resting pose with pointer arrow & acoustic waves
      tRest = setTimeout(() => {
        setPhase('rest');
        setTextStep(3);
      }, 4300);

      // 6.8s: Smooth duck down behind rim
      tDuck = setTimeout(() => setPhase('duck'), 6800);

      // 8.0s: Loop
      tLoop = setTimeout(() => runStory(), 8000);
    };

    runStory();

    return () => {
      clearTimeout(tLook);
      clearTimeout(tWink);
      clearTimeout(tHold);
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

  const isHolding = phase === 'hold' || phase === 'scan' || phase === 'rest';

  return (
    <div
      aria-hidden="true"
      className="absolute right-0 bottom-[48px] pointer-events-none select-none z-20 overflow-visible"
      style={{
        // Strictly clip below the search bar top edge: ZERO bleed can ever show below!
        clipPath: 'polygon(-200% -200%, 200% -200%, 200% 100%, -200% 100%)',
      }}
    >
      {/* Clickable interactive container */}
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
        className="relative pointer-events-auto cursor-pointer group flex items-end justify-end focus:outline-none"
        title="Tap camera to scan handwritten grocery slip"
        aria-label="3D Mascot — Scan grocery slip for 15-min delivery"
        style={{ width: 88, height: 72 }}
      >
        {/* ============================================================== */}
        {/* ANIMATED SIDE TEXT (Positioned cleanly to the left in Row 2)   */}
        {/* ============================================================== */}
        {phase !== 'hidden' && phase !== 'duck' && (
          <div className="absolute right-[92px] bottom-3 pointer-events-none whitespace-nowrap z-30 peeker-fade-in">
            {textStep === 1 && (
              <div className="bg-emerald-600/95 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-400/50 flex items-center gap-1 animate-pulse">
                <span>👋 Hi! Have a list?</span>
              </div>
            )}
            {textStep === 2 && (
              <div className="bg-amber-500/95 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-amber-300/60 flex items-center gap-1 animate-bounce">
                <span>📸 Snap your slip!</span>
              </div>
            )}
            {textStep === 3 && (
              <div className="bg-gray-900/90 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-400/50 flex items-center gap-1">
                <span className="text-emerald-400">⚡</span>
                <span>15-min auto-pack!</span>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* GREEN ACOUSTIC / MOTION RIPPLE LINES (((                       */}
        {/* ============================================================== */}
        {(phase === 'scan' || phase === 'rest') && (
          <div className="absolute top-1 left-[-6px] flex items-center pointer-events-none z-20">
            <svg
              className="w-3.5 h-5 text-emerald-500 drop-shadow-xs peeker-soundwave-anim"
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
        {/* 3D CHARACTER ACTOR (Multi-pose state engine)                    */}
        {/* ============================================================== */}
        <div
          className={`relative w-[86px] flex items-end justify-center peeker-motion-actor actor-${phase}`}
        >
          {/* Ambient soft glow */}
          <div className="absolute inset-0 bg-emerald-400/15 blur-sm rounded-full pointer-events-none" />

          {/* POSE 1: Hands gripping the search bar, looking at customer */}
          {phase === 'look' && (
            <div className="relative w-full aspect-[480/368]">
              <Image
                src="/images/anim_look.webp"
                alt="3D mascot hands on search bar looking at customer"
                width={480}
                height={368}
                priority
                className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
              />
            </div>
          )}

          {/* POSE 2: Playful wink at customer 😉 */}
          {phase === 'wink' && (
            <div className="relative w-full aspect-[480/368]">
              <Image
                src="/images/anim_wink.webp"
                alt="3D mascot winking eye playfully"
                width={480}
                height={368}
                priority
                className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
              />
            </div>
          )}

          {/* POSE 3, 4, 5: Holding phone & slip high up, scanning */}
          {isHolding && (
            <div className="relative w-full aspect-[480/325] peeker-flip-in">
              <Image
                src="/images/anim_hold.webp"
                alt="3D mascot holding phone and handwritten slip"
                width={480}
                height={325}
                priority
                className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none transition-transform group-hover:scale-105"
              />

              {/* Camera Shutter Flash Lens Pulse */}
              {shutterFlash && (
                <div className="absolute top-[35%] right-[12%] w-6 h-6 rounded-full bg-white shadow-[0_0_20px_10px_rgba(255,255,255,0.98)] animate-ping pointer-events-none z-30" />
              )}

              {/* Green Laser Scan down receipt */}
              {phase === 'scan' && (
                <div className="absolute left-[8%] w-[38%] h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981] rounded-full peeker-laser-sweep pointer-events-none z-30" />
              )}
            </div>
          )}
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

      {/* Synchronized Styles & Keyframes */}
      <style jsx>{`
        .peeker-motion-actor {
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.4s ease;
          transform-origin: bottom center;
        }

        /* Hidden: pulled down below the search bar rim (clipped strictly) */
        .actor-hidden {
          transform: translateY(100%);
          opacity: 0;
        }

        /* Look: risen up, hands gripping search bar */
        .actor-look {
          transform: translateY(0px) rotate(0deg);
          opacity: 1;
        }

        /* Wink: subtle playful tilt while winking */
        .actor-wink {
          transform: translateY(-1px) rotate(-1.5deg);
          opacity: 1;
        }

        /* Hold: 3D phone flip & slip catch */
        .actor-hold {
          transform: translateY(0px) rotate(0deg);
          opacity: 1;
        }

        /* Scan: slightly leans forward to scan */
        .actor-scan {
          transform: translateY(-2px) rotate(-2deg);
          opacity: 1;
        }

        /* Rest: gentle breathing bob */
        .actor-rest {
          animation: gentleRestBob 2.5s ease-in-out infinite;
          opacity: 1;
        }

        /* Duck: slides smoothly down behind search bar */
        .actor-duck {
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.4s ease;
        }

        /* 3D Phone Flip Spin when drawing phone & slip */
        .peeker-flip-in {
          animation: phoneFlipIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes phoneFlipIn {
          0% {
            transform: scale(0.8) rotateY(180deg);
            opacity: 0.5;
          }
          100% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes gentleRestBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        /* Laser sweep down receipt */
        .peeker-laser-sweep {
          animation: laserSweep 0.8s ease-in-out infinite alternate;
        }
        @keyframes laserSweep {
          0% {
            top: 25%;
            opacity: 0.3;
          }
          100% {
            top: 70%;
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

        .peeker-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .peeker-motion-actor,
          .peeker-flip-in,
          .peeker-laser-sweep,
          .peeker-soundwave-anim,
          .peeker-fade-in {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
