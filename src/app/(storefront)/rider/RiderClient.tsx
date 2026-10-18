'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Phone,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Package,
  ShieldCheck,
  Truck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Power,
  DollarSign,
  Bike,
  Sparkles,
  ShoppingBag,
  Check,
  Info,
  Volume2,
  User,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import type { Order } from '@/types';
import RiderAuthGuard from '@/components/rider/RiderAuthGuard';
import { useAuth } from '@/context/AuthContext';
import { soundAlerts } from '@/lib/soundAlerts';

export default function RiderClient() {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'assigned' | 'ready' | 'completed' | 'all'>('assigned');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Doorstep Handover & OTP State
  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);
  const [otpDigits, setOtpDigits] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isArriving, setIsArriving] = useState(false);
  const [cashCollectedChecked, setCashCollectedChecked] = useState(false);
  const [deliverySuccessOrder, setDeliverySuccessOrder] = useState<Order | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Profile Drawer & Off Duty Confirmation Sheets
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showOffDutyConfirm, setShowOffDutyConfirm] = useState(false);

  // Duty status (stored locally for shift continuity)
  const [isOnDuty, setIsOnDuty] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('g1mart_rider_on_duty');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const toggleDuty = (forceVal?: boolean) => {
    setIsOnDuty((prev) => {
      const next = forceVal !== undefined ? forceVal : !prev;
      try {
        localStorage.setItem('g1mart_rider_on_duty', String(next));
      } catch {}
      return next;
    });
  };

  const handleDutyToggleRequest = () => {
    if (isOnDuty) {
      setShowOffDutyConfirm(true);
    } else {
      toggleDuty(true);
    }
  };

  const handleConfirmGoOffDuty = () => {
    toggleDuty(false);
    setShowOffDutyConfirm(false);
  };

  const knownOrderIdsRef = useRef<Set<string> | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'x-rider-client': 'true',
          'x-user-email': (user?.email || '').toLowerCase().trim(),
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const newOrders: Order[] = data.orders;
        if (knownOrderIdsRef.current !== null) {
          const hasNewOrder = newOrders.some(
            (o) =>
              !knownOrderIdsRef.current!.has(o.id) &&
              ((o.status as string) === 'Rider Assigned' ||
                (o.status as string) === 'Ready for Pickup' ||
                (o.status as string) === 'Out for Delivery')
          );
          if (hasNewOrder) {
            soundAlerts.playRiderAssignmentChime();
          }
        }
        knownOrderIdsRef.current = new Set(newOrders.map((o) => o.id));
        setOrders(newOrders);
      }
    } catch (err) {
      console.error('Failed to load rider orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Realtime auto-poll every 7 seconds
    const interval = setInterval(fetchOrders, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    status: string,
    selfAssign: boolean = false
  ) => {
    setUpdatingId(orderId);
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      const riderPayload =
        selfAssign || status === 'Rider Assigned' || status === 'Out for Delivery'
          ? {
              id: user?.id || `rider-${Date.now()}`,
              email: user?.email || '',
              name: user?.name || 'Express Rider',
              phone: user?.phone || '',
              vehicleNumber: 'AP 26 EQ 4589',
            }
          : targetOrder?.assignedRider;

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rider-client': 'true',
          'x-user-email': (user?.email || '').toLowerCase().trim(),
        },
        body: JSON.stringify({
          status,
          staffIdentifier: user?.name ? `Rider: ${user.name}` : 'Rider App',
          assignedRider: riderPayload,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );
      } else {
        alert('Could not update status: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRiderArrived = async (order: Order) => {
    setIsArriving(true);
    try {
      const res = await fetch(`/api/rider/orders/${order.id}/arrived`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderName: user?.name || 'Express Rider',
          orderFallback: order,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, ...data.order } : o))
        );
      }
    } catch (err) {
      console.warn('Failed to notify arrival:', err);
    } finally {
      setIsArriving(false);
      setOtpModalOrder(order);
      setOtpDigits('');
      setOtpError(null);
      setCashCollectedChecked(false);
    }
  };

  const handlePressOtpDigit = (digit: string) => {
    if (otpDigits.length < 4) {
      const next = otpDigits + digit;
      setOtpDigits(next);
      setOtpError(null);
      if (next.length === 4) {
        triggerOtpVerification(next);
      }
    }
  };

  const handleDeleteOtpDigit = () => {
    if (otpDigits.length > 0) {
      setOtpDigits(otpDigits.slice(0, -1));
      setOtpError(null);
    }
  };

  const triggerOtpVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits;
    if (!otpModalOrder) return;
    if (code.length !== 4) {
      setOtpError('Please enter the complete 4-digit OTP');
      return;
    }
    if (
      !otpModalOrder.isPaid &&
      otpModalOrder.paymentMethod === 'Cash on Delivery' &&
      !cashCollectedChecked
    ) {
      setOtpError('Please collect cash from customer and tick the confirmation box');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch(`/api/rider/orders/${otpModalOrder.id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: code,
          riderIdentifier: user?.name ? `Rider: ${user.name}` : 'Rider',
          cashCollected: cashCollectedChecked,
          orderFallback: otpModalOrder,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        soundAlerts.playRiderAssignmentChime();
        try {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        } catch {}

        const completed = { ...otpModalOrder, status: 'Delivered' as any, isPaid: true };
        setOrders((prev) =>
          prev.map((o) =>
            o.id === otpModalOrder.id ? { ...o, status: 'Delivered' as any, isPaid: true } : o
          )
        );
        setOtpModalOrder(null);
        setDeliverySuccessOrder(completed);
      } else {
        setOtpError(data.error || 'Incorrect OTP. Ask customer to check their screen.');
        setOtpDigits('');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Error verifying OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpModalOrder || resendCooldown > 0) return;
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      await fetch(`/api/rider/orders/${otpModalOrder.id}/arrived`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderName: user?.name || 'Express Rider',
          orderFallback: otpModalOrder,
        }),
      });
      alert('Alert resent! Customer tracking screen has been updated with the 4-digit PIN.');
    } catch {}
  };

  const riderEmail = (user?.email || '').toLowerCase().trim();
  const riderName = (user?.name || '').toLowerCase().trim();

  // Metrics
  const metrics = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
    const delivered = orders.filter((o) => o.status === 'Delivered');

    // Calculate cash in hand from delivered COD orders
    const cashInHand = delivered
      .filter((o) => !o.isPaid || o.paymentMethod === 'Cash on Delivery')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const prepaidCount = delivered.filter((o) => o.isPaid).length;

    return {
      activeCount: active.length,
      deliveredCount: delivered.length,
      cashInHand,
      prepaidCount,
    };
  }, [orders]);

  // Active ongoing delivery run in progress
  const ongoingTrip = useMemo(() => {
    return orders.find((o) => {
      const isOut = o.status === 'Out for Delivery' || o.status === 'Order Dispatched';
      const isMyOrder =
        o.assignedRider?.email?.toLowerCase().trim() === riderEmail ||
        (riderName && o.assignedRider?.name?.toLowerCase().includes(riderName)) ||
        !o.assignedRider;
      return isOut && isMyOrder;
    });
  }, [orders, riderEmail, riderName]);

  // Tab Filtering
  const displayedOrders = useMemo(() => {
    return orders.filter((o) => {
      const isDelivered = o.status === 'Delivered';
      const isCancelled = o.status === 'Cancelled';
      if (isCancelled) return false;

      const assignedToMe =
        o.assignedRider?.email?.toLowerCase().trim() === riderEmail ||
        (riderEmail && o.assignedRider?.email?.toLowerCase().includes(riderEmail.split('@')[0])) ||
        (riderName && o.assignedRider?.name?.toLowerCase().includes(riderName));

      if (tab === 'assigned') {
        if (isDelivered) return false;

        // SINGLE DELIVERY FOCUS ENFORCER:
        // If rider has an active delivery in progress, lock view to that trip only!
        if (ongoingTrip) {
          return o.id === ongoingTrip.id;
        }

        return assignedToMe || !o.assignedRider;
      }

      if (tab === 'ready') {
        // Orders ready in darkstore for pickup
        return (
          !isDelivered &&
          (o.status === 'Packed' || o.status === 'Rider Assigned' || o.status === 'Confirmed')
        );
      }

      if (tab === 'completed') {
        return isDelivered;
      }

      // 'all' tab
      return true;
    });
  }, [orders, tab, riderEmail, riderName, ongoingTrip]);

  const toggleItems = (orderId: string) => {
    setExpandedItems((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <RiderAuthGuard>
      {/* Container: Responsive full-width on desktop, compact on mobile */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-28">

        {/* ================= DESKTOP & MOBILE TOP HEADER ================= */}
        <header className="bg-gradient-to-r from-[#0C2411] via-[#12381A] to-[#1B5E20] text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-lg border border-emerald-900/60 mb-4 sm:mb-6 transition-all">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Brand & Hub Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs flex items-center border border-white/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/g1_mart_banner_transparent.png"
                  alt="G1mart"
                  className="h-6 sm:h-7 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-lg text-white tracking-tight truncate">
                    {user?.name || 'Sai Ganesh'}
                  </span>
                  <span className="text-[10px] bg-[#F5B800] text-stone-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                    Fleet Partner
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-100/80 truncate mt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Nellore Darkstore Hub #01</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono font-bold text-white text-[11px]">AP 26 EQ 1589</span>
                </div>
              </div>
            </div>

            {/* Right: Duty Switcher & Utilities */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Duty Toggle Button (high contrast) */}
              <button
                type="button"
                onClick={handleDutyToggleRequest}
                className={`h-9 sm:h-10 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-xs active:scale-95 border cursor-pointer ${
                  isOnDuty
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 border-emerald-400'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-600'
                }`}
                title={isOnDuty ? 'Tap to go off duty' : 'Tap to receive orders'}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnDuty ? 'bg-stone-950 animate-pulse' : 'bg-stone-400'
                  }`}
                />
                <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
              </button>

              <button
                type="button"
                onClick={() => soundAlerts.playRiderAssignmentChime()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center justify-center transition-all border border-white/10 active:scale-95 cursor-pointer"
                title="Test notification chime"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 active:scale-95 cursor-pointer"
                title="Refresh dispatch queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Profile Drawer Trigger on Mobile */}
              <button
                type="button"
                onClick={() => setShowProfileDrawer(true)}
                className="lg:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15"
                title="Rider Profile"
              >
                <User className="w-4 h-4 text-emerald-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Off Duty Alert Banner */}
        {!isOnDuty && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs mb-4 animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <strong className="block text-stone-900">Shift Paused · You are currently Off Duty</strong>
                <span className="text-stone-600">Turn duty ON to receive new darkstore dispatch orders.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleDuty(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shrink-0 active:scale-95 transition-all shadow-xs"
            >
              Go On Duty
            </button>
          </div>
        )}

        {/* ================= MAIN RESPONSIVE WORKSPACE ================= */}
        {/* On laptop/desktop: 2 columns (Left sidebar + Right order queue) */}
        {/* On mobile: 1 column */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">

          {/* ----- LEFT SIDEBAR (Desktop / Tablet) ----- */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-4">
            {/* Shift Metrics Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3">
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs text-center lg:text-left lg:flex lg:items-center lg:justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Active Trips
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-stone-900">
                    {metrics.activeCount}
                  </span>
                </div>
                <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-stone-100 text-stone-600 items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs text-center lg:text-left lg:flex lg:items-center lg:justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Delivered
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-emerald-600">
                    {metrics.deliveredCount}
                  </span>
                </div>
                <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-3.5 sm:p-4 shadow-2xs text-center lg:text-left lg:flex lg:items-center lg:justify-between">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Cash in Hand
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-[#1E6B2E]">
                    ₹{metrics.cashInHand}
                  </span>
                </div>
                <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Desktop Rider Details Card (Visible on Laptop) */}
            <div className="hidden lg:block bg-white rounded-3xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-lg">
                  <User className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base">{user?.name || 'Sai Ganesh'}</h3>
                  <p className="text-xs text-stone-500 font-medium truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 font-medium">Assigned Hub</span>
                  <span className="font-bold text-stone-900">Nellore Darkstore Hub #01</span>
                </div>
                <div className="flex justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 font-medium">Bike Plate</span>
                  <span className="font-mono font-bold text-stone-900">AP 26 EQ 1589</span>
                </div>
                <div className="flex justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 font-medium">Shift Cash Deposit</span>
                  <span className="font-mono font-black text-[#1E6B2E]">₹{metrics.cashInHand}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-stone-200/80"
                >
                  <span>Open Storefront ↗</span>
                </Link>

                <button
                  type="button"
                  onClick={() => signOut?.()}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Rider</span>
                </button>
              </div>
            </div>

            {/* Cash Settlement Banner */}
            {metrics.cashInHand > 0 && (
              <div className="bg-stone-900 text-white p-4 rounded-3xl border border-stone-800 shadow-md space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">
                    End-of-Shift Cash Settlement
                  </span>
                  <span className="font-mono text-base font-black text-white">
                    ₹{metrics.cashInHand}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Please deposit all cash collected from COD orders with the store cashier at G1mart Nellore Hub at the end of your shift.
                </p>
              </div>
            )}
          </aside>

          {/* ----- RIGHT MAIN AREA (Orders, Active Trip, Queue) ----- */}
          <main className="flex-1 w-full min-w-0 space-y-4">

            {/* 1. ACTIVE TRIP HERO CARD (If order out for delivery) */}
            {ongoingTrip && (
              <div className="bg-gradient-to-br from-[#0A240F] via-[#103817] to-[#185322] border-2 border-emerald-400 text-white rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
                      Active Delivery In Progress
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-black text-white bg-white/15 px-2.5 py-1 rounded-xl border border-white/10">
                    #{ongoingTrip.id}
                  </span>
                </div>

                {/* Customer & Address Details */}
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base sm:text-lg text-white">
                      {ongoingTrip.address?.fullName || 'Customer'}
                    </span>
                    {ongoingTrip.address?.mobileNumber && (
                      <a
                        href={`tel:${ongoingTrip.address.mobileNumber}`}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    )}
                  </div>

                  <p className="text-emerald-100/90 leading-snug text-xs sm:text-sm">
                    {ongoingTrip.address?.houseFlat ? `${ongoingTrip.address.houseFlat}, ` : ''}
                    {ongoingTrip.address?.streetArea}, {ongoingTrip.address?.city || 'Nellore'}
                    {ongoingTrip.address?.pincode ? ` - ${ongoingTrip.address.pincode}` : ''}
                  </p>

                  {ongoingTrip.address?.landmark && (
                    <p className="text-xs text-emerald-200/80 italic">
                      📍 Landmark: {ongoingTrip.address.landmark}
                    </p>
                  )}
                </div>

                {/* High-Visibility Cash Warning Banner (if COD) */}
                {!ongoingTrip.isPaid && ongoingTrip.paymentMethod === 'Cash on Delivery' ? (
                  <div className="bg-rose-500 text-white p-3.5 rounded-2xl font-black flex items-center justify-between shadow-md border border-rose-300 animate-pulse">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <DollarSign className="w-5 h-5" />
                      <span>CASH ON DELIVERY</span>
                    </div>
                    <span className="text-base sm:text-lg font-mono">COLLECT ₹{ongoingTrip.grandTotal}</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 text-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-emerald-400/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Prepaid Online (No Cash to Collect)</span>
                  </div>
                )}

                {/* Hero Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${
                      ongoingTrip.address?.latitude && ongoingTrip.address?.longitude
                        ? `${ongoingTrip.address.latitude},${ongoingTrip.address.longitude}`
                        : encodeURIComponent(
                            `${ongoingTrip.address?.streetArea || ''} Nellore`
                          )
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 bg-white text-stone-950 hover:bg-emerald-50 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-emerald-700 fill-emerald-700" />
                    <span>Open Google Maps</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRiderArrived(ongoingTrip)}
                    disabled={isArriving}
                    className="py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{isArriving ? 'Connecting...' : 'At Doorstep (Verify OTP)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. FILTER NAVIGATION TABS */}
            <div className="flex gap-2 p-1.5 bg-stone-200/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setTab('assigned')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  tab === 'assigned'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                My Trips ({orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length})
              </button>
              <button
                type="button"
                onClick={() => setTab('ready')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  tab === 'ready'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Hub Pickup ({orders.filter((o) => o.status === 'Packed' || o.status === 'Rider Assigned').length})
              </button>
              <button
                type="button"
                onClick={() => setTab('completed')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  tab === 'completed'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Delivered ({metrics.deliveredCount})
              </button>
            </div>

            {/* 3. ORDERS QUEUE LIST */}
            {loading && orders.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-400 font-bold">Connecting to dispatch fleet...</p>
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center space-y-3.5 shadow-2xs">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-800">No Orders in this Queue</h3>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    When darkstore staff pack orders or assign dispatches, route assignments will appear here instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Check for New Orders</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedOrders.map((o) => {
                  const currentStatus = o.status || 'Order Placed';
                  const isDelivered = currentStatus === 'Delivered';
                  const isOutForDelivery =
                    currentStatus === 'Out for Delivery' || currentStatus === 'Order Dispatched';
                  const isPacked = currentStatus === 'Packed' || currentStatus === 'Rider Assigned';

                  const customerPhone = o.address?.mobileNumber || o.address?.phone;
                  const destQuery =
                    o.address?.latitude && o.address?.longitude
                      ? `${o.address.latitude},${o.address.longitude}`
                      : encodeURIComponent(
                          `${o.address?.houseFlat || ''} ${o.address?.streetArea || ''} ${
                            o.address?.city || 'Nellore'
                          }`
                        );

                  const riderMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;
                  const isExpanded = Boolean(expandedItems[o.id]);

                  return (
                    <div
                      key={o.id}
                      className={`bg-white rounded-3xl border ${
                        isDelivered
                          ? 'border-stone-200/80 opacity-75'
                          : isOutForDelivery
                          ? 'border-purple-300 shadow-md ring-1 ring-purple-100'
                          : 'border-stone-300/80 shadow-xs'
                      } p-4 sm:p-5 space-y-3.5 transition-all`}
                    >
                      {/* Top Bar: Order ID, Status, Payment Alert */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm sm:text-base text-stone-900">
                              #{o.id}
                            </span>
                            <span
                              className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isDelivered
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isOutForDelivery
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200 animate-pulse'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {currentStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            {o.date} · Slot: {o.slot}
                          </span>
                        </div>

                        {/* Payment Callout */}
                        <div className="text-right">
                          {o.isPaid || o.paymentMethod === 'UPI' || o.paymentStatus === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>PAID ONLINE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                              <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                              <span>COLLECT ₹{o.grandTotal}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customer & Doorstep Delivery Details */}
                      <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-extrabold text-stone-900 text-sm sm:text-base">
                            {o.address?.fullName || 'Customer'}
                          </div>
                          {customerPhone && (
                            <a
                              href={`tel:${customerPhone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs shadow-xs transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Customer</span>
                            </a>
                          )}
                        </div>

                        <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                          {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}
                          {o.address?.streetArea}, {o.address?.city || 'Nellore'}
                          {o.address?.pincode ? ` - ${o.address.pincode}` : ''}
                        </p>

                        {o.address?.landmark && (
                          <p className="text-xs text-stone-500 italic">
                            📍 Landmark: {o.address.landmark}
                          </p>
                        )}
                      </div>

                      {/* Grocery Items Collapsible Section */}
                      <div className="border border-stone-200/60 rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleItems(o.id)}
                          className="w-full p-2.5 bg-stone-50/70 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-stone-500" />
                            <span>
                              {o.items?.length || 0} Grocery {o.items?.length === 1 ? 'Item' : 'Items'} in Bag
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <span>{isExpanded ? 'Hide items' : 'View checklist'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3 bg-white divide-y divide-stone-100 text-xs">
                            {o.items?.map((it, idx) => (
                              <div key={idx} className="py-1.5 flex items-center justify-between">
                                <span className="font-semibold text-stone-800">
                                  {it.productName}
                                </span>
                                <span className="font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-lg text-[11px]">
                                  Qty: {it.quantity} {it.unit ? `· ${it.unit}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Rider Primary Actions */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <a
                          href={riderMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 sm:py-3 px-3 bg-[#0E2813] hover:bg-black text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                        >
                          <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                          <span>Google Maps</span>
                        </a>

                        {!isDelivered ? (
                          isOutForDelivery ? (
                            <button
                              type="button"
                              onClick={() => handleRiderArrived(o)}
                              disabled={isArriving}
                              className="py-2.5 sm:py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-amber-300" />
                              <span>{isArriving ? 'Connecting...' : 'At Doorstep (OTP)'}</span>
                            </button>
                          ) : isPacked ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(o.id, 'Out for Delivery', true)}
                              disabled={updatingId === o.id}
                              className="py-2.5 sm:py-3 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                            >
                              <Truck className="w-4 h-4" />
                              <span>{updatingId === o.id ? 'Starting...' : 'Start Delivery'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(o.id, 'Packed', true)}
                              disabled={updatingId === o.id}
                              className="py-2.5 sm:py-3 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                            >
                              <Bike className="w-4 h-4" />
                              <span>{updatingId === o.id ? 'Claiming...' : 'Claim & Pick Up'}</span>
                            </button>
                          )
                        ) : (
                          <div className="py-2.5 sm:py-3 px-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* ================= MODAL: RIDER PROFILE & SHIFT DRAWER (MOBILE) ================= */}
        {showProfileDrawer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <User className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900">{user?.name || 'Sai Ganesh'}</h3>
                    <p className="text-[11px] text-stone-500 font-medium">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileDrawer(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 font-medium">Assigned Hub</span>
                  <span className="font-bold text-stone-900">Nellore Darkstore Hub #01</span>
                </div>
                <div className="flex justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 font-medium">Registered Vehicle</span>
                  <span className="font-mono font-bold text-stone-900">AP 26 EQ 1589</span>
                </div>
                <div className="flex justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-500 font-medium">Cash to Deposit</span>
                  <span className="font-mono font-bold text-emerald-700">₹{metrics.cashInHand}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    signOut?.();
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out from Rider Fleet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: CONFIRM GO OFF DUTY ================= */}
        {showOffDutyConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xs w-full p-5 space-y-3 shadow-2xl text-center animate-in slide-in-from-bottom">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Power className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-stone-900">Go Off Duty?</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                You will stop receiving new delivery order dispatch alerts until you turn duty back ON.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOffDutyConfirm(false)}
                  className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Stay On Duty
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGoOffDuty}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Go Off Duty
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: DOORSTEP OTP VERIFICATION SHEET ================= */}
        {otpModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl space-y-3.5 border-t sm:border border-stone-200 animate-in slide-in-from-bottom duration-200">
              <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto sm:hidden" />

              {/* Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>DOORSTEP OTP VERIFICATION</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-stone-900">
                  Ask Customer for 4-Digit PIN
                </h3>
                <p className="text-xs text-stone-500">
                  Order #{otpModalOrder.id} · <span className="font-bold text-stone-700">{otpModalOrder.address?.fullName || 'Customer'}</span>
                </p>
              </div>

              {/* Cash Collection Requirement (if COD) */}
              {(!otpModalOrder.isPaid || otpModalOrder.paymentMethod === 'Cash on Delivery') && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-rose-900">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-rose-600" />
                      <span>CASH ON DELIVERY</span>
                    </span>
                    <span className="text-sm font-mono font-black text-rose-700">
                      Collect ₹{otpModalOrder.grandTotal}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer pt-1 border-t border-rose-200/60">
                    <input
                      type="checkbox"
                      checked={cashCollectedChecked}
                      onChange={(e) => setCashCollectedChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
                    />
                    <span>I have received ₹{otpModalOrder.grandTotal} cash</span>
                  </label>
                </div>
              )}

              {/* 4 Digit Boxes */}
              <div className="flex justify-center items-center gap-2.5 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const digit = otpDigits[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center font-mono text-2xl font-black shadow-inner transition-all ${
                        digit
                          ? 'border-emerald-600 bg-white text-emerald-700'
                          : otpError
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-stone-300 bg-stone-50 text-stone-900'
                      }`}
                    >
                      {digit}
                    </div>
                  );
                })}
              </div>

              {/* Feedback / Error Message */}
              {otpError ? (
                <div className="text-center text-xs font-black text-rose-600 animate-pulse">
                  ⚠️ {otpError}
                </div>
              ) : (
                <div className="text-center text-[11px] text-stone-400">
                  Customer has the 4-digit PIN on their order screen
                </div>
              )}

              {/* Custom Large Mobile Number Pad */}
              <div className="grid grid-cols-3 gap-1.5 px-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePressOtpDigit(num)}
                    disabled={isVerifyingOtp}
                    className="h-11 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-900 rounded-xl font-black text-lg shadow-xs transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOtpModalOrder(null);
                    setOtpDigits('');
                    setOtpError(null);
                  }}
                  className="h-11 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handlePressOtpDigit('0')}
                  disabled={isVerifyingOtp}
                  className="h-11 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-900 rounded-xl font-black text-lg shadow-xs transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleDeleteOtpDigit}
                  disabled={isVerifyingOtp || otpDigits.length === 0}
                  className="h-11 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-800 rounded-xl font-black text-base shadow-xs transition-all flex items-center justify-center cursor-pointer"
                >
                  ⌫
                </button>
              </div>

              {/* Primary Submit Button */}
              <button
                type="button"
                onClick={() => triggerOtpVerification()}
                disabled={isVerifyingOtp || otpDigits.length !== 4}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <span>Verifying PIN...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Complete Handover</span>
                  </>
                )}
              </button>

              {/* Footer Utilities: Resend / Call Customer */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-emerald-700 font-bold hover:underline disabled:text-stone-400 text-[11px] cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : '🔄 Resend Alert'}
                </button>
                {otpModalOrder.address?.mobileNumber && (
                  <a
                    href={`tel:${otpModalOrder.address.mobileNumber}`}
                    className="text-stone-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Phone className="w-3 h-3 text-emerald-700" />
                    <span>Call Customer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: CELEBRATION SUCCESS ================= */}
        {deliverySuccessOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 text-center space-y-3.5 max-w-xs w-full shadow-2xl animate-in zoom-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  VERIFIED &amp; DELIVERED
                </span>
                <h3 className="text-base font-black text-stone-900 mt-1.5">
                  Delivery Completed!
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Order #{deliverySuccessOrder.id} safely delivered to {deliverySuccessOrder.address?.fullName || 'Customer'}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeliverySuccessOrder(null)}
                className="w-full py-2.5 bg-[#0C2411] hover:bg-black text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Back to Dispatch Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </RiderAuthGuard>
  );
}
