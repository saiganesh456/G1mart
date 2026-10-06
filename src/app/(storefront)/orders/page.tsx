'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  ArrowRight,
  Phone,
  Truck,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function OrdersPage() {
  const { user, supabaseUser, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const syncOrders = async () => {
    setRefreshing(true);
    const orderMap = new Map<string, any>();

    // 1. Load from Supabase Auth user metadata (synced across all devices!)
    try {
      const metaOrders = supabaseUser?.user_metadata?.orders;
      if (Array.isArray(metaOrders)) {
        for (const o of metaOrders) {
          if (o && o.id) orderMap.set(o.id, o);
        }
      }
    } catch {}

    // 2. Load from localStorage cross-device account storage
    try {
      const stored = localStorage.getItem('g1mart_account_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const o of parsed) {
            if (o && o.id) orderMap.set(o.id, o);
          }
        }
      }
    } catch {}

    // 3. Load from sessionStorage recent session
    try {
      const storedSession = sessionStorage.getItem('g1mart_orders_list');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (Array.isArray(parsed)) {
          for (const o of parsed) {
            if (o && o.id) orderMap.set(o.id, o);
          }
        }
      }
    } catch {}

    // 4. Fetch latest status and orders from Cloud API server
    try {
      const userId = supabaseUser?.id || undefined;
      const phone = user?.phone || undefined;
      const query = new URLSearchParams();
      if (userId) query.set('userId', userId);
      if (phone) query.set('phone', phone);

      const res = await fetch(`/api/orders?${query.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        for (const o of data.orders) {
          if (o && o.id) {
            // Server has authoritative status and payment updates
            orderMap.set(o.id, { ...orderMap.get(o.id), ...o });
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud orders:', err);
    }

    const merged = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    setOrders(merged);
    setLoaded(true);
    setRefreshing(false);
  };

  useEffect(() => {
    syncOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUser, user]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-28 pt-2 sm:pt-4 px-3 sm:px-4 box-border">
      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121]">My Orders</h1>
          <p className="text-[11px] text-stone-500 font-medium">
            {isLoggedIn ? `Linked to ${user?.name || user?.phone || 'your account'}` : 'Guest & Local Orders'}
          </p>
        </div>
        <button
          type="button"
          onClick={syncOrders}
          disabled={refreshing}
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-[#2E7D32] hover:border-[#2E7D32] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          title="Refresh orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#2E7D32]' : ''}`} />
          <span className="hidden sm:inline text-xs">Sync</span>
        </button>
      </div>

      {loaded && orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#212121]">No orders found</h2>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              When you place an order on this or any of your devices, your live delivery tracking and receipts will appear here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#2E7D32]/20"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const currentStatus = order.status || 'Order Placed';
            const isDelivered = currentStatus === 'Delivered';
            const isOutForDelivery = currentStatus === 'Out for Delivery' || currentStatus === 'Order Dispatched';
            const isPacked = currentStatus === 'Packed';
            const isFullyPaid = order.paymentStatus === 'completed' || order.isPaid || order.paymentStatus === 'manual_verified';
            const displayTotal = order.grandTotal || order.total || order.subtotal || 0;
            const itemsList = order.items || [];

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden box-border"
              >
                {/* 1. Header Bar: Order ID, Date, and Live Status Badge */}
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-stone-50/90 to-white border-b border-stone-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-xs text-stone-900">
                        #{order.id}
                      </span>
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full">
                        {order.slot || 'Express 30 Mins'}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
                      {order.date || 'Recently placed'}
                    </p>
                  </div>

                  {/* Status Pill */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-2xs ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isOutForDelivery
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                          : isPacked
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Delivered</span>
                        </>
                      ) : isOutForDelivery ? (
                        <>
                          <Truck className="w-3 h-3 text-purple-700" />
                          <span>Out for Delivery</span>
                        </>
                      ) : isPacked ? (
                        <>
                          <Package className="w-3 h-3 text-blue-700" />
                          <span>Packed at Store</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
                          <span>Order Placed</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* 2. Middle Body: Item Thumbnails & Names */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  {/* Thumbnails Row */}
                  {itemsList.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {itemsList.slice(0, 4).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200/80 p-1 flex items-center justify-center shrink-0"
                          title={`${item.productName} (x${item.quantity})`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image || '/products/placeholder.svg'}
                            alt={item.productName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                            }}
                          />
                        </div>
                      ))}
                      {itemsList.length > 4 && (
                        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[11px] font-black text-stone-500 shrink-0">
                          +{itemsList.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Item Names Text */}
                  <div className="text-xs text-stone-700">
                    <p className="line-clamp-2 leading-relaxed">
                      {itemsList.length > 0
                        ? itemsList.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')
                        : 'Grocery essentials and fresh items'}
                    </p>
                  </div>

                  {/* Delivery Location & Phone */}
                  {order.address && (
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1 truncate max-w-[240px]">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">
                          {order.address.houseFlat ? `${order.address.houseFlat}, ` : ''}
                          {order.address.streetArea || order.address.city || 'Nellore'}
                        </span>
                      </div>
                      {order.address.phone && (
                        <span className="font-semibold text-emerald-800 font-mono shrink-0">
                          {formatIndianPhoneDisplay(order.address.phone)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Footer Bar: Price, Payment Mode, and Action CTA Buttons */}
                <div className="px-3.5 sm:px-4 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-stone-900 tabular-nums">
                        ₹{displayTotal}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isFullyPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isFullyPaid ? '✓ Paid' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
