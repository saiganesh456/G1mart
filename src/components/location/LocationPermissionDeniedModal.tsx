'use client';

import React, { useState } from 'react';
import { RefreshCw, ExternalLink, HelpCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onEnableDeviceLocation: () => Promise<void>;
  onSelectManually: () => void;
  onClose?: () => void;
}

/**
 * Centered Location Permission Denied Popup
 * Modelled on reference layout (location-popup.png) using G1 Mart green theme.
 */
export default function LocationPermissionDeniedModal({
  isOpen,
  onEnableDeviceLocation,
  onSelectManually,
  onClose,
}: Props) {
  const [retrying, setRetrying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleEnableClick = async () => {
    setRetrying(true);
    try {
      await onEnableDeviceLocation();
    } catch {
      setShowInstructions(true);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200/90 overflow-hidden text-center transform transition-all animate-in zoom-in-95 duration-200">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="p-6 pt-7 sm:p-7 sm:pt-8 flex flex-col items-center">
          {/* Crossed-out Location Pin Icon (matches location-popup.png) */}
          <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
            {/* Base pin SVG */}
            <svg
              className="w-16 h-16 text-stone-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {/* Red diagonal strike line */}
            <svg
              className="absolute inset-0 w-20 h-20 text-rose-500 pointer-events-none drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="4" y1="20" x2="20" y2="4" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug">
            Location permission not enabled
          </h2>

          {/* Descriptive text */}
          <p className="text-xs sm:text-[13px] text-stone-500 font-medium mt-2 leading-relaxed px-1">
            Please enable location permission for a better delivery experience
          </p>

          {/* Step-by-step browser unblock instructions (if already denied in settings) */}
          {showInstructions && (
            <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-left text-[11px] text-stone-600 space-y-1 animate-in fade-in">
              <p className="font-bold text-stone-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#1B5E20]" />
                <span>How to enable in your browser:</span>
              </p>
              <p>1. Tap the <strong>lock / tune icon</strong> in the address bar above.</p>
              <p>2. Set <strong>Permissions → Location</strong> to <strong>Allow</strong>.</p>
              <p>3. Refresh the page or tap &quot;Enable device location&quot; below.</p>
            </div>
          )}
        </div>

        {/* Buttons List matching reference layout */}
        <div className="border-t border-stone-100 divide-y divide-stone-100">
          {/* Primary Action in G1 Mart Green Theme */}
          <button
            type="button"
            onClick={handleEnableClick}
            disabled={retrying}
            className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-[#2E7D32] hover:bg-emerald-50 active:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {retrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#2E7D32]" />
                <span>Requesting permission...</span>
              </>
            ) : (
              <span>Enable device location</span>
            )}
          </button>

          {/* Secondary Action: Select location manually */}
          <button
            type="button"
            onClick={onSelectManually}
            className="w-full py-3.5 px-4 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer"
          >
            Select location manually
          </button>
        </div>
      </div>
    </div>
  );
}
