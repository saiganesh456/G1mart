'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * CameraMascotPeeker
 * 
 * Living 3D mascot peeking directly above the search bar's camera button.
 * 
 * Full Storyboard (10-second continuous cycle):
 * - Act 1 (0.8s - 2.2s): Sneak up! Hands grip search bar rim, looking at customer. (anim_look.webp)
 * - Act 2 (2.2s - 3.2s): Playful Wink! Winks right eye at customer while gripping bar. (anim_wink.webp)
 * - Act 3 (3.2s - 4.8s): 3D Phone Flip & Show! Shows slip in left hand and phone in right hand. (anim_hold.webp)
 * - Act 4 (4.8s - 7.2s): Active Manual Scan Motion! Character turns and scans the slip with his phone camera,
 *   green laser sweeps receipt, phone shutter flashes (📸), digital viewfinder brackets pulse. (anim_scan.webp)
 * - Act 5 (7.2s - 8.8s): Result & Camera Pointer! "⚡ 15-min auto-pack!" badge + glowing downward arrow
 *   DEAD-CENTERED directly over the camera button [📷].
 * - Act 6 (8.8s - 10.0s): Smooth Duck! Slides smoothly down behind search bar (strictly clipped: zero bleed!).
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

      // 0.8s: Hands on search bar, looking at customer
      tLook = setTimeout(() => {
        setPhase('look');
        setTextStep(1);
      }, 800);

      // 2.2s: Winks at customer 😉
      tWink = setTimeout(() => setPhase('wink'), 2200);

      // 3.2s: Shows both hands with slip and phone
      tHold = setTimeout(() => {
        setPhase('hold');
        setTextStep(2);
      }, 3200);

      // 4.8s: Actively aims phone camera at slip to scan
      tScan = setTimeout(() => {
        setPhase('scan');
        setTextStep(3);
      }, 4800);

      // 5.6s: Camera shutter flash
      tFlash = setTimeout(() => setShutterFlash(true), 5600);
      tFlashEnd = setTimeout(() => setShutterFlash(false), 6100);

      // 7.2s: Resting pose with pointer arrow & fast pack badge
      tRest = setTimeout(() => {
        setPhase('rest');
        setTextStep(4);
      }, 7200);

      // 8.8s: Smooth duck down behind rim
      tDuck = setTimeout(() => setPhase('duck'), 8800);

      // 10.0s: Loop
      tLoop = setTimeout(() => runStory(), 10000);
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

  return (
    <>
      {/* ============================================================== */}
      {/* 1. 3D MASCOT PEEKER CONTAINER (Confined above search bar rim)   */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        className="absolute right-0 bottom-[48px] pointer-events-none select-none z-20 overflow-visible"
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
          className="relative pointer-events-auto cursor-pointer group flex items-end justify-end focus:outline-none"
          title="Tap camera to scan handwritten grocery slip"
          aria-label="3D Mascot — Scan grocery slip for 15-min delivery"
          style={{ width: 88, height: 76 }}
        >
          {/* Animated side text pill in Row 2 */}
          {phase !== 'hidden' && phase !== 'duck' && (
            <div className="absolute right-[92px] bottom-3 pointer-events-none whitespace-nowrap z-30 peeker-fade-in">
              {textStep === 1 && (
                <div className="bg-emerald-600/95 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-400/50 flex items-center gap-1 animate-pulse">
                  <span>👋 Hi! Have a list?</span>
                </div>
              )}
              {textStep === 2 && (
                <div className="bg-amber-500/95 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-amber-300/60 flex items-center gap-1 animate-bounce">
                  <span>📝 Snap your slip!</span>
                </div>
              )}
              {textStep === 3 && (
                <div className="bg-emerald-600/95 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-400/50 flex items-center gap-1 animate-pulse">
                  <span>📸 Scanning slip...</span>
                </div>
              )}
              {textStep === 4 && (
                <div className="bg-gray-900/90 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-400/50 flex items-center gap-1">
                  <span className="text-emerald-400">⚡</span>
                  <span>15-min auto-pack!</span>
                </div>
              )}
            </div>
          )}

          {/* Green acoustic / motion ripple lines ((( */}
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

          {/* 3D Character Actor (Strictly clipped at rim to prevent lower bleed) */}
          <div
            className="relative w-full h-full flex items-end justify-center overflow-hidden"
            style={{
              clipPath: 'polygon(-200% -200%, 200% -200%, 200% 100%, -200% 100%)',
            }}
          >
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

              {/* POSE 3: Shows handwritten slip & phone in both hands */}
              {phase === 'hold' && (
                <div className="relative w-full aspect-[480/325] peeker-flip-in">
                  <Image
                    src="/images/anim_hold.webp"
                    alt="3D mascot holding phone and handwritten slip"
                    width={480}
                    height={325}
                    priority
                    className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              {/* POSE 4 & 5: Actively scanning slip with phone camera */}
              {(phase === 'scan' || phase === 'rest') && (
                <div className="relative w-[80px] aspect-[480/460] peeker-active-scan-motion">
                  <Image
                    src="/images/anim_scan.webp"
                    alt="3D mascot actively scanning handwritten slip with phone camera"
                    width={480}
                    height={460}
                    priority
                    className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
                  />

                  {/* Digital Viewfinder Targeting Brackets around slip */}
                  {phase === 'scan' && (
                    <div className="absolute left-[3%] bottom-[12%] w-[38%] h-[32%] border border-emerald-400/80 rounded-xs pointer-events-none animate-pulse">
                      <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  )}

                  {/* Camera Shutter Flash Lens Pulse on Phone */}
                  {shutterFlash && (
                    <div className="absolute top-[48%] left-[38%] w-8 h-8 rounded-full bg-white shadow-[0_0_28px_16px_rgba(255,255,255,0.98)] animate-ping pointer-events-none z-30" />
                  )}

                  {/* Green Laser Scan down receipt */}
                  {phase === 'scan' && (
                    <div className="absolute left-[5%] w-[34%] h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981] rounded-full peeker-laser-sweep pointer-events-none z-30" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CAMERA POINTER ARROW (DEAD-CENTERED DIRECTLY OVER CAMERA)   */}
      {/* Anchored at right: 8px, width: 40px (exact camera button span) */}
      {/* ============================================================== */}
      {(phase === 'scan' || phase === 'rest') && (
        <div
          aria-hidden="true"
          className="absolute right-2 top-0 pointer-events-none select-none z-40 -translate-y-[26px] w-10 flex flex-col items-center peeker-arrow-bounce"
        >
          {/* Snap Slip Badge */}
          <div className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-white flex items-center gap-0.5 whitespace-nowrap">
            <span>Snap Slip</span>
          </div>
          {/* Bouncing Pointer Arrow pointing down into camera button */}
          <svg className="w-4 h-4 text-emerald-600 -mt-1 drop-shadow-sm fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Synchronized Styles & Keyframes */}
      <style jsx>{`
        .peeker-motion-actor {
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.4s ease;
          transform-origin: bottom center;
        }

        /* Hidden: pulled down below the search bar rim */
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

        /* Hold: shows phone and slip in both hands */
        .actor-hold {
          transform: translateY(0px) rotate(0deg);
          opacity: 1;
        }

        /* Scan: character aims camera at slip */
        .actor-scan {
          transform: translateY(-1px) rotate(-1deg);
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

        /* 3D Phone Flip Spin when showing phone & slip */
        .peeker-flip-in {
          animation: phoneFlipIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes phoneFlipIn {
          0% {
            transform: scale(0.85) rotateY(180deg);
            opacity: 0.5;
          }
          100% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }

        /* Active scanning tilt motion: aims phone camera over slip */
        .peeker-active-scan-motion {
          animation: scanMotion 2.2s ease-in-out infinite alternate;
        }
        @keyframes scanMotion {
          0% {
            transform: rotate(-1deg) scale(0.98);
          }
          50% {
            transform: rotate(-4deg) translateX(-2px) scale(1.02);
          }
          100% {
            transform: rotate(-2deg) scale(1);
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
          animation: laserSweep 0.9s ease-in-out infinite alternate;
        }
        @keyframes laserSweep {
          0% {
            top: 60%;
            opacity: 0.3;
          }
          100% {
            top: 86%;
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

        /* Dedicated Camera Pointer Bounce Animation */
        .peeker-arrow-bounce {
          animation: arrowBounce 1s ease-in-out infinite;
        }
        @keyframes arrowBounce {
          0%, 100% {
            transform: translateY(-26px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .peeker-motion-actor,
          .peeker-flip-in,
          .peeker-active-scan-motion,
          .peeker-laser-sweep,
          .peeker-soundwave-anim,
          .peeker-fade-in,
          .peeker-arrow-bounce {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
