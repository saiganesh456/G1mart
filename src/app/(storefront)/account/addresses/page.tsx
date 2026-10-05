'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Building2,
  Navigation,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { addressService } from '@/services/addressService';
import { Address } from '@/types';
import { sanitizeIndianPhone, isValidIndianPhone } from '@/lib/phone';
import { STORE_CONFIG } from '@/config/store';

export default function SavedAddressesPage() {
  const router = useRouter();
  const { user, supabaseUser, isLoggedIn, isLoading } = useAuth();
  const { detectLocation, isDetecting } = useLocation();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New address form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState<string>(STORE_CONFIG.address.city || 'Nellore');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [autoFilled, setAutoFilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const list = await addressService.getAddresses(supabaseUser?.id || user?.id, user?.email || user?.phone);
      setAddresses(list);
    } catch (err) {
      console.warn('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    if (user?.name) setFullName(user.name);
    if (user?.phone) setPhone(sanitizeIndianPhone(user.phone));
  }, [user]);

  const handleAutoDetect = async () => {
    const loc = await detectLocation();
    if (loc) {
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

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = sanitizeIndianPhone(phone);
    if (!isValidIndianPhone(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit PIN code');
      return;
    }

    if (!houseFlat.trim() || !streetArea.trim()) {
      setErrorMsg('Please fill in complete house and street details');
      return;
    }

    try {
      setSaving(true);
      const newAddr = await addressService.saveAddress(supabaseUser?.id || user?.id, user?.email || user?.phone, {
        fullName: fullName.trim(),
        mobileNumber: cleanPhone,
        phone: cleanPhone,
        houseFlat: houseFlat.trim(),
        streetArea: streetArea.trim(),
        landmark: landmark.trim(),
        city: city.trim() || STORE_CONFIG.address.city || 'Nellore',
        state: 'Andhra Pradesh',
        pincode: cleanPin,
        type: addressType,
        isDefault: isDefault || addresses.length === 0,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        latitude,
        longitude,
      });

      setShowAddModal(false);
      // Reset form
      setHouseFlat('');
      setStreetArea('');
      setLandmark('');
      setPincode('');
      setLatitude(undefined);
      setLongitude(undefined);
      setAutoFilled(false);
      await loadAddresses();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this address?')) {
      await addressService.deleteAddress(supabaseUser?.id || user?.id, user?.email || user?.phone, id);
      await loadAddresses();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 pt-2 sm:pt-4 px-3 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#212121]">Saved Delivery Addresses</h1>
            <p className="text-xs text-stone-500">Manage your doorstep delivery locations</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading saved addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-[#2E7D32] rounded-2xl flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">No Saved Addresses Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add your doorstep address once to enjoy fast 1-click delivery on all future orders.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold hover:bg-[#1b5e20] cursor-pointer transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    {addr.type === 'Home' && <Home className="w-3 h-3 text-[#2E7D32]" />}
                    {addr.type === 'Work' && <Building2 className="w-3 h-3 text-blue-600" />}
                    {addr.type === 'Other' && <MapPin className="w-3 h-3 text-stone-600" />}
                    <span>{addr.type || 'Home'}</span>
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32]">
                      Default Address
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove Address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="font-extrabold text-xs text-stone-900">{addr.fullName}</span>
                <span className="text-xs text-stone-500 ml-2">• +91 {addr.mobileNumber || addr.phone}</span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {addr.houseFlat}, {addr.streetArea}
                {addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city} - {addr.pincode}
              </p>

              {addr.deliveryInstructions && (
                <p className="text-[11px] text-stone-400 italic">
                  Note: {addr.deliveryInstructions}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="text-sm font-bold text-stone-900">Add New Delivery Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            {/* Auto Detect Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5 fill-[#2E7D32]" />
                <span>{isDetecting ? 'Detecting GPS...' : 'Auto-detect GPS'}</span>
              </button>
            </div>

            {autoFilled && latitude && longitude && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>GPS coordinates captured ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(sanitizeIndianPhone(e.target.value))}
                      placeholder="98765 43210"
                      className="w-full h-9 pl-11 pr-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                    />
                  </div>
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
                    placeholder="e.g. Near Water Tank"
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

                {/* Address Type Buttons */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1.5">Save Address As</label>
                  <div className="flex items-center gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`px-3.5 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          addressType === type
                            ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
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
                  <label className="font-bold text-stone-700 block mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Ring bell twice / Leave at security"
                    className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
