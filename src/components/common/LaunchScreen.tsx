'use client';

import React, { useEffect, useState, useRef } from 'react';

const SESSION_KEY = 'g1mart_launch_splash_seen';

/**
 * G1 Mart Professional Launch Experience
 * 
 * Sequence:
 * 1. Plain white (#FFFFFF) full screen. Centered exact logo (/logo.png), ~170px wide (max 55vw).
 *    Scales 0.94 -> 1 and fades in over 500ms, then holds ~800ms (1.3s mark).
 * 2. If home data is ready at 1.3s: Logo fades out over 250ms -> reveals home page directly (~1.55s total).
 *    If home data is NOT ready: Logo fades out (250ms), tagline fades in (350ms):
 *      Line 1 (16px, medium weight, #1E6B2E): "Your monthly grocery, in one tap"
 *      Line 2 (13px, grey): "Nellore's own supermarket"
 *    As soon as data is ready (or capped at 2.5s maximum total time), fades out to home page.
 * 3. Cold start only via sessionStorage.
 * 4. Respects prefers-reduced-motion (instant crossfade, no scaling).
 * 5. If loading exceeds 6s: "Taking longer than usual" with Retry button.
 * 6. Offline detection with clear retry prompt.
 * 7. Status bar theme colour set to white during launch and restored on completion.
 */
