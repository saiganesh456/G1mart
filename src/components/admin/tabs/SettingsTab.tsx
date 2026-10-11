'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Search,
  Crosshair,
  Sliders,
  DollarSign,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { StoreSettings, DeliveryZone } from '@/types/deliveryZone';
import { DEFAULT_STORE_SETTINGS, DEFAULT_DELIVERY_ZONES } from '@/lib/storeSettingsConstants';

export default function SettingsTab() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [zones, setZones] = useState<DeliveryZone[]>(DEFAULT_DELIVERY_ZONES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Search & Map interactive state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Test distance simulator
  const [testDistance, setTestDistance] = useState<number>(3);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);

  // Fetch initial settings from server
  const fetchSettings = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.zones) && data.zones.length > 0) setZones(data.zones);
      }
    } catch (err: any) {
      console.error('[SettingsTab] Fetch error:', err);
      setSaveError('Failed to load settings from server. Showing local defaults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Dynamically load Leaflet for interactive map picking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const lat = Number(settings.store_lat || 14.4329);
    const lng = Number(settings.store_lng || 79.9680);
    const radiusMeters = (settings.max_radius_km || 30) * 1000;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="background-color: #1B5E20; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 3px solid white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);

      // Radius coverage circle
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: '#2E7D32',
        fillColor: '#81C784',
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        handleMapCoordinateChange(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        handleMapCoordinateChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
      circleInstanceRef.current = circle;
    } else {
      // Update existing map
      const map = mapInstanceRef.current;
      const marker = markerInstanceRef.current;
      const circle = circleInstanceRef.current;

      if (marker && circle) {
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        circle.setRadius(radiusMeters);
        map.panTo([lat, lng]);
      }
    }
  }, [leafletLoaded, settings.store_lat, settings.store_lng, settings.max_radius_km]);

  // Handle position change on map
  const handleMapCoordinateChange = async (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));

    setSettings((prev) => ({
      ...prev,
      store_lat: roundedLat,
      store_lng: roundedLng,
    }));

    // Auto reverse geocode
    try {
      const res = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: roundedLat, lng: roundedLng }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.formattedAddress) {
        setSettings((prev) => ({
          ...prev,
          store_address: data.data.formattedAddress,
        }));
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    }
  };

  // Search places handler
  const handleSearchPlaces = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Location search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    if (result.lat && result.lng) {
      handleMapCoordinateChange(result.lat, result.lng);
      if (result.fullAddress) {
        setSettings((prev) => ({ ...prev, store_address: result.fullAddress }));
      }
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  // Detect GPS coordinates
  const handleUseMyGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        handleMapCoordinateChange(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsDetectingGps(false);
        alert('Could not acquire GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Save all settings to server
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // Validate zones
      for (const z of zones) {
        if (Number(z.min_km) >= Number(z.max_km)) {
          throw new Error(`Invalid zone bracket "${z.name}": Min km (${z.min_km}) must be less than Max km (${z.max_km})`);
        }
        if (Number(z.min_order) < 0) {
          throw new Error(`Invalid zone "${z.name}": Min order value cannot be negative`);
        }
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...settings,
            store_lat: Number(settings.store_lat),
            store_lng: Number(settings.store_lng),
            max_radius_km: Number(settings.max_radius_km),
            prep_time_min: Number(settings.prep_time_min),
            cod_fee: Number(settings.cod_fee),
          },
          zones,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) setSettings(data.settings);
        if (data.zones) setZones(data.zones);
        setSaveSuccess('Store settings and delivery zones updated successfully!');
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveError(err.message || 'Error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Delivery zone table actions
  const handleZoneChange = (index: number, field: keyof DeliveryZone, value: any) => {
    setZones((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'min_order') {
        next[index].minOrderValue = Number(value);
      }
      if (field === 'active') {
        next[index].isActive = Boolean(value);
      }
      return next;
    });
  };

  const handleAddZone = () => {
    const lastZone = zones[zones.length - 1];
    const newMin = lastZone ? Number(lastZone.max_km) : 0;
    const newMax = newMin + 5;
    const newZone: DeliveryZone = {
      id: `zone-${newMin}-${newMax}-${Date.now()}`,
      name: `${newMin}–${newMax} km`,
      min_km: newMin,
      max_km: newMax,
      min_order: 1500,
      active: true,
      deliveryFee: 0,
      minOrderValue: 1500,
      isActive: true,
      estimatedDeliveryTimeText: `${newMax * 3} mins`,
    };
    setZones((prev) => [...prev, newZone]);
  };

  const handleDeleteZone = (index: number) => {
    if (zones.length <= 1) {
      alert('You must have at least one delivery zone configured.');
      return;
    }
    setZones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset store settings and delivery zones to recommended defaults?')) {
      setSettings(DEFAULT_STORE_SETTINGS);
      setZones(DEFAULT_DELIVERY_ZONES);
    }
  };

  // Test distance evaluation
  const testZoneMatch = (() => {
    if (testDistance > settings.max_radius_km) {
      return { serviceable: false, reason: `Beyond maximum delivery radius (${settings.max_radius_km} km)` };
    }
    const match = zones.find(
      (z) =>
        (z.active ?? z.isActive) &&
        (z.min_km === 0
          ? testDistance >= 0 && testDistance <= z.max_km
          : testDistance > z.min_km && testDistance <= z.max_km)
    );
    if (!match) {
      return { serviceable: false, reason: 'No active zone configured for this distance' };
    }
    return {
      serviceable: true,
      zone: match,
      minOrder: match.min_order ?? match.minOrderValue ?? 500,
      deliveryFee: 0,
    };
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1B5E20] animate-spin" />
        <p className="text-sm font-bold text-stone-600">Loading store settings & zones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center">
              <Sliders className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
              Store & Delivery Settings
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Configure darkstore hub GPS, 30 km geofence radius, distance-based minimum orders, and COD fees.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            title="Reset to recommended business values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{saveError}</span>
        </div>
      )}

      {/* Section 1: Store Location & Interactive Map */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-stone-900">1. Store Hub Location</h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Customer delivery distances and ETAs are calculated relative to this exact GPS location.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseMyGps}
            disabled={isDetectingGps}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>Use My GPS Pin</span>
          </button>
        </div>

        {/* Address & Coordinates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-black uppercase text-stone-600 tracking-wider">
              Physical Store Address
            </label>
            <input
              type="text"
              value={settings.store_address}
              onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
              placeholder="e.g. Govt Hospital, Beside Padarupalli, Nellore, AP - 524004"
              className="w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 focus:bg-white focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-stone-600 tracking-wider">
              Store Latitude
            </label>
            <input
              type="number"
              step="any"
              value={settings.store_lat}
              onChange={(e) => setSettings({ ...settings, store_lat: parseFloat(e.target.value) || 0 })}
              className="w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-800 focus:bg-white focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-stone-600 tracking-wider">
              Store Longitude
            </label>
            <input
              type="number"
              step="any"
              value={settings.store_lng}
              onChange={(e) => setSettings({ ...settings, store_lng: parseFloat(e.target.value) || 0 })}
              className="w-full h-11 px-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono font-bold text-stone-800 focus:bg-white focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-stone-600 tracking-wider">
              Search Nellore Landmark / Colony
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchPlaces(e.target.value)}
                placeholder="Search area (e.g. Pogathota, Magunta)"
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:bg-white focus:border-[#1B5E20] outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {isSearching && (
                <RefreshCw className="w-3 h-3 text-[#1B5E20] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-72 max-w-sm bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-2.5 text-left text-xs hover:bg-emerald-50 flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#1B5E20] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900">{item.title}</p>
                      <p className="text-[10px] text-stone-500 truncate">{item.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Map Picker Container */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1 font-semibold">
              <Navigation className="w-3.5 h-3.5 text-[#1B5E20]" />
              <span>Click or drag pin on map to set store coordinates. Translucent green ring shows {settings.max_radius_km} km max radius.</span>
            </span>
            <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded-md font-bold text-stone-700">
              {settings.store_lat.toFixed(5)}, {settings.store_lng.toFixed(5)}
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-72 sm:h-84 rounded-2xl border border-stone-200 overflow-hidden relative z-0 bg-stone-100"
          />
        </div>
      </div>

      {/* Section 2: Operating & Pricing Parameters */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-stone-900">2. Operational & Fee Parameters</h2>
            <p className="text-[11px] text-stone-500 font-medium">
              Geofence limit, packing buffer time, and Cash on Delivery handling charge.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Max Radius */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900">Max Delivery Radius</label>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Hard Boundary
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={settings.max_radius_km}
                onChange={(e) => setSettings({ ...settings, max_radius_km: parseFloat(e.target.value) || 30 })}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm font-bold text-stone-900 focus:border-[#1B5E20] outline-none"
              />
              <span className="text-xs font-black text-stone-600 whitespace-nowrap">km</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Customers beyond {settings.max_radius_km} km road distance are blocked with the unserviceable page.
            </p>
          </div>

          {/* Prep Time */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900">Store Prep / Packing Time</label>
              <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                ETA Buffer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={settings.prep_time_min}
                onChange={(e) => setSettings({ ...settings, prep_time_min: parseInt(e.target.value, 10) || 10 })}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm font-bold text-stone-900 focus:border-[#1B5E20] outline-none"
              />
              <span className="text-xs font-black text-stone-600 whitespace-nowrap">mins</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Added to driving duration from Google Distance Matrix (ETA = Driving Time + {settings.prep_time_min} min).
            </p>
          </div>

          {/* COD Handling Fee */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-900">Pay on Delivery Handling Fee</label>
              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                COD Only
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-stone-700">₹</span>
              <input
                type="number"
                min="0"
                max="500"
                value={settings.cod_fee}
                onChange={(e) => setSettings({ ...settings, cod_fee: parseFloat(e.target.value) || 0 })}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-stone-200 text-sm font-bold text-stone-900 focus:border-[#1B5E20] outline-none"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Added only when customer chooses Pay on Delivery. Online payment (UPI/Card) is ₹0 fee.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Distance-Based Delivery Zones Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-stone-900">3. Distance-Based Minimum Orders (Zones)</h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Delivery is free in all zones. Minimum order is enforced at checkout against item subtotal (excluding COD fee).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddZone}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zone Tier</span>
          </button>
        </div>

        {/* Zones List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-black uppercase tracking-wider text-stone-400">
                <th className="py-2.5 px-3">Zone Label</th>
                <th className="py-2.5 px-3">Min Dist (km)</th>
                <th className="py-2.5 px-3">Max Dist (km)</th>
                <th className="py-2.5 px-3">Min Order (₹)</th>
                <th className="py-2.5 px-3">Delivery Fee</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {zones.map((zone, idx) => (
                <tr key={zone.id || idx} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={zone.name || `${zone.min_km}–${zone.max_km} km`}
                      onChange={(e) => handleZoneChange(idx, 'name', e.target.value)}
                      className="w-36 sm:w-44 h-9 px-2.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-800 bg-white"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={zone.min_km}
                      onChange={(e) => handleZoneChange(idx, 'min_km', parseFloat(e.target.value) || 0)}
                      className="w-20 h-9 px-2.5 rounded-lg border border-stone-200 text-xs font-mono font-bold text-stone-800 bg-white"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={zone.max_km}
                      onChange={(e) => handleZoneChange(idx, 'max_km', parseFloat(e.target.value) || 0)}
                      className="w-20 h-9 px-2.5 rounded-lg border border-stone-200 text-xs font-mono font-bold text-stone-800 bg-white"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-stone-500">₹</span>
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={zone.min_order ?? zone.minOrderValue ?? 500}
                        onChange={(e) => handleZoneChange(idx, 'min_order', parseFloat(e.target.value) || 0)}
                        className="w-24 h-9 px-2.5 rounded-lg border border-stone-200 text-xs font-mono font-black text-[#1B5E20] bg-white"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                      FREE (₹0)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleZoneChange(idx, 'active', !(zone.active ?? zone.isActive))}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        (zone.active ?? zone.isActive)
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {(zone.active ?? zone.isActive) ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteZone(idx)}
                      className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center transition-colors ml-auto cursor-pointer"
                      title="Delete zone tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Live Business Rule Simulator */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-5 sm:p-6 rounded-3xl border border-stone-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Live Zone & Distance Rule Tester
            </h3>
          </div>
          <span className="text-[10px] bg-white/10 text-stone-300 px-2 py-0.5 rounded-full font-mono">
            Interactive Verification
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-300">Test Road Distance:</span>
              <span className="font-mono font-black text-emerald-300 text-sm">{testDistance} km</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={testDistance}
              onChange={(e) => setTestDistance(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <button type="button" onClick={() => setTestDistance(3)} className="hover:text-emerald-400">3 km</button>
              <button type="button" onClick={() => setTestDistance(8)} className="hover:text-emerald-400">8 km</button>
              <button type="button" onClick={() => setTestDistance(12)} className="hover:text-emerald-400">12 km</button>
              <button type="button" onClick={() => setTestDistance(20)} className="hover:text-emerald-400">20 km</button>
              <button type="button" onClick={() => setTestDistance(35)} className="hover:text-emerald-400">35 km</button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 min-w-[240px] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Serviceable:</span>
              <span
                className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                  testZoneMatch.serviceable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {testZoneMatch.serviceable ? 'YES — Serviceable' : 'NO — Unserviceable Page'}
              </span>
            </div>

            {testZoneMatch.serviceable ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Matched Zone:</span>
                  <span className="font-bold text-white">{testZoneMatch.zone?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Min Order Value:</span>
                  <span className="font-black text-emerald-400">₹{testZoneMatch.minOrder}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Delivery Fee:</span>
                  <span className="font-bold text-white">Free (₹0)</span>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-rose-300">{testZoneMatch.reason}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
