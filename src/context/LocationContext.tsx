'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORE_CONFIG } from '@/config/store';
import { deliveryZoneService } from '@/services/deliveryZoneService';
import type { DeliveryZone, DistanceServiceResult } from '@/types/deliveryZone';

export interface DeliveryLocation {
  formattedAddress: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state?: string;
  lat?: number;
  lng?: number;
  accuracy?: number; // GPS radius in meters
  zone?: DeliveryZone | null;
  // Phase 1 & 2 distance snapshots
  distance_km?: number;
  distanceKm?: number;
  eta_min?: number;
  etaMin?: number;
  zone_id?: string;
  zoneId?: string;
  approximate?: boolean;
  calculated_at?: string;
  calculatedAt?: string;
  serviceable?: boolean;
  min_order?: number;
  isManual?: boolean;
}

export interface MovedLocationAlert {
  savedLoc: DeliveryLocation;
  detectedLoc: DeliveryLocation;
  distanceMovedMeters: number;
}

interface LocationContextType {
  currentLocation: DeliveryLocation;
  isDetecting: boolean;
  detectError: string | null;
  // Modal & gate state controls
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  showDeniedPopup: boolean;
  setShowDeniedPopup: (show: boolean) => void;
  showPrePromptModal: boolean;
  setShowPrePromptModal: (show: boolean) => void;
  movedLocationAlert: MovedLocationAlert | null;
  setMovedLocationAlert: (alert: MovedLocationAlert | null) => void;
  // Serviceability & distance status
  isServiceable: boolean;
  distanceData: DistanceServiceResult | null;
  isGateReady: boolean;
  permissionState: 'granted' | 'prompt' | 'denied' | 'unknown';
  hasConfirmedLocation: boolean;
  setHasConfirmedLocation: (confirmed: boolean) => void;
  // Actions
  detectLocation: () => Promise<DeliveryLocation | null>;
  setLocation: (location: DeliveryLocation) => void;
  requestDeviceLocationPermission: () => Promise<void>;
  confirmMovedLocation: (useNew: boolean) => Promise<void>;
  verifyCoordinatesDistance: (lat: number, lng: number) => Promise<DistanceServiceResult | null>;
}

const STORAGE_KEY = 'g1mart_delivery_location_v1';
const MANUAL_STORAGE_KEY = 'g1mart_saved_manual_location_v1';
export const PROMPT_DISMISSED_KEY = 'g1mart_location_prompt_dismissed_v1';

const DEFAULT_LOCATION: DeliveryLocation = {
  formattedAddress: `${STORE_CONFIG.address.area || 'Padarupalli'}, ${STORE_CONFIG.address.city || 'Nellore'}`,
  street: STORE_CONFIG.address.line1 || 'Govt Hospital, beside Padarupalli',
  area: STORE_CONFIG.address.area || 'Padarupalli',
  city: STORE_CONFIG.address.city || 'Nellore',
  pincode: STORE_CONFIG.address.pincode || '524004',
  state: STORE_CONFIG.address.state || 'Andhra Pradesh',
  lat: 14.4329,
  lng: 79.9680,
  serviceable: true,
  distance_km: 1.5,
  eta_min: 15,
};

const LocationContext = createContext<LocationContextType | null>(null);

export function useLocation(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
}

/**
 * Client-side Haversine distance in meters for the 500m movement check
 */
export function computeDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Strict Doorstep GPS Acquisition Engine with Mobile-Optimized Fallbacks
 */
