'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Home,
  Building2,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { addressService } from '@/services/addressService';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/phone';
import { STORE_CONFIG } from '@/config/store';
import type { Address } from '@/types';

interface AddressBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (savedAddress: Address) => void;
  initialAddress?: Address | null;
}

export default function AddressBottomSheet({
  isOpen,
  onClose,
  onAddressSaved,
  initialAddress,
}: AddressBottomSheetProps) {
  const { detectLocation, isDetecting: isDetectingGPS } = useLocation();
  const { user, supabaseUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState<string>(STORE_CONFIG.address.city || 'Nellore');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [accuracy, setAccuracy] = useState<number | undefined>(undefined);

  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  // Initialize or reset form state when opening or when initialAddress changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setGpsSuccess(false);
      if (initialAddress) {
        setFullName(initialAddress.fullName || user?.name || '');
        setPhone(sanitizeIndianPhone(initialAddress.mobileNumber || initialAddress.phone || user?.phone || ''));
        setHouseFlat(initialAddress.houseFlat || '');
        setStreetArea(initialAddress.streetArea || '');
        setLandmark(initialAddress.landmark || '');
        setCity(initialAddress.city || STORE_CONFIG.address.city || 'Nellore');
        setPincode(initialAddress.pincode || '');
        setAddressType(initialAddress.type || 'Home');
        setLatitude(initialAddress.latitude);
        setLongitude(initialAddress.longitude);
        setAccuracy(initialAddress.accuracy);
        if (initialAddress.latitude && initialAddress.longitude) {
          setGpsSuccess(true);
        }
      } else {
        setFullName(user?.name || '');
        setPhone(user?.phone ? sanitizeIndianPhone(user.phone) : '');
        setHouseFlat('');
        setStreetArea('');
        setLandmark('');
        setCity(STORE_CONFIG.address.city || 'Nellore');
        setPincode('');
        setAddressType('Home');
        setLatitude(undefined);
        setLongitude(undefined);
        setAccuracy(undefined);
      }
    }
  }, [isOpen, initialAddress, user]);

  // Handle "Use current location" button click
  const handleUseCurrentLocation = async () => {
    setErrorMsg(null);
    setIsDetecting(true);
    try {
      const loc = await detectLocation();
      if (loc) {
        // Build clean human-readable street/area
        const rawParts = [loc.street, loc.area].filter(Boolean);
        const uniqueParts: string[] = [];
        rawParts.forEach((part) => {
          part.split(',').forEach((sub) => {
            const trimmed = sub.trim();
            if (
              trimmed &&
              !uniqueParts.some((p) => p.toLowerCase() === trimmed.toLowerCase()) &&
              trimmed.toLowerCase() !== (loc.city || '').toLowerCase()
            ) {
              uniqueParts.push(trimmed);
            }
          });
        });
        const cleanStreetArea = uniqueParts.join(', ');
        setStreetArea(cleanStreetArea || loc.street || loc.area || 'Trunk Road Area');
        setCity(loc.city || STORE_CONFIG.address.city || 'Nellore');
        if (loc.pincode) setPincode(loc.pincode);
        if (loc.lat && loc.lng) {
          setLatitude(loc.lat);
          setLongitude(loc.lng);
          setAccuracy(loc.accuracy);
          setGpsSuccess(true);
        }
      } else {
        setErrorMsg('Could not detect location. Please type your street address.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to capture GPS location. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle form submission and saving
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!houseFlat.trim()) {
      setErrorMsg('Please enter your House / Flat / Floor / Building name.');
      return;
    }

    if (!streetArea.trim()) {
      setErrorMsg('Please enter your Street / Area / Colony.');
      return;
    }

    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);

    setIsSaving(true);
    try {
      const addressId = initialAddress?.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newAddress: Address = {
        id: addressId,
        fullName: fullName.trim() || user?.name || 'Customer',
        mobileNumber: cleanPhone,
        phone: cleanPhone,
        houseFlat: houseFlat.trim(),
        streetArea: streetArea.trim(),
        landmark: landmark.trim(),
        city: city.trim() || STORE_CONFIG.address.city || 'Nellore',
        state: 'Andhra Pradesh',
        pincode: cleanPincode || '524003',
        type: addressType,
        isDefault: true,
        latitude,
        longitude,
        accuracy,
      };

      // Persist via addressService (LocalStorage + Supabase)
      await addressService.saveAddress(
        supabaseUser?.id || user?.id,
        user?.email || user?.phone,
        newAddress
      );

      // Save to sessionStorage for immediate checkout use
      sessionStorage.setItem('g1mart_checkout_address', JSON.stringify(newAddress));
      localStorage.setItem('g1mart_last_used_address', JSON.stringify(newAddress));

      // Callback to parent
      onAddressSaved(newAddress);

      // Automatic close as required
      onClose();
    } catch (err: any) {
      console.error('[AddressBottomSheet] Save error:', err);
      setErrorMsg('Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Slide-Up Bottom Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-sheet-title"
        className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-stone-200/80 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Grab Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 id="address-sheet-title" className="text-sm sm:text-base font-black text-stone-900 leading-tight">
                Delivery Doorstep Address
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Enter where you want your grocery order delivered
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Close address sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* 1. "Use current location" button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetecting || isDetectingGPS}
            className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/70 border border-emerald-300/80 text-[#1B5E20] text-xs font-black flex items-center justify-between hover:bg-emerald-100 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {isDetecting || isDetectingGPS ? (
                <Loader2 className="w-4 h-4 text-[#2E7D32] animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-[#2E7D32] fill-[#2E7D32]" />
              )}
              <span>
                {isDetecting || isDetectingGPS
                  ? 'Detecting GPS location…'
                  : 'Use Current Location'}
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md text-emerald-800 shadow-2xs">
              Auto-Fill
            </span>
          </button>

          {/* GPS Locked Status Banner */}
          {gpsSuccess && latitude && longitude && (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Doorstep GPS Coordinates Captured</span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <form id="address-bottom-sheet-form" onSubmit={handleSave} className="space-y-3 text-xs">
            {/* House / Flat / Building * */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                House / Flat / Floor / Building <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={houseFlat}
                onChange={(e) => setHouseFlat(e.target.value)}
                placeholder="e.g. Flat 302, Sri Sai Residency, 3rd Floor"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 font-medium"
              />
            </div>

            {/* Street / Area / Colony * */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Street / Area / Colony <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={streetArea}
                onChange={(e) => setStreetArea(e.target.value)}
                placeholder="e.g. Magunta Layout / Main Road"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 font-medium"
              />
            </div>

            {/* Landmark (Optional) */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near SBI ATM / Opposite Water Tank"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 font-medium"
              />
            </div>

            {/* Phone Number * */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(sanitizeIndianPhone(e.target.value))}
                  placeholder="98765 43210"
                  className="w-full h-10 pl-11 pr-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 font-bold"
                />
              </div>
            </div>

            {/* Full Name & PIN Code in 2 cols */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32] font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="524003"
                  className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32] font-medium"
                />
              </div>
            </div>

            {/* Address Tag Selector: Home / Work / Other */}
            <div>
              <label className="font-bold text-stone-700 block mb-1.5">Save As</label>
              <div className="flex items-center gap-2">
                {(['Home', 'Work', 'Other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      addressType === type
                        ? 'border-[#2E7D32] bg-[#2E7D32] text-white shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {type === 'Home' && <Home className="w-3.5 h-3.5" />}
                    {type === 'Work' && <Building2 className="w-3.5 h-3.5" />}
                    {type === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Sheet Footer with Save Button */}
        <div className="p-3.5 border-t border-stone-200 bg-stone-50/70 shrink-0">
          <button
            type="submit"
            form="address-bottom-sheet-form"
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Address…</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Address &amp; Deliver Here</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