export default function LaunchScreen() {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState<'logo' | 'tagline' | 'timeout' | 'offline'>('logo');
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [taglineOpacity, setTaglineOpacity] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // References for state across async timers without re-triggering effects
  const isDataReadyRef = useRef(false);
  const exitTriggeredRef = useRef(false);
  const originalThemeColorRef = useRef<string | null>(null);
  const stageRef = useRef<'logo' | 'tagline' | 'timeout' | 'offline'>('logo');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check cold start: if already seen in this tab session, do not render
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }

    // Save existing theme color and force white status bar during launch
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      originalThemeColorRef.current = metaTheme.getAttribute('content');
      metaTheme.setAttribute('content', '#FFFFFF');
    }

    // Check reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    // Restore status bar theme color
    const restoreThemeColor = () => {
      const currentMeta = document.querySelector('meta[name="theme-color"]');
      if (currentMeta && originalThemeColorRef.current) {
        currentMeta.setAttribute('content', originalThemeColorRef.current);
      }
    };

    // Exit launch overlay smoothly
    const triggerExit = (duration = 250) => {
      if (exitTriggeredRef.current) return;
      exitTriggeredRef.current = true;

      // Mark session as seen so returning or navigating never sees launch screen again
      sessionStorage.setItem(SESSION_KEY, 'true');
      document.documentElement.classList.add('g1-splash-dismissed');

      setOverlayOpacity(0);
      restoreThemeColor();

      setTimeout(() => {
        setVisible(false);
      }, duration);
    };

    // Helper to evaluate if the home page data is ready
    const isPageReady = (): boolean => {
      // Check if simulation flag is set for tests
      if ((window as any).__forceDataNotReady) return false;
      return isDataReadyRef.current || document.readyState === 'complete';
    };

    // Monitor when the window completes loading
    const handleWindowLoad = () => {
      isDataReadyRef.current = true;
      if (stageRef.current === 'tagline' && !exitTriggeredRef.current) {
        triggerExit(250);
      }
    };

    if (document.readyState === 'complete') {
      isDataReadyRef.current = true;
    } else {
      window.addEventListener('load', handleWindowLoad, { once: true });
    }

    // Offline / Online listeners
    const handleOffline = () => {
      if (!exitTriggeredRef.current) {
        stageRef.current = 'offline';
        setStage('offline');
      }
    };

    const handleOnline = () => {
      if (stageRef.current === 'offline') {
        window.location.reload();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      stageRef.current = 'offline';
      setStage('offline');
      return;
    }

    // ── 6-Second Timeout: "Taking longer than usual" with Retry ──
    const timeoutTimer = setTimeout(() => {
      if (!exitTriggeredRef.current && !isPageReady()) {
        stageRef.current = 'timeout';
        setStage('timeout');
      }
    }, 6000);

    // ── STEP 1: Logo Phase (500ms enter + 800ms hold = 1300ms) ──
    const step1Timer = setTimeout(() => {
      if (exitTriggeredRef.current) return;

      if (isPageReady()) {
        // Data is ready! Skip tagline directly.
        setLogoOpacity(0);
        triggerExit(250);
      } else {
        // Data not ready yet -> Fade out logo (250ms) and show tagline (350ms)
        setLogoOpacity(0);

        setTimeout(() => {
          if (exitTriggeredRef.current) return;
          stageRef.current = 'tagline';
          setStage('tagline');
          setTaglineOpacity(1);

          // Poll for data readiness during tagline stage
          const checkInterval = setInterval(() => {
            if (isPageReady()) {
              clearInterval(checkInterval);
              triggerExit(250);
            }
          }, 100);

          // Hard cap: Maximum total launch time is 2.5s (2500ms)
          // 1550ms has elapsed, maximum remaining time is 950ms
          const maxCapTimer = setTimeout(() => {
            clearInterval(checkInterval);
            triggerExit(250);
          }, 950);
        }, 250);
      }
    }, 1300);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(timeoutTimer);
      window.removeEventListener('load', handleWindowLoad);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      restoreThemeColor();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="g1-launch-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading G1 Mart"
      className="fixed inset-0 z-[99999] bg-[#FFFFFF] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        opacity: overlayOpacity,
        transition: prefersReducedMotion ? 'opacity 150ms ease-out' : 'opacity 250ms ease-out',
        pointerEvents: stage === 'timeout' || stage === 'offline' ? 'auto' : 'none',
      }}
    >
      {/* ── STAGE 1: Centered Brand Logo (Exact /logo.png, max 55vw, ~170px) ── */}
      {stage === 'logo' && (
        <div
          className="flex items-center justify-center"
          style={{
            opacity: logoOpacity,
            transition: prefersReducedMotion ? 'opacity 150ms ease-out' : 'opacity 250ms ease-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="G1mart"
            className="g1-launch-logo"
            width={170}
            height={62}
            priority-hint="high"
          />
        </div>
      )}

      {/* ── STAGE 2: Clean Tagline on White (Shown ONLY if data not ready at 1.3s) ── */}
      {stage === 'tagline' && (
        <div
          id="g1-launch-tagline"
          className="flex flex-col items-center justify-center text-center px-6"
          style={{
            opacity: taglineOpacity,
            transition: prefersReducedMotion ? 'opacity 150ms ease-out' : 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Line 1: 16px, medium weight, dark brand green (#1E6B2E) */}
          <p
            className="text-[16px] font-medium leading-snug tracking-tight text-[#1E6B2E]"
            style={{ color: '#1E6B2E', fontWeight: 500, fontSize: 16 }}
          >
            Your monthly grocery, in one tap
          </p>

          {/* Line 2: 13px, grey (#5F6368) */}
          <p
            className="text-[13px] font-normal leading-normal text-[#5F6368] mt-1.5"
            style={{ color: '#5F6368', fontWeight: 400, fontSize: 13 }}
          >
            Nellore&apos;s own supermarket
          </p>
        </div>
      )}

      {/* ── STAGE 3: Timeout Fallback (> 6s loading) ── */}
      {stage === 'timeout' && (
        <div className="flex flex-col items-center justify-center text-center px-6 max-w-sm animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[#1E6B2E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            Taking longer than usual
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
            Your connection might be slow or unstable. Please tap retry to refresh.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-xl shadow-xs hover:bg-[#155223] active:scale-95 transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── STAGE 4: Offline Fallback ── */}
      {stage === 'offline' && (
        <div className="flex flex-col items-center justify-center text-center px-6 max-w-sm animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth={3} />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            No Internet Connection
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
            Please check your mobile data or Wi-Fi connection and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.onLine) {
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
      )}
    </div>
  );
}
