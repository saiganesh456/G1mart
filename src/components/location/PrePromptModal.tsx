'use client';

import React from 'react';
import { MapPin, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onContinueToGps: () => void;
  onSelectManually: () => void;
  onClose?: () => void;
}

/**
 * Blinkit-style clean & minimal delivery location prompt popup.
 * Positioned under the header location bar, with zero AI/sparkle icons.
 * Reference: Blinkit location prompt layout.
 */
export default function PrePromptModal({
  isOpen,
  onContinueToGps,
  onSelectManually,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px] animate-in fade-in duration-150 flex items-start justify-center lg:justify-start p-3 sm:p-4 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* 
        Card container:
        - Mobile: Anchored near the top under the mobile header (top-24 / top-28), centered horizontally
        - Desktop (lg+): Anchored directly under the header location area (top-[72px], left-20 / left-28)
      */}
      <div className="w-full max-w-md sm:max-w-[480px] bg-white rounded-xl sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-stone-200/90 p-4 sm:p-5 text-left transform transition-all animate-in zoom-in-95 duration-150 mt-24 sm:mt-24 lg:mt-16 lg:ml-20 xl:ml-32">
        {/* Header row: "Welcome to g1mart" + optional close */}
        <div className="flex items-center justify-between mb-3 sm:mb-3.5">
          <p className="text-xs sm:text-[13px] font-semibold text-stone-600 tracking-tight">
            Welcome to <span className="font-extrabold text-[#1B5E20]">g1mart</span>
          </p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-stone-400 hover:text-stone-600 p-0.5 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body row: Location Pin outline + Prompt text */}
        <div className="flex items-start gap-2.5 sm:gap-3 mb-4 sm:mb-5">
          <div className="text-stone-800 shrink-0 mt-0.5">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
          </div>
          <p className="text-stone-800 font-medium text-xs sm:text-[13.5px] leading-snug">
            Please provide your delivery location to see products at nearby store
          </p>
        </div>

        {/* Action row: [Detect my location]  OR  [search delivery location] */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onContinueToGps}
            className="bg-[#1B5E20] hover:bg-[#154a19] active:bg-[#0e3512] text-white text-xs sm:text-[13px] font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Detect my location
          </button>

          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-stone-200 text-stone-400 text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 select-none">
            OR
          </div>

          <button
            type="button"
            onClick={onSelectManually}
            className="flex-1 min-w-0 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-400 hover:text-stone-600 text-xs sm:text-[13px] font-normal px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg text-left truncate transition-colors cursor-pointer"
          >
            search delivery location
          </button>
        </div>
      </div>
    </div>
  );
}