function acquireHighAccuracyGPS(
  maxWaitMs: number = 8000,
  targetDoorstepAccuracyMeters: number = 25
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {}
        watchId = null;
      }
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const onPosition = (pos: GeolocationPosition) => {
      const acc = pos.coords.accuracy;
      if (!bestPosition || acc < bestPosition.coords.accuracy) {
        bestPosition = pos;
      }

      if (acc <= targetDoorstepAccuracyMeters) {
        cleanup();
        resolve(pos);
      }
    };

    const onError = (err: GeolocationPositionError) => {
      if (bestPosition && bestPosition.coords.accuracy <= 60) {
        cleanup();
        resolve(bestPosition);
        return;
      }
      if (err.code === err.PERMISSION_DENIED) {
        cleanup();
        reject(err);
        return;
      }

      // If position unavailable or initial timeout, immediately try low-accuracy / network cell location
      cleanup();
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (fallbackErr) => reject(fallbackErr),
        { enableHighAccuracy: false, maximumAge: 30000, timeout: 8000 }
      );
    };

    try {
      watchId = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      });
    } catch {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        { enableHighAccuracy: false, maximumAge: 30000, timeout: 8000 }
      );
      return;
    }

    timer = setTimeout(() => {
      cleanup();
      if (bestPosition) {
        resolve(bestPosition);
      } else {
        // Fallback: fast network/cell tower location if high accuracy GPS satellite timed out
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: false, maximumAge: 30000, timeout: 6000 }
        );
      }
    }, maxWaitMs);
  });
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation>(DEFAULT_LOCATION);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  // Gate & Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeniedPopup, setShowDeniedPopup] = useState(false);
  const [showPrePromptModal, setShowPrePromptModal] = useState(false);
  const [movedLocationAlert, setMovedLocationAlert] = useState<MovedLocationAlert | null>(null);

  // Serviceability & Distance result
  const [isServiceable, setIsServiceable] = useState(true);
  const [distanceData, setDistanceData] = useState<DistanceServiceResult | null>(null);
  const [isGateReady, setIsGateReady] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('unknown');
  const [hasConfirmedLocation, setHasConfirmedLocation] = useState(false);

  /**
   * Server-side distance service caller
   */
  const verifyCoordinatesDistance = useCallback(
    async (lat: number, lng: number): Promise<DistanceServiceResult | null> => {
      try {
        const res = await fetch('/api/location/distance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          return json.data as DistanceServiceResult;
        }
      } catch (err) {
        console.warn('[LocationContext] Distance API error:', err);
      }
      return null;
    },
    []
  );

  /**
   * Reverse geocode helper
   */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch {}
    return null;
  };

  /**
   * Apply and persist location with live server distance validation
   */
  const applyLocation = useCallback(
    async (loc: DeliveryLocation, saveAsManual = false) => {
      const lat = loc.lat ?? 14.4329;
      const lng = loc.lng ?? 79.9680;

      // Run distance service
      const distResult = await verifyCoordinatesDistance(lat, lng);

      const isServ = distResult ? distResult.serviceable : true;
      const distKm = distResult ? distResult.distance_km : (loc.distance_km ?? 1.5);
      const etaMin = distResult ? distResult.eta_min : (loc.eta_min ?? 20);
      const matchedZone = distResult?.zone ?? loc.zone ?? deliveryZoneService.getDefaultZone();
      const minOrder = distResult ? distResult.min_order : (loc.min_order ?? 500);

      const enriched: DeliveryLocation = {
        ...loc,
        lat,
        lng,
        serviceable: isServ,
        distance_km: distKm,
        distanceKm: distKm,
        eta_min: etaMin,
        etaMin: etaMin,
        zone: matchedZone,
        zone_id: matchedZone?.id,
        zoneId: matchedZone?.id,
        min_order: minOrder,
        approximate: distResult?.approximate ?? false,
        calculated_at: new Date().toISOString(),
      };

      setCurrentLocation(enriched);
      setIsServiceable(isServ);
      if (distResult) setDistanceData(distResult);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
        localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(enriched));
        localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
      } catch {}

      setHasConfirmedLocation(true);
      return enriched;
    },
    [verifyCoordinatesDistance]
  );

  /**
   * User manually sets or selects location
   */
  const setLocation = useCallback(
    (loc: DeliveryLocation) => {
      setHasConfirmedLocation(true);
      setShowDeniedPopup(false);
      setShowPrePromptModal(false);
      setMovedLocationAlert(null);
      applyLocation({ ...loc, isManual: true }, true);
    },
    [applyLocation]
  );

  /**
   * GPS detection function
   */
  const detectLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      return null;
    }

    setIsDetecting(true);
    setDetectError(null);

    try {
      const position = await acquireHighAccuracyGPS();
      const { latitude, longitude, accuracy } = position.coords;

      const geoData = await reverseGeocode(latitude, longitude);

      const detected: DeliveryLocation = {
        formattedAddress:
          geoData?.formattedAddress ||
          `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        street: geoData?.street || 'Current GPS Location',
        area: geoData?.area || geoData?.city || 'Nellore',
        city: geoData?.city || 'Nellore',
        pincode: geoData?.pincode || '',
        state: geoData?.state || 'Andhra Pradesh',
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
      };

      const applied = await applyLocation(detected, false);
      setIsDetecting(false);
      setShowDeniedPopup(false);
      setShowPrePromptModal(false);
      return applied;
    } catch (error: any) {
      setIsDetecting(false);
      let msg = 'Failed to detect your location.';
      if (error?.code === 1) {
        msg = 'Location permission denied.';
        setPermissionState('denied');
        setShowDeniedPopup(true);
      } else if (error?.code === 2) {
        msg = 'GPS signal unavailable. Please ensure device location is enabled.';
      } else if (error?.code === 3) {
        msg = 'GPS lock timed out. Please try again.';
      }
      setDetectError(msg);
      return null;
    }
  }, [applyLocation]);

  /**
   * Handle user action from LocationMovedBanner
   */
  const confirmMovedLocation = useCallback(
    async (useNew: boolean) => {
      if (movedLocationAlert) {
        if (useNew) {
          await applyLocation(movedLocationAlert.detectedLoc, true);
        } else {
          await applyLocation(movedLocationAlert.savedLoc, true);
        }
      }
      setMovedLocationAlert(null);
    },
    [movedLocationAlert, applyLocation]
  );

  /**
   * Request device location permission
   */
  const requestDeviceLocationPermission = useCallback(async () => {
    setShowPrePromptModal(false);
    const detected = await detectLocation();
    if (!detected) {
      setShowDeniedPopup(true);
    }
  }, [detectLocation]);

  /**
   * Phase 3: Location Gate (Runs on app open / launch)
   * Non-intrusive: Once user sets/confirms their location, never nag them with popups.
   */
  useEffect(() => {
    let active = true;

    const runLocationGateOnAppOpen = async () => {
      let savedLoc: DeliveryLocation | null = null;
      let savedManualLoc: DeliveryLocation | null = null;
      let isPromptDismissed = false;

      try {
        const rawSaved = localStorage.getItem(STORAGE_KEY);
        const rawManual = localStorage.getItem(MANUAL_STORAGE_KEY);
        if (rawSaved) savedLoc = JSON.parse(rawSaved);
        if (rawManual) savedManualLoc = JSON.parse(rawManual);
        isPromptDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';
      } catch {}

      const activeSaved =
        savedManualLoc && savedManualLoc.lat ? savedManualLoc : savedLoc && savedLoc.lat ? savedLoc : null;

      // Check current browser permission state
      let pState: 'granted' | 'prompt' | 'denied' | 'unknown' = 'unknown';
      if (typeof window !== 'undefined' && navigator.permissions?.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          pState = perm.state as any;
          perm.onchange = () => {
            if (active) setPermissionState(perm.state as any);
          };
        } catch {}
      }

      if (!active) return;
      setPermissionState(pState);

      // Case 1: User ALREADY has a saved location.
      // ALWAYS respect and keep it. NEVER show nagging popups or movement alerts!
      if (activeSaved) {
        setHasConfirmedLocation(true);
        setShowPrePromptModal(false);
        setShowDeniedPopup(false);
        setMovedLocationAlert(null);
        await applyLocation(activeSaved, false);
        setIsGateReady(true);
        return;
      }

      // Case 2: No saved location, but user already dismissed location modal before.
      // Respect their dismissal and load default location without interrupting.
      if (isPromptDismissed) {
        setHasConfirmedLocation(true);
        setShowPrePromptModal(false);
        setShowDeniedPopup(false);
        setMovedLocationAlert(null);
        await applyLocation(DEFAULT_LOCATION, false);
        setIsGateReady(true);
        return;
      }

      // Case 3: First-time visitor with permission already granted -> silently acquire GPS
      if (pState === 'granted') {
        try {
          setIsDetecting(true);
          const position = await acquireHighAccuracyGPS(4000);
          const { latitude, longitude, accuracy } = position.coords;
          const geoData = await reverseGeocode(latitude, longitude);
          const freshGpsLoc: DeliveryLocation = {
            formattedAddress:
              geoData?.formattedAddress ||
              `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            street: geoData?.street || 'Current GPS Location',
            area: geoData?.area || geoData?.city || 'Nellore',
            city: geoData?.city || 'Nellore',
            pincode: geoData?.pincode || '',
            state: geoData?.state || 'Andhra Pradesh',
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
          };

          await applyLocation(freshGpsLoc, true);
          setIsGateReady(true);
          setIsDetecting(false);
          return;
        } catch (err) {
          console.warn('[LocationGate] Silent GPS acquisition error:', err);
          setIsDetecting(false);
        }
      }

      // Case 4: Brand new visitor with no saved location and not dismissed
      setShowPrePromptModal(true);
      setIsGateReady(true);
    };

    runLocationGateOnAppOpen();

    return () => {
      active = false;
    };
  }, [applyLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isDetecting,
        detectError,
        isModalOpen,
        setIsModalOpen,
        showDeniedPopup,
        setShowDeniedPopup,
        showPrePromptModal,
        setShowPrePromptModal,
        movedLocationAlert,
        setMovedLocationAlert,
        isServiceable,
        distanceData,
        isGateReady,
        permissionState,
        hasConfirmedLocation,
        setHasConfirmedLocation,
        detectLocation,
        setLocation,
        requestDeviceLocationPermission,
        confirmMovedLocation,
        verifyCoordinatesDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
