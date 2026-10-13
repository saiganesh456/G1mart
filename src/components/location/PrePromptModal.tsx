'use client';

import React from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onContinueToGps: () => void;
  onSelectManually: () => void;
  isMandatory?: boolean;
  onClose?: () => void;
}

/**
 * Blinkit-style clean & minimal delivery location prompt popup.
 * Positioned under the header location bar.
 * No close / removal (X) button, completely preventing accidental closing before location is selected.
 */
export default function PrePromptModal({
  isOpen,
  onContinueToGps,
  onSelectManually,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150 flex items-start justify-center lg:justify-start p-3 sm:p-4 pointer-events-auto">
      {/* 
        Card container:
        - Mobile: Anchored near the top under the mobile header (top-24 / top-28), centered horizontally
        - Desktop (lg+): Anchored directly under the header location area (top-[72px], left-20 / left-28)
      */}
      <div className="w-full max-w-md sm:max-w-[480px] bg-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.22)] border border-stone-200 p-4 sm:p-5 text-left transform transition-all animate-in zoom-in-95 duration-150 mt-24 sm:mt-24 lg:mt-16 lg:ml-20 xl:ml-32">
        {/* Header row: Clean "Welcome to g1mart" - NO close / removal X symbol */}
        <div className="flex items-center justify-between mb-3 sm:mb-3.5">
          <p className="text-xs sm:text-[13px] font-semibold text-stone-600 tracking-tight">
            Welcome to <span className="font-extrabold text-[#1B5E20]">g1mart</span>
          </p>
        </div>

        {/* Body row: Location Pin outline + Prompt text */}
        <div className="flex items-start gap-2.5 sm:gap-3 mb-4 sm:mb-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
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
            className="bg-[#1B5E20] hover:bg-[#154a19] active:bg-[#0e3512] text-white text-xs sm:text-[13px] font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Detect my location</span>
          </button>

          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-stone-200 text-stone-400 text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 select-none">
            OR
          </div>

          <button
            type="button"
            onClick={onSelectManually}
            className="flex-1 min-w-0 bg-stone-50 hover:bg-stone-100 border border-stone-300 hover:border-stone-400 text-stone-500 hover:text-stone-800 text-xs sm:text-[13px] font-medium px-3 sm:px-3.5 py-2.5 rounded-xl text-left truncate transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">search delivery location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
