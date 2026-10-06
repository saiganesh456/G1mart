'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Navigation,
  CheckCircle2,
  UserCheck,
  Plus,
  Home,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/phone';
import { authService } from '@/services/authService';
import { addressService } from '@/services/addressService';
import { Address } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartItemCount, cartSubtotal } = useCart();
  const { currentLocation, detectLocation, isDetecting } = useLocation();
  const { user, supabaseUser, isLoggedIn, setLocalUser } = useAuth();

  // Auth gate state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Saved addresses state (Flipkart / Blinkit pattern)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Address Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [houseFlat, setHouseFlat] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState<string>(STORE_CONFIG.address.city || 'Nellore');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('Standard Delivery');
  const [autoFilled, setAutoFilled] = useState(false);

  // 1. Fetch saved addresses on mount or when user changes
  useEffect(() => {
    let isMounted = true;

    const loadSavedAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const list = await addressService.getAddresses(supabaseUser?.id || user?.id, user?.email || user?.phone);
        if (!isMounted) return;

        setSavedAddresses(list);

        if (list.length > 0) {
          // Identify the most relevant address: last used address or default or first
          let active = list.find((a) => a.isDefault) || list[0];
          try {
            const lastUsed = localStorage.getItem('g1mart_last_used_address');
            if (lastUsed) {
              const parsed = JSON.parse(lastUsed);
              const match = list.find((a) => a.id === parsed.id);
              if (match) active = match;
            }
          } catch {}

          setSelectedAddressId(active.id);
          setFullName(active.fullName || user?.name || '');
          setPhone(sanitizeIndianPhone(active.mobileNumber || active.phone || user?.phone || ''));
          setHouseFlat(active.houseFlat || '');
          setStreetArea(active.streetArea || '');
          setLandmark(active.landmark || '');
          setCity(active.city || STORE_CONFIG.address.city || 'Nellore');
          setPincode(active.pincode || '');
          setAddressType(active.type || 'Home');
          if (active.deliveryInstructions) setDeliveryInstructions(active.deliveryInstructions);
          if (active.latitude) setLatitude(active.latitude);
          if (active.longitude) setLongitude(active.longitude);
          setIsAddingNewAddress(false);
        } else {
          // No saved addresses found - show address form
          setIsAddingNewAddress(true);
          if (user?.name && !fullName) setFullName(user.name);
          if (user?.phone && !phone) setPhone(sanitizeIndianPhone(user.phone));

          // Also check sessionStorage
          try {
            const saved = sessionStorage.getItem('g1mart_checkout_address');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.fullName) setFullName(parsed.fullName);
              if (parsed.phone) setPhone(sanitizeIndianPhone(parsed.phone));
              if (parsed.houseFlat) setHouseFlat(parsed.houseFlat);
              if (parsed.streetArea) setStreetArea(parsed.streetArea);
              if (parsed.landmark) setLandmark(parsed.landmark);
              if (parsed.city) setCity(parsed.city);
              if (parsed.pincode) setPincode(parsed.pincode);
              if (parsed.deliveryInstructions) setDeliveryInstructions(parsed.deliveryInstructions);
              if (parsed.latitude) setLatitude(parsed.latitude);
              if (parsed.longitude) setLongitude(parsed.longitude);
            }
          } catch {}
        }
      } catch (e) {
        console.warn('[Checkout] Failed to load saved addresses:', e);
        setIsAddingNewAddress(true);
      } finally {
        if (isMounted) setIsLoadingAddresses(false);
      }
    };

    loadSavedAddresses();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle selecting an existing saved address
  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName || user?.name || '');
    setPhone(sanitizeIndianPhone(addr.mobileNumber || addr.phone || user?.phone || ''));
    setHouseFlat(addr.houseFlat || '');
    setStreetArea(addr.streetArea || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || STORE_CONFIG.address.city || 'Nellore');
    setPincode(addr.pincode || '');
    setAddressType(addr.type || 'Home');
    if (addr.deliveryInstructions) setDeliveryInstructions(addr.deliveryInstructions);
    if (addr.latitude) setLatitude(addr.latitude);
    if (addr.longitude) setLongitude(addr.longitude);
    setIsAddingNewAddress(false);
  };

  // Switch to Add New Address mode
  const handleStartAddNewAddress = () => {
    setIsAddingNewAddress(true);
    setSelectedAddressId(null);
    if (user?.name) setFullName(user.name);
    if (user?.phone) setPhone(sanitizeIndianPhone(user.phone));
    setHouseFlat('');
    setStreetArea('');
    setLandmark('');
    setPincode('');
    setLatitude(undefined);
    setLongitude(undefined);
    setAutoFilled(false);
  };

  // Auto-detect GPS button handler
  const handleAutoFillClick = async () => {
    const loc = await detectLocation();
    if (loc) {
      // Build a clean, human-readable Street/Area without road codes like MDR032
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
      setStreetArea(cleanStreetArea || loc.street || loc.area);
      setCity(loc.city || STORE_CONFIG.address.city || 'Nellore');
      if (loc.pincode) setPincode(loc.pincode);
      if (loc.lat && loc.lng) {
        setLatitude(loc.lat);
        setLongitude(loc.lng);
      }
      setAutoFilled(true);
    }
  };

  if (cartItemCount === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <p className="text-stone-500 text-sm">Your cart is empty.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAuthError(null);
      const res = await authService.signInWithGoogle('/checkout');
      if (!res.success) {
        setAuthError(res.error || 'Google sign-in could not be completed.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeIndianPhone(quickPhone);
    if (!isValidIndianPhone(clean)) {
      setAuthError('Please enter a valid 10-digit mobile number (starts with 6, 7, 8, or 9)');
      return;
    }
    const name = quickName.trim() || 'Valued Customer';
    setLocalUser({
      name,
      phone: clean,
      email: '',
      avatar: '',
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    });
    setFullName(name);
    setPhone(clean);
    setAuthError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setAuthError('Account registration is required before booking. Please sign in with Google or enter your mobile number above.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      setPhoneError('Please enter a valid 10-digit mobile number (starts with 6, 7, 8, or 9)');
      return;
    }
    setPhoneError(null);

    const cleanPincode = pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      alert('Please enter a valid 6-digit PIN code');
      return;
    }

    if (!houseFlat.trim()) {
      alert('Please enter your House / Flat / Floor / Building');
      return;
    }

    if (!streetArea.trim()) {
      alert('Please enter your Street / Area / Colony');
      return;
    }

    // Prepare address object
    const addressIdToUse = isAddingNewAddress
      ? `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : selectedAddressId || `addr-${Date.now()}`;

    const addressRecord: Address = {
      id: addressIdToUse,
      fullName: fullName.trim(),
      mobileNumber: cleanPhone,
      phone: cleanPhone,
      houseFlat: houseFlat.trim(),
      streetArea: streetArea.trim(),
      landmark: landmark.trim(),
      city: city.trim() || STORE_CONFIG.address.city || 'Nellore',
      state: 'Andhra Pradesh',
      pincode: cleanPincode,
      type: addressType,
      isDefault: true,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      latitude,
      longitude,
    };

    /**
     * Persist to permanent storage & session
     */
    try {
      // 1. Save to addressService (LocalStorage + Supabase database)
      await addressService.saveAddress(supabaseUser?.id || user?.id, user?.email || user?.phone, addressRecord);

      // 2. Save to sessionStorage for payment flow
      sessionStorage.setItem(
        'g1mart_checkout_address',
        JSON.stringify({
          ...addressRecord,
          selectedSlot,
        })
      );

      // 3. Save to localStorage last used
      localStorage.setItem('g1mart_last_used_address', JSON.stringify(addressRecord));
    } catch (err) {
      console.warn('[Checkout] Failed to persist address:', err);
    }

    router.push('/payment');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">Checkout</h1>
      </div>

      {/* Account Authentication Gate - ONLY shown if NOT logged in */}
      {!isLoggedIn && (
        <div className="bg-white rounded-2xl border-2 border-[#2E7D32]/40 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                Account Required to Book Order
              </h2>
            </div>
            <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              Mandatory Sign-Up
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Quick-commerce booking requires an account so our delivery riders can verify your order and provide live tracking updates.
          </p>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-12 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-colors active:scale-[0.99] shadow-2xs cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Quick Mobile Number Sign-In / Register */}
          <div className="relative my-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              OR QUICK MOBILE SIGN-UP
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full h-11 px-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold outline-none focus:border-[#2E7D32] focus:bg-white"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(sanitizeIndianPhone(e.target.value))}
                  placeholder="98765 43210"
                  className="w-full h-11 pl-11 pr-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold outline-none focus:border-[#2E7D32] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickAuth}
              disabled={quickPhone.length !== 10}
              className="w-full h-11 bg-[#1A2E1C] hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Mobile &amp; Unlock Address Form</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Delivery Address Card */}
        <div className={`bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-4 ${!isLoggedIn ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Delivery Doorstep Address
              </h2>
            </div>

            {/* Auto Detect Button if in form mode */}
            {isAddingNewAddress && (
              <button
                type="button"
                onClick={handleAutoFillClick}
                disabled={isDetecting || !isLoggedIn}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 fill-[#2E7D32]" />
                <span>{isDetecting ? 'Detecting...' : 'Auto-detect GPS'}</span>
              </button>
            )}
          </div>

          {/* 1. Blinkit / Flipkart Saved Addresses Selector (when user has saved addresses) */}
          {savedAddresses.length > 0 && !isAddingNewAddress ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Select Delivery Location ({savedAddresses.length} Saved)
                </span>
                <button
                  type="button"
                  onClick={handleStartAddNewAddress}
                  className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#2E7D32] bg-emerald-50/30 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      {/* Radio Check Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-xs">
                            {addr.fullName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 uppercase tracking-wider">
                            {addr.type || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-600 leading-snug">
                          {addr.houseFlat}, {addr.streetArea}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city} - {addr.pincode}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                          <span>Phone: +91 {addr.mobileNumber || addr.phone}</span>
                          {addr.deliveryInstructions && (
                            <span className="truncate italic max-w-xs text-stone-400">
                              Note: {addr.deliveryInstructions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Action Tile */}
              <button
                type="button"
                onClick={handleStartAddNewAddress}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-[#2E7D32] hover:bg-emerald-50/30 text-stone-600 hover:text-[#2E7D32] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Deliver to a Different Address</span>
              </button>
            </div>
          ) : (
            /* 2. Address Input Form (First-time user or adding new address) */
            <div className="space-y-3.5">
              {savedAddresses.length > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-700">Enter New Address</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (savedAddresses.length > 0) {
                        handleSelectAddress(savedAddresses[0]);
                      }
                    }}
                    className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer"
                  >
                    ← Choose from Saved Addresses ({savedAddresses.length})
                  </button>
                </div>
              )}

              {/* GPS Confirmation Pill */}
              {autoFilled && latitude && longitude && (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    <span className="font-semibold">
                      Exact GPS pin captured: ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                    </span>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded font-bold text-emerald-900 shadow-2xs">
                    RIDER NAV READY
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sai Ganesh"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={16}
                      value={phone}
                      onChange={(e) => {
                        const cleaned = sanitizeIndianPhone(e.target.value);
                        setPhone(cleaned);
                        if (phoneError && isValidIndianPhone(cleaned)) {
                          setPhoneError(null);
                        }
                      }}
                      onBlur={() => {
                        if (phone && !isValidIndianPhone(phone)) {
                          setPhoneError('Please enter a valid 10-digit mobile number');
                        } else {
                          setPhoneError(null);
                        }
                      }}
                      placeholder="98765 43210"
                      className={`w-full h-9 pl-11 pr-3 rounded-xl border outline-none transition-colors ${
                        phoneError ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300 focus:border-[#2E7D32]'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{phoneError}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">
                    House / Flat / Floor / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseFlat}
                    onChange={(e) => setHouseFlat(e.target.value)}
                    placeholder="e.g. Flat 302, Sri Sai Residency, 3rd Floor"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">
                    Street / Area / Colony *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                    placeholder="e.g. Tadipartipalem, Venkatachalam"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Water Tank / Near Temple"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 524321"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>

                {/* Address Type Tag Selector */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1.5">Save Address As</label>
                  <div className="flex items-center gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
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

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">
                    Delivery Instructions for Rider (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Ring the bell twice / Leave at security gate"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Slot Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Clock className="w-4 h-4 text-[#2E7D32]" />
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Delivery Window
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {[
              {
                id: 'Standard Delivery',
                title: 'Standard Delivery',
                subtitle: currentLocation.zone?.estimatedDeliveryTimeText || STORE_CONFIG.delivery.cityEtaText,
              },
              { id: 'Morning Delivery', title: 'Morning Slot', subtitle: '7:00 AM – 10:00 AM' },
              { id: 'Evening Delivery', title: 'Evening Slot', subtitle: '5:00 PM – 8:00 PM' },
            ].map((slot) => (
              <label
                key={slot.id}
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  selectedSlot === slot.id
                    ? 'border-[#2E7D32] bg-[#2E7D32]/5 ring-1 ring-[#2E7D32]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#212121]">{slot.title}</span>
                  <input
                    type="radio"
                    name="deliverySlot"
                    checked={selectedSlot === slot.id}
                    onChange={() => setSelectedSlot(slot.id)}
                    className="accent-[#2E7D32]"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1">{slot.subtitle}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary & Submit Button */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
            Order Summary ({cartItemCount} items)
          </h2>

          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Total (Estimated)</span>
              <span className="font-bold text-[#212121]">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-emerald-700 font-semibold">
                {currentLocation.zone?.deliveryFee !== undefined
                  ? `₹${currentLocation.zone.deliveryFee}`
                  : 'Calculated on Server'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isLoggedIn}
            className={`w-full h-12 rounded-xl font-bold text-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              isLoggedIn
                ? 'bg-[#2E7D32] hover:bg-[#1b5e20] text-white cursor-pointer shadow-md'
                : 'bg-stone-300 text-stone-600 cursor-not-allowed'
            }`}
          >
            <span>{isLoggedIn ? 'Continue to Payment Selection' : 'Please Sign In or Register to Continue'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
