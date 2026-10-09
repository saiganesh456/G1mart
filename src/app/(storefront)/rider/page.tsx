'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
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
} from 'lucide-react';
import type { Order } from '@/types';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import RiderAuthGuard from '@/components/rider/RiderAuthGuard';
import { useAuth } from '@/context/AuthContext';
import { soundAlerts } from '@/lib/soundAlerts';

export default function RiderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'assigned' | 'ready' | 'completed' | 'all'>('assigned');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [confirmDeliveryOrder, setConfirmDeliveryOrder] = useState<Order | null>(null);

  // Duty status (stored locally for shift continuity)
  const [isOnDuty, setIsOnDuty] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('g1mart_rider_on_duty');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const toggleDuty = () => {
    setIsOnDuty((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('g1mart_rider_on_duty', String(next));
      } catch {}
      return next;
    });
  };

  const knownOrderIdsRef = React.useRef<Set<string> | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const newOrders: Order[] = data.orders;
        if (knownOrderIdsRef.current !== null) {
          const hasNewOrder = newOrders.some(
            (o) =>
              !knownOrderIdsRef.current!.has(o.id) &&
              ((o.status as string) === 'Rider Assigned' || (o.status as string) === 'Ready for Pickup' || (o.status as string) === 'Out for Delivery')
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
      const riderPayload = selfAssign || status === 'Rider Assigned' || status === 'Out for Delivery'
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
        headers: { 'Content-Type': 'application/json' },
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
      setConfirmDeliveryOrder(null);
    }
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
        // Show active orders assigned to this rider, OR unassigned active if none assigned
        if (isDelivered) return false;
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
  }, [orders, tab, riderEmail, riderName]);

  const toggleItems = (orderId: string) => {
    setExpandedItems((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <RiderAuthGuard>
      <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-2 sm:pt-4 px-3 sm:px-0">
        {/* Top Header Card — Blinkit Quick-Commerce Style */}
        <div className="bg-gradient-to-br from-[#122214] via-[#1A2E1C] to-emerald-950 text-white p-4 sm:p-5 rounded-3xl shadow-xl space-y-4 border border-emerald-900/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white border border-white/10 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight">
                    {user?.name || 'Express Rider'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-emerald-400/30">
                    Fleet Partner
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Nellore Darkstore Hub #01</span>
                  <span>·</span>
                  <span>Vehicle: AP 26 EQ 4589</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => soundAlerts.playRiderAssignmentChime()}
                className="h-9 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold transition-all border border-white/10 cursor-pointer active:scale-95"
                title="Test notification alert chime"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Test</span>
                <span>Alert</span>
              </button>
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 cursor-pointer active:scale-95"
                title="Refresh dispatch queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Duty Switcher Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isOnDuty
                    ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse'
                    : 'bg-stone-400'
                }`}
              />
              <div>
                <div className="text-xs font-black tracking-wide">
                  {isOnDuty ? '🟢 ON DUTY · RECEIVING ORDERS' : '⚪ OFF DUTY · BREAK TIME'}
                </div>
                <p className="text-[10px] text-stone-300">
                  {isOnDuty
                    ? 'GPS active · Ready for darkstore dispatches'
                    : 'Shift paused · Turn on to receive delivery alerts'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleDuty}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
                isOnDuty
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnDuty ? 'Go Off Duty' : 'Go On Duty'}</span>
            </button>
          </div>
        </div>

        {/* Off Duty Alert */}
        {!isOnDuty && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">You are currently Off Duty.</span> Turn your duty ON using the
              switch above when you are ready to accept customer deliveries in Nellore.
            </div>
          </div>
        )}

        {/* Shift Metrics Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Active Trips
            </span>
            <span className="text-lg font-black text-stone-900">{metrics.activeCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Delivered
            </span>
            <span className="text-lg font-black text-emerald-600">{metrics.deliveredCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-3 shadow-2xs text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Cash In Hand
            </span>
            <span className="text-lg font-black text-[#2E7D32]">₹{metrics.cashInHand}</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-stone-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab('assigned')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
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
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
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
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'completed'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Delivered ({metrics.deliveredCount})
          </button>
        </div>

        {/* Orders Listing */}
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-bold">Connecting to dispatch fleet...</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-800">No Orders in this Queue</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 leading-relaxed">
                When darkstore staff pack orders or dispatch deliveries, your route assignments will appear here instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
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
                      } ${o.address?.pincode || ''}`
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
                        <span className="font-mono font-black text-sm text-stone-900">
                          #{o.id}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
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
                      <span className="text-[10px] text-stone-400 block mt-0.5">
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 animate-bounce">
                          <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                          <span>COLLECT CASH: ₹{o.grandTotal}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer & Doorstep Delivery Details */}
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-stone-900 text-sm">
                        {o.address?.fullName || 'Customer'}
                      </div>
                      {customerPhone && (
                        <a
                          href={`tel:${customerPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-extrabold rounded-xl text-xs shadow-xs transition-colors"
                        >
                          <Phone className="w-3 h-3 fill-white" />
                          <span>Call Customer</span>
                        </a>
                      )}
                    </div>

                    <p className="text-stone-700 leading-relaxed">
                      {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}
                      {o.address?.streetArea}, {o.address?.city || 'Nellore'}
                      {o.address?.pincode ? ` - ${o.address.pincode}` : ''}
                    </p>

                    {o.address?.landmark && (
                      <p className="text-[11px] text-stone-500 italic">
                        📍 Landmark: {o.address.landmark}
                      </p>
                    )}

                    {o.address?.latitude && o.address?.longitude && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Navigation className="w-3 h-3 fill-emerald-700 text-emerald-700 shrink-0" />
                        <span>
                          Doorstep GPS Locked ({o.address.latitude.toFixed(4)},{' '}
                          {o.address.longitude.toFixed(4)})
                        </span>
                      </div>
                    )}

                    {o.address?.deliveryInstructions && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-medium">
                        ⚠️ Note: {o.address.deliveryInstructions}
                      </div>
                    )}
                  </div>

                  {/* Grocery Items Collapsible Section */}
                  <div className="border border-stone-200/60 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleItems(o.id)}
                      className="w-full p-2.5 bg-stone-50/70 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                        <span>
                          {o.items?.length || 0} Grocery {o.items?.length === 1 ? 'Item' : 'Items'} in Bag
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <span>{isExpanded ? 'Hide items' : 'View checklist'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
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
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                    {/* GPS Navigation Button */}
                    <a
                      href={riderMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-[#1A2E1C] hover:bg-black text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>Start GPS Route</span>
                    </a>

                    {/* Status Step Button */}
                    {!isDelivered ? (
                      isOutForDelivery ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDeliveryOrder(o)}
                          disabled={updatingId === o.id}
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {updatingId === o.id ? 'Updating...' : 'Mark Delivered'}
                          </span>
                        </button>
                      ) : isPacked ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(o.id, 'Out for Delivery', true)}
                          disabled={updatingId === o.id}
                          className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>
                            {updatingId === o.id ? 'Starting...' : 'Start Delivery'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(o.id, 'Packed', true)}
                          disabled={updatingId === o.id}
                          className="py-2.5 px-3 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>
                            {updatingId === o.id ? 'Claiming...' : 'Claim & Pick Up'}
                          </span>
                        </button>
                      )
                    ) : (
                      <div className="py-2.5 px-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cash Settlement Notice at Bottom */}
        {metrics.cashInHand > 0 && (
          <div className="bg-gradient-to-r from-emerald-950 to-stone-900 text-white p-4 rounded-3xl border border-emerald-500/30 shadow-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300">
                End-of-Shift Cash Settlement
              </span>
              <span className="font-mono text-base font-black text-white">
                ₹{metrics.cashInHand}
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Please deposit the total cash collected from Cash-on-Delivery orders with the store cashier at G1 Mart Nellore Hub at the end of your shift.
            </p>
          </div>
        )}

        {/* Confirmation Modal for Delivery Completion */}
        {confirmDeliveryOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-stone-900">
                  Confirm Doorstep Delivery?
                </h3>
                <p className="text-xs text-stone-500">
                  Order #{confirmDeliveryOrder.id} for {confirmDeliveryOrder.address?.fullName || 'Customer'}
                </p>
              </div>

              {/* Cash collection reminder */}
              {!confirmDeliveryOrder.isPaid && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">
                    Cash on Delivery Collection
                  </span>
                  <span className="text-lg font-black text-rose-900">
                    Collect ₹{confirmDeliveryOrder.grandTotal} Cash
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeliveryOrder(null)}
                  className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(confirmDeliveryOrder.id, 'Delivered')}
                  disabled={updatingId === confirmDeliveryOrder.id}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs"
                >
                  {updatingId === confirmDeliveryOrder.id ? 'Completing...' : 'Yes, Delivered!'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RiderAuthGuard>
  );
}
