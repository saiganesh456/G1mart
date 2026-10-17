'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Phone,
  Package,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  X,
  CreditCard,
  Banknote,
  Truck,
  Check,
  Sparkles,
  FileText,
  ChevronRight,
} from 'lucide-react';
import DeliveryJourneyAnimation from '@/components/orders/DeliveryJourneyAnimation';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import { STORE_CONFIG } from '@/config/store';
import { soundAlerts } from '@/lib/soundAlerts';
import { useCart } from '@/context/CartContext';
import { triggerSuccessHaptic } from '@/lib/haptics';
import { MIGRATED_PRODUCT_LIST } from '@/services/productService';
import type { Product } from '@/types';

function getProductHref(item: any): string | null {
  if (!item) return null;
  const pid = item.productId || item.product_id;
  if (pid) return `/product/${pid}`;

  if (item.id && !String(item.id).startsWith('item_') && !String(item.id).startsWith('slip_')) {
    return `/product/${item.id}`;
  }

  const rawName = (item.productName || item.name || '').trim();
  if (!rawName) return null;

  const directMatch = MIGRATED_PRODUCT_LIST.find(
    (p) => p.name.toLowerCase() === rawName.toLowerCase()
  );
  if (directMatch) return `/product/${directMatch.id}`;

  const partialMatch = MIGRATED_PRODUCT_LIST.find((p) => {
    const pName = p.name.toLowerCase();
    const target = rawName.toLowerCase();
    return pName.includes(target) || target.includes(pName);
  });
  if (partialMatch) return `/product/${partialMatch.id}`;

  return `/search?q=${encodeURIComponent(rawName)}`;
}

interface Props {
  orderId: string;
  initialOrder?: any;
}

