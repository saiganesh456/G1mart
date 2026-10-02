'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, ShieldCheck, AlertCircle, Navigation, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { STORE_CONFIG } from '@/config/store';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartItemCount, cartSubtotal } = useCart();
  const { currentLocation, detectLocation, isDetecting } = useLocation();

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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

  // Pre-fill from currentLocation if available
  useEffect(() => {
    if (currentLocation && !streetArea) {
      if (currentLocation.street || currentLocation.area) {
        setStreetArea(currentLocation.street || currentLocation.area);
      }
      if (currentLocation.city) {
        setCity(currentLocation.city);
      }
      if (currentLocation.pincode) {
        setPincode(currentLocation.pincode);
      }
      if (currentLocation.lat && currentLocation.lng) {
        setLatitude(currentLocation.lat);
        setLongitude(currentLocation.lng);
        setAutoFilled(true);
      }
    }
  }, [currentLocation, streetArea]);

  const handleAutoFillClick = async () => {
    const loc = await detectLocation();
    if (loc) {
      setStreetArea(loc.street || loc.area);
      setCity(loc.city);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /**
     * Store temporary address in sessionStorage for payment confirmation
     */
    try {
      sessionStorage.setItem(
        'g1mart_checkout_address',
        JSON.stringify({
          fullName,
          phone,
          houseFlat,
          streetArea,
          landmark,
          city,
          pincode,
          latitude,
          longitude,
          deliveryInstructions,
          selectedSlot,
        })
      );
    } catch {}

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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Delivery Address Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                1. Delivery Doorstep Address
              </h2>
            </div>

            {/* Auto Detect Button */}
            <button
              type="button"
              onClick={handleAutoFillClick}
              disabled={isDetecting}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#2E7D32]" />
              <span>{isDetecting ? 'Detecting...' : 'Auto-detect GPS'}</span>
            </button>
          </div>

          {/* GPS Confirmation Pill */}
          {autoFilled && latitude && longitude && (
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="font-semibold">
                  Exact GPS pin captured: ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </span>
              </div>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded font-bold text-emerald-900">
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
                placeholder="e.g. Ramesh Reddy"
                className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-stone-700 block mb-1">House / Flat / Floor / Building *</label>
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
              <label className="font-bold text-stone-700 block mb-1">Street / Area / Colony *</label>
              <input
                type="text"
                required
                value={streetArea}
                onChange={(e) => setStreetArea(e.target.value)}
                placeholder="e.g. Setti Gunta Rd, Weavers Colony"
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
                pattern="[0-9]{6}"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 524002"
                className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
              />
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

        {/* Delivery Slot Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Clock className="w-4 h-4 text-[#2E7D32]" />
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              2. Delivery Window
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
            3. Order Summary ({cartItemCount} items)
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
            className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Payment Selection</span>
          </button>
        </div>
      </form>
    </div>
  );
}
