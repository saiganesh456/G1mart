'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  Bike,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  ShoppingBag,
  ChevronRight,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useNotification, AppNotification } from '@/context/NotificationContext';

export default function GlobalNotificationBanner() {
  const router = useRouter();
  const {
    activeNotification,
    dismissNotification,
    showPermissionPrompt,
    dismissPermissionPrompt,
    requestPushPermission,
  } = useNotification();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeNotification) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = activeNotification.durationMs || 6000;
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

  const renderIcon = (notif: AppNotification) => {
    switch (notif.iconType) {
      case 'package':
      case 'box':
        return <Package className="w-5 h-5 text-[#2E7D32]" />;
      case 'bike':
        return <Bike className="w-5 h-5 text-[#2E7D32]" />;
      case 'app':
        return <Smartphone className="w-5 h-5 text-[#2E7D32]" />;
      case 'check':
        return <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />;
      case 'bag':
        return <ShoppingBag className="w-5 h-5 text-[#2E7D32]" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return (
          <Image
            src="/logo.png"
            alt="G1 Mart"
            width={24}
            height={24}
            className="w-5 h-5 object-contain rounded-md"
          />
        );
    }
  };

  const handleActionClick = (notif: AppNotification) => {
    dismissNotification(notif.id);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  return (
    <>
      {/* 1. Main In-App Floating Notification Banner (Clean White Premium) */}
      {activeNotification && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-[99999] pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-6"
        >
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-200/90 shadow-[#2E7D32]/10 overflow-hidden text-stone-900">
            {/* Top Accent Strip in G1 Mart Brand Green */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#2E7D32]" />

            <div className="flex items-start gap-3.5 pr-6">
              {/* Icon Container with soft emerald tint */}
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 p-2 shrink-0 flex items-center justify-center relative">
                {renderIcon(activeNotification)}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#2E7D32] rounded-full border-2 border-white" />
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    {activeNotification.badge || 'ORDER UPDATE'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Just now</span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight leading-snug">
                  {activeNotification.title}
                </h3>

                <p className="text-xs text-stone-600 font-medium leading-relaxed mt-1">
                  {activeNotification.body}
                </p>

                {/* Action Button */}
                {activeNotification.actionLabel && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleActionClick(activeNotification)}
                      className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{activeNotification.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => dismissNotification(activeNotification.id)}
                aria-label="Dismiss notification"
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-Dismiss Progress Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-100">
              <div
                className="h-full bg-[#2E7D32] transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Push Notification Permission Card (Prompted on APK Download or Initial Visit) */}
      {showPermissionPrompt && !activeNotification && (
        <div
          role="dialog"
          aria-label="Enable delivery notifications"
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6"
        >
          <div className="relative bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-200/90 shadow-[#2E7D32]/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#2E7D32]" />

            <button
              onClick={dismissPermissionPrompt}
              type="button"
              aria-label="Dismiss prompt"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-2 shrink-0 flex items-center justify-center shadow-xs">
                <Bell className="w-6 h-6 text-[#2E7D32]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                    Live Order Updates
                  </span>
                </div>

                <h4 className="text-sm font-black text-stone-900 leading-tight">
                  Enable Order Tracking Notifications
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Get real-time alerts when your order is confirmed, packed, and out for delivery even when the app is closed.
                </p>

                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestPushPermission}
                    className="flex-1 py-2 px-3.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xs shadow-xs transition-transform active:scale-95 text-center cursor-pointer"
                  >
                    Allow Notifications
                  </button>
                  <button
                    type="button"
                    onClick={dismissPermissionPrompt}
                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