export default function OrderDetailClient({ orderId, initialOrder }: Props) {
  const searchParams = useSearchParams();
  const isJustPlaced = searchParams.get('placed') === 'true';
  const isPaid = searchParams.get('paid') === 'true';
  const { clearCart } = useCart();

  // Instant zero-delay hydration from server props or local storage cache
  const [order, setOrder] = useState<any>(() => {
    if (initialOrder) return initialOrder;
    if (typeof window !== 'undefined') {
      try {
        const cleanTargetId = String(orderId || '').replace(/^SLIP-/i, '').toLowerCase();

        // 1. Check latest placed order
        const latestRaw =
          sessionStorage.getItem('g1mart_latest_order') ||
          localStorage.getItem('g1mart_recent_order');
        if (latestRaw) {
          const parsed = JSON.parse(latestRaw);
          const parsedId = String(parsed?.id || '').replace(/^SLIP-/i, '').toLowerCase();
          const parsedNum = String(parsed?.orderNumber || '').replace(/^SLIP-/i, '').toLowerCase();
          if (parsedId === cleanTargetId || parsedNum === cleanTargetId) {
            return parsed;
          }
        }

        // 2. Check g1mart_account_orders (where /orders page stores orders)
        const accRaw = localStorage.getItem('g1mart_account_orders');
        if (accRaw) {
          const list = JSON.parse(accRaw);
          if (Array.isArray(list)) {
            const match = list.find((o: any) => {
              const oId = String(o?.id || '').replace(/^SLIP-/i, '').toLowerCase();
              const oNum = String(o?.orderNumber || '').replace(/^SLIP-/i, '').toLowerCase();
              return oId === cleanTargetId || oNum === cleanTargetId;
            });
            if (match) return match;
          }
        }

        // 3. Check g1mart_orders_list in sessionStorage
        const listRaw = sessionStorage.getItem('g1mart_orders_list');
        if (listRaw) {
          const list = JSON.parse(listRaw);
          if (Array.isArray(list)) {
            const match = list.find((o: any) => {
              const oId = String(o?.id || '').replace(/^SLIP-/i, '').toLowerCase();
              const oNum = String(o?.orderNumber || '').replace(/^SLIP-/i, '').toLowerCase();
              return oId === cleanTargetId || oNum === cleanTargetId;
            });
            if (match) return match;
          }
        }
      } catch (err) {
        console.warn('Error hydrating cached order:', err);
      }
    }
    return null;
  });

  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Phase 5 & 6 Payment state for slip orders
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [codFee, setCodFee] = useState<number>(50);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showRazorpayTestModal, setShowRazorpayTestModal] = useState(false);

  // Top-up items modal (Phase 6 Rule 5)
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState(1);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Fetch store COD fee
  useEffect(() => {
    fetch('/api/store/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.store?.cod_fee === 'number') {
          setCodFee(data.store.cod_fee);
        }
      })
      .catch(() => {});
  }, []);

  // Search products for top-up
  useEffect(() => {
    if (!showAddItemsModal) return;
    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(itemSearchQuery)}&limit=12`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setSearchResults(data.products);
        }
      } catch (err) {
        console.warn('Product search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(searchTimer);
  }, [itemSearchQuery, showAddItemsModal]);

  useEffect(() => {
    const cleanTargetId = String(orderId || '').replace(/^SLIP-/i, '').toLowerCase();
    let currentOrder = order;

    // Check localStorage cache if not yet set
    if (!currentOrder && typeof window !== 'undefined') {
      try {
        const latestRaw =
          sessionStorage.getItem('g1mart_latest_order') ||
          localStorage.getItem('g1mart_recent_order');
        if (latestRaw) {
          const parsed = JSON.parse(latestRaw);
          const parsedId = String(parsed?.id || '').replace(/^SLIP-/i, '').toLowerCase();
          const parsedNum = String(parsed?.orderNumber || '').replace(/^SLIP-/i, '').toLowerCase();
          if (parsedId === cleanTargetId || parsedNum === cleanTargetId) {
            currentOrder = parsed;
            setOrder(parsed);
          }
        }

        if (!currentOrder) {
          const accRaw = localStorage.getItem('g1mart_account_orders');
          if (accRaw) {
            const list = JSON.parse(accRaw);
            if (Array.isArray(list)) {
              const match = list.find((o: any) => {
                const oId = String(o?.id || '').replace(/^SLIP-/i, '').toLowerCase();
                const oNum = String(o?.orderNumber || '').replace(/^SLIP-/i, '').toLowerCase();
                return oId === cleanTargetId || oNum === cleanTargetId;
              });
              if (match) {
                currentOrder = match;
                setOrder(match);
              }
            }
          }
        }

        if (!currentOrder) {
          const listRaw = sessionStorage.getItem('g1mart_orders_list');
          if (listRaw) {
            const list = JSON.parse(listRaw);
            if (Array.isArray(list)) {
              const match = list.find((o: any) => {
                const oId = String(o?.id || '').replace(/^SLIP-/i, '').toLowerCase();
                const oNum = String(o?.orderNumber || '').replace(/^SLIP-/i, '').toLowerCase();
                return oId === cleanTargetId || oNum === cleanTargetId;
              });
              if (match) {
                currentOrder = match;
                setOrder(match);
              }
            }
          }
        }
      } catch {}
    }

    // Proactively register locally cached order with server store if server had cold started
    if (currentOrder && currentOrder.id) {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentOrder),
      }).catch(() => {});
    }

    const playStatusChime = (newStatus: string) => {
      switch (newStatus) {
        case 'Confirmed':
          soundAlerts.playOrderConfirmedChime();
          break;
        case 'Packing':
        case 'Packed':
          soundAlerts.playPackedChime();
          break;
        case 'Rider Assigned':
          soundAlerts.playRiderAssignmentChime();
          break;
        case 'Order Dispatched':
        case 'Out for Delivery':
          soundAlerts.playOutForDeliveryChime();
          break;
        case 'Delivered':
          soundAlerts.playDeliveredChime();
          break;
      }
    };

    const syncLiveOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder((prev: any) => {
            if (prev && prev.status && prev.status !== data.order.status) {
              playStatusChime(data.order.status);
            }
            return { ...prev, ...data.order };
          });
          try {
            sessionStorage.setItem('g1mart_latest_order', JSON.stringify(data.order));
            localStorage.setItem('g1mart_recent_order', JSON.stringify(data.order));

            // Keep g1mart_account_orders updated
            const accRaw = localStorage.getItem('g1mart_account_orders');
            if (accRaw) {
              const list = JSON.parse(accRaw);
              if (Array.isArray(list)) {
                const updated = list.map((o: any) =>
                  o.id === data.order.id || o.orderNumber === data.order.id
                    ? { ...o, ...data.order }
                    : o
                );
                localStorage.setItem('g1mart_account_orders', JSON.stringify(updated));
              }
            }
          } catch {}
          return;
        }

        const payRes = await fetch(`/api/orders/${orderId}/payment-status`);
        const payData = await payRes.json();
        if (payData.success && payData.order) {
          setOrder((prev: any) => {
            if (prev && prev.status && prev.status !== payData.order.status) {
              playStatusChime(payData.order.status);
            }
            return { ...prev, ...payData.order };
          });
        }
      } catch (err) {
        // quiet poll
      }
    };

    syncLiveOrder();

    // 4-second safety timeout so users are never stuck on a 3-4 minute infinite spinner
    const timer = setTimeout(() => {
      setOrder((prev: any) => {
        if (!prev) setHasTimedOut(true);
        return prev;
      });
    }, 4000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('g1mart_order_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDER_UPDATED' && (event.data.orderId === orderId || event.data.order?.id === orderId)) {
          const nextStatus = event.data.status || event.data.order?.status;
          setOrder((prev: any) => {
            if (prev && nextStatus && prev.status !== nextStatus) {
              playStatusChime(nextStatus);
            }
            return { ...prev, ...(event.data.order || {}), status: nextStatus || prev?.status };
          });
        }
      };
    } catch {}

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

    const interval = setInterval(syncLiveOrder, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, [orderId]);

  useEffect(() => {
    if (isJustPlaced || isPaid) {
      clearCart();
      triggerSuccessHaptic();
      if (typeof document !== 'undefined') {
        document.cookie = 'g1mart_order_just_paid=; path=/; max-age=0;';
      }
      // Immediately clean search params from address bar so refresh/re-renders never re-trigger
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('placed');
          url.searchParams.delete('paid');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      } catch {}
    }

    if (isJustPlaced) {
      // Play confirmation sound chime once on placement without showing redundant "Track Order" banner
      const placedChimeKey = `g1mart_placed_chime_${orderId}`;
      try {
        if (!sessionStorage.getItem(placedChimeKey)) {
          sessionStorage.setItem(placedChimeKey, 'true');
          soundAlerts.playOrderConfirmedChime();
        }
      } catch {
        soundAlerts.playOrderConfirmedChime();
      }
    }
  }, [isJustPlaced, isPaid, orderId, clearCart]);

  const isSlipOrder =
    order?.type === 'slip' ||
    orderId.startsWith('SLIP-') ||
    Boolean(order?.images && order.images.length > 0);

  const address = order?.address || null;
  const items = order?.items || [];
  const lat = address?.latitude || order?.lat || 14.4426;
  const lng = address?.longitude || order?.lng || 79.9865;
  const isPickup = order?.orderType === 'pickup' || order?.slot === 'Store Pickup';

  const isFullyPaid =
    order?.isPaid ||
    order?.status === 'PAID' ||
    order?.paymentStatus === 'paid' ||
    order?.paymentStatus === 'completed' ||
    order?.paymentStatus === 'manual_verified';

  const isCodPending =
    order?.status === 'COD_PENDING' ||
    order?.paymentStatus === 'COD_PENDING';

  // Zone Minimum and Shortfall Calculations
  const zoneMinOrder = Number(order?.zone_min_order) || 500;
  // Subtotal is based on available packed items
  const currentSubtotal = Number(order?.subtotal) || Number(order?.finalTotal) || Number(order?.estimatedTotal) || 0;
  const hasShortfall = !isPickup && currentSubtotal < zoneMinOrder;
  const shortfallAmount = Math.max(0, zoneMinOrder - currentSubtotal);

  const effectiveCodFee = paymentMethod === 'cod' ? (order?.codFee ?? codFee) : 0;
  const slipFinalTotal = currentSubtotal + effectiveCodFee;

  // Add Item to Slip Order (Phase 6 Rule 5)
  const handleAddItemToSlip = async () => {
    if (!selectedProductToAdd) return;
    setIsAddingItem(true);
    setPaymentError(null);

    try {
      const res = await fetch(`/api/slip-orders/${orderId}/add-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              productId: selectedProductToAdd.id,
              name: selectedProductToAdd.name,
              unit: selectedProductToAdd.unit || '1 unit',
              price: selectedProductToAdd.price || 0,
              quantity: qtyToAdd,
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setOrder((prev: any) => ({
          ...prev,
          items: (data.order.items || []).map((it: any) => ({
            id: it.id,
            productId: it.product_id,
            productName: it.name,
            unit: it.unit,
            price: it.price,
            quantity: it.packed_qty || it.requested_qty,
            requestedQty: it.requested_qty,
            packedQty: it.packed_qty,
            available: it.available,
            substituteNote: it.substitute_note,
          })),
          subtotal: data.order.subtotal,
          finalTotal: data.order.final_total,
          total: data.order.final_total,
        }));
        setSelectedProductToAdd(null);
        setQtyToAdd(1);
        setShowAddItemsModal(false);
      } else {
        setPaymentError(data.error || 'Failed to add item to order');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Error connecting to server');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Submit Payment for Slip Order
  const handleCompleteSlipPayment = async (isTestOnlineSuccess: boolean = false) => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      if (paymentMethod === 'cod') {
        const res = await fetch(`/api/slip-orders/${orderId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'cod',
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setOrder((prev: any) => ({
            ...prev,
            status: 'COD_PENDING',
            paymentStatus: 'COD_PENDING',
            paymentMethod: 'Cash on Delivery',
            finalTotal: data.order.final_total,
            codFee: data.order.cod_fee,
          }));

          try {
            const bc = new BroadcastChannel('g1mart_order_channel');
            bc.postMessage({ type: 'ORDER_UPDATED', orderId, status: 'COD_PENDING' });
            bc.close();
          } catch {}
        } else {
          setPaymentError(data.error || 'Failed to confirm Pay on Delivery');
        }
      } else {
        // Online Payment via Razorpay
        if (!isTestOnlineSuccess) {
          setShowRazorpayTestModal(true);
          setIsProcessingPayment(false);
          return;
        }

        const paymentId = `pay_slip_${Date.now().toString().slice(-8)}`;
        const razorpayOrderId = `order_slip_${orderId}`;
        const signature = `sig_${razorpayOrderId}_${paymentId}`;

        const res = await fetch(`/api/slip-orders/${orderId}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'online',
            razorpayPaymentId: paymentId,
            razorpayOrderId,
            razorpaySignature: signature,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setShowRazorpayTestModal(false);
          setOrder((prev: any) => ({
            ...prev,
            status: 'PAID',
            paymentStatus: 'paid',
            isPaid: true,
            paymentMethod: 'Razorpay UPI/Card',
            transactionId: paymentId,
            finalTotal: data.order.final_total,
          }));

          try {
            const bc = new BroadcastChannel('g1mart_order_channel');
            bc.postMessage({ type: 'ORDER_UPDATED', orderId, status: 'PAID' });
            bc.close();
          } catch {}
        } else {
          setPaymentError(data.error || 'Online payment verification failed');
        }
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isAwaitingPayment =
    order?.status === 'AWAITING_PAYMENT' ||
    order?.status === 'PACKED' ||
    (isSlipOrder && !isFullyPaid && !isCodPending && (order?.items || []).length > 0 && order?.status !== 'SLIP_RECEIVED' && order?.status !== 'BILLING');

  if (!order) {
    if (hasTimedOut) {
      return (
        <div className="max-w-md mx-auto space-y-5 pb-28 pt-20 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-black text-stone-900">Order #{orderId} Details Not Found</h2>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              We couldn&apos;t retrieve the live details for this order. It may have expired or was placed in a different browser session.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-95"
              style={{ backgroundColor: 'var(--g1-primary)' }}
            >
              Back to My Orders
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all active:scale-95"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#2E7D32] border-t-transparent animate-spin mx-auto" />
        <h2 className="text-base font-bold text-stone-800">Loading your order details...</h2>
        <p className="text-xs text-stone-500">Order #{orderId}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8] pb-48">
      {/* Top Header — Reference C: Deep Green Bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 text-white shadow-xs"
        style={{ height: 56, backgroundColor: 'var(--g1-primary)' }}
      >
        <Link
          href="/orders"
          aria-label="Back to orders"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
        </Link>

        <div className="flex-1 text-center px-2 min-w-0">
          <h1 className="font-bold text-sm sm:text-base text-white truncate flex items-center justify-center gap-1.5">
            <span>Order #{orderId}</span>
            {isSlipOrder && (
              <span className="text-[9px] font-black uppercase bg-emerald-800 text-white px-2 py-0.5 rounded-full border border-emerald-600">
                Slip
              </span>
            )}
          </h1>
          <p className="text-[11px] text-emerald-100 truncate mt-0.5 font-medium">
            {order?.date || 'Today'} · {isPickup ? 'Store Pickup' : 'Express Doorstep Delivery'}
          </p>
        </div>

        <div className="w-9 flex items-center justify-end shrink-0">
          {order?.eta_min ? (
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              ~{order.eta_min}m
            </span>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 space-y-3.5">
        {/* Just Placed / Paid Congratulations Pill */}
        {(isJustPlaced || isPaid) && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-[#1E6B2E] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-extrabold text-emerald-900">
                {isPaid
                  ? 'Payment Confirmed & Order Placed!'
                  : isSlipOrder
                  ? 'We received your list. Our team will call you to confirm!'
                  : 'Order Confirmed & Dispatched to Hub!'}
              </h2>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                {isPaid
                  ? `We received your payment of ₹${order?.paidAmount || order?.finalTotal || order?.grandTotal || '—'}. Our store team is packing your groceries fresh.`
                  : isSlipOrder
                  ? 'Our Nellore store manager is transcribing your list. Once confirmed and packed fresh, your verified final bill will appear here.'
                  : 'We received your order. Our store team is packing your groceries fresh.'}
              </p>
            </div>
          </div>
        )}

        {/* Error alert */}
        {paymentError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* Illustrated Delivery Journey Component — Reference C Primary Visual Feature */}
        <DeliveryJourneyAnimation
          status={order?.status || 'Order Placed'}
          orderType={order?.orderType}
          orderId={orderId}
          etaMin={order?.eta_min}
        />

        {/* Main Order Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-4">
          {/* Order Status & Payment Status row — Reference C */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[11px] text-stone-400 font-semibold block">Order Status</span>
              <span className="text-sm sm:text-base font-bold text-[#1E6B2E] flex items-center gap-1.5">
                <span>
                  {order?.status === 'SLIP_RECEIVED'
                    ? 'List Received by Store'
                    : order?.status === 'BILLING'
                    ? 'Bill in Preparation'
                    : order?.status === 'AWAITING_CUSTOMER_CONFIRMATION'
                    ? 'Awaiting Store Confirmation Call'
                    : order?.status === 'CONFIRMED'
                    ? 'Confirmed · Preparing Packing'
                    : order?.status === 'PACKING'
                    ? 'Packing Fresh Items'
                    : order?.status === 'PACKED' || order?.status === 'AWAITING_PAYMENT'
                    ? 'Packed · Awaiting Bill Payment'
                    : order?.status === 'COD_PENDING'
                    ? 'Pay on Delivery Confirmed'
                    : order?.status === 'PAID'
                    ? 'Paid Online · Ready for Dispatch'
                    : order?.status || 'Order Placed'}
                </span>
                {(order?.status === 'PACKING' || order?.status === 'AWAITING_PAYMENT' || order?.status === 'Out for Delivery') && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-400 font-semibold block">Payment Status</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isFullyPaid
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isCodPending
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {isFullyPaid
                  ? '✓ Paid & Confirmed'
                  : isCodPending
                  ? 'Cash on Delivery (Pending)'
                  : 'Payment Pending'}
              </span>
            </div>
          </div>

        {/* Doorstep Delivery PIN (Customer Handover Verification) */}
        {(() => {
          const status = order?.status || 'Order Placed';
          const isDelivered = status === 'Delivered' || status === 'DELIVERED';
          const isOutForDelivery =
            status === 'Out for Delivery' ||
            status === 'OUT_FOR_DELIVERY' ||
            status === 'Order Dispatched' ||
            status === 'RIDER_ASSIGNED';
          const otp = order?.deliveryOtp || order?.delivery_otp;

          if (!isDelivered && (isOutForDelivery || otp || order?.arrivedAtDoorstep || order?.arrived_at_doorstep)) {
            const displayPin = otp || '4821';
            const riderName =
              order?.assignedRider?.name ||
              order?.assigned_rider_name ||
              'Express Fleet Partner';

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0E2813] via-[#163D1D] to-[#1E6B2E] text-white shadow-lg space-y-2 border border-emerald-500/30 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                      Doorstep Delivery PIN
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/15 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                    Share with Rider
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 gap-3">
                  <div>
                    <p className="text-xs text-stone-200 leading-snug">
                      Share this 4-digit code with rider <strong className="text-white">{riderName}</strong> when they arrive at your door:
                    </p>
                  </div>
                  <div className="bg-white text-[#1E6B2E] font-mono text-2xl font-black px-4 py-1.5 rounded-xl border-2 border-emerald-400 tracking-widest shadow-inner shrink-0">
                    {displayPin}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Customer Uploaded Photos Preview (for slip orders) */}
        {order?.images && order.images.length > 0 && (
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#2E7D32]" />
              <span>Your Uploaded Grocery List ({order.images.length} photos)</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {order.images.map((img: any, idx: number) => (
                <a
                  key={idx}
                  href={img.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={`List page ${idx + 1}`}
                    className="w-12 h-12 object-cover rounded-lg border border-stone-200 hover:opacity-80 transition-opacity bg-stone-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Rider Card (if assigned) */}
        {order?.assignedRider && (
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-black">
                🛵
              </div>
              <div>
                <p className="text-xs font-black text-emerald-950">
                  {order.assignedRider.name || 'Express Rider'}
                </p>
                <p className="text-[10px] text-emerald-700">G1 Mart Delivery Partner</p>
              </div>
            </div>

            {order.assignedRider.phone && (
              <a
                href={`tel:${order.assignedRider.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-black rounded-xl hover:bg-[#2E7D32]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            )}
          </div>
        )}

        {/* Customer & Address Details */}
        {address && (
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 space-y-2">
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
                <span>Delivery Details</span>
              </div>
              {order?.distance_km && (
                <span className="text-[11px] font-bold text-stone-500">
                  {order.distance_km} km road distance
                </span>
              )}
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
            </div>
          </div>
        )}

        {/* Items Breakdown with Unavailable Strike-Through (Phase 6 Rule 5) */}
        {items.length > 0 && (
          <div className="space-y-2.5 border-t border-stone-100 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900">
                <Package className="w-4 h-4 text-[#1E6B2E]" />
                <span>Items ({items.length})</span>
              </div>

              {/* Add items top-up button if awaiting payment */}
              {isAwaitingPayment && (
                <button
                  type="button"
                  onClick={() => setShowAddItemsModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-black text-[#1E6B2E] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Items</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
              {items.map((item: any, idx: number) => {
                const isItemUnavailable = item.available === false;
                const qty = item.packedQty || item.requestedQty || item.quantity || 1;
                const price = Number(item.price) || 0;
                const lineTotal = isItemUnavailable ? 0 : price * qty;

                const itemHref = getProductHref(item);

                const itemContent = (
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || '/products/placeholder.svg'}
                      alt={item.productName || item.name}
                      className="w-10 h-10 object-contain rounded-lg border border-stone-200 bg-stone-50 p-1 shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`font-black group-hover:text-[#1E6B2E] transition-colors leading-snug line-clamp-2 ${
                            isItemUnavailable ? 'line-through text-stone-400' : 'text-[#212121]'
                          }`}
                        >
                          {item.productName || item.name}
                        </p>
                        {itemHref && (
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1E6B2E] group-hover:translate-x-0.5 transition-all shrink-0" />
                        )}
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {item.requestedQty !== undefined && item.packedQty !== undefined
                          ? `Requested: ${item.requestedQty} · Packed: ${item.packedQty} ${item.unit || ''}`
                          : `Qty: ${qty} · ${item.unit || 'unit'}`}{' '}
                        @ ₹{price}/unit
                      </p>

                      {/* Unavailable Badge & Substitute Note */}
                      {isItemUnavailable && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            Out of stock
                          </span>
                          {item.substituteNote && (
                            <span className="text-[11px] text-stone-600 italic">
                              Note: {item.substituteNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div
                    key={idx}
                    className={`p-3 flex items-start justify-between text-xs transition-colors ${
                      isItemUnavailable ? 'bg-rose-50/40 text-stone-400' : 'bg-white hover:bg-stone-50/80'
                    }`}
                  >
                    {itemHref ? (
                      <Link
                        href={itemHref}
                        className="group flex-1 min-w-0 flex items-start cursor-pointer mr-3"
                        title={`View ${item.productName || item.name} details`}
                      >
                        {itemContent}
                      </Link>
                    ) : (
                      <div className="flex-1 min-w-0 flex items-start mr-3">{itemContent}</div>
                    )}

                    <div className="text-right shrink-0">
                      <span
                        className={`font-black ${
                          isItemUnavailable ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {isItemUnavailable ? '₹0' : `₹${lineTotal}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary — Reference C */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs sm:text-sm pb-1 border-b border-stone-200/60">
                <FileText className="w-4 h-4 text-[#1E6B2E]" />
                <span>Bill Summary</span>
              </div>

              <div className="flex justify-between items-center text-stone-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-stone-900">₹{currentSubtotal}</span>
              </div>

              <div className="flex justify-between items-center text-stone-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-[#1E6B2E]">FREE (₹0)</span>
              </div>

              {/* Pay on Delivery Fee row (Phase 5 Rule 2) */}
              {(isCodPending || paymentMethod === 'cod') && (
                <div className="flex justify-between items-center text-stone-800 font-medium">
                  <span>Pay on Delivery handling fee:</span>
                  <span className="font-bold text-orange-900">+₹{order?.codFee ?? codFee}</span>
                </div>
              )}

              <div className="border-t border-stone-200 pt-2 flex justify-between items-center">
                <span className="font-bold text-stone-900 text-sm">Final Bill Total:</span>
                <span className="text-base font-black text-[#1E6B2E]">
                  ₹{order?.finalTotal || slipFinalTotal}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 6 RULE 5: ZONE MINIMUM SHORTFALL BANNER & BLOCK PAYMENT */}
        {isAwaitingPayment && hasShortfall && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-amber-950">
                  Add ₹{shortfallAmount} more to get free delivery to your location
                </h3>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your delivery zone requires a minimum order of ₹{zoneMinOrder}. Current subtotal is ₹{currentSubtotal}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddItemsModal(true)}
              className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Items to Meet ₹{zoneMinOrder} Minimum</span>
            </button>
          </div>
        )}

        {/* PHASE 5 & 6 PAYMENT STEP (When at or above minimum) */}
        {isAwaitingPayment && !hasShortfall && (
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/90 space-y-3.5 animate-in fade-in">
            <div>
              <span className="text-xs font-black text-[#1B5E20] uppercase tracking-wider block">
                Choose Payment Method to Dispatch
              </span>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Delivery is 100% Free. Complete payment to dispatch our delivery partner.
              </p>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Pay Online */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3 rounded-2xl border-2 text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#1B5E20] bg-white ring-2 ring-emerald-100 shadow-xs'
                    : 'border-stone-200 bg-white/70 hover:bg-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-black text-stone-900 block">
                    Pay Online (UPI / Card)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    No extra fee • Instant verification
                  </span>
                  <span className="text-xs font-black text-[#2E7D32] mt-1 block">
                    ₹{currentSubtotal}
                  </span>
                </div>
              </button>

              {/* Option 2: Pay on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border-2 text-left flex items-start gap-2.5 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#1B5E20] bg-white ring-2 ring-emerald-100 shadow-xs'
                    : 'border-stone-200 bg-white/70 hover:bg-white'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-black text-stone-900 block">Pay on Delivery</span>
                  <span className="text-[10px] text-amber-800 font-bold block">
                    +₹{codFee} handling fee
                  </span>
                  <span className="text-xs font-black text-stone-900 mt-1 block">
                    ₹{currentSubtotal + codFee}
                  </span>
                </div>
              </button>
            </div>

            {/* Pay CTA */}
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleCompleteSlipPayment(false)}
              className="w-full py-3.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {isProcessingPayment
                  ? 'Processing Payment...'
                  : paymentMethod === 'online'
                  ? `Pay Online ₹${currentSubtotal}`
                  : `Confirm Pay on Delivery (₹${currentSubtotal + codFee})`}
              </span>
            </button>
          </div>
        )}

        {/* Customer Help & Support — Reference C */}
        <div className="bg-stone-50 p-3.5 sm:p-4 rounded-2xl border border-stone-200/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">Need Help with your Order?</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#1E6B2E]" />
              <span>G1 Mart Care</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href={`tel:${(STORE_CONFIG.contact.phone || '+919876543210').replace(/\s+/g, '')}`}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 px-3 bg-white hover:bg-stone-100 active:scale-95 text-stone-800 font-bold rounded-xl text-xs sm:text-sm border border-stone-200 transition-all shadow-2xs cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#1E6B2E]" />
              <span>Call Store</span>
            </a>
            <a
              href={`https://wa.me/${(STORE_CONFIG.contact.whatsapp || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi G1 Mart Team, I have an inquiry regarding Order #${orderId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 px-3 bg-[#1E6B2E] hover:bg-[#155223] active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.079-.496-1.637-.679-2.684-2.348-2.766-2.456-.081-.109-.652-.868-.652-1.652 0-.784.412-1.17.558-1.328.146-.159.32-.198.428-.198.107 0 .214.002.308.006.098.005.231-.038.36.273.134.323.456 1.111.496 1.192.04.081.067.176.014.283-.053.107-.08.175-.16.27-.08.095-.169.213-.241.286-.081.082-.166.17-.071.332.094.163.42 1.002 1.018 1.533.771.686 1.42.898 1.62.998.2.1.317.087.435-.048.118-.135.508-.59.643-.792.135-.202.27-.168.455-.1.185.068 1.172.553 1.374.654.202.101.337.151.386.236.049.085.049.493-.095.898z" />
              </svg>
              <span>WhatsApp Store</span>
            </a>
          </div>
        </div>
      </div>
    </main>

      {/* MODAL 1: ADD TOP-UP ITEMS TO MEET ZONE MINIMUM */}
      {showAddItemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div>
                <h4 className="text-sm font-black text-stone-900">Add Items to Your Order</h4>
                <p className="text-[11px] text-stone-500">
                  Zone minimum shortfall: <strong className="text-amber-700">₹{shortfallAmount}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItemsModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search groceries (e.g., Milk, Atta, Ghee, Sugar)..."
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 pr-1">
              {isSearching ? (
                <div className="p-6 text-center text-xs text-stone-400 font-bold">
                  Searching supermarket catalog...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">
                  {itemSearchQuery ? 'No matching products found' : 'Type grocery name to search'}
                </div>
              ) : (
                searchResults.map((product) => {
                  const isSelected = selectedProductToAdd?.id === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProductToAdd(product)}
                      className={`p-2.5 flex items-center justify-between rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || '/products/placeholder.svg'}
                          alt={product.name}
                          className="w-9 h-9 object-contain rounded-md border border-stone-200 bg-white"
                        />
                        <div>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {product.unit || '1 unit'} · ₹{product.price}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#2E7D32]">₹{product.price}</span>
                        {isSelected && (
                          <span className="block text-[10px] text-emerald-800 font-bold">Selected</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Product Qty adjust and Add Button */}
            {selectedProductToAdd && (
              <div className="pt-2 border-t border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">{selectedProductToAdd.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQtyToAdd((q) => Math.max(1, q - 1))}
                      className="w-6 h-6 rounded-md bg-stone-100 font-bold flex items-center justify-center hover:bg-stone-200"
                    >
                      -
                    </button>
                    <span className="font-black text-stone-900 w-4 text-center">{qtyToAdd}</span>
                    <button
                      type="button"
                      onClick={() => setQtyToAdd((q) => q + 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 font-bold flex items-center justify-center hover:bg-stone-200"
                    >
                      +
                    </button>
                    <span className="font-black text-[#2E7D32] ml-2">
                      = ₹{(selectedProductToAdd.price || 0) * qtyToAdd}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAddingItem}
                  onClick={handleAddItemToSlip}
                  className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isAddingItem
                      ? 'Adding...'
                      : `Add to Order (+₹${(selectedProductToAdd.price || 0) * qtyToAdd})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: RAZORPAY TEST PAYMENT MODAL */}
      {showRazorpayTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2E7D32]" />
                <h4 className="text-sm font-black text-stone-900">Razorpay Test Checkout</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowRazorpayTestModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Order Number:</span>
                <span className="font-bold text-stone-900">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Total Amount:</span>
                <span className="font-black text-[#2E7D32]">₹{currentSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Mode:</span>
                <span className="font-bold text-emerald-700">TEST / Sandbox</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              In test mode, clicking &quot;Simulate Success&quot; will generate an authenticated HMAC SHA256 payment signature and verify it server-side.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRazorpayTestModal(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleCompleteSlipPayment(true)}
                className="flex-1 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Simulate Success</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
