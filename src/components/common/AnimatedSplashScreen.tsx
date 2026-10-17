'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface AnimatedSplashScreenProps {
  /**
   * Force show for demonstration/preview purposes
   */
  forceShow?: boolean;
  /**
   * Callback when splash screen finishes its exit transition
   */
  onComplete?: () => void;
}

export default function AnimatedSplashScreen({
  forceShow = false,
  onComplete,
}: AnimatedSplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);

  useEffect(() => {
    // Only show once per session unless forceShow is true
    const hasShown = typeof window !== 'undefined' ? sessionStorage.getItem('g1mart_splash_shown') : 'true';
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );

    // If never shown this session, or opened from installed APK/PWA standalone
    if (!hasShown || forceShow || isStandalone) {
      setVisible(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('g1mart_splash_shown', 'true');
      }

      // Step 1: Trigger shimmer sweep at 320ms
      const shimmerTimer = setTimeout(() => {
        setShimmerActive(true);
      }, 320);

      // Step 2: Begin exit dissolve at 1400ms
      const exitTimer = setTimeout(() => {
        setAnimatingOut(true);
      }, 1400);

      // Step 3: Unmount completely at 1850ms
      const unmountTimer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1850);

      return () => {
        clearTimeout(shimmerTimer);
        clearTimeout(exitTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [forceShow, onComplete]);

  // Support manual replay event for previews
  useEffect(() => {
    const handleReplay = () => {
      setAnimatingOut(false);
      setShimmerActive(false);
      setVisible(true);

      setTimeout(() => setShimmerActive(true), 320);
      setTimeout(() => setAnimatingOut(true), 1400);
      setTimeout(() => setVisible(false), 1850);
    };

    window.addEventListener('g1mart:replay-splash', handleReplay);
    return () => window.removeEventListener('g1mart:replay-splash', handleReplay);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 350);
  };

  return (
    <div
      onClick={handleDismiss}
      role="status"
      aria-label="Launching Jeevan Mart"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden cursor-pointer select-none transition-all duration-450 ease-out ${
        animatingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #185e2b 0%, #0d481c 55%, #06260e 100%)',
      }}
    >
      {/* Top ambient brand light accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 opacity-80" />

      {/* Decorative central radial emerald glow behind C Logo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full pointer-events-none blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(74,222,128,0.3) 0%, rgba(30,107,46,0.15) 60%, transparent 80%)',
        }}
      />

      {/* Header spacing */}
      <div className="w-full pt-12 sm:pt-16 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-emerald-200 bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
          <Sparkles className="w-3 h-3 text-emerald-300 animate-spin" style={{ animationDuration: '4s' }} />
          Jeevan Mart · Nellore
        </span>
      </div>

      {/* Center Hero: Official Stacked Emerald C-Logo with Spring Motion */}
      <div className="relative flex flex-col items-center justify-center px-6">
        <div className="relative flex flex-col items-center">
          {/* Main Logo Container with Entrance Spring */}
          <div
            className="relative w-[190px] sm:w-[230px] h-[190px] sm:h-[230px] transition-transform duration-700 ease-out"
            style={{
              animation: 'splashLogoSpring 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            }}
          >
            <Image
              src="/assets/images/g1_mart_logo_stacked_transparent.png"
              alt="Jeevan Mart Official App Logo"
              fill
              priority
              className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.4)]"
            />

            {/* Shimmer / Metallic Gleam Sweep across Golden 1 & Silver MART */}
            <div
              className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300 ${
                shimmerActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.95) 52%, transparent 65%)',
                  transform: shimmerActive ? 'translateX(160%)' : 'translateX(-160%)',
                  transition: 'transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>

          {/* Micro Tagline beneath Logo */}
          <div
            className="mt-3 text-center transition-all duration-500 delay-300"
            style={{
              animation: 'splashFadeUp 0.6s ease-out 0.35s both',
            }}
          >
            <p className="text-sm font-bold tracking-wide text-white drop-shadow-sm">
              Everyday Essentials at Your Doorstep
            </p>
            <p className="text-xs font-semibold text-emerald-300/90 mt-0.5">
              Supermarket Groceries · Express Delivery
            </p>
          </div>
        </div>
      </div>

      {/* Footer Area: Minimal Progress Indicator */}
      <div className="w-full pb-8 sm:pb-12 flex flex-col items-center gap-3">
        {/* Breathing 3-dot pulse */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-emerald-300 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>

        <span className="text-[11px] font-medium text-emerald-200/60 tracking-tight">
          Tap anywhere to enter
        </span>
      </div>

      {/* Keyframe Styles */}
      <style jsx>{`
        @keyframes splashLogoSpring {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(12px);
          }
          60% {
            opacity: 1;
            transform: scale(1.03) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes splashFadeUp {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
