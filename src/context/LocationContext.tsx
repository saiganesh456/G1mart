'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORE_CONFIG } from '@/config/store';
import { deliveryZoneService } from '@/services/deliveryZoneService';
import type { DeliveryZone } from '@/types/deliveryZone';

export interface DeliveryLocation {
  formattedAddress: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state?: string;
  lat?: number;
  lng?: number;
  accuracy?: number; // Accurate GPS radius in meters
  zone?: DeliveryZone;
}

interface LocationContextType {
  currentLocation: DeliveryLocation;
  isDetecting: boolean;
  detectError: string | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  detectLocation: () => Promise<DeliveryLocation | null>;
  setLocation: (location: DeliveryLocation) => void;
}

const STORAGE_KEY = 'g1mart_delivery_location_v1';

const DEFAULT_LOCATION: DeliveryLocation = {
  formattedAddress: `${STORE_CONFIG.address.area || 'Padarupalli'}, ${STORE_CONFIG.address.city || 'Nellore'}`,
  street: STORE_CONFIG.address.line1 || 'Govt Hospital, beside Padarupalli',
  area: STORE_CONFIG.address.area || 'Padarupalli',
  city: STORE_CONFIG.address.city || 'Nellore',
  pincode: STORE_CONFIG.address.pincode || '524004',
  state: STORE_CONFIG.address.state || 'Andhra Pradesh',
};

const LocationContext = createContext<LocationContextType | null>(null);

export function useLocation(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
}

/**
 * Strict Doorstep GPS Acquisition Engine
 *
 * Browsers often return coarse cell-tower/Wi-Fi positioning (~100m away) on the first callback.
 * To achieve true doorstep satellite accuracy (<= 15 meters):
 * 1. Uses navigator.geolocation.watchPosition with high accuracy and 0 maximumAge.
 * 2. Continuously samples positions until hardware GPS locks down to <= 15m or best available.
 * 3. Falls back gracefully if satellite lock takes longer than 4.5s.
 */
function acquireHighAccuracyGPS(
  maxWaitMs: number = 4500,
  targetDoorstepAccuracyMeters: number = 15
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
        navigator.geolocation.clearWatch(watchId);
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

      // If doorstep precision achieved (<= 15m), resolve immediately!
      if (acc <= targetDoorstepAccuracyMeters) {
        cleanup();
        resolve(pos);
      }
    };

    const onError = (err: GeolocationPositionError) => {
      // If we already captured a reasonable fix (< 60m), use it
      if (bestPosition && bestPosition.coords.accuracy <= 60) {
        cleanup();
        resolve(bestPosition);
        return;
      }
      if (err.code === err.PERMISSION_DENIED) {
        cleanup();
        reject(err);
      }
    };

    try {
      watchId = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
      });
    } catch {
      // Ignore watch setup error and rely on timer fallback
    }

    timer = setTimeout(() => {
      cleanup();
      if (bestPosition) {
        resolve(bestPosition);
      } else {
        // Fallback to one-shot getCurrentPosition with strict high accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 6000 }
        );
      }
    }, maxWaitMs);
  });
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation>(DEFAULT_LOCATION);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hydrate from localStorage on initial client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize legacy TODO strings from older builds
        if (
          !parsed ||
          typeof parsed.city !== 'string' ||
          parsed.city.includes('TODO') ||
          (parsed.area && parsed.area.includes('TODO')) ||
          (parsed.formattedAddress && parsed.formattedAddress.includes('TODO'))
        ) {
          const defaultZone = deliveryZoneService.getDefaultZone();
          const cleanLoc = { ...DEFAULT_LOCATION, zone: defaultZone };
          setCurrentLocation(cleanLoc);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanLoc));
        } else {
          const zone = deliveryZoneService.resolveZone(
            `${parsed.area} ${parsed.city} ${parsed.pincode}`
          );
          setCurrentLocation({ ...parsed, zone });
        }
      } else {
        const defaultZone = deliveryZoneService.getDefaultZone();
        setCurrentLocation((prev) => ({ ...prev, zone: defaultZone }));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    const zone = deliveryZoneService.resolveZone(
      `${loc.area} ${loc.city} ${loc.pincode} ${loc.formattedAddress}`
    );
    const updated = { ...loc, zone };
    setCurrentLocation(updated);
    setDetectError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  }, []);

  const detectLocation = useCallback(async (): Promise<DeliveryLocation | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      return null;
    }

    setIsDetecting(true);
    setDetectError(null);

    try {
      // 1. Acquire true doorstep satellite coordinates (filter out coarse 100m cell-tower fixes)
      const position = await acquireHighAccuracyGPS();
      const { latitude, longitude, accuracy } = position.coords;

      // 2. Call server reverse-geocode route for human readable street/colony
      let geoData: any = null;
      try {
        const res = await fetch('/api/location/reverse-geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          geoData = data.data;
        }
      } catch (err) {
        console.warn('[DetectLocation] Reverse geocode network fallback:', err);
      }

      const detected: DeliveryLocation = {
        formattedAddress:
          geoData?.formattedAddress ||
          `Current GPS Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
        street: geoData?.street || 'Current GPS Location',
        area: geoData?.area || geoData?.city || 'Nellore',
        city: geoData?.city || 'Nellore',
        pincode: geoData?.pincode || '',
        state: geoData?.state || 'Andhra Pradesh',
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
      };

      setLocation(detected);
      setIsDetecting(false);
      return detected;
    } catch (error: any) {
      setIsDetecting(false);
      let msg = 'Failed to detect your location.';
      if (error?.code === 1) {
        msg = 'Location permission denied. Please allow location access in your browser.';
      } else if (error?.code === 2) {
        msg = 'GPS satellite signal unavailable. Please ensure device location is enabled.';
      } else if (error?.code === 3) {
        msg = 'GPS satellite lock timed out. Please try again.';
      } else if (error?.message) {
        msg = error.message;
      }
      setDetectError(msg);
      return null;
    }
  }, [setLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isDetecting,
        detectError,
        isModalOpen,
        setIsModalOpen,
        detectLocation,
        setLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
