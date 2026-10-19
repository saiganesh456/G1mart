'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  X,
  Info,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { addressService } from '@/services/addressService';
import Script from 'next/script';
import { loadRazorpayScript } from '@/components/payment/RazorpayCheckoutButton';

export default function PaymentPage() {
  const router = useRouter();
  const { cart, cartSubtotal, cartItemCount, clearCart } = useCart();
  const { isLoggedIn, supabaseUser, user } = useAuth();

  // Two options — 'online' (Razorpay UPI/Cards/NetBanking) vs 'cod' (Pay on delivery)
  const [selectedMethod, setSelectedMethod] = useState<'online' | 'cod'>('online');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic COD fee from store settings (default ₹50)
  const [codFee, setCodFee] = useState<number>(50);
  const [recentOrder, setRecentOrder] = useState<any>(null);

  // If user arrives at /payment with ?paid=true and ?orderId=, redirect to order detail page immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paid = params.get('paid');
      const orderId = params.get('orderId');
      if (orderId && paid === 'true') {
        router.replace(`/orders/${orderId}?paid=true`);
      }
      try {
        const raw = localStorage.getItem('g1mart_recent_order');
        if (raw) {
          const parsed = JSON.parse(raw);
          setRecentOrder(parsed);
        }
      } catch {}
    }
  }, [router]);

  // Fetch store settings for configured COD fee (Rule 3)
  useEffect(() => {
    fetch('/api/store/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.store?.cod_fee === 'number') {
          setCodFee(data.store.cod_fee);
        }
      })
      .catch((err) => {
        console.warn('[Payment] Failed to fetch store settings:', err);
      });
  }, []);

  // Bill Calculations:
  // Online payment adds NO fee (delivery = Free, COD fee = 0)
  // Pay on Delivery adds cod_fee (default ₹50)
  const effectiveCodFee = selectedMethod === 'cod' ? codFee : 0;
  const deliveryFee = 0; // Delivery is FREE in all zones
  const grandTotal = cartSubtotal + effectiveCodFee + deliveryFee;

  // Handle Order Placement / Payment Step
  const handleProceed = async () => {
    setErrorMessage(null);

    if (!isLoggedIn) {
      alert('Account required for ordering. Please sign in with Google first.');
      router.push('/checkout');
      return;
    }

    let addressData: any = null;
    try {
      const raw = sessionStorage.getItem('g1mart_checkout_address');
      if (raw) addressData = JSON.parse(raw);
      if (!addressData || !addressData.phone) {
        const lastUsed = localStorage.getItem('g1mart_last_used_address');
        if (lastUsed) addressData = JSON.parse(lastUsed);
      }
    } catch {}

    const isPickup = addressData?.orderType === 'pickup';
    if (!isPickup && (!addressData || (!addressData.phone && !addressData.mobileNumber))) {
      alert('Please complete your delivery address in checkout first.');
      router.push('/checkout');
      return;
    }

    const effectiveAddress = isPickup
      ? {
          id: 'store-pickup',
          orderType: 'pickup',
          fullName: addressData?.fullName || user?.name || 'Customer',
          mobileNumber: addressData?.phone || addressData?.mobileNumber || user?.phone || '9876543210',
          phone: addressData?.phone || addressData?.mobileNumber || user?.phone || '9876543210',
          houseFlat: 'G1mart Supermarket',
          streetArea: 'Govt Hospital, beside Padarupalli',
          landmark: 'In-Store Customer Pickup',
          city: 'Nellore',
          state: 'Andhra Pradesh',
          pincode: '524004',
          type: 'Other' as const,
          isDefault: false,
          deliveryInstructions: 'In-Store Customer Pickup',
        }
      : addressData;

    const payload = {
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        image: i.product.imageUrl || i.product.image || (i.product as any).image_url || '/products/placeholder.svg',
        price: i.variant?.price || i.product.price || 0,
        unit: i.variant?.size_label || i.product.unit || '1 unit',
        quantity: i.quantity,
        ...(i.variantId ? { variantId: i.variantId } : {}),
        ...(i.variant?.size_label ? { sizeLabel: i.variant.size_label } : {}),
      })),
      address: effectiveAddress,
      paymentMethod: selectedMethod === 'cod' ? 'Cash on Delivery' : 'Pay Online',
      orderType: isPickup ? 'pickup' : 'delivery',
      slot: addressData?.selectedSlot || (isPickup ? 'Store Pickup' : 'Standard Delivery'),
      userId: supabaseUser?.id || undefined,
      userEmail: user?.email || supabaseUser?.email || undefined,
      userPhone: effectiveAddress.phone || user?.phone || undefined,
      userName: effectiveAddress.fullName || user?.name || undefined,
    };

    setProcessing(true);

    try {
      // Initiate order on server
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const isAuthFailure =
          data?.error?.toLowerCase().includes('authentication') ||
          data?.error?.toLowerCase().includes('auth') ||
          res.status === 401;

        if (isAuthFailure) {
          setErrorMessage(
            'Payment gateway authentication error. Please retry or choose Pay on delivery.'
          );
        } else {
          setErrorMessage(data?.error || 'Failed to initiate checkout. Please check minimum order and try again.');
        }
        setProcessing(false);
        return;
      }

      // --- Option B: Pay on Delivery ---
      // Adds cod_fee to total; order becomes PLACED with payment_status = COD_PENDING (Phase 5 Rule 1)
      if (selectedMethod === 'cod') {
        const orderRecord = {
          id: data.orderId,
          orderNumber: data.orderId,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'Order Placed',
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'COD_PENDING',
          subtotal: data.subtotal || cartSubtotal,
          codFee: data.codFee || codFee,
          deliveryFee: 0,
          grandTotal: data.grandTotal || grandTotal,
          total: data.grandTotal || grandTotal,
          items: cart.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            unit: i.variant?.size_label || i.product.unit,
            price: i.variant?.price || i.product.price,
            quantity: i.quantity,
            image: i.product.image || '/products/placeholder.svg',
            variantId: i.variantId,
            sizeLabel: i.variant?.size_label,
          })),
          address: effectiveAddress,
          slot: addressData?.selectedSlot || (isPickup ? 'Store Pickup' : 'Standard Delivery'),
          userId: supabaseUser?.id || undefined,
          userEmail: user?.email || supabaseUser?.email || undefined,
        };

        try {
          sessionStorage.setItem('g1mart_latest_order', JSON.stringify(orderRecord));
          const prev = JSON.parse(sessionStorage.getItem('g1mart_orders_list') || '[]');
          sessionStorage.setItem('g1mart_orders_list', JSON.stringify([orderRecord, ...prev]));

          const accPrev = JSON.parse(localStorage.getItem('g1mart_account_orders') || '[]');
          localStorage.setItem('g1mart_account_orders', JSON.stringify([orderRecord, ...accPrev]));
          localStorage.setItem('g1mart_recent_order', JSON.stringify(orderRecord));

          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderRecord),
            keepalive: true,
          }).catch(() => {});

          // Sync to Supabase auth user metadata across devices
          if (supabaseUser && isSupabaseConfigured()) {
            const existingOrders = supabaseUser.user_metadata?.orders || [];
            supabase.auth.updateUser({
              data: { orders: [orderRecord, ...existingOrders] },
            }).catch(() => {});
          }

          // Direct client upsert to Supabase database (valid schema columns only)
          if (isSupabaseConfigured()) {
            try {
              await supabase.from('orders').upsert({
                id: orderRecord.id,
                user_id: supabaseUser?.id || null,
                date: orderRecord.date,
                slot: orderRecord.slot || 'Standard Delivery',
                payment_method: 'Cash on Delivery',
                is_paid: false,
                status: 'Order Placed',
                subtotal: orderRecord.subtotal || orderRecord.total || 0,
                discount: 0,
                delivery_fee: 0,
                taxes: 0,
                grand_total: orderRecord.grandTotal || orderRecord.total || 0,
                address: {
                  ...effectiveAddress,
                  _items: orderRecord.items,
                  _paymentStatus: 'COD_PENDING',
                  _userId: supabaseUser?.id,
                  _userEmail: user?.email || supabaseUser?.email,
                },
                updated_at: new Date().toISOString(),
              });
            } catch (sbErr) {
              console.warn('[Checkout] Supabase COD client upsert note:', sbErr);
            }
          }

          try {
            const bc = new BroadcastChannel('g1mart_order_channel');
            bc.postMessage({ type: 'NEW_ORDER', order: orderRecord });
            bc.close();
          } catch {}
        } catch {}

        clearCart();
        router.replace(`/orders/${data.orderId}?placed=true`);
        return;
      }

      // --- Option A: Pay Online via Razorpay Standard Checkout ---
      // Cache pending order so if mobile UPI switches app or tab reloads, items and details are preserved
      const pendingOrderRecord = {
        id: data.orderId,
        orderNumber: data.orderId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Order Placed',
        paymentMethod: 'Pay Online (Razorpay)',
        paymentStatus: 'pending',
        subtotal: data.subtotal || cartSubtotal,
        deliveryFee: 0,
        codFee: 0,
        grandTotal: data.grandTotal,
        total: data.grandTotal,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          unit: i.variant?.size_label || i.product.unit,
          price: i.variant?.price || i.product.price,
          quantity: i.quantity,
          image: i.product.image || '/products/placeholder.svg',
          variantId: i.variantId,
          sizeLabel: i.variant?.size_label,
        })),
        address: effectiveAddress,
        slot: addressData?.selectedSlot || (isPickup ? 'Store Pickup' : 'Standard Delivery'),
        userId: supabaseUser?.id || undefined,
        userEmail: user?.email || supabaseUser?.email || undefined,
      };

      try {
        sessionStorage.setItem('g1mart_latest_order', JSON.stringify(pendingOrderRecord));
        localStorage.setItem('g1mart_recent_order', JSON.stringify(pendingOrderRecord));
      } catch {}


      if (!data.providerOrderId || !data.keyId) {
        setErrorMessage('Online payment gateway is temporarily unavailable. Please retry or choose Pay on delivery.');
        setProcessing(false);
        return;
      }

      // Load official Razorpay checkout.js script
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        setErrorMessage('Unable to load payment gateway. Please check your internet connection or choose Pay on delivery.');
        setProcessing(false);
        return;
      }

      // Explicit callback link for Razorpay redirection upon UPI completion (as instructed by Razorpay support)
      const callbackUrl = `${window.location.origin}/api/payment/callback?orderId=${encodeURIComponent(data.orderId)}`;

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amountInPaise,
        currency: data.currency || 'INR',
        name: 'G1mart Supermarket',
        description: `Order #${data.orderId}`,
        order_id: data.providerOrderId,
        callback_url: callbackUrl,
        redirect: true,
        prefill: {
          name: effectiveAddress.fullName || user?.name || '',
          contact: effectiveAddress.phone || effectiveAddress.mobileNumber || user?.phone || '',
          email: user?.email || supabaseUser?.email || '',
        },
        theme: {
          color: '#2E7D32',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setErrorMessage('Online payment was cancelled or not completed. Please retry or choose Pay on delivery.');
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          await handleVerifyRazorpaySuccess({
            orderId: data.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            grandTotal: data.grandTotal,
          });
        },
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (failResp: any) => {
          setProcessing(false);
          const desc = failResp?.error?.description || failResp?.error?.reason || 'Payment transaction failed.';
          setErrorMessage(`Payment failed: ${desc}`);
        });

        rzp.open();
        setProcessing(false);
      } catch (rzpErr) {
        console.warn('[Payment] Error opening Razorpay popup:', rzpErr);
        setErrorMessage('Unable to open payment popup. Please allow popups or choose Pay on delivery.');
        setProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Server connection error during payment initiation');
      setProcessing(false);
    }
  };

  // Complete Razorpay Online Payment with Server-Side Verification
  const handleVerifyRazorpaySuccess = async (verifyParams: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    grandTotal: number;
  }) => {
    if (!verifyParams) return;
    const params = verifyParams;

    setProcessing(true);
    setErrorMessage(null);

    try {
      // Call server verification API (HMAC SHA-256 verification)
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: params.razorpayOrderId,
          payment_id: params.razorpayPaymentId,
          razorpay_signature: params.razorpaySignature,
          internalOrderId: params.orderId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setErrorMessage(verifyData.error || 'Server payment signature verification failed');
        setProcessing(false);
        return;
      }

      let addressData: any = null;
      try {
        const raw = sessionStorage.getItem('g1mart_checkout_address');
        if (raw) addressData = JSON.parse(raw);
        if (!addressData || !addressData.phone) {
          const lastUsed = localStorage.getItem('g1mart_last_used_address');
          if (lastUsed) addressData = JSON.parse(lastUsed);
        }
      } catch {}

      const effectiveAddress = addressData || {
        fullName: user?.name || 'Customer',
        phone: user?.phone || '9876543210',
        mobileNumber: user?.phone || '9876543210',
        houseFlat: 'Flat 101',
        streetArea: 'Nellore',
        city: 'Nellore',
        state: 'Andhra Pradesh',
        pincode: '524004',
        type: 'Home',
        isDefault: true,
      };

      // Server verified payment signature successfully! Order is now PAID
      const paidOrderRecord = {
        id: params.orderId,
        orderNumber: params.orderId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Order Placed',
        paymentMethod: 'Razorpay Standard Checkout',
        paymentStatus: 'paid',
        isPaid: true,
        paidAmount: params.grandTotal,
        transactionId: params.razorpayPaymentId,
        subtotal: cartSubtotal,
        deliveryFee: 0,
        codFee: 0,
        grandTotal: params.grandTotal,
        total: params.grandTotal,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          unit: i.variant?.size_label || i.product.unit,
          price: i.variant?.price || i.product.price,
          quantity: i.quantity,
          image: i.product.image || '/products/placeholder.svg',
          variantId: i.variantId,
          sizeLabel: i.variant?.size_label,
        })),
        address: effectiveAddress,
        slot: addressData?.selectedSlot || 'Standard Delivery',
        userId: supabaseUser?.id || undefined,
        userEmail: user?.email || supabaseUser?.email || undefined,
      };

      try {
        sessionStorage.setItem('g1mart_latest_order', JSON.stringify(paidOrderRecord));
        const prev = JSON.parse(sessionStorage.getItem('g1mart_orders_list') || '[]');
        sessionStorage.setItem('g1mart_orders_list', JSON.stringify([paidOrderRecord, ...prev]));

        const accPrev = JSON.parse(localStorage.getItem('g1mart_account_orders') || '[]');
        localStorage.setItem('g1mart_account_orders', JSON.stringify([paidOrderRecord, ...accPrev]));
        localStorage.setItem('g1mart_recent_order', JSON.stringify(paidOrderRecord));

        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paidOrderRecord),
          keepalive: true,
        }).catch(() => {});

        // Sync to Supabase auth user metadata across devices
        if (supabaseUser && isSupabaseConfigured()) {
          const existingOrders = supabaseUser.user_metadata?.orders || [];
          supabase.auth.updateUser({
            data: { orders: [paidOrderRecord, ...existingOrders] },
          }).catch(() => {});
        }

        // Direct client upsert to Supabase database (valid schema columns only)
        if (isSupabaseConfigured()) {
          try {
            await supabase.from('orders').upsert({
              id: paidOrderRecord.id,
              user_id: supabaseUser?.id || null,
              date: paidOrderRecord.date,
              slot: paidOrderRecord.slot || 'Standard Delivery',
              payment_method: 'Razorpay Standard Checkout',
              is_paid: true,
              status: 'Order Placed',
              subtotal: paidOrderRecord.subtotal || paidOrderRecord.total || 0,
              discount: 0,
              delivery_fee: 0,
              taxes: 0,
              grand_total: paidOrderRecord.grandTotal || paidOrderRecord.total || 0,
              address: {
                ...effectiveAddress,
                _items: paidOrderRecord.items,
                _paymentStatus: 'paid',
                _userId: supabaseUser?.id,
                _userEmail: user?.email || supabaseUser?.email,
              },
              updated_at: new Date().toISOString(),
            });
          } catch (sbErr) {
            console.warn('[Checkout] Supabase Razorpay client upsert note:', sbErr);
          }
        }

        try {
          const bc = new BroadcastChannel('g1mart_order_channel');
          bc.postMessage({ type: 'ORDER_PAID', orderId: params.orderId, order: paidOrderRecord });
          bc.close();
        } catch {}
      } catch {}

      clearCart();
      router.replace(`/orders/${params.orderId}?paid=true`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error completing server payment verification');
      setProcessing(false);
    }
  };

  if (cartItemCount === 0) {
    if (recentOrder) {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-[#2E7D32] rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Order Placed Successfully!</h2>
          <p className="text-stone-600 text-xs">
            Your order <strong className="text-stone-900">#{recentOrder.id}</strong> has been received and confirmed.
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href={`/orders/${recentOrder.id}?paid=true`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <span>View Order Details &amp; Track Items</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full inline-block px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
            >
              Return to Store
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
          <Banknote className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-stone-800">Your cart is empty</h2>
        <p className="text-stone-500 text-xs">
          Please add items to your cart before proceeding to payment.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Return to Store &amp; Add Items
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5 pb-36 pt-2 sm:pt-4 px-3 sm:px-4 box-border min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.replace('/checkout');
            }
          }}
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 shrink-0 cursor-pointer"
          aria-label="Back to Checkout"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-black text-[#212121] truncate">Payment Options</h1>
          <p className="text-[11px] text-stone-500 truncate">
            {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} · Secure 256-bit checkout
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2 animate-in fade-in min-w-0 w-full box-border">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="flex-1 font-medium leading-relaxed">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedMethod !== 'cod' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('cod');
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-[11px] font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Switch to Pay on Delivery (+₹{codFee})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Step with Two Options */}
      <div className="space-y-2.5 min-w-0 w-full box-border">
        <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block px-1">
          Select Payment Method
        </label>

        {/* Option 1: Pay online (UPI / Cards / NetBanking) */}
        <label
          onClick={() => {
            setSelectedMethod('online');
            setErrorMessage(null);
          }}
          className={`bg-white rounded-2xl border p-3 sm:p-3.5 shadow-2xs cursor-pointer flex items-center justify-between gap-2.5 transition-all min-w-0 w-full box-border ${
            selectedMethod === 'online'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20 bg-emerald-50/30'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedMethod === 'online'
                  ? 'bg-[#2E7D32] text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-[#212121]">
                  Pay online (UPI / Cards)
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#1B5E20] shrink-0">
                  ZERO FEE
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                GPay, PhonePe, Paytm, UPI, Cards &amp; NetBanking
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="paymentOption"
            checked={selectedMethod === 'online'}
            onChange={() => {
              setSelectedMethod('online');
              setErrorMessage(null);
            }}
            className="accent-[#2E7D32] w-4 h-4 shrink-0 cursor-pointer"
          />
        </label>

        {/* Option 2: Pay on delivery (Cash on Delivery) */}
        <label
          onClick={() => {
            setSelectedMethod('cod');
            setErrorMessage(null);
          }}
          className={`bg-white rounded-2xl border p-3 sm:p-3.5 shadow-2xs cursor-pointer flex items-center justify-between gap-2.5 transition-all min-w-0 w-full box-border ${
            selectedMethod === 'cod'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20 bg-emerald-50/30'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedMethod === 'cod'
                  ? 'bg-[#2E7D32] text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-[#212121]">
                  Pay on delivery
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 shrink-0">
                  +₹{codFee} FEE
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                Cash or QR code scan on arrival at doorstep
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="paymentOption"
            checked={selectedMethod === 'cod'}
            onChange={() => {
              setSelectedMethod('cod');
              setErrorMessage(null);
            }}
            className="accent-[#2E7D32] w-4 h-4 shrink-0 cursor-pointer"
          />
        </label>
      </div>

      {/* PHASE 5: The Bill Summary Card (Updates live when option changes) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-3.5 shadow-2xs space-y-2.5 min-w-0 w-full box-border">
        <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
          Bill Details ({cartItemCount} items)
        </h2>

        <div className="space-y-2 text-xs text-stone-600 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="truncate">Items Subtotal</span>
            <span className="font-bold text-[#212121] tabular-nums shrink-0">₹{cartSubtotal}</span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="truncate">Store Packing &amp; Bag</span>
            <span className="font-bold text-[#2E7D32] shrink-0">FREE</span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="truncate">Delivery Fee</span>
            <span className="font-bold text-[#2E7D32] shrink-0">FREE</span>
          </div>

          {/* COD handling fee clearly labelled (only when Pay on Delivery is selected) */}
          {selectedMethod === 'cod' ? (
            <div className="flex justify-between items-center gap-2 text-amber-900 bg-amber-50/70 p-2 rounded-xl min-w-0">
              <span className="font-bold truncate">Pay on delivery fee</span>
              <span className="font-black tabular-nums shrink-0">+₹{codFee}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 text-emerald-800 bg-emerald-50/60 p-2 rounded-xl min-w-0">
              <span className="font-bold truncate">Online payment fee</span>
              <span className="font-black shrink-0">₹0 (FREE)</span>
            </div>
          )}

          <div className="pt-2 border-t border-stone-100 flex justify-between items-center gap-2 font-black text-sm text-[#212121]">
            <span>To Pay</span>
            <span className="tabular-nums text-base text-[#1B5E20] shrink-0">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Official Razorpay Standard Checkout SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Trust Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
        <span className="truncate">Razorpay Standard Web Checkout · Safe &amp; 256-bit Secure</span>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-3 shadow-lg box-border">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3 min-w-0 w-full box-border">
          <div className="flex flex-col text-left min-w-0 shrink-0">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">TOTAL TO PAY</span>
            <span className="text-base sm:text-lg font-black text-[#212121] tabular-nums">₹{grandTotal}</span>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            disabled={processing}
            className="h-11 sm:h-12 px-5 sm:px-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shrink-0 whitespace-nowrap"
          >
            {processing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <span className="truncate">
              {processing
                ? 'Processing...'
                : selectedMethod === 'cod'
                ? `Confirm Order (₹${grandTotal})`
                : `Pay Online (₹${grandTotal})`}
            </span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
