'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ImageOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import InnerPageHeader from '@/components/layout/InnerPageHeader';

// 4-step order progress
const ORDER_STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'packed', label: 'Packed' },
  { key: 'out', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
] as const;

function getStepIndex(status: string) {
  if (status === 'Delivered') return 3;
  if (status === 'Out for Delivery' || status === 'Order Dispatched') return 2;
  if (status === 'Packed' || status === 'Packed at Store') return 1;
  return 0;
}

function StatusChip({ status }: { status: string }) {
  const step = getStepIndex(status);
  const isDelivered = step === 3;
  const isOut = step === 2;
  const isPacked = step === 1;

  let bg = 'var(--g1-primary-tint)';
  let color = 'var(--g1-primary)';
  let border = 'var(--g1-primary)';
  let dotColor = 'var(--g1-primary)';

  if (isDelivered) { bg = '#ecfdf5'; color = '#065f46'; border = '#6ee7b7'; dotColor = '#10b981'; }
  else if (isOut)  { bg = '#f5f3ff'; color = '#5b21b6'; border = '#c4b5fd'; dotColor = '#8b5cf6'; }
  else if (isPacked) { bg = '#eff6ff'; color = '#1e40af'; border = '#93c5fd'; dotColor = '#3b82f6'; }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      {/* Dot with 6px margin, never overlaps text */}
      <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      <span>{status}</span>
    </span>
  );
}

