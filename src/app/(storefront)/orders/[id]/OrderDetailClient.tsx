'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Navigation, Phone, Package, ShieldCheck } from 'lucide-react';
import { formatIndianPhoneDisplay } from '@/lib/phone';

interface Props {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: Props) {
  const searchParams = useSearchParams();
  const isJustPlaced = searchParams.get('placed') === 'true';

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    try {
      // Check latest order or orders list in sessionStorage
      const latestRaw = sessionStorage.getItem('g1mart_latest_order');
      if (latestRaw) {
        const parsed = JSON.parse(latestRaw);
        if (parsed.id === orderId || parsed.orderNumber === orderId) {
          setOrder(parsed);
          return;
        }
      }

      const listRaw = sessionStorage.getItem('g1mart_orders_list');
      if (listRaw) {
        const list = JSON.parse(listRaw);
        const found = list.find((o: any) => o.id === orderId || o.orderNumber === orderId);
        if (found) {
          setOrder(found);
          return;
        }
      }
    } catch {}
  }, [orderId]);

  const address = order?.address || null;
  const items = order?.items || [];
  const lat = address?.latitude || 14.4426;
  const lng = address?.longitude || 79.9865;
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121]">Order #{orderId}</h1>
          <span className="text-[11px] text-stone-500 font-medium">
            {order?.date || 'Today'}
          </span>
        </div>
      </div>

      {/* Just Placed Congratulations Pill */}
      {isJustPlaced && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-[#2E7D32] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-extrabold text-emerald-900">
              Order Confirmed &amp; Dispatched to Hub!
            </h2>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              We received your order. Our store team is packing your groceries fresh. You will receive an SMS update on your mobile number.
            </p>
          </div>
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs text-stone-400 font-semibold block">Order Status</span>
            <span className="text-sm font-extrabold text-[#2E7D32]">
              {order?.status || 'Order Received'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 font-semibold block">Payment</span>
            <span className="text-xs font-bold text-stone-800">
              {order?.paymentMethod || 'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* Live Tracking Timeline */}
        <div className="space-y-3 py-1 text-xs">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold">Order Placed</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500">
            <div className="w-4 h-4 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
            <span className="font-semibold text-stone-800">Packing at G1 Mart Hub</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <Clock className="w-4 h-4" />
            <span>Out for Express Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <Clock className="w-4 h-4" />
            <span>Delivered at Doorstep</span>
          </div>
        </div>

        {/* Customer & Address Details */}
        {address && (
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 border-b border-stone-200/60 pb-1.5">
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
              <span>Delivery Details</span>
            </div>
            <div className="text-xs text-stone-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{address.fullName || 'Customer'}</span>
                {address.phone && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Phone className="w-3 h-3" />
                    {formatIndianPhoneDisplay(address.phone)}
                  </span>
                )}
              </div>
              <p className="text-stone-600">
                {address.houseFlat ? `${address.houseFlat}, ` : ''}
                {address.streetArea ? `${address.streetArea}, ` : ''}
                {address.city} – {address.pincode}
              </p>
              {address.landmark && (
                <p className="text-stone-500 text-[11px]">Landmark: {address.landmark}</p>
              )}
              {address.deliveryInstructions && (
                <p className="text-stone-500 text-[11px] italic">
                  Note: &quot;{address.deliveryInstructions}&quot;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Ordered Items List */}
        {items.length > 0 && (
          <div className="space-y-2.5 border-t border-stone-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Items in this Order ({items.length})</span>
            </div>
            <div className="divide-y divide-stone-100">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || '/products/placeholder.svg'}
                      alt={item.productName}
                      className="w-10 h-10 object-contain rounded-lg border border-stone-200 bg-stone-50 p-1"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                      }}
                    />
                    <div>
                      <p className="font-bold text-[#212121] line-clamp-1">{item.productName}</p>
                      <p className="text-stone-500 text-[11px]">
                        Qty: {item.quantity} · {item.unit}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    {item.price > 0 ? `₹${item.price * item.quantity}` : 'Price TBA'}
                  </span>
                </div>
              ))}
            </div>
            {order?.total > 0 && (
              <div className="border-t border-stone-200/80 pt-2 flex justify-between items-center text-xs">
                <span className="font-bold text-stone-700">Total Amount</span>
                <span className="text-sm font-black text-[#2E7D32]">₹{order.total}</span>
              </div>
            )}
          </div>
        )}

        {/* Rider Navigation Direct Link */}
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Delivery Navigation</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              GPS ATTACHED
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Turn-by-turn route navigation to customer doorstep.
          </p>
          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs mt-1"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Open Google Maps Route →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
