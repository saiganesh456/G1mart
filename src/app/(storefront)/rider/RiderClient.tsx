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
  const [itemsHandedOverChecked, setItemsHandedOverChecked] = useState(false);
  const [showModalItems, setShowModalItems] = useState(false);
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(new Set());
  const [deliverySuccessOrder, setDeliverySuccessOrder] = useState<Order | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

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
            try {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 300]);
              }
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('🛵 New Delivery Assigned!', {
                  body: 'A new dispatch trip is ready in your queue. Open app to view.',
                  icon: '/logo.png',
                  badge: '/logo.png',
                  tag: 'new-rider-order',
                });
              }
            } catch {}
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
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchOrders();
      }
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Unlock Audio on first interaction & sync Notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
    const handleUnlock = () => {
      soundAlerts.unlockAudio();
    };
    window.addEventListener('click', handleUnlock, { passive: true });
    window.addEventListener('touchstart', handleUnlock, { passive: true });
    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
    };
  }, []);

  const handleEnableRiderAlerts = async () => {
    soundAlerts.unlockAudio();
    soundAlerts.playRiderAssignmentChime();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPushPermission(res);
      } catch {}
    }
  };

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
          orderFallback: targetOrder,
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
        headers: {
          'Content-Type': 'application/json',
          'x-rider-client': 'true',
          'x-user-email': (user?.email || '').toLowerCase().trim(),
        },
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
      setCashCollectedChecked(Boolean(order.isPaid || order.paymentMethod !== 'Cash on Delivery'));
      setItemsHandedOverChecked(false);
      setShowModalItems(false);
    }
  };

  const handlePressOtpDigit = (digit: string) => {
    if (!otpModalOrder) return;
    const isCod = !otpModalOrder.isPaid && otpModalOrder.paymentMethod === 'Cash on Delivery';
    if (isCod && !cashCollectedChecked) {
      setOtpError(`Please confirm collecting ₹${otpModalOrder.grandTotal} cash first`);
      return;
    }

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
    const isCod = !otpModalOrder.isPaid && otpModalOrder.paymentMethod === 'Cash on Delivery';
    if (isCod && !cashCollectedChecked) {
      setOtpError(`Please collect ₹${otpModalOrder.grandTotal} cash and tap confirm first`);
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch(`/api/rider/orders/${otpModalOrder.id}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rider-client': 'true',
          'x-user-email': (user?.email || '').toLowerCase().trim(),
        },
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

        // If rider has an active delivery in progress, it is prominently pinned in the Hero Card at the top!
        // In the list below, show OTHER assigned trips (queue) so the active trip is NEVER duplicated!
        if (ongoingTrip) {
          return o.id !== ongoingTrip.id && (assignedToMe || !o.assignedRider);
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
      {/* Strict overflow protection so mobile screens never clip on the right */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-6 pb-36 sm:pb-24 lg:pb-12 min-w-0 max-w-full overflow-x-hidden box-border">

        {/* ================= 1. RESPONSIVE TOP HEADER ================= */}
        <header className="bg-gradient-to-r from-[#0C2411] via-[#12381A] to-[#1B5E20] text-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg border border-emerald-900/60 mb-3 sm:mb-6 w-full min-w-0 max-w-full box-border">
          
          {/* A. MOBILE-SPECIFIC HEADER (< sm: 640px) — 2 Clean Rows, Zero Overflow */}
          <div className="sm:hidden space-y-2.5">
            {/* Mobile Row 1: Logo on Left, Action Pills on Right */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="bg-white px-2 py-0.5 rounded-lg shadow-2xs flex items-center border border-white/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/g1_mart_banner_transparent.png"
                  alt="G1mart"
                  className="h-5 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Duty Toggle Button */}
                <button
                  type="button"
                  onClick={handleDutyToggleRequest}
                  className={`h-7 px-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 shadow-xs active:scale-95 border cursor-pointer ${
                    isOnDuty
                      ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                      : 'bg-stone-800 text-stone-300 border-stone-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnDuty ? 'bg-stone-950 animate-pulse' : 'bg-stone-400'
                    }`}
                  />
                  <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
                </button>

                {/* Sound Chime Button */}
                <button
                  type="button"
                  onClick={() => soundAlerts.playRiderAssignmentChime()}
                  className="w-7 h-7 rounded-lg bg-white/10 text-emerald-300 flex items-center justify-center border border-white/15 active:scale-95 cursor-pointer"
                  title="Test alert sound"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                {/* Refresh Queue Button */}
                <button
                  type="button"
                  onClick={fetchOrders}
                  disabled={loading}
                  className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/15 active:scale-95 cursor-pointer"
                  title="Refresh orders"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* Profile Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setShowProfileDrawer(true)}
                  className="w-7 h-7 rounded-lg bg-white/15 text-white flex items-center justify-center border border-white/20 active:scale-95 cursor-pointer"
                  title="Rider Profile"
                >
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              </div>
            </div>

            {/* Mobile Row 2: Rider Name & Station Badge Sub-bar */}
            <div className="flex items-center justify-between text-xs text-emerald-100/90 pt-2 border-t border-white/10 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="font-extrabold text-white text-xs truncate">
                  {user?.name || 'Sai Ganesh'}
                </span>
                <span className="text-[9px] bg-[#F5B800] text-stone-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shrink-0">
                  Partner
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-200 shrink-0">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Hub #01 • AP 26 EQ 1589</span>
              </div>
            </div>
          </div>

          {/* B. DESKTOP / TABLET HEADER (>= sm: 640px) — 1 Wide Spacious Row */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4 min-w-0">
            {/* Left: Brand & Hub Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs flex items-center border border-white/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/g1_mart_banner_transparent.png"
                  alt="G1mart"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base sm:text-lg text-white tracking-tight truncate">
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
                className="w-9 h-9 sm:h-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center justify-center transition-all border border-white/10 active:scale-95 cursor-pointer"
                title="Test notification chime"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="w-9 h-9 sm:h-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 active:scale-95 cursor-pointer"
                title="Refresh dispatch queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Off Duty Alert Banner */}
        {!isOnDuty && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs mb-3 sm:mb-4 animate-in fade-in w-full min-w-0 max-w-full box-border">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="min-w-0 truncate">
                <strong className="block text-stone-900 truncate">Shift Paused · You are Off Duty</strong>
                <span className="text-stone-600 truncate text-[11px] block">Turn duty ON to receive orders</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleDuty(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shrink-0 active:scale-95 transition-all shadow-xs"
            >
              Go On Duty
            </button>
          </div>
        )}

        {/* Rider Sound & Push Notification Permission Banner */}
        {pushPermission !== 'granted' && isOnDuty && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-xs text-emerald-950 flex items-center justify-between gap-3 shadow-xs mb-3 sm:mb-4 animate-in fade-in w-full min-w-0 max-w-full box-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                🔔
              </div>
              <div className="min-w-0">
                <strong className="block text-stone-900 truncate">Enable Dispatch Alerts</strong>
                <span className="text-emerald-700 truncate text-[11px] block">Hear order chimes &amp; receive new trip alerts</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnableRiderAlerts}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs shrink-0 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              Enable
            </button>
          </div>
        )}

        {/* ================= MAIN RESPONSIVE WORKSPACE ================= */}
        {/* On laptop/desktop: 2 columns (Left sidebar + Right order queue) */}
        {/* On mobile: 1 column, perfect fit with zero right-side clipping */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start w-full min-w-0 max-w-full box-border">

          {/* ----- LEFT SIDEBAR (Desktop / Tablet) ----- */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-3 sm:space-y-4 min-w-0 max-w-full">
            
            {/* Shift Metrics Grid: 3 Clean Columns with strict min-w-0 */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 w-full min-w-0 max-w-full">
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-2.5 sm:p-4 shadow-2xs text-center lg:text-left lg:flex lg:items-center lg:justify-between min-w-0 overflow-hidden">
                <div className="min-w-0 w-full lg:w-auto">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-tight block truncate">
                    Active Trips
                  </span>
                  <span className="text-base sm:text-2xl font-black text-stone-900 block truncate mt-0.5">
                    {metrics.activeCount}
                  </span>
                </div>
                <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-stone-100 text-stone-600 items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-2.5 sm:p-4 shadow-2xs text-center lg:text-left lg:flex lg:items-center lg:justify-between min-w-0 overflow-hidden">
                <div className="min-w-0 w-full lg:w-auto">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-tight block truncate">
                    Delivered
                  </span>
                  <span className="text-base sm:text-2xl font-black text-emerald-600 block truncate mt-0.5">
                    {metrics.deliveredCount}
                  </span>
                </div>
                <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-2.5 sm:p-4 shadow-2xs text-center lg:text-left lg:flex lg:items-center lg:justify-between min-w-0 overflow-hidden">
                <div className="min-w-0 w-full lg:w-auto">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-tight block truncate">
                    Cash in Hand
                  </span>
                  <span className="text-base sm:text-2xl font-black text-[#1E6B2E] block truncate mt-0.5">
                    ₹{metrics.cashInHand}
                  </span>
                </div>
                <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 items-center justify-center shrink-0">
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
                <div className="min-w-0">
                  <h3 className="font-black text-stone-900 text-base truncate">{user?.name || 'Sai Ganesh'}</h3>
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
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Rider</span>
                </button>
              </div>
            </div>

            {/* Cash Settlement Banner */}
            {metrics.cashInHand > 0 && (
              <div className="bg-stone-900 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-800 shadow-md space-y-1 w-full min-w-0 max-w-full box-border">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs font-black text-emerald-400 truncate">
                    End-of-Shift Cash Settlement
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-white shrink-0">
                    ₹{metrics.cashInHand}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug break-words">
                  Deposit collected cash with the cashier at G1mart Nellore Hub at the end of your shift.
                </p>
              </div>
            )}
          </aside>

          {/* ----- RIGHT MAIN AREA (Orders, Active Trip, Queue) ----- */}
          <main className="flex-1 w-full min-w-0 max-w-full space-y-3 sm:space-y-4 box-border">

            {/* 1. ACTIVE TRIP HERO CARD (If order out for delivery) */}
            {ongoingTrip && (
              <div className="bg-gradient-to-br from-[#0A240F] via-[#103817] to-[#185322] border-2 border-emerald-400 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl space-y-3 animate-in zoom-in-95 duration-200 w-full min-w-0 max-w-full box-border">
                <div className="flex items-center justify-between pb-2 border-b border-white/15 min-w-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 truncate">
                      Active Delivery Trip
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-black text-white bg-white/15 px-2 py-0.5 rounded-lg border border-white/10 shrink-0">
                    #{ongoingTrip.id}
                  </span>
                </div>

                {/* Customer & Address Details */}
                <div className="bg-white/10 rounded-2xl p-3 border border-white/10 space-y-1.5 text-xs sm:text-sm min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="font-black text-sm sm:text-base text-white truncate">
                      {ongoingTrip.address?.fullName || 'Customer'}
                    </span>
                    {ongoingTrip.address?.mobileNumber && (
                      <a
                        href={`tel:${ongoingTrip.address.mobileNumber}`}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>

                  <p className="text-emerald-100/90 leading-snug text-xs sm:text-sm break-words">
                    {ongoingTrip.address?.houseFlat ? `${ongoingTrip.address.houseFlat}, ` : ''}
                    {ongoingTrip.address?.streetArea}, {ongoingTrip.address?.city || 'Nellore'}
                    {ongoingTrip.address?.pincode ? ` - ${ongoingTrip.address.pincode}` : ''}
                  </p>

                  {ongoingTrip.address?.landmark && (
                    <p className="text-[11px] sm:text-xs text-emerald-200/80 italic truncate">
                      📍 Landmark: {ongoingTrip.address.landmark}
                    </p>
                  )}
                </div>

                {/* Sleek High-Contrast Payment Chip */}
                {!ongoingTrip.isPaid && ongoingTrip.paymentMethod === 'Cash on Delivery' ? (
                  <div className="bg-amber-400 text-stone-950 px-3.5 py-2.5 rounded-xl font-black flex items-center justify-between shadow-md min-w-0 gap-2">
                    <div className="flex items-center gap-1.5 text-xs truncate">
                      <span className="w-5 h-5 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">₹</span>
                      <span className="truncate tracking-wide">CASH ON DELIVERY</span>
                    </div>
                    <span className="text-sm sm:text-base font-mono font-black shrink-0">COLLECT ₹{ongoingTrip.grandTotal}</span>
                  </div>
                ) : (
                  <div className="bg-white/10 text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between border border-white/10 truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Prepaid Online Order</span>
                    </div>
                    <span className="font-mono text-emerald-300 font-bold shrink-0">₹0 to collect</span>
                  </div>
                )}

                {/* Collapsible Items Inspector for Active Trip */}
                <div className="bg-white/10 rounded-xl overflow-hidden border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleItems(ongoingTrip.id)}
                    className="w-full px-3 py-2 flex items-center justify-between font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span className="truncate">
                        {ongoingTrip.items?.length || 1} {(ongoingTrip.items?.length || 1) === 1 ? 'Grocery Item' : 'Grocery Items'} (Verify Products)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1 shrink-0 ml-2">
                      {expandedItems[ongoingTrip.id] ? 'Hide Items' : 'View Items'}
                      {expandedItems[ongoingTrip.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </span>
                  </button>
                  {expandedItems[ongoingTrip.id] && (
                    <div className="px-3 pb-2.5 pt-1 border-t border-white/10 max-h-36 overflow-y-auto space-y-1.5 divide-y divide-white/5">
                      {ongoingTrip.items && ongoingTrip.items.length > 0 ? (
                        ongoingTrip.items.map((it, idx) => (
                          <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              {it.image ? (
                                <img src={it.image} alt={it.productName} className="w-6 h-6 rounded object-contain bg-white shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-[10px] shrink-0">
                                  📦
                                </div>
                              )}
                              <span className="text-white truncate font-medium text-xs">{it.productName}</span>
                            </div>
                            <span className="font-mono font-black text-emerald-300 shrink-0 text-xs bg-white/10 px-1.5 py-0.5 rounded">
                              ×{it.quantity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-white/60 py-1">Items listed on store packing slip</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Hero Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 w-full min-w-0">
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
                    className="py-2.5 sm:py-3 bg-white text-stone-950 hover:bg-emerald-50 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-center truncate"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700 shrink-0" />
                    <span className="truncate">Open Maps</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRiderArrived(ongoingTrip)}
                    disabled={isArriving}
                    className="py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer text-center truncate"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isArriving ? 'Connecting...' : 'Reached Destination'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. FILTER NAVIGATION TABS — Guaranteed to fit with min-w-0 and truncate */}
            <div className="flex gap-1 p-1 bg-stone-200/80 rounded-2xl w-full min-w-0 max-w-full overflow-hidden box-border">
              <button
                type="button"
                onClick={() => setTab('assigned')}
                className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer truncate text-center ${
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
                className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer truncate text-center ${
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
                className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer truncate text-center ${
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
              ongoingTrip && tab === 'assigned' ? (
                <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 text-center space-y-2 shadow-2xs w-full min-w-0 max-w-full box-border">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">Current Trip Active Above</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    You are currently delivering order #{ongoingTrip.id}. Complete this handover to receive your next route assignments.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 text-center space-y-3 shadow-2xs w-full min-w-0 max-w-full box-border">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Truck className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-800">No Orders in this Queue</h3>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      When darkstore staff pack orders or assign dispatches, route assignments will appear here instantly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check for New Orders</span>
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-3 w-full min-w-0 max-w-full box-border">
                {ongoingTrip && tab === 'assigned' && (
                  <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1 pt-1">
                    <span>Upcoming Trips in Queue ({displayedOrders.length})</span>
                  </div>
                )}
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
                      className={`bg-white rounded-2xl sm:rounded-3xl border ${
                        isDelivered
                          ? 'border-stone-200/80 opacity-75'
                          : isOutForDelivery
                          ? 'border-purple-300 shadow-md ring-1 ring-purple-100'
                          : 'border-stone-300/80 shadow-xs'
                      } p-3.5 sm:p-5 space-y-3 transition-all w-full min-w-0 max-w-full box-border`}
                    >
                      {/* Top Bar: Order ID, Status, Payment Alert */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 min-w-0 gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className="font-mono font-black text-xs sm:text-base text-stone-900 truncate">
                              #{o.id}
                            </span>
                            <span
                              className={`text-[9px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
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
                          <span className="text-[10px] text-stone-400 block mt-0.5 truncate">
                            {o.date} · Slot: {o.slot}
                          </span>
                        </div>

                        {/* Payment Callout */}
                        <div className="text-right shrink-0">
                          {o.isPaid || o.paymentMethod === 'UPI' || o.paymentStatus === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>PAID</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                              <DollarSign className="w-3 h-3 text-rose-600" />
                              <span>COLLECT ₹{o.grandTotal}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customer & Doorstep Delivery Details */}
                      <div className="bg-stone-50 rounded-xl sm:rounded-2xl p-3 border border-stone-200/70 space-y-1.5 text-xs sm:text-sm min-w-0">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <div className="font-extrabold text-stone-900 text-xs sm:text-base truncate">
                            {o.address?.fullName || 'Customer'}
                          </div>
                          {customerPhone && (
                            <a
                              href={`tel:${customerPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg text-xs shadow-xs transition-colors shrink-0"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>

                        <p className="text-stone-700 leading-relaxed text-xs sm:text-sm break-words">
                          {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}
                          {o.address?.streetArea}, {o.address?.city || 'Nellore'}
                        </p>

                        {o.address?.landmark && (
                          <p className="text-[11px] text-stone-500 italic truncate">
                            📍 Landmark: {o.address.landmark}
                          </p>
                        )}
                      </div>

                      {/* Grocery Items Collapsible Section */}
                      <div className="border border-stone-200/60 rounded-xl sm:rounded-2xl overflow-hidden w-full min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleItems(o.id)}
                          className="w-full p-2 sm:p-2.5 bg-stone-50/70 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors cursor-pointer min-w-0"
                        >
                          <div className="flex items-center gap-1.5 truncate min-w-0">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="truncate font-extrabold text-stone-900">
                              {o.items?.length || 0} Grocery {o.items?.length === 1 ? 'Item' : 'Items'} (Inspect Items)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0">
                            <span className="font-semibold text-emerald-800">{isExpanded ? 'Hide' : 'View Details'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-2.5 bg-white divide-y divide-stone-100 text-xs">
                            {o.items && o.items.length > 0 ? (
                              o.items.map((it, idx) => (
                                <div key={idx} className="py-2 flex items-center justify-between text-xs min-w-0 gap-2">
                                  <div className="flex items-center gap-2 min-w-0 truncate">
                                    {it.image && (
                                      <img
                                        src={it.image}
                                        alt={it.productName}
                                        className="w-9 h-9 rounded-lg object-contain bg-stone-50 border border-stone-200 shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0 truncate">
                                      <p className="font-bold text-stone-900 text-xs truncate">{it.productName}</p>
                                      {it.unit && <p className="text-[10px] text-stone-500 font-medium">{it.unit}</p>}
                                    </div>
                                  </div>
                                  <span className="font-black text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg text-xs shrink-0 border border-stone-200">
                                    Qty: {it.quantity}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-stone-400 py-1.5 text-center">Items listed on store bill / packing slip</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Rider Primary Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1 w-full min-w-0">
                        <a
                          href={riderMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 sm:py-3 px-2 bg-[#0E2813] hover:bg-black text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] truncate text-center"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 shrink-0" />
                          <span className="truncate">Maps</span>
                        </a>

                        {!isDelivered ? (
                          isOutForDelivery ? (
                            <button
                              type="button"
                              onClick={() => handleRiderArrived(o)}
                              disabled={isArriving}
                              className="py-2.5 sm:py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer truncate text-center"
                            >
                              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                              <span className="truncate">{isArriving ? 'Connecting...' : 'Reached Destination'}</span>
                            </button>
                          ) : isPacked ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(o.id, 'Out for Delivery', true)}
                              disabled={updatingId === o.id}
                              className="py-2.5 sm:py-3 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer truncate text-center"
                            >
                              <Truck className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{updatingId === o.id ? 'Starting...' : 'Start Trip'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(o.id, 'Packed', true)}
                              disabled={updatingId === o.id}
                              className="py-2.5 sm:py-3 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer truncate text-center"
                            >
                              <Bike className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{updatingId === o.id ? 'Claiming...' : 'Claim & Pick'}</span>
                            </button>
                          )
                        ) : (
                          <div className="py-2.5 sm:py-3 px-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-1 border border-emerald-200 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">Delivered</span>
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

        {/* ================= MODAL: STREAMLINED DOORSTEP HANDOVER SHEET ================= */}
        {otpModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border-t sm:border border-stone-200 animate-in slide-in-from-bottom duration-200 max-h-[94vh] overflow-y-auto">
              {/* Top drag handle indicator for mobile sheet */}
              <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

              {/* Header with Title and Close Button */}
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-stone-100">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    <span>Reached Destination</span>
                  </div>
                  <h3 className="text-base font-black text-stone-900 truncate">
                    {otpModalOrder.address?.fullName || 'Customer Handover'}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium truncate">
                    Order #{otpModalOrder.id} {otpModalOrder.address?.streetArea ? `· ${otpModalOrder.address.streetArea}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpModalOrder(null);
                    setOtpDigits('');
                    setOtpError(null);
                    setShowModalItems(false);
                  }}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-3">
                {/* Clean 1-Line Collapsible Product Handover Bar */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setShowModalItems((prev) => !prev)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-stone-800 hover:bg-stone-100/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        {otpModalOrder.items?.length || 1} {(otpModalOrder.items?.length || 1) === 1 ? 'Item' : 'Items'} to Hand Over
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                      {showModalItems ? 'Hide Items' : 'View Items'}
                      {showModalItems ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {showModalItems && (
                    <div className="px-3 pb-3 pt-1 border-t border-stone-200/70 max-h-36 overflow-y-auto space-y-1.5 divide-y divide-stone-100">
                      {otpModalOrder.items && otpModalOrder.items.length > 0 ? (
                        otpModalOrder.items.map((it, idx) => (
                          <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              {it.image ? (
                                <img
                                  src={it.image}
                                  alt={it.productName}
                                  className="w-7 h-7 rounded-lg object-contain bg-white border border-stone-200 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 shrink-0">
                                  📦
                                </div>
                              )}
                              <span className="font-bold text-stone-800 truncate text-xs">{it.productName}</span>
                            </div>
                            <span className="font-black text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md shrink-0 text-xs font-mono">
                              ×{it.quantity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 py-1">Items listed on store packing slip</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tactile Cash on Delivery Card (or Prepaid Badge) */}
                {(!otpModalOrder.isPaid || otpModalOrder.paymentMethod === 'Cash on Delivery') ? (
                  cashCollectedChecked ? (
                    <button
                      type="button"
                      onClick={() => setCashCollectedChecked(false)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 hover:bg-emerald-100/70 transition-all text-left shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                            Cash Collected
                          </div>
                          <div className="text-sm font-black text-emerald-950 font-mono">
                            ₹{otpModalOrder.grandTotal} Received
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold underline hover:text-emerald-900">
                        Change
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCashCollectedChecked(true);
                        setOtpError(null);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 hover:bg-amber-100/70 transition-all text-left shadow-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                          ₹
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                            Cash to Collect (COD)
                          </div>
                          <div className="text-sm font-black text-amber-950 font-mono">
                            Collect ₹{otpModalOrder.grandTotal}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1.5 rounded-xl bg-amber-600 group-hover:bg-amber-700 text-white text-xs font-black transition-colors shadow-xs">
                        Tap to Confirm
                      </span>
                    </button>
                  )
                ) : (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900">Prepaid Online Order</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 font-mono">₹0 to collect</span>
                  </div>
                )}

                {/* Customer Delivery PIN Entry */}
                <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-3 space-y-2.5">
                  <div className="text-center">
                    <div className="text-xs font-black text-stone-900">
                      Customer Delivery PIN
                    </div>
                    {(!otpModalOrder.isPaid && otpModalOrder.paymentMethod === 'Cash on Delivery' && !cashCollectedChecked) ? (
                      <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                        🔒 Confirm ₹{otpModalOrder.grandTotal} cash above to unlock PIN
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Ask customer for the 4-digit delivery PIN on their screen
                      </p>
                    )}
                  </div>

                  {/* 4 Digit Boxes */}
                  <div className="flex justify-center items-center gap-2.5">
                    {[0, 1, 2, 3].map((idx) => {
                      const digit = otpDigits[idx] || '';
                      const isLocked = !otpModalOrder.isPaid && otpModalOrder.paymentMethod === 'Cash on Delivery' && !cashCollectedChecked;
                      return (
                        <div
                          key={idx}
                          className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-2xl font-black shadow-inner transition-all ${
                            isLocked
                              ? 'border-stone-200 bg-stone-100 text-stone-300'
                              : digit
                              ? 'border-emerald-600 bg-white text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                              : otpError
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : 'border-stone-300 bg-white text-stone-900'
                          }`}
                        >
                          {isLocked ? '•' : digit}
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback / Error Message */}
                  {otpError && (
                    <div className="text-center text-xs font-black text-rose-600 animate-pulse">
                      ⚠️ {otpError}
                    </div>
                  )}

                  {/* Clean Number Pad: 1-9, Clear, 0, Backspace */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                      const isLocked = !otpModalOrder.isPaid && otpModalOrder.paymentMethod === 'Cash on Delivery' && !cashCollectedChecked;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePressOtpDigit(num)}
                          disabled={isVerifyingOtp || isLocked}
                          className={`h-10 rounded-xl font-black text-lg shadow-xs transition-all ${
                            isLocked
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed opacity-50'
                              : 'bg-white hover:bg-stone-100 active:scale-95 text-stone-900 border border-stone-200 cursor-pointer'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}

                    {/* Clear Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setOtpDigits('');
                        setOtpError(null);
                      }}
                      disabled={isVerifyingOtp || otpDigits.length === 0}
                      className="h-10 bg-white hover:bg-stone-100 active:scale-95 disabled:opacity-40 border border-stone-200 text-stone-600 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center cursor-pointer"
                    >
                      Clear
                    </button>

                    {/* Zero Button */}
                    {(() => {
                      const isLocked = !otpModalOrder.isPaid && otpModalOrder.paymentMethod === 'Cash on Delivery' && !cashCollectedChecked;
                      return (
                        <button
                          type="button"
                          onClick={() => handlePressOtpDigit('0')}
                          disabled={isVerifyingOtp || isLocked}
                          className={`h-10 rounded-xl font-black text-lg shadow-xs transition-all ${
                            isLocked
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed opacity-50'
                              : 'bg-white hover:bg-stone-100 active:scale-95 text-stone-900 border border-stone-200 cursor-pointer'
                          }`}
                        >
                          0
                        </button>
                      );
                    })()}

                    {/* Backspace Button */}
                    <button
                      type="button"
                      onClick={handleDeleteOtpDigit}
                      disabled={isVerifyingOtp || otpDigits.length === 0}
                      className="h-10 bg-stone-200 hover:bg-stone-300 active:scale-95 disabled:opacity-40 text-stone-800 rounded-xl font-black text-base shadow-xs transition-all flex items-center justify-center cursor-pointer"
                      aria-label="Backspace"
                    >
                      ⌫
                    </button>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="button"
                  onClick={() => triggerOtpVerification()}
                  disabled={isVerifyingOtp || otpDigits.length !== 4}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
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
