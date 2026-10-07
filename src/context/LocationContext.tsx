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
  formattedAddress: `${STORE_CONFIG.address.area || 'Magunta Layout'}, ${STORE_CONFIG.address.city || 'Nellore'}`,
  street: STORE_CONFIG.address.line1 || 'Trunk Road',
  area: STORE_CONFIG.address.area || 'Magunta Layout',
  city: STORE_CONFIG.address.city || 'Nellore',
  pincode: STORE_CONFIG.address.pincode || '524003',
  state: STORE_CONFIG.address.state || 'Andhra Pradesh',
};

const LocationContext = createContext<LocationContextType | null>(null);

export function useLocation(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
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

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Call server reverse-geocode route
            const res = await fetch('/api/location/reverse-geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
              throw new Error(data.error || 'Failed to resolve location address');
            }

            const detected: DeliveryLocation = {
              formattedAddress: data.data.formattedAddress,
              street: data.data.street || '',
              area: data.data.area || data.data.city || 'Nellore',
              city: data.data.city || 'Nellore',
              pincode: data.data.pincode || '',
              state: data.data.state || 'Andhra Pradesh',
              lat: latitude,
              lng: longitude,
            };

            setLocation(detected);
            setIsDetecting(false);
            resolve(detected);
          } catch (err: any) {
            console.error('[DetectLocation] Geocode Error:', err);
            setDetectError(err.message || 'Unable to reverse-geocode your coordinates.');
            setIsDetecting(false);
            resolve(null);
          }
        },
        (error) => {
          setIsDetecting(false);
          let msg = 'Failed to detect your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow location access in your browser.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please try again.';
          }
          setDetectError(msg);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
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
