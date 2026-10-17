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
  Truck,
  Sparkles,
  Check,
  Circle,
  CreditCard,
  Banknote,
  Clock,
  UserCheck,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import RiderAssignmentModal from '@/components/admin/RiderAssignmentModal';

interface Props {
  order: Order;
  onBack: () => void;
  onUpdateStatus: (
    orderId: string,
    status: string,
    assignedRider?: { id?: string; email?: string; name: string; phone?: string; vehicleNumber?: string }
  ) => void;
  onMarkPaid?: (orderId: string) => void;
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

  // Workflow steps definition
  const WORKFLOW_STEPS = [
    { key: 'Order Placed', label: 'Order Placed', icon: Circle },
    { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'Packing', label: 'Packing', icon: Package },
    { key: 'Packed', label: 'Packed', icon: Sparkles },
    { key: 'Rider Assigned', label: 'Rider Assigned', icon: Bike },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Check },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'New') return 0;
    if (status === 'Order Dispatched') return 5;
    const idx = WORKFLOW_STEPS.findIndex((st) => st.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStepIndex(s);

  // Determine primary forward action
  const getPrimaryAction = () => {
    if (s === 'Order Placed' || s === 'New')
      return {
        label: 'Confirm Order',
        next: 'Confirmed',
        description: 'Acknowledge order and notify customer',
        color: 'bg-blue-600 hover:bg-blue-700',
      };
    if (s === 'Confirmed')
      return {
        label: 'Start Packing',
        next: 'Packing',
        description: 'Send order items to packing station',
        color: 'bg-amber-600 hover:bg-amber-700',
      };
    if (s === 'Packing')
      return {
        label: 'Mark Packed',
        next: 'Packed',
        description: 'Bagging completed and ready for pickup',
        color: 'bg-indigo-600 hover:bg-indigo-700',
      };
    if (s === 'Packed')
      return {
        label: 'Appoint Delivery Rider',
        next: 'Rider Assigned',
        description: 'Select an available delivery rider from the fleet',
        color: 'bg-purple-600 hover:bg-purple-700',
      };
    if (s === 'Rider Assigned')
      return {
        label: 'Handover & Dispatch (Out for Delivery)',
        next: 'Out for Delivery',
        description: 'Handover packed bags to rider for doorstep delivery',
        color: 'bg-purple-700 hover:bg-purple-800',
      };
    if (s === 'Out for Delivery' || s === 'Order Dispatched')
      return {
        label: 'Confirm Customer Handover (OTP)',
        next: 'Delivered',
        description: 'Enter customer 4-digit handover OTP to confirm doorstep delivery',
        color: 'bg-emerald-700 hover:bg-emerald-800',
      };
    return null;
  };

  const primaryAction = getPrimaryAction();

  // Handle rider assignment
  const handleAssignRiderClick = () => {
    const foundRider = availableRiders.find(
      (r) => r.email === selectedRiderEmail || r.id === selectedRiderEmail
    );
    const riderInfo = foundRider
      ? {
          id: foundRider.id,
          email: foundRider.email,
          name: foundRider.name || 'Express Rider',
          phone: foundRider.phone,
          vehicleNumber: foundRider.vehicleNumber,
        }
      : {
          name: 'Store Delivery Partner',
          phone: '9876543210',
          vehicleNumber: 'AP 26 EQ 4589',
        };

    soundAlerts.playRiderAssignmentChime();
    onUpdateStatus(order.id, 'Rider Assigned', riderInfo);
  };

  const handleExecutePrimary = () => {
    if (!primaryAction) return;
    if (primaryAction.next === 'Rider Assigned') {
      setShowRiderModal(true);
    } else {
      onUpdateStatus(order.id, primaryAction.next);
    }
  };

  const phone = order.address?.mobileNumber || order.address?.phone || '';
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const lat = order.address?.latitude || 14.4426;
  const lng = order.address?.longitude || 79.9865;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-screen bg-[#F4F6F9] p-3 sm:p-6 pb-28">
      {/* Sticky Top Header Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center justify-between mb-4 sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
                Order #{order.id}
              </span>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">• {order.date}</span>
            </div>
            <p className="text-xs text-stone-500">
              Customer: <span className="font-bold text-stone-800">{order.address?.fullName || 'Guest'}</span>
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="text-right">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
            Status
          </span>
          <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {s.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. VISUAL 7-STEP FULFILLMENT STEPPER */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              Order Fulfillment Workflow
            </h2>
            <span className="text-xs font-bold text-emerald-700">
              Step {currentIndex + 1} of {WORKFLOW_STEPS.length}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-2xs scale-102'
                      : isPassed
                      ? 'bg-stone-50 border-stone-200 text-stone-600 font-bold'
                      : 'bg-white border-stone-100 text-stone-300 font-medium'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] leading-tight line-clamp-1">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Primary Action Button Box */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-stone-400 uppercase tracking-wider">
                Recommended Next Action
              </p>
              {primaryAction ? (
                <p className="text-sm font-bold text-stone-800">{primaryAction.description}</p>
              ) : (
                <p className="text-sm font-bold text-emerald-800">✓ Order is fully delivered &amp; complete</p>
              )}
            </div>

            {primaryAction && (
              <button
                type="button"
                onClick={handleExecutePrimary}
                className={`px-6 py-3 rounded-2xl text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${primaryAction.color}`}
              >
                <span>{primaryAction.label}</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Manual Jump Status Selector */}
          <div className="pt-2 flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-bold whitespace-nowrap">Change status manually:</span>
            <select
              value={manualStatus}
              onChange={(e) => {
                const newStatus = e.target.value as OrderStatus;
                setManualStatus(newStatus);
                onUpdateStatus(order.id, newStatus);
              }}
              className="bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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

        {/* 2. CUSTOMER & DELIVERY ADDRESS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              Customer Information
            </h3>

            <div className="space-y-1">
              <p className="text-lg font-black text-stone-900">{order.address?.fullName || 'Customer'}</p>
              <p className="text-xs text-stone-500 font-medium">
                {order.userEmail || order.userId ? `Account: ${order.userEmail || order.userId}` : 'Direct order'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {cleanPhone ? (
                <>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
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
                    className="py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <span className="text-xs text-stone-400">No mobile number provided</span>
              )}
            </div>
          </div>

          {/* Delivery Location & Slot */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
                Delivery Address &amp; Slot
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
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200/80 mt-1">
                <span>🛣️ Road Distance: <strong>{(order as any).distance_km || 0} km</strong></span>
                <span className="text-[#2E7D32]">⏱️ Delivery ETA: <strong>~{(order as any).eta_min || 20} mins</strong></span>
              </div>
            )}

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Open Google Maps Directions</span>
            </a>
          </div>
        </div>

        {/* 3. RIDER ASSIGNMENT SECTION */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-stone-700 tracking-wider">
                  Assigned Delivery Partner
                </h3>
              </div>
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
            <div className="p-4 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 rounded-2xl border border-purple-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black shadow-xs">
                      <Bike className="w-6 h-6" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-stone-900 text-base">{order.assignedRider.name}</p>
                      <span className="text-[10px] font-black uppercase bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                        Fleet Partner
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      🏍️ {order.assignedRider.vehicleNumber || 'AP 26 EQ 4589'} • 📞 {order.assignedRider.phone || '9876543210'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  {order.assignedRider.phone && (
                    <>
                      <a
                        href={`tel:${order.assignedRider.phone}`}
                        className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-purple-600" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${order.assignedRider.phone.replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(
                          order.assignedRider.name
                        )},%20order%20%23${order.id}%20is%20ready%20for%20delivery%20to%20${encodeURIComponent(
                          order.address?.fullName || 'customer'
                        )}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowRiderModal(true)}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    title="Change or reassign this order to another delivery rider"
                  >
                    <span>🔄 Reassign Rider</span>
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
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Handover &amp; Dispatch (Out for Delivery)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">No delivery partner appointed yet</p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Appoint an available fleet rider to pick up and deliver this order to the customer.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRiderModal(true)}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
              >
                <Bike className="w-4 h-4" />
                <span>Appoint Delivery Rider ➔</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. ORDERED PRODUCTS BREAKDOWN */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
              Ordered Products ({order.items?.length || 0})
            </h3>
            <span className="text-xs font-bold text-stone-500">Packing Checklist</span>
          </div>

          <div className="divide-y divide-stone-100">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || '/products/placeholder.svg'}
                    alt={item.productName}
                    className="w-12 h-12 object-contain bg-stone-50 border border-stone-200 rounded-2xl p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 text-xs sm:text-sm leading-snug truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.unit || '1 unit'} • ₹{item.price} each
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 bg-stone-100 rounded-xl font-black text-xs text-stone-800 mr-2">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-black text-stone-900 text-sm">
                    ₹{(item.quantity * item.price) || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. PAYMENT & BILLING CARD */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
          <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">
            Bill Details &amp; Payment Status
          </h3>

          <div className="space-y-2 text-xs text-stone-600 border-b border-stone-100 pb-3">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span className="font-bold text-stone-900">₹{order.subtotal || order.grandTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span className="font-bold text-stone-900">₹{order.deliveryFee || 0}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Discount:</span>
                <span className="font-bold">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-dashed border-stone-200">
              <span>Grand Total:</span>
              <span className="text-base text-emerald-800">₹{order.grandTotal}</span>
            </div>
          </div>

          {/* Payment Method Badge & Collection Alert */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {isPaid ? '✓ PAID ONLINE' : '🟠 CASH ON DELIVERY'}
              </span>
              <span className="text-xs text-stone-500 font-medium">Method: {order.paymentMethod}</span>
            </div>

            {!isPaid && onMarkPaid && (
              <button
                type="button"
                onClick={() => onMarkPaid(order.id)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Confirm Cash Collected (₹{order.grandTotal})</span>
              </button>
            )}
          </div>
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
