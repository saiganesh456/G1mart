'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

function StatusChip({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const isDelivered = s.includes('delivered');
  const isOut = s.includes('out for delivery') || s.includes('dispatched') || s.includes('rider');
  const isPacked = s.includes('packed') || s.includes('packing');
  const isCancelled = s.includes('cancel');

  let bg = '#eaf7ee';
  let color = '#1E6B2E';
  let border = '#a7f3d0';
  let dotColor = '#10b981';

  if (isDelivered) {
    bg = '#ecfdf5';
    color = '#065f46';
    border = '#a7f3d0';
    dotColor = '#10b981';
  } else if (isOut) {
    bg = '#f5f3ff';
    color = '#5b21b6';
    border = '#c4b5fd';
    dotColor = '#8b5cf6';
  } else if (isPacked) {
    bg = '#eff6ff';
    color = '#1e40af';
    border = '#93c5fd';
    dotColor = '#3b82f6';
  } else if (isCancelled) {
    bg = '#fef2f2';
    color = '#991b1b';
    border = '#fecaca';
    dotColor = '#ef4444';
  }

  // Display user-friendly label
  let displayStatus = status || 'Order Placed';
  if (status === 'SLIP_RECEIVED') displayStatus = 'List Received';
  else if (status === 'BILLING') displayStatus = 'Preparing Bill';
  else if (status === 'AWAITING_CUSTOMER_CONFIRMATION') displayStatus = 'Confirming Call';
  else if (status === 'AWAITING_PAYMENT') displayStatus = 'Packed · Pay Bill';
  else if (status === 'COD_PENDING') displayStatus = 'Pay on Delivery';
  else if (status === 'PAID') displayStatus = 'Paid · Dispatching';

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 shadow-2xs"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      <span className="truncate max-w-[130px]">{displayStatus}</span>
    </span>
  );
}

