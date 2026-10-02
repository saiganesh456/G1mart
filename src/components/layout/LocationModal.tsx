'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Navigation,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useLocation, DeliveryLocation } from '@/context/LocationContext';
import { NELLORE_AREAS } from '@/services/deliveryZoneService';

export default function LocationModal() {
  const {
    currentLocation,
    isDetecting,
    detectError,
    isModalOpen,
    setIsModalOpen,
    detectLocation,
    setLocation,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/location/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, setIsModalOpen]);

  if (!isModalOpen) return null;

  const handleDetectClick = async () => {
    const detected = await detectLocation();
    if (detected) {
      setTimeout(() => setIsModalOpen(false), 400);
    }
  };

  const handleSelectArea = (areaString: string) => {
    // e.g. "Magunta Layout, Nellore - 524003"
    const parts = areaString.split(',').map((s) => s.trim());
    const area = parts[0];
    const pincodeMatch = areaString.match(/\b524\d{3}\b/);
    const pincode = pincodeMatch ? pincodeMatch[0] : '';

    const newLoc: DeliveryLocation = {
      formattedAddress: areaString,
      street: area,
      area,
      city: 'Nellore',
      pincode,
      state: 'Andhra Pradesh',
    };

    setLocation(newLoc);
    setIsModalOpen(false);
  };

  const handleSelectSuggestion = (s: any) => {
    const newLoc: DeliveryLocation = {
      formattedAddress: s.fullAddress || s.title,
      street: s.title,
      area: s.title,
      city: 'Nellore',
      pincode: '',
      lat: s.lat,
      lng: s.lng,
    };
    setLocation(newLoc);
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#212121]">Change Location</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Blinkit Style Controls (Detect my location OR Search) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Auto Detect Button */}
            <button
              type="button"
              onClick={handleDetectClick}
              disabled={isDetecting}
              className="h-11 px-4 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0 disabled:opacity-75"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-white" />
                  <span>Detect my location</span>
                </>
              )}
            </button>

            {/* OR Divider */}
            <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-bold uppercase sm:px-1">
              <span className="w-6 h-px bg-stone-200 sm:hidden" />
              <span>OR</span>
              <span className="w-6 h-px bg-stone-200 sm:hidden" />
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search delivery location"
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-stone-300 text-xs outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-all placeholder:text-stone-400"
              />
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Error Message if Denied */}
          {detectError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Location Detection Notice:</span> {detectError}
              </div>
            </div>
          )}

          {/* Search Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-1 border border-stone-200 rounded-2xl p-2 bg-stone-50/60">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 block mb-1">
                Matching Localities
              </span>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white flex items-start gap-2.5 transition-colors border border-transparent hover:border-stone-200"
                >
                  <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#212121] truncate">{s.title}</p>
                    <p className="text-[11px] text-stone-500 truncate">{s.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Current Active Location Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-[#212121]">
                    Currently Selected
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                </div>
                <p className="text-xs text-stone-700 font-semibold truncate mt-0.5">
                  {currentLocation.formattedAddress}
                </p>
                {currentLocation.zone && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold mt-1">
                    <Clock className="w-3 h-3 text-[#2E7D32]" />
                    <span>Estimated: {currentLocation.zone.estimatedDeliveryTimeText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick-Select Popular Areas in Service Zone */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block">
              Popular Delivery Hubs ({NELLORE_AREAS.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {NELLORE_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleSelectArea(area)}
                  className="text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#2E7D32] hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-between group transition-all"
                >
                  <span className="truncate">{area.split('-')[0].trim()}</span>
                  <span className="text-[10px] text-stone-400 group-hover:text-[#2E7D32] shrink-0 ml-1">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
          <span>G1 Mart Doorstep Delivery</span>
          <span className="text-[11px] text-emerald-800 font-bold">
            Live GPS Enabled
          </span>
        </div>
      </div>
    </div>
  );
}
