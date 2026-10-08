'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Star, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  isAppInstalled,
  isInstallDismissed,
  markInstallDismissed,
  executeInstallFlow,
} from '@/lib/installState';

export default function InstallAppPlacard() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (pathname === '/') {
      setVisible(false);
      return;
    }
    // Check if the app is already installed or previously dismissed
    if (isAppInstalled(user?.id) || isInstallDismissed()) {
      setVisible(false);
      return;
    }

    // Delay slight display for smooth UX when opening a new view
    const timer = setTimeout(() => {
      if (!isAppInstalled(user?.id) && !isInstallDismissed()) {
        setVisible(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await executeInstallFlow(user?.id, '/downloads/g1mart.apk');
      setInstalled(true);
      // Auto-hide and never show again
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    } catch (err) {
      console.error('Install flow failed:', err);
    } finally {
      setInstalling(false);
    }
  };

  const handleClose = () => {
    markInstallDismissed();
    setVisible(false);
  };

  if (pathname === '/' || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install G1 Mart App"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-8"
    >
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-200/90 shadow-[#2E7D32]/10 overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#2E7D32] to-teal-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Dismiss app install banner"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* App Icon */}
          <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200/80 p-1 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt="G1 Mart App Icon"
              width={52}
              height={52}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
                G1 Mart App
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#2E7D32] border border-emerald-200">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            </div>

            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
              10-minute grocery delivery &amp; app exclusive prices
            </p>

            {/* Badges / Rating */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-600 font-semibold">
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                4.8
              </span>
              <span className="text-stone-300">•</span>
              <span>12 MB</span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Fast APK
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3.5">
          <button
            onClick={handleInstall}
            disabled={installing || installed}
            type="button"
            className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              installed
                ? 'bg-emerald-600 text-white cursor-default'
                : installing
                ? 'bg-[#1b5e20] text-white opacity-90 cursor-wait'
                : 'bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-emerald-900/20'
            }`}
          >
            {installed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed Successfully!</span>
              </>
            ) : installing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Installing APK...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Install App (Direct APK)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