function getInitialCachedOrders(): any[] {
  if (typeof window === 'undefined') return [];
  const orderMap = new Map<string, any>();

  const registerOrderToMap = (o: any) => {
    if (!o) return;
    const key = (o.id || o.orderNumber || '').toString().trim().toLowerCase();
    if (!key) return;
    if (!orderMap.has(key)) {
      orderMap.set(key, o);
    } else {
      const existing = orderMap.get(key);
      const existingItems = Array.isArray(existing?.items) ? existing.items.length : 0;
      const newItems = Array.isArray(o?.items) ? o.items.length : 0;
      if (newItems >= existingItems) {
        orderMap.set(key, { ...existing, ...o });
      }
    }
  };

  try {
    const stored = localStorage.getItem('g1mart_account_orders');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        for (const o of parsed) registerOrderToMap(o);
      }
    }
  } catch {}

  try {
    const storedSession = sessionStorage.getItem('g1mart_orders_list');
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      if (Array.isArray(parsed)) {
        for (const o of parsed) registerOrderToMap(o);
      }
    }
  } catch {}

  try {
    const latest = sessionStorage.getItem('g1mart_latest_order');
    if (latest) {
      const parsed = JSON.parse(latest);
      registerOrderToMap(parsed);
    }
  } catch {}

  return Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime()
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, supabaseUser, isLoggedIn } = useAuth();
  const { cartItemCount } = useCart();

  // Instant render from local cache
  const [orders, setOrders] = useState<any[]>(() => getInitialCachedOrders());
  const [loaded, setLoaded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'delivered' | 'cancelled'>('all');

  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const isSyncingRef = useRef(false);

  const syncOrders = useCallback(async (isManual = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (isManual) setRefreshing(true);

    try {
      const userId = supabaseUser?.id || undefined;
      let phone = user?.phone || undefined;
      if (!phone && typeof window !== 'undefined') {
        try {
          const lastAddr = JSON.parse(localStorage.getItem('g1mart_last_used_address') || '{}');
          phone = lastAddr.phone || lastAddr.mobileNumber || undefined;
        } catch {}
      }

      const query = new URLSearchParams();
      if (userId) query.set('userId', userId);
      if (phone) query.set('phone', phone);

      if (userId || phone) {
        query.set('_t', String(Date.now()));
        const res = await fetch(`/api/orders?${query.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // Authoritative list directly from server
          setOrders(data.orders);
          try {
            localStorage.setItem('g1mart_account_orders', JSON.stringify(data.orders.slice(0, 30)));
          } catch {}
        }
      } else {
        // Unauthenticated guest without stored phone: read local cache
        const localCached = getInitialCachedOrders();
        setOrders(localCached);
      }
    } catch (err) {
      console.warn('Could not fetch cloud orders:', err);
    } finally {
      setLoaded(true);
      setRefreshing(false);
      isSyncingRef.current = false;
    }
  }, [supabaseUser, user]);

  useEffect(() => {
    syncOrders(false);

    // Visibility-aware background refresh every 15s
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncOrders(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [syncOrders]);

  // Order filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || '').toLowerCase();
      const isDelivered = s.includes('delivered');
      const isCancelled = s.includes('cancel');
      const isOngoing = !isDelivered && !isCancelled;

      if (filter === 'ongoing') return isOngoing;
      if (filter === 'delivered') return isDelivered;
      if (filter === 'cancelled') return isCancelled;
      return true;
    });
  }, [orders, filter]);

  return (
    <div className="min-h-screen bg-[#F6F7F8] pb-44">
      {/* Top Header — Mobile only (Desktop header is handled by layout) */}
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 text-white shadow-xs"
        style={{ height: 56, backgroundColor: 'var(--g1-primary)' }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
        </button>

        <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
          My Orders
        </h1>

        <Link
          href="/cart"
          aria-label={`View cart with ${cartItemCount} items`}
          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center justify-center shadow-xs">
              {cartItemCount}
            </span>
          )}
        </Link>
      </header>

      {/* Desktop Breadcrumbs & Title */}
      <div className="hidden lg:block max-w-5xl xl:max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 font-medium">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-900 font-bold">My Orders</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">My Orders</h1>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* Filter and Refresh Bar */}
      <div className="bg-white border-b border-stone-200/80 px-4 py-2.5">
        <div className="max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(
              [
                { id: 'all', label: 'All Orders' },
                { id: 'ongoing', label: 'Ongoing' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
              ] as const
            ).map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1E6B2E] text-white shadow-2xs'
                      : 'bg-[#F2F4F5] hover:bg-stone-200/80 text-stone-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Quick Refresh Icon */}
          <button
            type="button"
            onClick={() => syncOrders(true)}
            disabled={refreshing}
            aria-label="Refresh orders"
            title="Refresh orders"
            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center shrink-0 text-stone-600 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer bg-white"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#1E6B2E]' : 'text-stone-500'}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 pt-3 space-y-3">
        {/* Subtitle */}
        <div className="flex items-center justify-between px-0.5">
          <p className="text-xs text-stone-500 font-medium">
            Showing latest orders
          </p>
          {isLoggedIn && user?.name && (
            <p className="text-[11px] text-stone-400 truncate max-w-[180px]">
              {user.name}
            </p>
          )}
        </div>

        {/* Empty State */}
        {loaded && filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center space-y-4 shadow-2xs mt-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: 'var(--g1-primary-tint)' }}
            >
              <ShoppingBag className="w-7 h-7" style={{ color: 'var(--g1-primary)' }} />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">
                {filter === 'all' ? 'No orders placed yet' : `No ${filter} orders`}
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {filter === 'all'
                  ? 'Your order tracking, receipts, and order history will appear here once placed.'
                  : `You have no ${filter} orders to show right now.`}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors"
              style={{ backgroundColor: 'var(--g1-primary)' }}
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Responsive Order Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredOrders.map((order) => {
              const currentStatus = order.status || 'Order Placed';
              const displayId = String(order.id || '').replace(/^SLIP-/i, '');
              const isDelivered = (order.status || '').toLowerCase().includes('delivered');
              const isFullyPaid =
                order.paymentStatus === 'completed' ||
                order.paymentStatus === 'paid' ||
                order.isPaid ||
                order.paymentStatus === 'manual_verified';
              const displayTotal =
                order.finalTotal || order.grandTotal || order.total || order.subtotal || 0;
              const itemsList: any[] = order.items || [];

              // Summary line: e.g. "2 items · Aashirvaad Suji Rava, Aachi Mutton Masala"
              const itemsCount = itemsList.length > 0
                ? itemsList.reduce((acc, it) => acc + (it.quantity || it.packedQty || it.requestedQty || 1), 0)
                : 1;

              const productNames = itemsList
                .map((it) => it.productName || it.name)
                .filter(Boolean)
                .slice(0, 3)
                .join(', ');

              const displayThumbnails = itemsList.slice(0, 3);
              const remainingThumbnailsCount = itemsList.length > 3 ? itemsList.length - 3 : 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-3.5 sm:p-4 space-y-3 transition-all hover:border-stone-300"
                >
                  {/* Card Header: Order #ID + Status Badge + Chevron */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-bold text-stone-900 text-sm sm:text-base hover:text-[#1E6B2E] transition-colors flex items-center gap-1.5"
                    >
                      <span>Order #{displayId}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <StatusChip status={currentStatus} />
                      <Link
                        href={`/orders/${order.id}`}
                        aria-label={`View order ${displayId}`}
                        className="text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium -mt-1">
                    {order.date || 'Recently placed'}
                  </p>

                  {/* Content Row: Product Thumbnails + Item Summary */}
                  <div className="flex items-center gap-3 pt-1">
                    {/* Thumbnails Row */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {displayThumbnails.length > 0 ? (
                        displayThumbnails.map((item, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-xl border border-stone-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden"
                            title={item.productName || item.name}
                          >
                            {item.image && !item.image.includes('placeholder.svg') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.productName || item.name || 'Grocery Item'}
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  (e.currentTarget.parentElement as HTMLElement)
                                    .querySelector('.g1-thumb-fallback')
                                    ?.removeAttribute('hidden');
                                }}
                              />
                            ) : null}
                            <Package
                              className="g1-thumb-fallback w-5 h-5 text-stone-400"
                              style={{ display: item.image && !item.image.includes('placeholder.svg') ? 'none' : 'block' }}
                              strokeWidth={1.8}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-12 h-12 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-stone-400" />
                        </div>
                      )}

                      {/* +N More indicator */}
                      {remainingThumbnailsCount > 0 && (
                        <div className="w-12 h-12 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 font-bold text-xs flex items-center justify-center shrink-0">
                          +{remainingThumbnailsCount}
                        </div>
                      )}
                    </div>

                    {/* Product Summary */}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs sm:text-sm text-stone-900 leading-snug">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-[11px] sm:text-xs text-stone-500 leading-snug line-clamp-2 mt-0.5">
                        {productNames || (order.type === 'slip' ? 'Uploaded grocery list items' : 'Supermarket items')}
                      </p>
                    </div>
                  </div>

                  {/* Footer Row: Price + Payment Status + Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-base sm:text-lg">
                        ₹{displayTotal}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFullyPaid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {isFullyPaid ? '✓ Paid' : 'Cash on Delivery'}
                      </span>
                    </div>

                    {isDelivered ? (
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-[#1E6B2E] text-[#1E6B2E] text-xs font-bold bg-white hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                        style={{ backgroundColor: 'var(--g1-primary)' }}
                      >
                        <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Track Order</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
