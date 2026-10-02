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
    let found = false;
    try {
      const latestRaw =
        sessionStorage.getItem('g1mart_latest_order') ||
        localStorage.getItem('g1mart_recent_order');
      if (latestRaw) {
        const parsed = JSON.parse(latestRaw);
        if (parsed.id === orderId || parsed.orderNumber === orderId) {
          setOrder(parsed);
          found = true;
        }
      }

      const listRaw = sessionStorage.getItem('g1mart_orders_list');
      if (listRaw && !found) {
        const list = JSON.parse(listRaw);
        const match = list.find((o: any) => o.id === orderId || o.orderNumber === orderId);
        if (match) {
          setOrder(match);
          found = true;
        }
      }
    } catch {}

    // Always sync with server for verified items, prices, and delivery tracking
    fetch(`/api/orders/${orderId}/payment-status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder((prev: any) => ({ ...prev, ...data.order }));
          try {
            sessionStorage.setItem('g1mart_latest_order', JSON.stringify(data.order));
            localStorage.setItem('g1mart_recent_order', JSON.stringify(data.order));
          } catch {}
        }
      })
      .catch((err) => console.warn('Could not sync order from server', err));
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
        {(() => {
          const currentStatus = order?.status || 'Order Placed';
          const isPlaced = true;
          const isPacking = currentStatus === 'Packing' || currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' || currentStatus === 'Delivered';
          const isDispatched = currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' || currentStatus === 'Delivered';
          const isDelivered = currentStatus === 'Delivered';

          return (
            <div className="space-y-3 py-1 text-xs">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span className="font-bold">Order Placed</span>
              </div>
              <div className="flex items-center gap-3">
                {isPacking ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span className="font-bold text-stone-800">Packed at G1 Mart Hub</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
                    <span className="font-semibold text-stone-800">Packing at G1 Mart Hub</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isDispatched ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span className="font-bold text-stone-800">
                      {isDelivered ? 'Dispatched for Express Delivery' : 'Out for Express Delivery with Rider'}
                    </span>
                  </>
                ) : isPacking ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
                    <span className="font-semibold text-stone-800">Ready for Rider Pickup</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-400">Out for Express Delivery</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isDelivered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span className="font-bold text-emerald-800">Delivered at Doorstep 🎉</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-400">Delivered at Doorstep</span>
                  </>
                )}
              </div>
            </div>
          );
        })()}

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

        {/* Customer Help & Support */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">Need Help with your Delivery?</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
              <span>G1 Mart Care</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Our store team in Nellore is processing your order. For queries or instant updates, connect with our store manager.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href="tel:+919876543210"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-xl text-xs border border-stone-200 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Call Store</span>
            </a>
            <a
              href={`https://wa.me/919876543210?text=Hi%20G1%20Mart%20Team,%20I%20have%20an%20inquiry%20regarding%20my%20Order%20%23${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
            >
              <span>WhatsApp Store</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
