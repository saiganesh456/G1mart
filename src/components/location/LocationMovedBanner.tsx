'use client';

import React from 'react';
import { Navigation, MapPin, Check, X } from 'lucide-react';
import type { DeliveryLocation } from '@/context/LocationContext';

interface Props {
  isOpen: boolean;
  savedLocation: DeliveryLocation;
  detectedLocation: DeliveryLocation;
  distanceMovedMeters: number;
  onConfirmNew: () => void;
  onKeepSaved: () => void;
}

export default function LocationMovedBanner({
  isOpen,
  savedLocation,
  detectedLocation,
  distanceMovedMeters,
  onConfirmNew,
  onKeepSaved,
}: Props) {
  if (!isOpen) return null;

  const distanceText =
    distanceMovedMeters >= 1000
      ? `${(distanceMovedMeters / 1000).toFixed(1)} km`
      : `${Math.round(distanceMovedMeters)} meters`;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-stone-200/90 space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-4 h-4 fill-[#1B5E20]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-900">
                You moved ~{distanceText}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                GPS Detected
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Would you like to deliver to your current location or keep your saved address?
            </p>
          </div>
        </div>

        {/* Comparison card */}
        <div className="bg-stone-50 rounded-2xl p-2.5 space-y-1.5 border border-stone-100 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="text-[10px] font-bold text-stone-400 uppercase w-12 shrink-0">Current:</span>
            <span className="font-bold text-stone-900 truncate">{detectedLocation.formattedAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <span className="text-[10px] font-bold text-stone-400 uppercase w-12 shrink-0">Saved:</span>
            <span className="font-medium text-stone-600 truncate">{savedLocation.formattedAddress}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onKeepSaved}
            className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Keep Saved
          </button>
          <button
            type="button"
            onClick={onConfirmNew}
            className="py-2.5 px-3 rounded-xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-black text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Update Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