function OrderProgress({ status }: { status: string }) {
  const activeStep = getStepIndex(status);

  return (
    <div className="flex items-center gap-0 mt-3">
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= activeStep;
        const isLast = idx === ORDER_STEPS.length - 1;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute top-[7px] left-1/2 right-0 h-0.5 -mr-px"
                style={{
                  width: '100%',
                  backgroundColor: idx < activeStep ? 'var(--g1-primary)' : 'var(--g1-border)',
                  left: '50%',
                }} />
            )}
            {/* Dot */}
            <div className="relative z-10 w-3.5 h-3.5 rounded-full border-2 shrink-0"
              style={{
                backgroundColor: done ? 'var(--g1-primary)' : 'var(--g1-bg)',
                borderColor: done ? 'var(--g1-primary)' : 'var(--g1-border)',
              }} />
            {/* Label */}
            <span className="mt-1 text-[9px] text-center leading-tight"
              style={{ color: done ? 'var(--g1-primary)' : 'var(--g1-text-secondary)', fontWeight: done ? 700 : 400 }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const { user, supabaseUser, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const syncOrders = async () => {
    setRefreshing(true);
    const orderMap = new Map<string, any>();

    try {
      const metaOrders = supabaseUser?.user_metadata?.orders;
      if (Array.isArray(metaOrders)) {
        for (const o of metaOrders) { if (o?.id) orderMap.set(o.id, o); }
      }
    } catch {}

    try {
      const stored = localStorage.getItem('g1mart_account_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const o of parsed) { if (o?.id) orderMap.set(o.id, o); }
        }
      }
    } catch {}

    try {
      const storedSession = sessionStorage.getItem('g1mart_orders_list');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (Array.isArray(parsed)) {
          for (const o of parsed) { if (o?.id) orderMap.set(o.id, o); }
        }
      }
    } catch {}

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
          if (o?.id) orderMap.set(o.id, { ...orderMap.get(o.id), ...o });
        }
      }

      for (const [id, localOrder] of Array.from(orderMap.entries())) {
        if (!data?.orders?.some((o: any) => o.id === id)) {
          try {
            const singleRes = await fetch(`/api/orders/${id}`);
            const singleData = await singleRes.json();
            if (singleData.success && singleData.order) {
              orderMap.set(id, { ...localOrder, ...singleData.order });
            }
          } catch {}
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
    const interval = setInterval(() => { syncOrders(); }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUser, user]);

  return (
    <>
      <InnerPageHeader title="My orders" />

      <div className="w-full max-w-2xl mx-auto pb-28 pt-3 px-4" style={{ boxSizing: 'border-box' }}>
        {/* Refresh row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px]" style={{ color: 'var(--g1-text-secondary)' }}>
            {isLoggedIn ? `Linked to ${user?.name || user?.phone || 'your account'}` : 'Recent orders on this device'}
          </p>
          <button
            type="button"
            onClick={syncOrders}
            disabled={refreshing}
            aria-label="Refresh orders"
            className="w-10 h-10 flex items-center justify-center rounded-full g1-press transition-colors"
            style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)', color: 'var(--g1-text-secondary)' }}
          >
            <RefreshCw className={`w-[18px] h-[18px] ${refreshing ? 'animate-spin' : ''}`}
              style={{ color: refreshing ? 'var(--g1-primary)' : undefined }} strokeWidth={1.75} />
          </button>
        </div>

        {/* Empty state */}
        {loaded && orders.length === 0 ? (
          <div className="rounded-[var(--g1-r-card)] border p-10 text-center space-y-4"
            style={{ backgroundColor: 'var(--g1-bg)', borderColor: 'var(--g1-border)' }}>
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: 'var(--g1-primary-tint)' }}>
              <ShoppingBag className="w-8 h-8" style={{ color: 'var(--g1-primary)' }} />
            </div>
            <div>
              <h2 className="font-bold" style={{ fontSize: 16, color: 'var(--g1-text)' }}>No orders yet</h2>
              <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--g1-text-secondary)' }}>
                When you place an order, your delivery tracking and receipts will appear here.
              </p>
            </div>
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--g1-primary)' }}>
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const currentStatus = order.status || 'Order Placed';
              const displayId = String(order.id || '').replace(/^SLIP-/i, '');
              const isFullyPaid = order.paymentStatus === 'completed' || order.isPaid || order.paymentStatus === 'manual_verified';
              const displayTotal = order.grandTotal || order.total || order.subtotal || 0;
              const itemsList: any[] = order.items || [];

              // Summary line: "4 items · Idhayam Sesame Oil 1L, +3"
              const firstItem = itemsList[0];
              const extraCount = itemsList.length > 1 ? itemsList.length - 1 : 0;
              const summaryLine = itemsList.length > 0
                ? `${itemsList.length} ${itemsList.length === 1 ? 'item' : 'items'} · ${firstItem?.productName || 'Item'}${extraCount > 0 ? `, +${extraCount}` : ''}`
                : null;

              return (
                <div
                  key={order.id}
                  className="rounded-[var(--g1-r-card)] overflow-hidden"
                  style={{ backgroundColor: 'var(--g1-bg)', border: '1px solid var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
                >
                  {/* Card header: Order ID + status chip */}
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: 'var(--g1-surface)', borderBottom: '1px solid var(--g1-border)' }}>
                    <div className="min-w-0">
                      <span className="font-bold font-mono" style={{ fontSize: 14, color: 'var(--g1-text)' }}>
                        Order #{displayId}
                      </span>
                      <p className="mt-0.5" style={{ fontSize: 11, color: 'var(--g1-text-secondary)' }}>
                        {order.date || 'Recently placed'}
                      </p>
                    </div>
                    {/* Status chip — dot has 6px margin, never overlaps text */}
                    <StatusChip status={currentStatus} />
                  </div>

                  {/* Card body */}
                  <div className="px-4 py-3 space-y-3">
                    {/* Thumbnails — max 4, 48px, neutral icon when image missing */}
                    {itemsList.length > 0 && (
                      <div className="flex items-center gap-2">
                        {itemsList.slice(0, 4).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}
                            title={item.productName}
                          >
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.productName || ''}
                                className="w-full h-full object-contain rounded-xl p-1"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  (e.currentTarget.parentElement as HTMLElement).querySelector('.g1-img-fallback')
                                    ?.removeAttribute('hidden');
                                }}
                              />
                            ) : null}
                            {/* Neutral icon fallback — no text */}
                            <Package
                              className="g1-img-fallback w-5 h-5"
                              style={{ color: 'var(--g1-text-secondary)', display: item.image ? 'none' : 'block' }}
                              strokeWidth={1.75}
                            />
                          </div>
                        ))}
                        {itemsList.length > 4 && (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)', color: 'var(--g1-text-secondary)' }}
                          >
                            +{itemsList.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary line — one line with ellipsis */}
                    {summaryLine && (
                      <p className="truncate" style={{ fontSize: 13, color: 'var(--g1-text)', fontWeight: 500 }}>
                        {summaryLine}
                      </p>
                    )}

                    {/* Address — one line, phone only in order detail */}
                    {order.address && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-[14px] h-[14px] shrink-0" strokeWidth={1.75}
                          style={{ color: 'var(--g1-text-secondary)' }} />
                        <p className="truncate" style={{ fontSize: 12, color: 'var(--g1-text-secondary)' }}>
                          {[order.address.houseFlat, order.address.streetArea || order.address.city]
                            .filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}

                    {/* 4-step progress bar */}
                    <OrderProgress status={currentStatus} />
                  </div>

                  {/* Card footer: total + payment + Track Order button */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: 'var(--g1-surface)', borderTop: '1px solid var(--g1-border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black tabular-nums" style={{ fontSize: 16, color: 'var(--g1-text)' }}>
                        ₹{displayTotal}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={isFullyPaid
                          ? { backgroundColor: '#ecfdf5', color: '#065f46' }
                          : { backgroundColor: '#fef3c7', color: '#92400e' }}
                      >
                        {isFullyPaid ? '✓ Paid' : 'Cash on Delivery'}
                      </span>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-bold text-white g1-press"
                      style={{ backgroundColor: 'var(--g1-primary)' }}
                    >
                      <Truck className="w-[18px] h-[18px]" strokeWidth={1.75} />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
