'use client';

import React from 'react';
import { MapPin, Navigation, Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onContinueToGps: () => void;
  onSelectManually: () => void;
  onClose?: () => void;
}

/**
 * Short friendly screen preceding the OS/browser location prompt.
 * Reassures customers why location is needed for quick-commerce delivery.
 */
export default function PrePromptModal({
  isOpen,
  onContinueToGps,
  onSelectManually,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200/90 overflow-hidden text-center transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-6 pt-7 sm:p-7 flex flex-col items-center">
          {/* Animated Delivery Pin */}
          <div className="w-16 h-16 rounded-full bg-emerald-100/80 text-[#1B5E20] flex items-center justify-center mb-4 relative shadow-inner">
            <MapPin className="w-8 h-8 text-[#1B5E20]" />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
            Check Doorstep Delivery
          </h2>

          <p className="text-xs sm:text-[13px] text-stone-500 font-medium mt-2 leading-relaxed px-2">
            G1 Mart delivers fresh groceries in <strong>15–30 mins</strong>. Please allow location access to verify delivery to your doorstep.
          </p>

          <div className="w-full mt-6 space-y-2.5">
            <button
              type="button"
              onClick={onContinueToGps}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>Allow Location Access</span>
            </button>

            <button
              type="button"
              onClick={onSelectManually}
              className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Select Location Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
