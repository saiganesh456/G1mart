'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Search,
  MapPin,
  Navigation,
  CheckCircle2,
  RefreshCw,
  Clock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useLocation, DeliveryLocation } from '@/context/LocationContext';
import { searchNelloreLocations } from '@/data/nelloreLocations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

/**
 * Store hub coordinates (Govt Hospital, Beside Padarupalli, Nellore)
 */
const STORE_LAT = 14.4329;
const STORE_LNG = 79.9680;

function calculateDeliveryDetails(lat: number, lng: number) {
  const R = 6371;
  const dLat = (lat - STORE_LAT) * (Math.PI / 180);
  const dLon = (lng - STORE_LNG) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(STORE_LAT * (Math.PI / 180)) *
      Math.cos(lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadKm = Math.round(R * c * 1.25 * 10) / 10;

  if (roadKm <= 5) {
    return {
      distanceKm: roadKm,
      etaText: '15–30 mins',
      etaMin: 20,
      minOrder: 500,
      zoneName: 'Local Express (0–5 km)',
      serviceable: true,
    };
  } else if (roadKm <= 10) {
    return {
      distanceKm: roadKm,
      etaText: '30–45 mins',
      etaMin: 35,
      minOrder: 1000,
      zoneName: 'City Delivery (5–10 km)',
      serviceable: true,
    };
  } else if (roadKm <= 15) {
    return {
      distanceKm: roadKm,
      etaText: '30–45 mins',
      etaMin: 45,
      minOrder: 1000,
      zoneName: 'Suburban Delivery (10–15 km)',
      serviceable: true,
    };
  } else if (roadKm <= 30) {
    return {
      distanceKm: roadKm,
      etaText: 'Approx. 1–1.5 hours',
      etaMin: 75,
      minOrder: 2000,
      zoneName: 'Extended Delivery (15–30 km)',
      serviceable: true,
    };
  } else {
    return {
      distanceKm: roadKm,
      etaText: 'Beyond 30 km',
      etaMin: 0,
      minOrder: 0,
      zoneName: 'Unserviceable Area',
      serviceable: false,
    };
  }
}

export default function ManualLocationModal({ isOpen, onClose, isMandatory = false }: Props) {
  const { currentLocation, setLocation, detectLocation, isDetecting } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);

  // Selected Pin Coordinates & Resolved Address
  const [pinLat, setPinLat] = useState<number>(() => currentLocation.lat || 14.4447);
  const [pinLng, setPinLng] = useState<number>(() => currentLocation.lng || 79.9882);
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    () => currentLocation.formattedAddress || 'VRC Centre, Trunk Road, Nellore'
  );
  const [resolvedStreet, setResolvedStreet] = useState<string>(() => currentLocation.street || 'VRC Centre');
  const [resolvedArea, setResolvedArea] = useState<string>(() => currentLocation.area || 'Nellore');
  const [resolvedCity, setResolvedCity] = useState<string>(() => currentLocation.city || 'Nellore');
  const [resolvedPincode, setResolvedPincode] = useState<string>(() => currentLocation.pincode || '524001');

  const [isPanning, setIsPanning] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geocodeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Computed delivery metrics
  const deliveryInfo = calculateDeliveryDetails(pinLat, pinLng);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentLocation.lat && currentLocation.lng) {
        setPinLat(currentLocation.lat);
        setPinLng(currentLocation.lng);
      }
      if (currentLocation.formattedAddress) {
        setResolvedAddress(currentLocation.formattedAddress);
      }
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [isOpen, currentLocation]);

  // Dynamically load Leaflet assets
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;

    if ((window as any).L) {
      setLeafletReady(true);
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
      script.onload = () => setLeafletReady(true);
      document.body.appendChild(script);
    }
  }, [isOpen]);

  // Reverse geocoding helper
  const reverseGeocodeCoordinates = useCallback(async (lat: number, lng: number) => {
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
        setResolvedAddress(d.formattedAddress || `${d.area || 'Nellore'}, ${roundedLat}, ${roundedLng}`);
        setResolvedStreet(d.street || '');
        setResolvedArea(d.area || d.city || 'Nellore');
        setResolvedCity(d.city || 'Nellore');
        setResolvedPincode(d.pincode || '');
      }
    } catch (err) {
      console.warn('[ManualLocationModal] Reverse geocode error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Initialize Leaflet map with fixed center pin tracking
  useEffect(() => {
    if (!isOpen || !leafletReady || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const lat = Number(pinLat || 14.4447);
    const lng = Number(pinLng || 79.9882);

    // Destroy existing instance to prevent detached container bugs
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    map.on('movestart', () => {
      setIsPanning(true);
    });

    const syncCenter = () => {
      const center = map.getCenter();
      const rLat = Number(center.lat.toFixed(6));
      const rLng = Number(center.lng.toFixed(6));
      setPinLat(rLat);
      setPinLng(rLng);
      return { rLat, rLng };
    };

    map.on('move', () => {
      syncCenter();
    });

    map.on('moveend', () => {
      setIsPanning(false);
      const { rLat, rLng } = syncCenter();
      if (geocodeDebounceRef.current) {
        clearTimeout(geocodeDebounceRef.current);
      }
      geocodeDebounceRef.current = setTimeout(() => {
        reverseGeocodeCoordinates(rLat, rLng);
      }, 350);
    });

    map.on('zoomend', () => {
      setIsPanning(false);
      syncCenter();
    });

    map.on('click', (e: any) => {
      map.panTo(e.latlng, { animate: true });
    });

    mapInstanceRef.current = map;

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (geocodeDebounceRef.current) clearTimeout(geocodeDebounceRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, leafletReady, reverseGeocodeCoordinates]);

  // Live address autocomplete search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    // First do immediate local search for instant feedback
    const instantLocal = searchNelloreLocations(trimmed, 6).map((loc) => ({
      id: `local-${loc.id}`,
      title: loc.name,
      subtitle: [loc.landmark, loc.area, `Nellore - ${loc.pincode}`].filter(Boolean).join(', '),
      fullAddress: `${loc.name}, ${loc.area}, Nellore, Andhra Pradesh - ${loc.pincode}`,
      area: loc.area,
      city: loc.city,
      pincode: loc.pincode,
      lat: loc.lat,
      lng: loc.lng,
      isLocalNellore: true,
    }));

    if (instantLocal.length > 0) {
      setSuggestions(instantLocal);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSuggestions(json.data);
        }
      } catch (err) {
        console.warn('[ManualLocationModal] Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When user selects a suggestion: PIN MOVES IMMEDIATELY
  const handleSelectSuggestion = (item: any) => {
    const lat = Number(item.lat || STORE_LAT);
    const lng = Number(item.lng || STORE_LNG);

    setPinLat(lat);
    setPinLng(lng);
    setResolvedAddress(item.fullAddress || item.title);
    setResolvedStreet(item.title || '');
    setResolvedArea(item.area || item.title || 'Nellore');
    setResolvedCity(item.city || 'Nellore');
    setResolvedPincode(item.pincode || '');

    setSearchQuery(item.title || '');
    setSuggestions([]);

    // Move map directly to centered coordinates
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  // Handle Enter key on search input (e.g. typing "Balaji Nellore" + Enter)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else {
      // Check local dataset directly
      const matches = searchNelloreLocations(query, 1);
      if (matches.length > 0) {
        const loc = matches[0];
        handleSelectSuggestion({
          title: loc.name,
          fullAddress: `${loc.name}, ${loc.area}, Nellore, Andhra Pradesh - ${loc.pincode}`,
          area: loc.area,
          city: loc.city,
          pincode: loc.pincode,
          lat: loc.lat,
          lng: loc.lng,
        });
      }
    }
  };

  // Quick preset area button click
  const handleSelectPresetArea = (areaString: string) => {
    const areaName = areaString.split(',')[0].trim();
    setSearchQuery(areaName);
    const matches = searchNelloreLocations(areaName, 1);
    if (matches.length > 0) {
      const loc = matches[0];
      handleSelectSuggestion({
        title: loc.name,
        fullAddress: `${loc.name}, ${loc.area}, Nellore, Andhra Pradesh - ${loc.pincode}`,
        area: loc.area,
        city: loc.city,
        pincode: loc.pincode,
        lat: loc.lat,
        lng: loc.lng,
      });
    }
  };

  // "Locate Me / GPS" button inside the map
  const handleSnapToDeviceGps = async () => {
    setIsLocatingDevice(true);
    try {
      const loc = await detectLocation();
      if (loc && loc.lat && loc.lng) {
        setPinLat(loc.lat);
        setPinLng(loc.lng);
        setResolvedAddress(loc.formattedAddress);
        setResolvedStreet(loc.street || '');
        setResolvedArea(loc.area || 'Nellore');
        setResolvedCity(loc.city || 'Nellore');
        setResolvedPincode(loc.pincode || '');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([loc.lat, loc.lng], 16, { animate: true });
        }
      }
    } catch (err) {
      console.warn('[ManualLocationModal] GPS snap error:', err);
    } finally {
      setIsLocatingDevice(false);
    }
  };

  // Confirm and save chosen delivery location
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
      serviceable: deliveryInfo.serviceable,
      distance_km: deliveryInfo.distanceKm,
      distanceKm: deliveryInfo.distanceKm,
      eta_min: deliveryInfo.etaMin,
      etaMin: deliveryInfo.etaMin,
      min_order: deliveryInfo.minOrder,
    };

    setLocation(confirmedLoc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <style jsx global>{`
        .g1-map-marker-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900 leading-tight">
                Choose Delivery Location
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Nellore Delivery Service
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar with live autocomplete & Enter key submission */}
        <div className="p-3 sm:p-4 pb-2 border-b border-stone-100 shrink-0 relative bg-stone-50/50">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              placeholder="Search area (e.g. Balaji Nellore, Magunta, Kovur)..."
              className="w-full h-11 pl-10 pr-16 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/10 transition-all placeholder:text-stone-400"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-[#2E7D32] animate-spin absolute right-10 top-1/2 -translate-y-1/2" />
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1B5E20] text-white text-[11px] font-bold rounded-xl cursor-pointer hover:bg-[#154a19] transition-colors"
            >
              Go
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-3 sm:left-4 right-3 sm:right-4 top-16 z-30 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 max-h-60 overflow-y-auto animate-in fade-in duration-150">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full p-3 text-left text-xs hover:bg-emerald-50/80 flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900">{item.title}</p>
                    <p className="text-[11px] text-stone-500 truncate">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#2E7D32] shrink-0 self-center" />
                </button>
              ))}
            </div>
          )}

          {/* Popular quick areas tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar text-[11px]">
            <span className="text-stone-400 font-semibold shrink-0">Popular:</span>
            {['Balaji Nagar', 'Magunta Layout', 'Pogathota', 'VRC Centre', 'Kovur', 'Padarupalli'].map(
              (area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleSelectPresetArea(area)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] text-stone-600 font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                >
                  {area}
                </button>
              )
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] bg-stone-100 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full min-h-[220px] sm:min-h-[260px]" />

          {/* Fixed Stationary Center Pin Overlay — Always pinned to exact center of map */}
          <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center">
            <div className="relative flex flex-col items-center justify-center -translate-y-1/2">
              {/* Floating needle pin with interactive lift on pan */}
              <div
                className={`transition-all duration-200 ease-out origin-bottom ${
                  isPanning ? '-translate-y-3 scale-110 drop-shadow-2xl' : 'translate-y-0 scale-100 drop-shadow-md'
                }`}
              >
                <svg width="38" height="46" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 0C8.06 0 0 8.06 0 18C0 28.5 15.6 42.4 16.3 43C16.8 43.4 17.4 43.7 18 43.7C18.6 43.7 19.2 43.4 19.7 43C20.4 42.4 36 28.5 36 18C36 8.06 27.94 0 18 0Z"
                    fill="#1B5E20"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <circle cx="18" cy="18" r="6" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Pin Target Base Ground Shadow Point directly at tip */}
              <div
                className={`w-3.5 h-1.5 rounded-full bg-stone-900/40 transition-all duration-200 -mt-0.5 ${
                  isPanning ? 'scale-75 opacity-40' : 'scale-100 opacity-90'
                }`}
              />
            </div>
          </div>

          {/* Map Top Helper Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-stone-200 text-[10px] font-bold text-stone-700 flex items-center gap-1.5 pointer-events-none">
            <Navigation className="w-3 h-3 text-[#2E7D32]" />
            <span>Drag or zoom map to pinpoint exact doorstep</span>
          </div>

          {/* Floating "Locate Me / GPS" Button */}
          <button
            type="button"
            onClick={handleSnapToDeviceGps}
            disabled={isLocatingDevice || isDetecting}
            className="absolute bottom-3 right-3 z-10 bg-white hover:bg-emerald-50 text-[#1B5E20] font-bold text-[11px] px-3 py-2 rounded-xl shadow-lg border border-stone-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            title="Snap pin to my device GPS"
          >
            {isLocatingDevice || isDetecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 fill-[#1B5E20]" />
            )}
            <span>Locate Me</span>
          </button>

          {/* Reverse Geocode Loading indicator */}
          {isReverseGeocoding && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/75 text-white px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 animate-in fade-in">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Fetching Nellore address...</span>
            </div>
          )}
        </div>

        {/* Bottom Section: Resolved Address & Delivery Details & Confirm Button */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-100 space-y-3 shrink-0">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Selected Doorstep Pin
                </p>
                <span className="text-[10px] font-bold text-[#1B5E20] bg-emerald-50 px-1.5 py-0.2 rounded">
                  {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug">
                {resolvedAddress}
              </p>
            </div>
          </div>

          {/* Delivery Zone Summary */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              deliveryInfo.serviceable
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {deliveryInfo.serviceable ? (
                <Clock className="w-4 h-4 text-[#1B5E20] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="font-extrabold leading-tight">
                  {deliveryInfo.serviceable
                    ? `Delivery in ${deliveryInfo.etaText}`
                    : 'Location outside 30 km radius'}
                </p>
                <p className="text-[10px] text-stone-600 font-medium">
                  {deliveryInfo.serviceable
                    ? `${deliveryInfo.zoneName} · Min order ₹${deliveryInfo.minOrder} · Free Delivery`
                    : 'Please select an address within 30 km of Nellore'}
                </p>
              </div>
            </div>

            {deliveryInfo.serviceable && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1B5E20] text-white shrink-0">
                FREE Delivery
              </span>
            )}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!deliveryInfo.serviceable}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1B5E20] hover:bg-[#154a19] active:bg-[#0e3512] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Delivery Location & See Products</span>
          </button>
        </div>
      </div>
    </div>
  );
}
