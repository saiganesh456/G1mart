'use client';

import React, { useState } from 'react';
import {
  Bike,
  Phone,
  CheckCircle2,
  X,
  Truck,
  User,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Order, StaffMember } from '@/types';
import { soundAlerts } from '@/lib/soundAlerts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  availableRiders?: StaffMember[];
  onAssignRider: (
    orderId: string,
    riderInfo: { id?: string; email?: string; name: string; phone?: string; vehicleNumber?: string }
  ) => void;
}

// Guaranteed baseline riders if fleet is still loading or unconfigured
const DEFAULT_STORE_RIDERS: StaffMember[] = [
  {
    id: 'rider-express-hub',
    email: 'rider@g1mart.com',
    name: 'Express Delivery Partner',
    phone: '9876543212',
    vehicleNumber: 'AP 26 EQ 4591',
    role: 'rider',
    createdAt: '2026-10-01T00:00:00Z',
    status: 'active',
  },
];

export default function RiderAssignmentModal({
  isOpen,
  onClose,
  order,
  availableRiders = [],
  onAssignRider,
}: Props) {
  const [activeTab, setActiveTab] = useState<'fleet' | 'custom'>('fleet');

  // Custom / spot rider form state
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');

  if (!isOpen || !order) return null;

  // Merge available fleet with defaults to guarantee store manager always has active riders
  const fleetMap = new Map<string, StaffMember>();
  DEFAULT_STORE_RIDERS.forEach((r) => fleetMap.set((r.email || r.id).toLowerCase(), r));
  availableRiders.forEach((r) => {
    if (r && (r.email || r.id)) {
      fleetMap.set((r.email || r.id).toLowerCase(), r);
    }
  });
  const activeFleet = Array.from(fleetMap.values());

  const handleSelectRider = (rider: StaffMember) => {
    soundAlerts.playRiderAssignmentChime();
    onAssignRider(order.id, {
      id: rider.id,
      email: rider.email,
      name: rider.name || 'Express Rider',
      phone: rider.phone || '9876543210',
      vehicleNumber: rider.vehicleNumber || 'AP 26 EQ 4589',
    });
    onClose();
  };

  const handleAssignCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Please enter the delivery rider name');
      return;
    }

    soundAlerts.playRiderAssignmentChime();
    onAssignRider(order.id, {
      name: customName.trim(),
      phone: customPhone.trim() || '9876543210',
      vehicleNumber: customVehicle.trim() || 'Bike',
    });
    setCustomName('');
    setCustomPhone('');
    setCustomVehicle('');
    onClose();
  };

  const isPaid =
    order.isPaid ||
    order.paymentStatus === 'completed' ||
    order.paymentStatus === 'manual_verified';

  const currentlyAssignedName = order.assignedRider?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 1. MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bike className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  Appoint Delivery Rider
                </h3>
                <span className="text-[10px] font-black uppercase bg-purple-500/40 border border-purple-300/40 text-purple-100 px-2 py-0.5 rounded-full">
                  Fulfillment
                </span>
              </div>
              <p className="text-xs text-purple-200/90 font-medium">
                Order #{order.id} • ₹{order.grandTotal} • {order.items?.length || 1} items
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. ORDER CONTEXT & CUSTOMER SNAPSHOT */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-b border-stone-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                Delivery Location
              </span>
              <p className="text-xs font-bold text-stone-900 truncate">
                {order.address?.fullName || 'Customer'} •{' '}
                <span className="text-stone-600 font-medium">
                  {order.address?.houseFlat ? `${order.address.houseFlat}, ` : ''}
                  {order.address?.streetArea || order.address?.city || 'Nellore'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {isPaid ? '✓ Paid Online' : `COD: ₹${order.grandTotal} to collect`}
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                {order.slot || 'Express ASAP'}
              </span>
            </div>
          </div>

          {currentlyAssignedName && (
            <div className="text-[11px] font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
              <span>
                Currently Appointed: <strong>{currentlyAssignedName}</strong>
              </span>
              <span className="text-[10px] uppercase font-black text-purple-700 bg-purple-200/70 px-2 py-0.5 rounded-md">
                Select another to reassign
              </span>
            </div>
          )}
        </div>

        {/* 3. SEGMENTED TAB SWITCHER */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-stone-100">
          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'fleet'
                ? 'text-purple-900 font-black'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Store Delivery Fleet ({activeFleet.length})</span>
            {activeTab === 'fleet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-700 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'custom'
                ? 'text-purple-900 font-black'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>+ Spot / Custom Rider</span>
            {activeTab === 'custom' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-700 rounded-full" />
            )}
          </button>
        </div>

        {/* 4. MODAL CONTENT BODY */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {activeTab === 'fleet' ? (
            <div className="space-y-2.5">
              <p className="text-[11px] text-stone-500 font-medium">
                Tap any available partner below to appoint and dispatch this order:
              </p>

              {activeFleet.map((rider) => {
                const isThisRiderAssigned =
                  order.assignedRider?.email === rider.email ||
                  order.assignedRider?.id === rider.id ||
                  order.assignedRider?.name === rider.name;

                return (
                  <div
                    key={rider.id || rider.email}
                    onClick={() => handleSelectRider(rider)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
                      isThisRiderAssigned
                        ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-300/40 shadow-xs'
                        : 'bg-white border-stone-200/90 hover:border-purple-600 hover:bg-stone-50/70 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-transform group-hover:scale-105 ${
                            isThisRiderAssigned
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 text-purple-800 group-hover:bg-purple-600 group-hover:text-white'
                          }`}
                        >
                          <Bike className="w-5 h-5" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-stone-900 text-xs sm:text-sm truncate">
                            {rider.name || 'Delivery Partner'}
                          </p>
                          {isThisRiderAssigned && (
                            <span className="text-[9px] font-black uppercase bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-md">
                              Assigned
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                          {rider.vehicleNumber ? `🏍️ ${rider.vehicleNumber}` : '🏍️ Standard Two-Wheeler'} •{' '}
                          {rider.phone ? `📞 ${rider.phone}` : rider.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rider.phone && (
                        <a
                          href={`tel:${rider.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-purple-100 text-stone-700 hover:text-purple-800 flex items-center justify-center transition-colors"
                          title="Call rider directly"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRider(rider);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                          isThisRiderAssigned
                            ? 'bg-purple-700 text-white'
                            : 'bg-purple-50 group-hover:bg-purple-700 text-purple-800 group-hover:text-white'
                        }`}
                      >
                        <span>{isThisRiderAssigned ? 'Reappoint' : 'Appoint'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleAssignCustom} className="space-y-3.5">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Spot / Temporary Rider Appointment</span>
                </p>
                <p className="text-amber-800">
                  Quickly appoint a local bike rider, auto, or helper without registering an account.
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-stone-700 block mb-1">
                  Rider Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh (Local Auto / Bike)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-black text-stone-700 block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9848012345"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-black text-stone-700 block mb-1">
                  Vehicle Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AP 26 TB 4589"
                  value={customVehicle}
                  onChange={(e) => setCustomVehicle(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('fleet')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Back to Fleet
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  Appoint Spot Rider
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 5. MODAL FOOTER */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-500 font-medium">
            Rider will receive order address and delivery items
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
