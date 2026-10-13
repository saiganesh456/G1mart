'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import LocationPermissionDeniedModal from './LocationPermissionDeniedModal';
import PrePromptModal from './PrePromptModal';
import ManualLocationModal from './ManualLocationModal';
import LocationMovedBanner from './LocationMovedBanner';
import UnserviceablePage from './UnserviceablePage';

interface Props {
  children: React.ReactNode;
}

/**
 * Global Location Gate Wrapper
 * Runs on EVERY app open / launch:
 * 1. Checks permissions and guides customer to GPS or manual location
 * 2. Compares GPS with saved address (500m movement alert)
 * 3. Enforces 30 km serviceable radius: renders UnserviceablePage on shop screens if beyond 30 km.
 */
export default function LocationGate({ children }: Props) {
  const pathname = usePathname();
  const {
    isModalOpen,
    setIsModalOpen,
    showDeniedPopup,
    setShowDeniedPopup,
    showPrePromptModal,
    setShowPrePromptModal,
    movedLocationAlert,
    confirmMovedLocation,
    requestDeviceLocationPermission,
    isServiceable,
    isGateReady,
    savedLocation = null as any,
    hasConfirmedLocation = false,
  } = useLocation() as any;

  // Shopping routes that must be gated when unserviceable
  const isShoppingRoute =
    pathname === '/' ||
    pathname.startsWith('/category') ||
    pathname.startsWith('/product') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/monthly-list') ||
    pathname.startsWith('/order-again');

  return (
    <>
      {/* If location gate resolved to Unserviceable (> 30 km) and user is on a shopping route:
          Show full-screen UnserviceablePage */}
      {isGateReady && !isServiceable && isShoppingRoute ? (
        <UnserviceablePage onChangeLocation={() => setIsModalOpen(true)} />
      ) : (
        children
      )}

      {/* 1. Location Permission Denied Popup (Modelled on location-popup.png) */}
      <LocationPermissionDeniedModal
        isOpen={showDeniedPopup}
        onEnableDeviceLocation={requestDeviceLocationPermission}
        onSelectManually={() => {
          setShowDeniedPopup(false);
          setIsModalOpen(true);
        }}
      />

      {/* 2. Short Friendly Pre-Prompt Screen before browser prompt */}
      <PrePromptModal
        isOpen={showPrePromptModal}
        onContinueToGps={requestDeviceLocationPermission}
        onSelectManually={() => {
          setShowPrePromptModal(false);
          setIsModalOpen(true);
        }}
      />

      {/* 3. Select Location Manually Modal (Search box + Draggable Map Pin + Confirm) */}
      <ManualLocationModal
        isOpen={isModalOpen}
        isMandatory={!hasConfirmedLocation}
        onClose={() => {
          if (!hasConfirmedLocation) {
            // Cannot dismiss location without selection: return to pre-prompt
            setIsModalOpen(false);
            setShowPrePromptModal(true);
          } else {
            setIsModalOpen(false);
          }
        }}
      />

      {/* 4. GPS Re-detection movement confirmation (> 500m moved) */}
      {movedLocationAlert && (
        <LocationMovedBanner
          isOpen={Boolean(movedLocationAlert)}
          savedLocation={movedLocationAlert.savedLoc}
          detectedLocation={movedLocationAlert.detectedLoc}
          distanceMovedMeters={movedLocationAlert.distanceMovedMeters}
          onConfirmNew={() => confirmMovedLocation(true)}
          onKeepSaved={() => confirmMovedLocation(false)}
        />
      )}
    </>
  );
}
