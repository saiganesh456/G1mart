'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Package,
  Bike,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Gift,
  ChevronRight,
  BellRing,
} from 'lucide-react';
import { useNotification, AppNotification } from '@/context/NotificationContext';

export default function GlobalNotificationBanner() {
  const router = useRouter();
  const { activeNotification, dismissNotification, requestPushPermission } = useNotification();
  const [progress, setProgress] = useState(100);
  const [hasPromptedPush, setHasPromptedPush] = useState(false);

  useEffect(() => {
    if (!activeNotification) {
      setProgress(100);
      return;
    }

    // Reset progress
    setProgress(100);
    const duration = activeNotification.durationMs || 6500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeNotification]);

  // Request browser push permission on first notification interaction
  const handleInteraction = async () => {
    if (!hasPromptedPush) {
      setHasPromptedPush(true);
      await requestPushPermission();
    }
  };

  if (!activeNotification) return null;

  const notif = activeNotification;

  // Icon selector
  const renderIcon = () => {
    switch (notif.iconType) {
      case 'celebration':
        return <Gift className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'package':
      case 'box':
        return <Package className="w-5 h-5 text-indigo-400" />;
      case 'bike':
        return <Bike className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'sparkle':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'app':
        return <Smartphone className="w-5 h-5 text-teal-400" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <BellRing className="w-5 h-5 text-emerald-400" />;
    }
  };

  // Border glow accent
  const getAccentGradient = () => {
    if (notif.type === 'welcome') return 'from-amber-400 via-emerald-400 to-teal-400';
    if (notif.type === 'apk_download') return 'from-teal-400 via-emerald-500 to-cyan-400';
    if (notif.statusKey === 'Out for Delivery' || notif.statusKey === 'Rider Assigned')
      return 'from-purple-500 via-indigo-500 to-pink-500';
    if (notif.statusKey === 'Delivered') return 'from-emerald-400 via-teal-400 to-green-500';
    if (notif.statusKey === 'Packing' || notif.statusKey === 'Packed')
      return 'from-amber-500 via-orange-500 to-yellow-400';
    return 'from-emerald-500 to-[#2E7D32]';
  };

  const handleActionClick = () => {
    handleInteraction();
    dismissNotification(notif.id);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={handleInteraction}
      className="fixed top-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-[99999] pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-6"
    >
      <div className="relative bg-stone-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-800 shadow-emerald-950/40 overflow-hidden text-white">
        {/* Animated Top Glow Strip */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getAccentGradient()}`} />

        {/* Confetti sparkle overlay for celebratory notifications */}
        {(notif.type === 'welcome' || notif.type === 'apk_download' || notif.statusKey === 'Delivered') && (
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="flex items-start gap-3.5">
          {/* Badge & Icon Container */}
          <div className="w-11 h-11 rounded-2xl bg-stone-800/90 border border-stone-700/60 p-2 shrink-0 flex items-center justify-center shadow-inner relative">
            {renderIcon()}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                {notif.badge || 'G1 MART ALERT'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Just now</span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
              {notif.title}
            </h3>

            <p className="text-xs text-stone-300 font-medium leading-relaxed mt-1">
              {notif.body}
            </p>

            {/* Action Button */}
            {notif.actionLabel && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#2E7D32] hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-900/30 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>{notif.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => dismissNotification(notif.id)}
            aria-label="Dismiss notification"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-Dismiss Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800">
          <div
            className={`h-full bg-gradient-to-r ${getAccentGradient()} transition-all ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
