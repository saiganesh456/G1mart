'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { Order } from '@/types';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import RiderAuthGuard from '@/components/rider/RiderAuthGuard';

export default function RiderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load rider orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, staffIdentifier: 'Rider App' }),
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

  const filteredOrders = orders.filter((o) => {
    const isCompleted = o.status === 'Delivered';
    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  return (
    <RiderAuthGuard>
      <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-2 sm:pt-4 px-3 sm:px-0">
      {/* Rider Header Bar */}
      <div className="bg-[#1A2E1C] text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h1 className="text-sm font-extrabold tracking-tight">Rider Delivery Console</h1>
            </div>
            <p className="text-[11px] text-white/70">G1 Mart Nellore Hub · Live Dispatch</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          title="Refresh orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl">
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            filter === 'active'
              ? 'bg-[#2E7D32] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Active Deliveries ({orders.filter((o) => o.status !== 'Delivered').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-[#2E7D32] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Delivered ({orders.filter((o) => o.status === 'Delivered').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#2E7D32] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All ({orders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="py-16 text-center text-xs text-stone-400 font-bold">
          Checking for dispatched orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-2">
          <Truck className="w-10 h-10 text-stone-300 mx-auto" />
          <h2 className="text-sm font-extrabold text-stone-800">No Orders in this View</h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            When store staff pack and dispatch orders, they will show up here for doorstep delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const destQuery =
              o.address?.latitude && o.address?.longitude
                ? `${o.address.latitude},${o.address.longitude}`
                : encodeURIComponent(
                    `${o.address?.houseFlat || ''} ${o.address?.streetArea || ''} ${
                      o.address?.city || 'Nellore'
                    } ${o.address?.pincode || ''}`
                  );

            const riderMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;
            const customerPhone = o.address?.mobileNumber || o.address?.phone;
            const currentStatus = o.status || 'Order Placed';
            const isDelivered = currentStatus === 'Delivered';

            return (
              <div
                key={o.id}
                className={`bg-white rounded-2xl border ${
                  isDelivered ? 'border-stone-200 opacity-80' : 'border-stone-300/80 shadow-xs'
                } p-4 space-y-3`}
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div>
                    <span className="font-mono font-black text-sm text-stone-900">#{o.id}</span>
                    <span className="text-[10px] text-stone-400 block">{o.date} · Slot: {o.slot}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {currentStatus}
                    </span>
                    <div className="text-xs font-black text-stone-900 mt-0.5">
                      {o.isPaid ? (
                        <span className="text-emerald-700">PAID ONLINE</span>
                      ) : (
                        <span className="text-rose-700">COLLECT CASH: ₹{o.grandTotal}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Address Details */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-900">{o.address?.fullName || 'Customer'}</span>
                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px]"
                      >
                        <Phone className="w-3 h-3 text-[#2E7D32]" />
                        <span>Call Customer</span>
                      </a>
                    )}
                  </div>

                  <p className="text-stone-700">
                    {o.address?.houseFlat ? `${o.address.houseFlat}, ` : ''}
                    {o.address?.streetArea}, {o.address?.city || 'Nellore'}
                  </p>

                  {o.address?.landmark && (
                    <p className="text-[11px] text-stone-500 italic">
                      Landmark: {o.address.landmark}
                    </p>
                  )}

                  {o.address?.deliveryInstructions && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] font-medium">
                      ⚠️ Instruction: {o.address.deliveryInstructions}
                    </div>
                  )}
                </div>

                {/* Items Summary */}
                <div className="text-xs text-stone-600 flex items-center justify-between px-1">
                  <span>{o.items?.length || 0} Grocery Items:</span>
                  <span className="font-semibold truncate max-w-[220px]">
                    {o.items?.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                  </span>
                </div>

                {/* Action Buttons for Rider */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                  <a
                    href={riderMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-[#1A2E1C] hover:bg-black text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>Navigate GPS</span>
                  </a>

                  {!isDelivered ? (
                    currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                        disabled={updatingId === o.id}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{updatingId === o.id ? 'Updating...' : 'Mark Delivered'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(o.id, 'Order Dispatched')}
                        disabled={updatingId === o.id}
                        className="py-2.5 px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{updatingId === o.id ? 'Updating...' : 'Start Delivery'}</span>
                      </button>
                    )
                  ) : (
                    <div className="py-2.5 px-3 bg-stone-100 text-stone-500 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivered</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </RiderAuthGuard>
  );
}
