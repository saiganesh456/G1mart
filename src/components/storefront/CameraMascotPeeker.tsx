'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * CameraMascotPeeker
 * 
 * Living 3D mascot peeking directly above the search bar's camera button.
 * Scaled down so his face and hands are 100% clear with zero overlap.
 * 
 * Choreography:
 * 1. Peek: Hands on search bar rim, smiling at customer. (anim_look.webp)
 * 2. Wink: Playfully winks right eye 😉 at customer. (anim_wink.webp)
 * 3. Flip & Show: Shows handwritten slip and phone in both hands. (anim_hold.webp)
 * 4. Accurate Back-Camera Scan: Phone's back camera lenses aimed directly down at the
 *    handwritten slip (Rice, Milk, Oil, Sugar), green laser sweeps down receipt,
 *    camera lens shutter flashes. (anim_scan.webp)
 * 5. Camera Button Flash & Direct Arrow: Prominent downward arrow pointing straight
 *    into the search bar camera icon [📷] with camera snap flash effect. No text badge.
 * 6. Smooth Duck: Slides cleanly down behind search bar (strictly clipped, zero lower bleed).
 */
export default function CameraMascotPeeker() {
  const [phase, setPhase] = useState<'hidden' | 'look' | 'wink' | 'hold' | 'scan' | 'rest' | 'duck'>('hidden');
  const [cameraFlash, setCameraFlash] = useState(false);

  useEffect(() => {
    let tLook: NodeJS.Timeout;
    let tWink: NodeJS.Timeout;
    let tHold: NodeJS.Timeout;
    let tScan: NodeJS.Timeout;
    let tFlash: NodeJS.Timeout;
    let tFlashEnd: NodeJS.Timeout;
    let tRest: NodeJS.Timeout;
    let tRestFlash: NodeJS.Timeout;
    let tRestFlashEnd: NodeJS.Timeout;
    let tDuck: NodeJS.Timeout;
    let tLoop: NodeJS.Timeout;

    const runStory = () => {
      // 0.0s: Hidden behind rim
      setPhase('hidden');

      // 0.8s: Hands on search bar, looking at customer
      tLook = setTimeout(() => {
        setPhase('look');
      }, 800);

      // 2.2s: Winks at customer 😉
      tWink = setTimeout(() => setPhase('wink'), 2200);

      // 3.2s: Shows both hands with slip and phone
      tHold = setTimeout(() => {
        setPhase('hold');
      }, 3200);

      // 4.8s: Aims phone back camera at slip to scan
      tScan = setTimeout(() => {
        setPhase('scan');
      }, 4800);

      // 5.4s: Shutter flash on phone back camera
      tFlash = setTimeout(() => setCameraFlash(true), 5400);
      tFlashEnd = setTimeout(() => setCameraFlash(false), 5900);

      // 7.0s: Resting pose & arrow pointing directly to camera button
      tRest = setTimeout(() => {
        setPhase('rest');
      }, 7000);

      // 7.2s: Snap flash on the search bar camera button when arrow appears
      tRestFlash = setTimeout(() => setCameraFlash(true), 7200);
      tRestFlashEnd = setTimeout(() => setCameraFlash(false), 7700);

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
      clearTimeout(tRestFlash);
      clearTimeout(tRestFlashEnd);
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
      {/* 1. 3D MASCOT CONTAINER (Compact 64px width, head below Cart)   */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        className="absolute right-1 bottom-[48px] pointer-events-none select-none z-20 overflow-visible"
      >
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
          style={{ width: 72, height: 58 }}
        >


          {/* Green acoustic / motion ripple lines ((( */}
          {(phase === 'scan' || phase === 'rest') && (
            <div className="absolute top-0.5 left-[-4px] flex items-center pointer-events-none z-20">
              <svg
                className="w-3 h-4.5 text-emerald-500 drop-shadow-xs peeker-soundwave-anim"
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
              className={`relative w-[64px] flex items-end justify-center peeker-motion-actor actor-${phase}`}
            >
              {/* Ambient soft glow */}
              <div className="absolute inset-0 bg-emerald-400/15 blur-xs rounded-full pointer-events-none" />

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
                    className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
                  />
                </div>
              )}

              {/* POSE 4 & 5: Scanning with BACK CAMERA pointing at handwritten slip */}
              {(phase === 'scan' || phase === 'rest') && (
                <div className="relative w-[64px] aspect-[480/447] peeker-active-scan-motion">
                  <Image
                    src="/images/anim_scan.webp"
                    alt="3D mascot scanning grocery slip with phone back camera"
                    width={480}
                    height={447}
                    priority
                    className="w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
                  />

                  {/* Shutter Flash Pulse on Phone Camera Lens */}
                  {cameraFlash && (
                    <div className="absolute top-[52%] left-[53%] w-7 h-7 rounded-full bg-white shadow-[0_0_24px_14px_rgba(255,255,255,0.98)] animate-ping pointer-events-none z-30" />
                  )}

                  {/* Green Laser Scan line sweeping down the handwritten slip */}
                  {phase === 'scan' && (
                    <div className="absolute right-[8%] w-[32%] h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981] rounded-full peeker-laser-sweep pointer-events-none z-30" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ONLY ARROW MARK (NO TEXT) BOUNCING DIRECTLY ON TOP OF CAMERA*/}
      {/* Aligned directly over the camera button (right: 8px, width: 40px) */}
      {/* ============================================================== */}
      {(phase === 'scan' || phase === 'rest') && (
        <div
          aria-hidden="true"
          className="absolute right-2 top-0 pointer-events-none select-none z-40 -translate-y-[8px] w-10 flex flex-col items-center peeker-arrow-bounce"
        >
          {/* Downward pointer arrow pointing straight into the camera lens */}
          <svg className="w-5 h-5 text-emerald-600 drop-shadow-md fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SNAP FLASH ON THE SEARCH BAR CAMERA BUTTON                  */}
      {/* Triggers bright camera flash effect directly on camera button  */}
      {/* ============================================================== */}
      {(phase === 'scan' || phase === 'rest') && (
        <div
          aria-hidden="true"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 pointer-events-none z-35 flex items-center justify-center"
        >
          {/* White camera snap flash flare */}
          {cameraFlash && (
            <div className="absolute inset-0 rounded-xl bg-white shadow-[0_0_32px_18px_rgba(255,255,255,0.98)] animate-ping" />
          )}
          {/* Glowing emerald ring pulse around camera button */}
          <div className="absolute -inset-1 rounded-xl border-2 border-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse" />
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

        /* Scan: character aims back camera at slip */
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
            transform: rotate(-3deg) translateX(-1px) scale(1.02);
          }
          100% {
            transform: rotate(-1deg) scale(1);
          }
        }

        @keyframes gentleRestBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-1.5px);
          }
        }

        /* Laser sweep down the handwritten grocery list */
        .peeker-laser-sweep {
          animation: laserSweep 0.9s ease-in-out infinite alternate;
        }
        @keyframes laserSweep {
          0% {
            top: 55%;
            opacity: 0.3;
          }
          100% {
            top: 85%;
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
            transform: translateX(4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Camera Arrow Bounce Animation - kept down near the top of camera */
        .peeker-arrow-bounce {
          animation: arrowBounce 1s ease-in-out infinite;
        }
        @keyframes arrowBounce {
          0%, 100% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(-3px);
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
