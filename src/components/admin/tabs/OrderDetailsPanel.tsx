'use client';

import React, { useState } from 'react';
import { Order, StaffMember, OrderStatus } from '@/types';
import { soundAlerts } from '@/lib/soundAlerts';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Bike,
  Package,
  PackageCheck,
  Truck,
  Check,
  Circle,
  CreditCard,
  Banknote,
  Clock,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  Copy,
  Store,
  ChevronRight,
  CheckSquare,
  Loader2,
  Square,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Info,
} from 'lucide-react';

import RiderAssignmentModal from '@/components/admin/RiderAssignmentModal';

interface Props {
  order: Order;
  onBack: () => void;
  onUpdateStatus: (
    orderId: string,
    status: string,
    assignedRider?: { id?: string; email?: string; name: string; phone?: string; vehicleNumber?: string },
    providedOtp?: string
  ) => Promise<any> | void;
  onMarkPaid?: (orderId: string) => Promise<any> | void;
  availableRiders?: StaffMember[];
}

export default function OrderDetailsPanel({
  order,
  onBack,
  onUpdateStatus,
  onMarkPaid,
  availableRiders = [],
}: Props) {
  const isPaid =
    order.isPaid ||
    order.paymentStatus === 'completed' ||
    order.paymentStatus === 'manual_verified';

  const s = order.status || 'Order Placed';

  // Rider selection modal state
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [selectedRiderEmail, setSelectedRiderEmail] = useState(
    order.assignedRider?.id || availableRiders[0]?.email || ''
  );
  const [manualStatus, setManualStatus] = useState(s);
  React.useEffect(() => {
    setManualStatus(s);
  }, [s]);
  const [copiedId, setCopiedId] = useState(false);

  // Interactive packing checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Accurate Store Pickup detection
  const isStorePickup = Boolean(
    order.slot?.toLowerCase().includes('pickup') ||
    order.address?.streetArea?.toLowerCase().includes('pickup') ||
    order.address?.landmark?.toLowerCase().includes('pickup') ||
    (order as any).orderType === 'pickup' ||
    (order as any).deliveryType === 'pickup' ||
    order.address?.fullName?.toLowerCase().includes('pickup')
  );

  // Dynamic workflow steps: Pickup vs Home Delivery
  const DELIVERY_STEPS = [
    { key: 'Order Placed', label: 'Placed', icon: Circle },
    { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'Packing', label: 'Packing', icon: Package },
    { key: 'Packed', label: 'Packed', icon: PackageCheck },
    { key: 'Rider Assigned', label: 'Rider Assigned', icon: Bike },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Check },
  ];

  const PICKUP_STEPS = [
    { key: 'Order Placed', label: 'Placed', icon: Circle },
    { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'Packing', label: 'Packing', icon: Package },
    { key: 'Packed', label: 'Ready for Pickup', icon: PackageCheck },
    { key: 'Delivered', label: 'Handed Over', icon: Check },
  ];

  const WORKFLOW_STEPS = isStorePickup ? PICKUP_STEPS : DELIVERY_STEPS;

  const getStepIndex = (status: string) => {
    if (status === 'New') return 0;
    if (status === 'Order Dispatched') return isStorePickup ? 3 : 5;
    const idx = WORKFLOW_STEPS.findIndex((st) => st.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStepIndex(s);
  const isCompleted = s === 'Delivered';

  // Determine primary recommended next action
  const getPrimaryAction = () => {
    if (s === 'Order Placed' || s === 'New') {
      return {
        label: 'Confirm Order',
        next: 'Confirmed',
        description: 'Acknowledge order and send to store queue',
        color: 'bg-blue-600 hover:bg-blue-700',
      };
    }
    if (s === 'Confirmed') {
      return {
        label: 'Start Packing',
        next: 'Packing',
        description: 'Begin picking & bagging items from shelves',
        color: 'bg-amber-600 hover:bg-amber-700',
      };
    }
    if (s === 'Packing') {
      return {
        label: isStorePickup ? 'Mark Ready for Pickup' : 'Mark as Packed',
        next: 'Packed',
        description: isStorePickup
          ? 'Items bagged and ready at store customer counter'
          : 'Items packed in bags, ready for rider handover',
        color: 'bg-indigo-600 hover:bg-indigo-700',
      };
    }
    if (s === 'Packed') {
      if (isStorePickup) {
        return {
          label: 'Customer Handover (Complete)',
          next: 'Delivered',
          description: 'Customer is at counter. Verify and handover bags',
          color: 'bg-emerald-600 hover:bg-emerald-700',
        };
      }
      return {
        label: 'Appoint Delivery Rider',
        next: 'Rider Assigned',
        description: 'Assign an express fleet rider to pick up bags',
        color: 'bg-purple-600 hover:bg-purple-700',
      };
    }
    if (s === 'Rider Assigned') {
      return {
        label: 'Handover & Dispatch (Out for Delivery)',
        next: 'Out for Delivery',
        description: 'Bags handed to rider. Rider is departing to customer doorstep',
        color: 'bg-purple-700 hover:bg-purple-800',
      };
    }
    if (s === 'Out for Delivery' || s === 'Order Dispatched') {
      return {
        label: 'Confirm Customer Handover (OTP)',
        next: 'Delivered',
        description: 'Customer receives order. Verify 4-digit handover OTP',
        color: 'bg-emerald-600 hover:bg-emerald-700',
      };
    }
    return null;
  };

  const primaryAction = getPrimaryAction();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleExecutePrimary = async () => {
    if (!primaryAction || isUpdating) return;
    if (primaryAction.next === 'Rider Assigned') {
      setShowRiderModal(true);
    } else {
      setIsUpdating(true);
      try {
        await onUpdateStatus(order.id, primaryAction.next, order.assignedRider);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleStepClick = async (stepKey: OrderStatus) => {
    if (isUpdating || stepKey === s) return;
    if (stepKey === 'Rider Assigned') {
      setShowRiderModal(true);
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, stepKey, order.assignedRider);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(order.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const toggleItemCheck = (idxKey: string) => {
    setCheckedItems((prev) => ({ ...prev, [idxKey]: !prev[idxKey] }));
  };

  const allItemsChecked =
    (order.items || []).length > 0 &&
    (order.items || []).every((_, idx) => checkedItems[idx.toString()]);

  const toggleAllItems = () => {
    if (allItemsChecked) {
      setCheckedItems({});
    } else {
      const all: Record<string, boolean> = {};
      (order.items || []).forEach((_, idx) => {
        all[idx.toString()] = true;
      });
      setCheckedItems(all);
    }
  };

  // Contacts
  const phone = order.address?.mobileNumber || order.address?.phone || '';
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const lat = order.address?.latitude || 14.4426;
  const lng = order.address?.longitude || 79.9865;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Accurate Billing Calculations (solving the mystery difference)
  const itemsSum = (order.items || []).reduce(
    (acc: number, it: any) => acc + ((Number(it.price) || 0) * (Number(it.quantity) || 1)),
    0
  );

  const subtotal = itemsSum > 0 ? itemsSum : (order.subtotal || order.grandTotal || 0);
  const deliveryFee = order.deliveryFee || 0;
  const discount = order.discount || 0;
  const taxes = order.taxes || 0;
  const codFee = order.codFee || order.cod_fee || (order.paymentMethod === 'Cash on Delivery' && !isStorePickup ? 50 : 0);
  const grandTotal = itemsSum > 0 && ((order.grandTotal || 0) < itemsSum || Math.abs((order.grandTotal || 0) - (itemsSum + deliveryFee - discount + taxes + codFee)) > 5)
    ? subtotal + deliveryFee - discount + taxes + codFee
    : (order.grandTotal || subtotal + deliveryFee - discount + taxes + codFee);

  // Compute any extra platform/handling fee so the math ALWAYS adds up transparently
  const knownSum = subtotal + deliveryFee - discount + taxes + codFee;
  const handlingFee = grandTotal > knownSum ? grandTotal - knownSum : 0;

  // Status color pill generator
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rider Assigned':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Packing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-none mx-auto flex flex-col min-h-screen bg-[#F4F6F9] pb-36">
      {/* 1. CLEAN STICKY APP BAR (Mobile & Desktop optimized) */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b sm:border border-stone-200/90 sm:rounded-3xl p-3.5 sm:p-4 shadow-xs mb-3 sm:mb-4 transition-all">
        <div className="flex items-center justify-between gap-2">
          {/* Back button & Order identifier */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-colors shrink-0 active:scale-95"
              aria-label="Back to Orders List"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-black text-stone-900 tracking-tight truncate">
                  Order #{order.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                  title="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedId && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Copied!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 truncate">
                <span>{order.address?.fullName || 'Customer'}</span>
                <span>•</span>
                <span className="truncate">{order.date || 'Today'}</span>
              </div>
            </div>
          </div>

          {/* Type & Status Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                isStorePickup
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-blue-50 text-blue-900 border-blue-300'
              }`}
            >
              {isStorePickup ? '🏬 Store Pickup' : '🛵 Delivery'}
            </span>

            <span
              className={`text-[11px] sm:text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-full border shadow-2xs ${getStatusBadge(
                s
              )}`}
            >
              {s}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
        {/* 2. COMPACT MOBILE WORKFLOW & SMART STEPPER */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                Order Fulfillment
              </h2>
              <span className="text-[10px] font-bold text-stone-400">
                ({isStorePickup ? 'Pickup Mode' : 'Doorstep Mode'})
              </span>
            </div>
            <span className="text-xs font-black text-emerald-700">
              {isCompleted ? '✓ Completed' : `Step ${currentIndex + 1} of ${WORKFLOW_STEPS.length}`}
            </span>
          </div>

          {/* Sleek Horizontal Stepper Line */}
          <div className="relative pt-1 pb-1">
            {/* Background connection bar */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-stone-100 rounded-full z-0 hidden sm:block" />
            <div
              className="absolute top-4 left-4 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-300 hidden sm:block"
              style={{
                width: `${(currentIndex / Math.max(1, WORKFLOW_STEPS.length - 1)) * 92}%`,
              }}
            />

            {/* Stepper items (Horizontally scrollable on small screens, neat grid on desktop) */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 relative z-10 scrollbar-none">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isPassed = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const StepIcon = step.icon;

                return (
                  <button
                    key={step.key}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStepClick(step.key as OrderStatus)}
                    className={`flex flex-col items-center min-w-[54px] sm:min-w-[70px] text-center transition-all cursor-pointer touch-manipulation hover:opacity-85 ${
                      isCurrent
                        ? 'scale-105 font-black text-emerald-900'
                        : isPassed
                        ? 'text-stone-700 font-bold'
                        : 'text-stone-400 font-medium'
                    }`}
                    title={`Set status to ${step.label}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs mb-1 transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] sm:text-[11px] leading-tight max-w-[65px] truncate">
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Hero Banner */}
          <div className="bg-stone-50 rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block mb-0.5">
                Recommended Action
              </span>
              {primaryAction ? (
                <div>
                  <p className="text-xs sm:text-sm font-bold text-stone-800">
                    {primaryAction.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Order is fully delivered &amp; fulfilled</span>
                </p>
              )}
            </div>

            {primaryAction && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleExecutePrimary}
                className={`w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 shrink-0 touch-manipulation disabled:opacity-75 disabled:cursor-not-allowed ${primaryAction.color}`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>{primaryAction.label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Manual Jump Dropdown (Compact & discreet) */}
          <div className="pt-1 flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium">Need to override status?</span>
            <div className="flex items-center gap-1.5">
              <select
                value={manualStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  setManualStatus(newStatus);
                  onUpdateStatus(order.id, newStatus);
                }}
                className="bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
              >
                {WORKFLOW_STEPS.map((st) => (
                  <option key={st.key} value={st.key}>
                    {st.label}
                  </option>
                ))}
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. CONTEXT-AWARE CUSTOMER & PICKUP/DELIVERY SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
                Customer Information
              </h3>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {order.userEmail ? 'Registered User' : 'Direct Order'}
              </span>
            </div>

            <div>
              <p className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                {order.address?.fullName || 'Customer'}
              </p>
              <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                {order.userEmail || order.userId ? `Account: ${order.userEmail || order.userId}` : 'Customer'}
              </p>
            </div>

            {/* Quick Action Contact Pills */}
            <div className="flex items-center gap-2 pt-1">
              {cleanPhone ? (
                <>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ({cleanPhone})</span>
                  </a>
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                      order.address?.fullName || 'Customer'
                    )},%20your%20G1%20MART%20order%20%23${order.id}%20status%20is%20${s}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-98"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <span className="text-xs text-stone-400 italic">No mobile phone provided</span>
              )}
            </div>
          </div>

          {/* Delivery or Store Pickup Card */}
          {isStorePickup ? (
            /* STORE PICKUP CARD - No rider needed, no directions to own store */
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wider">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>Store Pickup Counter</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Customer Self-Pickup
                </span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 space-y-1 text-xs">
                <p className="font-bold text-stone-900">
                  📍 Handover Counter: G1Mart Main Store
                </p>
                <p className="text-stone-600">
                  Nellore Hub • Govt Hospital, beside Padarupalli (524004)
                </p>
                <p className="text-amber-800 font-semibold pt-1">
                  💡 Note: Customer collects directly at store counter. No delivery rider dispatch required.
                </p>
              </div>

              {s === 'Packed' && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id, 'Delivered')}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Handover to Customer</span>
                </button>
              )}
            </div>
          ) : (
            /* HOME DELIVERY ADDRESS CARD */
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
                  Doorstep Delivery Address
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Slot: {order.slot || 'Express Delivery'}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs font-medium text-stone-800 space-y-0.5 leading-relaxed">
                  <p className="font-bold text-stone-900">
                    {order.address?.houseFlat ? `${order.address.houseFlat}, ` : ''}
                    {order.address?.streetArea}
                  </p>
                  {order.address?.landmark && (
                    <p className="text-stone-500 italic">Landmark: {order.address.landmark}</p>
                  )}
                  <p className="text-stone-600">
                    {order.address?.city || 'Nellore'} - {order.address?.pincode || '524003'}
                  </p>
                </div>
              </div>

              {((order as any).distance_km !== undefined || (order as any).eta_min !== undefined) && (
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/80">
                  <span>🛣️ Distance: <strong>{(order as any).distance_km || 0} km</strong></span>
                  <span className="text-[#2E7D32]">⏱️ ETA: <strong>~{(order as any).eta_min || 20} mins</strong></span>
                </div>
              )}

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Google Maps Directions</span>
              </a>
            </div>
          )}
        </div>

        {/* 4. RIDER ASSIGNMENT SECTION (Only for Home Delivery) */}
        {!isStorePickup && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black uppercase text-stone-700 tracking-wider">
                  Assigned Delivery Partner
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  order.assignedRider
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {order.assignedRider ? '🛵 Rider Appointed' : '⚠️ Unassigned'}
              </span>
            </div>

            {order.assignedRider ? (
              <div className="p-3.5 sm:p-4 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-stone-900 text-sm sm:text-base">
                          {order.assignedRider.name}
                        </p>
                        <span className="text-[10px] font-black uppercase bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                          Fleet Partner
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        🏍️ {order.assignedRider.vehicleNumber || 'AP 26 EQ 4589'} • 📞{' '}
                        {order.assignedRider.phone || '9876543210'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.assignedRider.phone && (
                      <>
                        <a
                          href={`tel:${order.assignedRider.phone}`}
                          className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-purple-600" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/91${order.assignedRider.phone
                            .replace(/\D/g, '')
                            .slice(-10)}?text=Hello%20${encodeURIComponent(
                            order.assignedRider.name
                          )},%20order%20%23${order.id}%20is%20ready%20for%20delivery.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowRiderModal(true)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
                      title="Reassign another rider"
                    >
                      <span>🔄 Reassign</span>
                    </button>
                  </div>
                </div>

                {s === 'Rider Assigned' && (
                  <div className="pt-2 border-t border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-purple-800 font-medium">
                      Order is ready for pickup by {order.assignedRider.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Handover &amp; Dispatch (Out for Delivery)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 sm:p-4 bg-amber-50/60 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">No delivery rider appointed yet</p>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Select an available fleet rider to pick up and deliver this order.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRiderModal(true)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
                >
                  <Bike className="w-4 h-4" />
                  <span>Appoint Rider ➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5 & 6. PRODUCTS CHECKLIST & PAYMENT SUMMARY GRID (Side-by-side on Monitor) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* 5. ORDERED PRODUCTS & INTERACTIVE PACKING CHECKLIST */}
          <div className="xl:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                  Ordered Products ({order.items?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={toggleAllItems}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>{allItemsChecked ? 'Uncheck All' : 'Check All Packed'}</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {order.items?.map((item: any, i: number) => {
                const isChecked = Boolean(checkedItems[i.toString()]);
                return (
                  <div
                    key={i}
                    onClick={() => toggleItemCheck(i.toString())}
                    className={`py-2.5 flex items-center justify-between gap-3 cursor-pointer rounded-xl px-1.5 transition-colors ${
                      isChecked ? 'bg-emerald-50/60' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        className="text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                        aria-label={isChecked ? 'Mark item unpacked' : 'Mark item packed'}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-300" />
                        )}
                      </button>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || '/products/placeholder.svg'}
                        alt={item.productName}
                        className="w-11 h-11 object-contain bg-white border border-stone-200 rounded-xl p-1 shrink-0"
                      />

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm leading-snug font-bold truncate ${
                            isChecked ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}
                        >
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.unit || '1 unit'} • ₹{item.price} each
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 bg-stone-100 rounded-lg font-black text-xs text-stone-800 mr-2">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-black text-stone-900 text-xs sm:text-sm">
                        ₹{item.quantity * item.price || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. TRANSPARENT BILLING & PAYMENT BREAKDOWN */}
          <div className="xl:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3 sticky top-24">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
                Bill Details &amp; Payment Status
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isPaid ? '✓ Paid' : '🟠 Payment Pending'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600 border-b border-stone-100 pb-3">
              <div className="flex justify-between">
                <span>Item Subtotal:</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className="font-bold text-stone-900">
                  {deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}
                </span>
              </div>

              {/* Display store packaging / handling charge so math adds up without confusion */}
              {handlingFee > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>Packaging &amp; Handling Charge:</span>
                  <span className="font-bold text-stone-900">₹{handlingFee}</span>
                </div>
              )}

              {taxes > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>Taxes &amp; GST:</span>
                  <span className="font-bold text-stone-900">₹{taxes}</span>
                </div>
              )}

              {codFee > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>Cash on Delivery Fee:</span>
                  <span className="font-bold text-stone-900">₹{codFee}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount:</span>
                  <span className="font-bold">-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-black text-stone-900 pt-2 border-t border-dashed border-stone-200">
                <span>Grand Total:</span>
                <span className="text-base sm:text-lg text-emerald-800">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Badge & Collection Trigger */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium">Method:</span>
                <span className="font-bold text-xs text-stone-900">{order.paymentMethod || 'Cash on Delivery'}</span>
              </div>

              {!isPaid && onMarkPaid && (
                <button
                  type="button"
                  onClick={() => onMarkPaid(order.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Confirm Cash Collected (₹{grandTotal})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7. PINNED MOBILE QUICK ACTION FOOTER */}
      {/* Placed at bottom so store manager can take immediate action on mobile without scrolling */}
      <div className="fixed bottom-14 sm:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 sm:hidden shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {!isPaid && onMarkPaid ? (
            <button
              type="button"
              onClick={() => onMarkPaid(order.id)}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
            >
              <Banknote className="w-4 h-4" />
              <span>Collect ₹{grandTotal}</span>
            </button>
          ) : null}

          {primaryAction ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleExecutePrimary}
              className={`flex-1 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs active:scale-98 touch-manipulation disabled:opacity-75 disabled:cursor-not-allowed ${primaryAction.color}`}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>{primaryAction.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="w-full text-center py-1 text-xs font-black text-emerald-800">
              ✓ Order Complete
            </div>
          )}
        </div>
      </div>

      {/* Rider Appointment Modal */}
      <RiderAssignmentModal
        isOpen={showRiderModal}
        onClose={() => setShowRiderModal(false)}
        order={order}
        availableRiders={availableRiders}
        onAssignRider={(orderId, riderInfo) => {
          onUpdateStatus(orderId, 'Rider Assigned', riderInfo);
        }}
      />
    </div>
  );
}
