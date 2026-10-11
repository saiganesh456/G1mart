'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  MapPin,
  Navigation,
  CheckCircle2,
  RefreshCw,
  Crosshair,
  Clock,
} from 'lucide-react';
import { useLocation, DeliveryLocation } from '@/context/LocationContext';
import { NELLORE_AREAS } from '@/services/deliveryZoneService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualLocationModal({ isOpen, onClose }: Props) {
  const { currentLocation, setLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Selected Pin Coordinates & Resolved Address
  const [pinLat, setPinLat] = useState<number>(() => currentLocation.lat || 14.4329);
  const [pinLng, setPinLng] = useState<number>(() => currentLocation.lng || 79.9680);
  const [resolvedAddress, setResolvedAddress] = useState<string>(() => currentLocation.formattedAddress || 'Padarupalli, Nellore');
  const [resolvedStreet, setResolvedStreet] = useState<string>(() => currentLocation.street || '');
  const [resolvedArea, setResolvedArea] = useState<string>(() => currentLocation.area || 'Padarupalli');
  const [resolvedCity, setResolvedCity] = useState<string>(() => currentLocation.city || 'Nellore');
  const [resolvedPincode, setResolvedPincode] = useState<string>(() => currentLocation.pincode || '524004');

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Sync with currentLocation when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentLocation.lat && currentLocation.lng) {
        setPinLat(currentLocation.lat);
        setPinLng(currentLocation.lng);
      }
      if (currentLocation.formattedAddress) {
        setResolvedAddress(currentLocation.formattedAddress);
      }
    }
  }, [isOpen, currentLocation]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    }
  }, [isOpen]);

  // Initialize or update Map
  useEffect(() => {
    if (!isOpen || !leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const lat = Number(pinLat || 14.4329);
    const lng = Number(pinLng || 79.9680);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom draggable customer pin
      const customPin = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div style="background-color: #2E7D32; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 3px solid white; cursor: grab;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customPin }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleUpdatePin(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        handleUpdatePin(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    } else {
      const map = mapInstanceRef.current;
      const marker = markerInstanceRef.current;
      if (marker) {
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
      }
    }
  }, [isOpen, leafletLoaded]);

  // Update pin and reverse-geocode
  const handleUpdatePin = async (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));
    setPinLat(roundedLat);
    setPinLng(roundedLng);

    setIsReverseGeocoding(true);
    try {
      const res = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: roundedLat, lng: roundedLng }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const d = data.data;
        setResolvedAddress(d.formattedAddress || `${roundedLat}, ${roundedLng}`);
        setResolvedStreet(d.street || '');
        setResolvedArea(d.area || d.city || 'Nellore');
        setResolvedCity(d.city || 'Nellore');
        setResolvedPincode(d.pincode || '');
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search places autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (s: any) => {
    const lat = Number(s.lat || 14.4329);
    const lng = Number(s.lng || 79.9680);
    setPinLat(lat);
    setPinLng(lng);
    setResolvedAddress(s.fullAddress || s.title);
    setResolvedStreet(s.title || '');
    setResolvedArea(s.title || '');
    setSearchQuery('');
    setSuggestions([]);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 16);
    }
  };

  // Quick preset area selection
  const handleSelectPresetArea = (areaString: string) => {
    setSearchQuery(areaString.split(',')[0]);
  };

  // Confirm and Save active location
  const handleConfirmLocation = () => {
    const confirmedLoc: DeliveryLocation = {
      formattedAddress: resolvedAddress,
      street: resolvedStreet || resolvedArea || 'Delivery Address',
      area: resolvedArea || resolvedCity || 'Nellore',
      city: resolvedCity || 'Nellore',
      pincode: resolvedPincode || '',
      state: 'Andhra Pradesh',
      lat: pinLat,
      lng: pinLng,
    };

    // Save as manual address
    setLocation(confirmedLoc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#1B5E20] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-stone-900">Select Delivery Location</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 pb-2 border-b border-stone-100 shrink-0 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, landmark, or apartment..."
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:bg-white focus:border-[#2E7D32] transition-all"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-[#2E7D32] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-16 z-30 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden divide-y divide-stone-100 max-h-56 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full p-3 text-left text-xs hover:bg-emerald-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">{item.title}</p>
                    <p className="text-[10px] text-stone-500 truncate">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] bg-stone-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[220px] sm:min-h-[260px]" />

          {/* Map Helper Badge */}
          <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 text-[10px] font-bold text-stone-700 flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-[#2E7D32]" />
            <span>Drag pin or click map to pinpoint doorstep</span>
          </div>

          {isReverseGeocoding && (
            <div className="absolute bottom-2 left-2 z-10 bg-black/75 text-white px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 animate-in fade-in">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Fetching street address...</span>
            </div>
          )}
        </div>

        {/* Resolved Address & Confirm Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-100 space-y-3 shrink-0">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                Selected Location
              </p>
              <p className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug">
                {resolvedAddress}
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
