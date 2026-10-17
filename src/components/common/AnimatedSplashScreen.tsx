'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AnimatedSplashScreen() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Strictly run once on client mount
    setMounted(true);

    // 1. Only show on root storefront landing ("/")
    if (pathname !== '/') {
      return;
    }

    // 2. Strict session check: NEVER show if already seen in this session
    try {
      const alreadyShown = sessionStorage.getItem('g1mart_splash_v2_shown');
      if (alreadyShown === 'true') {
        return;
      }
      // Immediately mark as shown so NO route change, search, or re-render can EVER replay it
      sessionStorage.setItem('g1mart_splash_v2_shown', 'true');
    } catch {
      return;
    }

    // 3. Show for exactly 900ms (minimal, snappy, clean)
    setVisible(true);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 650);

    const unmountTimer = setTimeout(() => {
      setVisible(false);
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [pathname]);

  if (!mounted || !visible) return null;

  return (
    <div
      onClick={() => setVisible(false)}
      role="status"
      aria-label="Jeevan Mart"
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-250 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Minimal Studio Logo with gentle spring entrance */}
      <div
        className="flex flex-col items-center gap-3"
        style={{
          animation: 'minimalLogoReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg shadow-emerald-950/15 border border-stone-100 flex items-center justify-center bg-[#0D481C]">
          <Image
            src="/icons/icon-512x512.png"
            alt="Jeevan Mart"
            width={112}
            height={112}
            priority
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center mt-1">
          <span className="text-xs font-black tracking-wider text-stone-800 uppercase">
            Jeevan Mart
          </span>
          <span className="block text-[10px] font-semibold text-emerald-700 tracking-tight">
            Fresh Groceries
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes minimalLogoReveal {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
