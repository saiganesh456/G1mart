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
  CheckCircle2,
  UserCheck,
  Plus,
  Minus,
  Store,
  Truck,
  Check,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/phone';
import { authService } from '@/services/authService';
import { addressService } from '@/services/addressService';
import AddressBottomSheet from '@/components/checkout/AddressBottomSheet';
import type { Address } from '@/types';
import type { DistanceServiceResult } from '@/types/deliveryZone';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartItemCount, cartSubtotal, updateCartQuantity, removeFromCart } = useCart();
  const { currentLocation } = useLocation();
  const { user, supabaseUser, isLoggedIn, setLocalUser, signOut } = useAuth();

  // Fulfillment selector: Delivery vs Pickup
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');

  // Address bottom sheet & saved address state
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  // Address-specific distance & zone resolution
  const [addressDistanceData, setAddressDistanceData] = useState<DistanceServiceResult | null>(null);
  const [isResolvingDistance, setIsResolvingDistance] = useState(false);

  // Delivery slot selection
  const [selectedSlot, setSelectedSlot] = useState('Standard Delivery');

  // Auth gate state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Load saved address on initial mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialAddress = async () => {
      try {
        setIsLoadingAddress(true);
        const list = await addressService.getAddresses(
          supabaseUser?.id || user?.id,
          user?.email || user?.phone
        );
        if (!isMounted) return;

        if (list.length > 0) {
          let active = list.find((a) => a.isDefault) || list[0];
          try {
            const lastUsed = localStorage.getItem('g1mart_last_used_address');
            if (lastUsed) {
              const parsed = JSON.parse(lastUsed);
              const match = list.find((a) => a.id === parsed.id);
              if (match) active = match;
            }
          } catch {}
          setSavedAddress(active);
        } else {
          try {
            const sessionRaw = sessionStorage.getItem('g1mart_checkout_address');
            if (sessionRaw) {
              setSavedAddress(JSON.parse(sessionRaw));
            }
          } catch {}
        }
      } catch (err) {
        console.warn('[Checkout] Failed to load address:', err);
      } finally {
        if (isMounted) setIsLoadingAddress(false);
      }
    };

    loadInitialAddress();

    return () => {
      isMounted = false;
    };
  }, [user, supabaseUser]);

  // Re-evaluate distance when saved address has specific coordinates that differ from currentLocation
  useEffect(() => {
    let isMounted = true;

    if (orderType === 'delivery' && savedAddress?.latitude && savedAddress?.longitude) {
      const addrLat = savedAddress.latitude;
      const addrLng = savedAddress.longitude;
      const curLat = currentLocation.lat || 0;
      const curLng = currentLocation.lng || 0;

      // If coordinates are identical or within 100m of currentLocation, reuse currentLocation
      if (Math.abs(addrLat - curLat) < 0.001 && Math.abs(addrLng - curLng) < 0.001) {
        setAddressDistanceData(null);
      } else {
        setIsResolvingDistance(true);
        fetch(`/api/location/distance?lat=${addrLat}&lng=${addrLng}`)
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data.success && data.data) {
              setAddressDistanceData(data.data);
            }
          })
          .catch((err) => {
            console.warn('[Checkout] Failed to resolve address distance:', err);
          })
          .finally(() => {
            if (isMounted) setIsResolvingDistance(false);
          });
      }
    } else {
      setAddressDistanceData(null);
    }

    return () => {
      isMounted = false;
    };
  }, [savedAddress, currentLocation, orderType]);

  // Auth Handlers
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
    setAuthError(null);
    if (!savedAddress && orderType === 'delivery') {
      setIsAddressSheetOpen(true);
    }
  };

  // Callback when address is saved in bottom sheet
  const handleAddressSaved = (addr: Address) => {
    setSavedAddress(addr);
    setIsAddressSheetOpen(false);
  };

  // --- Phase 4 Business Rules & Distance Zone Calculations ---
  const isPickup = orderType === 'pickup';

  // Active distance in km (pickup is exempt)
  const activeDistanceKm = isPickup
    ? 0
    : (addressDistanceData?.distance_km ?? currentLocation.distance_km ?? currentLocation.distanceKm ?? 2);

  // Active ETA in minutes
  const activeEtaMins = isPickup
    ? 30
    : (addressDistanceData?.eta_min ?? currentLocation.eta_min ?? currentLocation.etaMin ?? 15);

  // Distance-based minimum order: Pickup skips the minimum (₹0)
  const activeMinOrder = isPickup
    ? 0
    : (addressDistanceData?.min_order ?? currentLocation.min_order ?? currentLocation.zone?.min_order ?? 500);

  // Serviceability status (30 km road distance limit)
  const isAddressServiceable = isPickup
    ? true
    : (addressDistanceData ? addressDistanceData.serviceable : (currentLocation.serviceable ?? (activeDistanceKm <= 30)));

  // Minimum is checked against ITEM SUBTOTAL after discounts (never including COD fee)
  const isBelowMinOrder = !isPickup && cartSubtotal < activeMinOrder;
  const shortfallAmount = Math.max(0, activeMinOrder - cartSubtotal);
  const minOrderProgress = Math.min(100, Math.round((cartSubtotal / (activeMinOrder || 1)) * 100));

  // Delivery is FREE in all zones
  const deliveryFee = 0;
  const grandTotal = cartSubtotal + deliveryFee;

  // Place Order / Proceed to Payment Handler
  const handlePlaceOrder = () => {
    if (!isLoggedIn) {
      setAuthError('Account registration is required before placing order. Please sign in with Google or enter your mobile number.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If delivery and NO saved address: open address bottom sheet
    if (orderType === 'delivery' && !savedAddress) {
      setIsAddressSheetOpen(true);
      return;
    }

    // Distance serviceability check (max 30 km)
    if (orderType === 'delivery' && !isAddressServiceable) {
      alert('Selected delivery address is beyond our 30 km serviceable radius. Please select Store Pickup or choose another address.');
      return;
    }

    // Minimum order check (Phase 4)
    if (isBelowMinOrder) {
      alert(`Minimum order for your delivery zone (${activeDistanceKm} km) is ₹${activeMinOrder}. Please add ₹${shortfallAmount} more to proceed.`);
      return;
    }

    // Prepare checkout payload
    const checkoutData = {
      ...(savedAddress || {}),
      orderType,
      selectedSlot: orderType === 'pickup' ? 'Store Pickup' : selectedSlot,
      fullName: savedAddress?.fullName || user?.name || 'Customer',
      phone: savedAddress?.phone || savedAddress?.mobileNumber || user?.phone || '9876543210',
      mobileNumber: savedAddress?.phone || savedAddress?.mobileNumber || user?.phone || '9876543210',
      distance_km: activeDistanceKm,
      zone_min_order: activeMinOrder,
      eta_min: activeEtaMins,
      subtotal: cartSubtotal,
      delivery_fee: 0,
      latitude: savedAddress?.latitude ?? currentLocation.lat,
      longitude: savedAddress?.longitude ?? currentLocation.lng,
    };

    try {
      sessionStorage.setItem('g1mart_checkout_address', JSON.stringify(checkoutData));
      if (savedAddress) {
        localStorage.setItem('g1mart_last_used_address', JSON.stringify(savedAddress));
      }
    } catch {}

    // Proceed to Payment step (Phase 5)
    router.push('/payment');
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

  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5 pb-32 pt-2 sm:pt-4 px-3 sm:px-4 box-border min-w-0 overflow-x-hidden">
      {/* Top Header */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.replace('/cart');
            }
          }}
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 shrink-0 cursor-pointer"
          aria-label="Back to Cart"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-black text-[#212121] truncate">Checkout</h1>
          <p className="text-[11px] text-stone-500 truncate">
            {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} · ₹{cartSubtotal}
          </p>
        </div>
      </div>

      {/* Account Verification Gate - ONLY if not logged in */}
      {!isLoggedIn ? (
        <div className="bg-white rounded-2xl border-2 border-[#2E7D32]/40 p-3.5 sm:p-4 shadow-sm space-y-3 animate-in fade-in min-w-0 w-full box-border">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <UserCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
              <h2 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider truncate">
                Step 1: Account Sign-In / Register
              </h2>
            </div>
            <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
              Required to Book
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Sign in with Google or enter your mobile number. Your cart items are preserved.
          </p>

          {authError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* Quick Mobile Form */}
          <form onSubmit={handleQuickAuth} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold outline-none focus:border-[#2E7D32] focus:bg-white box-border"
              />
              <div className="relative min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(sanitizeIndianPhone(e.target.value))}
                  placeholder="98765 43210"
                  className="w-full h-10 pl-11 pr-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold outline-none focus:border-[#2E7D32] focus:bg-white box-border"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={quickPhone.length !== 10}
              className="w-full h-10 bg-[#1A2E1C] hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sign In with Mobile &amp; Continue</span>
            </button>
          </form>

          {/* Google Sign In Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-10 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors active:scale-[0.99] cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      ) : (
        /* Verified Account Badge - shown when signed in */
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-stone-900 block truncate">
                Signed in as {user?.name || 'Customer'}
              </span>
              <span className="text-[11px] text-emerald-800 font-medium block truncate">
                {user?.phone ? `+91 ${user.phone}` : user?.email || 'Verified Account'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-[11px] font-bold text-stone-500 hover:text-stone-700 underline shrink-0 cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      )}

      {/* 1. Fulfillment Toggle: Home Delivery vs Store Pickup */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs space-y-2 min-w-0 w-full box-border">
        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block">
          Order Fulfillment Type
        </label>
        <div className="grid grid-cols-2 gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0 ${
              orderType === 'delivery'
                ? 'border-[#2E7D32] bg-emerald-50/50 text-[#1B5E20] ring-1 ring-[#2E7D32]'
                : 'border-stone-200 hover:border-stone-300 text-stone-600'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                orderType === 'delivery' ? 'bg-[#2E7D32] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-xs block leading-tight truncate">Home Delivery</span>
              <span className="text-[10px] text-stone-500 font-medium block truncate">To doorstep</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('pickup')}
            className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0 ${
              orderType === 'pickup'
                ? 'border-[#2E7D32] bg-emerald-50/50 text-[#1B5E20] ring-1 ring-[#2E7D32]'
                : 'border-stone-200 hover:border-stone-300 text-stone-600'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                orderType === 'pickup' ? 'bg-[#2E7D32] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-xs block leading-tight truncate">Store Pickup</span>
              <span className="text-[10px] text-stone-500 font-medium block truncate">Free at G1 Mart</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Small Line Address in Checkout */}
      {orderType === 'delivery' ? (
        <div className="space-y-1.5 min-w-0 w-full box-border">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">
              Doorstep Delivery Address
            </span>
            {savedAddress && (
              <button
                type="button"
                onClick={() => setIsAddressSheetOpen(true)}
                className="text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer"
              >
                Change
              </button>
            )}
          </div>

          {savedAddress ? (
            /* Show the saved address as a small line in checkout */
            <div
              onClick={() => setIsAddressSheetOpen(true)}
              className="p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-[#2E7D32] transition-colors flex items-center justify-between gap-2 shadow-2xs cursor-pointer group min-w-0 w-full box-border"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-stone-900 text-xs truncate">
                      {savedAddress.houseFlat}, {savedAddress.streetArea}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 uppercase shrink-0">
                      {savedAddress.type || 'Home'}
                    </span>
                    {activeDistanceKm > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-[#1B5E20] shrink-0">
                        {activeDistanceKm} km
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                    {savedAddress.landmark ? `Near ${savedAddress.landmark}, ` : ''}
                    {savedAddress.city} · Ph: +91 {savedAddress.phone || savedAddress.mobileNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#2E7D32] group-hover:translate-x-0.5 transition-transform shrink-0">
                <span>Edit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            /* No address saved yet — small line prompt */
            <div
              onClick={() => setIsAddressSheetOpen(true)}
              className="p-3 rounded-2xl bg-white border border-dashed border-stone-300 hover:border-[#2E7D32] hover:bg-emerald-50/20 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs min-w-0 w-full box-border"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-stone-800 text-xs block leading-tight truncate">
                    No delivery address added
                  </span>
                  <span className="text-[11px] text-stone-500 truncate block">Tap to set your doorstep address</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddressSheetOpen(true);
                }}
                className="px-2.5 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                + Add Address
              </button>
            </div>
          )}

          {/* Unserviceable Warning if address is over 30 km */}
          {!isAddressServiceable && orderType === 'delivery' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 animate-in fade-in min-w-0 w-full box-border">
              <div className="flex items-center gap-1.5 text-rose-800 text-xs font-black">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Delivery Not Available ({activeDistanceKm} km from store)</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-tight">
                Maximum delivery radius is 30 km. You can still place your order by choosing Store Pickup!
              </p>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className="mt-1 px-3 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg transition-transform active:scale-95 cursor-pointer"
              >
                Switch to Store Pickup (Free)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Store Pickup Small Line (skip address requirement for pickup) */
        <div className="space-y-1.5 min-w-0 w-full box-border">
          <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1 block">
            Pickup Location
          </span>
          <div className="p-3 rounded-2xl bg-white border border-stone-200/90 flex items-center justify-between gap-2 shadow-2xs min-w-0 w-full box-border">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-stone-900 text-xs block leading-tight truncate">
                  G1 Mart Supermarket
                </span>
                <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                  {STORE_CONFIG.address.line1}, {STORE_CONFIG.address.city} · Ready in 30 mins
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
              FREE PICKUP
            </span>
          </div>
        </div>
      )}

      {/* PHASE 4: Distance-Based Minimum Order Banner (Shown ONLY at Checkout when below minimum) */}
      {isBelowMinOrder && (
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50/60 border-2 border-amber-400/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3 animate-in fade-in min-w-0 w-full box-border">
          <div className="flex items-start justify-between gap-2.5 min-w-0">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-black text-amber-950 leading-tight">
                  Add ₹{shortfallAmount} more for free delivery
                </h3>
                <p className="text-[11px] text-stone-600 font-medium mt-1 leading-relaxed">
                  Min order for your area ({activeDistanceKm > 0 ? `${activeDistanceKm} km` : 'zone'}) is{' '}
                  <strong className="text-stone-900">₹{activeMinOrder}</strong>. Delivery is 100% FREE!
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add items</span>
            </Link>
          </div>

          {/* Live Progress Bar (Updates live as cart changes) */}
          <div className="space-y-1 min-w-0">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-amber-900 gap-2">
              <span className="truncate">Delivery Threshold Progress</span>
              <span className="shrink-0 tabular-nums">
                ₹{cartSubtotal} / ₹{activeMinOrder} ({minOrderProgress}%)
              </span>
            </div>
            <div className="h-2 w-full bg-stone-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] transition-all duration-300 rounded-full"
                style={{ width: `${minOrderProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: At or Above Minimum: Delivery ETA and Free Delivery Banner */}
      {!isBelowMinOrder && (
        <div className="bg-emerald-50/90 border border-[#2E7D32]/30 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex items-center justify-between gap-2.5 animate-in fade-in min-w-0 w-full box-border">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
              {orderType === 'pickup' ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-emerald-950 truncate">
                  {orderType === 'pickup' ? 'Ready for Store Pickup' : `Delivery in ~${activeEtaMins} mins`}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.2 bg-emerald-600 text-white rounded-full shrink-0">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium truncate mt-0.5">
                {orderType === 'pickup'
                  ? 'Packaged at G1 Mart Padarupalli within 30 mins'
                  : `Free doorstep delivery to your location (${activeDistanceKm} km zone)`}
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#2E7D32] shrink-0 whitespace-nowrap">
            ₹0 Delivery Fee
          </span>
        </div>
      )}

      {/* Quick Basket Adjuster (Allows customer to adjust quantities right on checkout to meet minimum) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-3.5 shadow-2xs space-y-2.5 min-w-0 w-full box-border">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider truncate">
              Basket Items ({cartItemCount})
            </h2>
          </div>
          <Link href="/cart" className="text-[11px] font-bold text-[#2E7D32] hover:underline shrink-0 whitespace-nowrap">
            Edit Full Cart
          </Link>
        </div>

        <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
          {cart.map((item) => {
            const linePrice = item.variant?.price || item.product.price;
            return (
              <div
                key={`${item.product.id}-${item.variantId || ''}`}
                className="py-2 flex items-center justify-between gap-2 text-xs min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="font-bold text-stone-900 hover:text-[#2E7D32] transition-colors truncate text-[11px] sm:text-xs block"
                    title={`View ${item.product.name}`}
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[10px] text-stone-500 truncate">
                    {item.variant?.size_label || item.product.unit} · ₹{linePrice} each
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeFromCart(item.product.id, item.variantId);
                        } else {
                          updateCartQuantity(item.product.id, item.quantity - 1, item.variantId);
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-white rounded transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-black text-xs tabular-nums text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity + 1, item.variantId)
                      }
                      className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-white rounded transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                  <span className="font-bold text-stone-900 text-xs tabular-nums min-w-[38px] text-right shrink-0">
                    ₹{linePrice * item.quantity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Delivery / Pickup Window Selection */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-3.5 shadow-2xs space-y-2.5 min-w-0 w-full box-border">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
          <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider truncate">
            {orderType === 'pickup' ? 'Pickup Window' : 'Delivery Slot'}
          </h2>
        </div>

        {orderType === 'delivery' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs min-w-0">
            {[
              {
                id: 'Standard Delivery',
                title: 'Standard Delivery',
                subtitle: `Estimated ~${activeEtaMins} mins`,
              },
              { id: 'Morning Delivery', title: 'Morning Slot', subtitle: '10:00 AM – 1:00 PM' },
              { id: 'Afternoon Delivery', title: 'Afternoon Slot', subtitle: '1:00 PM – 5:00 PM' },
            ].map((slot) => (
              <label
                key={slot.id}
                className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all min-w-0 ${
                  selectedSlot === slot.id
                    ? 'border-[#2E7D32] bg-[#2E7D32]/5 ring-1 ring-[#2E7D32]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[#212121] truncate">{slot.title}</span>
                  <input
                    type="radio"
                    name="deliverySlot"
                    checked={selectedSlot === slot.id}
                    onChange={() => setSelectedSlot(slot.id)}
                    className="accent-[#2E7D32] shrink-0"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 truncate">{slot.subtitle}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 flex items-center justify-between gap-2 min-w-0">
            <span className="font-bold truncate">Store Packaging Window:</span>
            <span className="text-emerald-700 font-extrabold shrink-0 whitespace-nowrap">Ready in 30–45 mins</span>
          </div>
        )}
      </div>

      {/* 4. Bill Summary Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-3.5 shadow-2xs space-y-2.5 min-w-0 w-full box-border">
        <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
          Bill Details ({cartItemCount} items)
        </h2>

        <div className="space-y-2 text-xs text-stone-600 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="truncate">Items Subtotal</span>
            <span className="font-bold text-[#212121] tabular-nums shrink-0">₹{cartSubtotal}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="truncate">Packing &amp; Bag</span>
            <span className="font-bold text-[#2E7D32] shrink-0">FREE</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="truncate">Delivery Fee</span>
            <span className="font-bold text-[#2E7D32] shrink-0">FREE</span>
          </div>

          {orderType === 'delivery' && (
            <div className="flex justify-between items-center gap-2 text-[11px] pt-1 text-stone-500 border-t border-dashed border-stone-100 min-w-0">
              <span className="truncate">Zone Min Order ({activeDistanceKm > 0 ? `${activeDistanceKm} km` : 'distance'})</span>
              <span className={`font-bold shrink-0 whitespace-nowrap ${isBelowMinOrder ? 'text-amber-700' : 'text-emerald-700'}`}>
                ₹{activeMinOrder} {isBelowMinOrder ? `(Need ₹${shortfallAmount} more)` : '(Met ✓)'}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-stone-100 flex justify-between items-center gap-2 font-black text-sm text-[#212121]">
            <span>To Pay</span>
            <span className="tabular-nums shrink-0">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
        <span className="truncate">Authentic in-store billing &amp; verified FMCG stock</span>
      </div>

      {/* 5. Sticky Bottom CTA: Place Order / Proceed to Payment (Phase 4) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-3 shadow-lg box-border">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3 min-w-0 w-full box-border">
          <div className="flex flex-col text-left min-w-0 shrink-0">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TOTAL</span>
            <span className="text-base sm:text-lg font-black text-[#212121] tabular-nums">₹{grandTotal}</span>
          </div>

          {isBelowMinOrder ? (
            <button
              type="button"
              disabled
              className="h-11 sm:h-12 px-4 sm:px-5 bg-stone-200 text-stone-500 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-not-allowed opacity-80 shrink-0 whitespace-nowrap"
              title={`Add ₹${shortfallAmount} more to meet the ₹${activeMinOrder} minimum for your area`}
            >
              <span>Add ₹{shortfallAmount} More</span>
            </button>
          ) : !isAddressServiceable && orderType === 'delivery' ? (
            <button
              type="button"
              disabled
              className="h-11 sm:h-12 px-4 sm:px-5 bg-rose-100 text-rose-700 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-not-allowed shrink-0 whitespace-nowrap"
            >
              <span>Outside 30 km Area</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="h-11 sm:h-12 px-5 sm:px-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>Proceed to Payment</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* 6. Slide-Up Bottom Sheet for Doorstep Address */}
      <AddressBottomSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        onAddressSaved={handleAddressSaved}
        initialAddress={savedAddress}
      />
    </div>
  );
}
