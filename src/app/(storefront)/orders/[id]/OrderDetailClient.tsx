'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Navigation, Phone, Package, ShieldCheck } from 'lucide-react';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import { STORE_CONFIG } from '@/config/store';

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

    const syncLiveOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder((prev: any) => ({ ...prev, ...data.order }));
          try {
            sessionStorage.setItem('g1mart_latest_order', JSON.stringify(data.order));
            localStorage.setItem('g1mart_recent_order', JSON.stringify(data.order));
          } catch {}
          return;
        }

        // Secondary fallback to payment-status endpoint
        const payRes = await fetch(`/api/orders/${orderId}/payment-status`);
        const payData = await payRes.json();
        if (payData.success && payData.order) {
          setOrder((prev: any) => ({ ...prev, ...payData.order }));
        }
      } catch (err) {
        // quiet polling error
      }
    };

    // Immediate sync
    syncLiveOrder();

    // 1. Real-time instant BroadcastChannel listener (0ms latency cross-tab)
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('g1mart_order_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDER_UPDATED' && (event.data.orderId === orderId || event.data.order?.id === orderId)) {
          setOrder((prev: any) => ({ ...prev, ...(event.data.order || {}), status: event.data.status || event.data.order?.status || prev?.status }));
        }
      };
    } catch {}

    // 2. Storage event listener (fires when admin tab updates localStorage on same machine)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'g1mart_recent_order' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.id === orderId) {
            setOrder((prev: any) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Fast auto-poll every 1.5s for cross-device updates
    const interval = setInterval(syncLiveOrder, 1500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, [orderId]);

  const address = order?.address || null;
  const items = order?.items || [];
  const lat = address?.latitude || 14.4426;
  const lng = address?.longitude || 79.9865;
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const isFullyPaid =
    order?.isPaid ||
    order?.paymentStatus === 'completed' ||
    order?.paymentStatus === 'manual_verified';

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
            <span className="text-sm sm:text-base font-black text-[#2E7D32] flex items-center gap-1.5">
              <span>{order?.status || 'Order Received'}</span>
              {(order?.status === 'Packed' || order?.status === 'Order Dispatched' || order?.status === 'Out for Delivery') && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 font-semibold block">Payment Status</span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                isFullyPaid
                  ? 'bg-emerald-100 text-[#1B5E20] border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {isFullyPaid
                ? '✓ Paid & Confirmed'
                : order?.paymentMethod === 'Cash on Delivery'
                ? 'Cash on Delivery (Pending)'
                : 'Payment Pending'}
            </span>
          </div>
        </div>

        {/* Live Tracking Timeline */}
        {(() => {
          const currentStatus = order?.status || 'Order Placed';
          const isPacked = currentStatus === 'Packed' || currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' || currentStatus === 'Delivered';
          const isDispatched = currentStatus === 'Order Dispatched' || currentStatus === 'Out for Delivery' || currentStatus === 'Delivered';
          const isDelivered = currentStatus === 'Delivered';

          return (
            <div className="space-y-3.5 py-1 text-xs">
              {/* Step 1: Placed */}
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span className="font-bold">Order Placed &amp; Confirmed</span>
              </div>

              {/* Step 2: Packing */}
              <div className="flex items-center gap-3">
                {isPacked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span className="font-bold text-stone-800">Packed &amp; Bagged at G1 Mart Hub</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
                    <span className="font-bold text-[#2E7D32]">Packing &amp; preparing fresh groceries...</span>
                  </>
                )}
              </div>

              {/* Step 3: Dispatch & Rider */}
              <div className="flex items-center gap-3">
                {isDispatched ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span className="font-bold text-stone-800">
                      Out for Express Delivery with Rider 🛵
                    </span>
                  </>
                ) : isPacked ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
                    <span className="font-bold text-[#2E7D32]">Ready for Rider Pickup (Rider Assigned)</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-400">Out for Express Delivery</span>
                  </>
                )}
              </div>

              {/* Step 4: Delivery */}
              <div className="flex items-center gap-3">
                {isDelivered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span className="font-bold text-emerald-800">Delivered at Doorstep 🎉</span>
                  </>
                ) : isDispatched ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
                    <span className="font-semibold text-stone-700">Rider on the way to your address</span>
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
              href={`tel:${(STORE_CONFIG.contact.phone || '+919876543210').replace(/\s+/g, '')}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-xl text-xs border border-stone-200 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Call Store</span>
            </a>
            <a
              href={`https://wa.me/${(STORE_CONFIG.contact.whatsapp || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi G1 Mart Team, I have an inquiry regarding my Order #${orderId}`)}`}
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
