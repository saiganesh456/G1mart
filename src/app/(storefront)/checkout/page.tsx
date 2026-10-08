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
  Store,
  Truck,
  Check,
  ChevronRight,
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartItemCount, cartSubtotal } = useCart();
  const { currentLocation } = useLocation();
  const { user, supabaseUser, isLoggedIn, setLocalUser } = useAuth();

  // Fulfillment selector: Delivery vs Pickup
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');

  // Address bottom sheet & saved address state
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

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
          // Priority: last used address or default or first
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
          // Check session storage
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
  };

  // Callback when address is saved in bottom sheet
  const handleAddressSaved = (addr: Address) => {
    setSavedAddress(addr);
    setIsAddressSheetOpen(false);
  };

  // Place Order / Proceed to Payment Handler
  const handlePlaceOrder = () => {
    if (!isLoggedIn) {
      setAuthError('Account registration is required before placing order. Please sign in with Google or enter your mobile number.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 1. If delivery and NO saved address: slide up bottom sheet!
    if (orderType === 'delivery' && !savedAddress) {
      setIsAddressSheetOpen(true);
      return;
    }

    // 2. Prepare checkout payload
    const checkoutData = {
      ...(savedAddress || {}),
      orderType,
      selectedSlot: orderType === 'pickup' ? 'Store Pickup' : selectedSlot,
      fullName: savedAddress?.fullName || user?.name || 'Customer',
      phone: savedAddress?.phone || savedAddress?.mobileNumber || user?.phone || '9876543210',
      mobileNumber: savedAddress?.phone || savedAddress?.mobileNumber || user?.phone || '9876543210',
    };

    try {
      sessionStorage.setItem('g1mart_checkout_address', JSON.stringify(checkoutData));
      if (savedAddress) {
        localStorage.setItem('g1mart_last_used_address', JSON.stringify(savedAddress));
      }
    } catch {}

    // 3. Proceed to payment
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

  const deliveryFee = orderType === 'pickup' ? 0 : (currentLocation.zone?.deliveryFee ?? 0);
  const grandTotal = cartSubtotal + deliveryFee;

  return (
    <div className="max-w-xl mx-auto space-y-3.5 pb-28 pt-2 sm:pt-4 px-2.5 sm:px-0">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
          aria-label="Back to Cart"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121]">Checkout</h1>
          <p className="text-[11px] text-stone-500">
            {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} · ₹{cartSubtotal}
          </p>
        </div>
      </div>

      {/* Account Verification Gate - ONLY if not logged in */}
      {!isLoggedIn && (
        <div className="bg-white rounded-2xl border-2 border-[#2E7D32]/40 p-4 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                Account Sign-In
              </h2>
            </div>
            <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              Required to Book
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Enter your mobile number or sign in with Google for live order tracking and rider verification.
          </p>

          {authError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* Quick Mobile Form */}
          <form onSubmit={handleQuickAuth} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-10 px-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold outline-none focus:border-[#2E7D32] focus:bg-white"
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
                  className="w-full h-10 pl-11 pr-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold outline-none focus:border-[#2E7D32] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={quickPhone.length !== 10}
              className="w-full h-10 bg-[#1A2E1C] hover:bg-black text-white rounded-xl text-xs font-extrabold transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Mobile &amp; Continue</span>
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
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Fulfillment Toggle: Home Delivery vs Store Pickup */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs space-y-2">
        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block">
          Order Fulfillment Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
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
            <div className="min-w-0">
              <span className="font-extrabold text-xs block leading-tight">Home Delivery</span>
              <span className="text-[10px] text-stone-500 font-medium">To doorstep</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('pickup')}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
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
            <div className="min-w-0">
              <span className="font-extrabold text-xs block leading-tight">Store Pickup</span>
              <span className="text-[10px] text-stone-500 font-medium">Free at G1 Mart</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Small Line Address in Checkout */}
      {orderType === 'delivery' ? (
        <div className="space-y-1.5">
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
              className="p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-[#2E7D32] transition-colors flex items-center justify-between gap-2 shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-stone-900 text-xs truncate">
                      {savedAddress.houseFlat}, {savedAddress.streetArea}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 uppercase">
                      {savedAddress.type || 'Home'}
                    </span>
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
              className="p-3 rounded-2xl bg-white border border-dashed border-stone-300 hover:border-[#2E7D32] hover:bg-emerald-50/20 flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-stone-800 text-xs block leading-tight">
                    No delivery address added
                  </span>
                  <span className="text-[11px] text-stone-500">Tap to set your doorstep address</span>
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
        </div>
      ) : (
        /* Store Pickup Small Line (skip address requirement for pickup) */
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1 block">
            Pickup Location
          </span>
          <div className="p-3 rounded-2xl bg-white border border-stone-200/90 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-stone-900 text-xs block leading-tight">
                  G1 Mart Supermarket
                </span>
                <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                  Trunk Road, Magunta Layout, Nellore · Ready in 30 mins
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
              FREE PICKUP
            </span>
          </div>
        </div>
      )}

      {/* 3. Delivery / Pickup Window Selection */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
          <Clock className="w-4 h-4 text-[#2E7D32]" />
          <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            {orderType === 'pickup' ? 'Pickup Window' : 'Delivery Slot'}
          </h2>
        </div>

        {orderType === 'delivery' ? (
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
                className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
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
                <span className="text-[10px] text-stone-500 mt-0.5">{slot.subtitle}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 flex items-center justify-between">
            <span className="font-bold">Store Packaging Window:</span>
            <span className="text-emerald-700 font-extrabold">Ready in 30–45 mins</span>
          </div>
        )}
      </div>

      {/* 4. Bill Summary Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs space-y-2.5">
        <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
          Bill Details ({cartItemCount} items)
        </h2>

        <div className="space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-bold text-[#212121] tabular-nums">₹{cartSubtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Packing &amp; Bag</span>
            <span className="font-bold text-[#2E7D32]">FREE</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-[#2E7D32]">
              {orderType === 'pickup' || deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex justify-between font-black text-sm text-[#212121]">
            <span>To Pay</span>
            <span className="tabular-nums">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>Authentic in-store billing &amp; verified FMCG stock</span>
      </div>

      {/* 5. Sticky Bottom CTA: Place Order / Proceed to Payment */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-3 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TOTAL</span>
            <span className="text-base sm:text-lg font-black text-[#212121] tabular-nums">₹{grandTotal}</span>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            className="h-11 sm:h-12 px-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Place Order</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
