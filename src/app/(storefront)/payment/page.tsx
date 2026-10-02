'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Banknote, Smartphone, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function PaymentPage() {
  const router = useRouter();
  const { cart, cartSubtotal, cartItemCount, clearCart } = useCart();
  const { isLoggedIn, supabaseUser, user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!isLoggedIn) {
      alert('Account required for ordering. Please log in or verify your mobile number first.');
      router.push('/checkout');
      return;
    }

    let addressData: any = null;
    try {
      const raw = sessionStorage.getItem('g1mart_checkout_address');
      if (raw) addressData = JSON.parse(raw);
    } catch {}

    if (!addressData || !addressData.phone) {
      alert('Please complete your delivery address in checkout first.');
      router.push('/checkout');
      return;
    }

    const payload = {
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      address: addressData,
      paymentMethod: selectedMethod === 'cod' ? 'Cash on Delivery' : 'UPI',
      slot: addressData.selectedSlot,
      userId: supabaseUser?.id || undefined,
      userEmail: user?.email || supabaseUser?.email || undefined,
      userPhone: addressData.phone || user?.phone || undefined,
      userName: addressData.fullName || user?.name || undefined,
    };

    // 1. Cash on Delivery (Fallback method per Rule 11)
    if (selectedMethod === 'cod') {
      setProcessing(true);
      try {
        const res = await fetch('/api/checkout/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.orderId) {
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
            paymentStatus: 'cash_on_delivery',
            subtotal: cartSubtotal,
            grandTotal: data.amountInPaise ? data.amountInPaise / 100 : cartSubtotal,
            total: data.amountInPaise ? data.amountInPaise / 100 : cartSubtotal,
            items: cart.map((i) => ({
              productId: i.product.id,
              productName: i.product.name,
              unit: i.product.unit,
              price: i.product.price,
              quantity: i.quantity,
              image: i.product.image || '/products/placeholder.svg',
            })),
            address: addressData,
            slot: addressData.selectedSlot || 'Standard Delivery',
            userId: supabaseUser?.id || undefined,
            userEmail: user?.email || supabaseUser?.email || undefined,
          };

          try {
            sessionStorage.setItem('g1mart_latest_order', JSON.stringify(orderRecord));
            const prev = JSON.parse(sessionStorage.getItem('g1mart_orders_list') || '[]');
            sessionStorage.setItem('g1mart_orders_list', JSON.stringify([orderRecord, ...prev]));
            
            // Sync to permanent cross-device account storage
            const accPrev = JSON.parse(localStorage.getItem('g1mart_account_orders') || '[]');
            localStorage.setItem('g1mart_account_orders', JSON.stringify([orderRecord, ...accPrev]));
            localStorage.setItem('g1mart_recent_order', JSON.stringify(orderRecord));

            // Sync to server store via API
            fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderRecord),
            }).catch(() => {});

            // Sync to Supabase auth user metadata across devices
            if (supabaseUser && isSupabaseConfigured()) {
              const existingOrders = supabaseUser.user_metadata?.orders || [];
              supabase.auth.updateUser({
                data: { orders: [orderRecord, ...existingOrders] },
              }).catch(() => {});
            }
          } catch {}

          clearCart();
          router.push(`/orders/${data.orderId}?placed=true`);
          return;
        } else {
          alert(data.error || 'Could not place Cash on Delivery order.');
          setProcessing(false);
          return;
        }
      } catch (err: any) {
        alert('Server communication error: ' + (err.message || 'Failed to place order'));
        setProcessing(false);
        return;
      }
    }

    // 2. Online PhonePe UPI Checkout (Rules 1, 2, 3)
    setProcessing(true);
    try {
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.redirectUrl) {
        alert(data.error || 'Unable to initiate PhonePe UPI checkout');
        setProcessing(false);
        return;
      }

      // Persist pending order record so tracking is ready upon return
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
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
        subtotal: cartSubtotal,
        grandTotal: data.amountInPaise ? data.amountInPaise / 100 : cartSubtotal,
        total: data.amountInPaise ? data.amountInPaise / 100 : cartSubtotal,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          unit: i.product.unit,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image || '/products/placeholder.svg',
        })),
        address: addressData,
        slot: addressData.selectedSlot || 'Standard Delivery',
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

        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderRecord),
        }).catch(() => {});

        if (supabaseUser && isSupabaseConfigured()) {
          const existingOrders = supabaseUser.user_metadata?.orders || [];
          supabase.auth.updateUser({
            data: { orders: [orderRecord, ...existingOrders] },
          }).catch(() => {});
        }
      } catch {}

      clearCart();
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      alert(err.message || 'Error communicating with checkout server');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-36 sm:pb-40 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/checkout"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">Select Payment Method</h1>
      </div>

      {/* Advisory Notice */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">PhonePe UPI Gateway:</span> Secure payment with GPay, PhonePe, Paytm, or Cards. Server verifies transaction with PhonePe before confirming order.
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-2.5">
        {/* COD */}
        <label
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer flex items-center justify-between transition-all ${
            selectedMethod === 'cod'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#212121]">
                  Cash on Delivery (COD)
                </span>
                <span className="text-[10px] font-extrabold bg-[#FF9800] text-black px-1.5 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Pay cash or scan UPI QR upon arrival at your doorstep
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={selectedMethod === 'cod'}
            onChange={() => setSelectedMethod('cod')}
            className="accent-[#2E7D32]"
          />
        </label>

        {/* UPI */}
        <label
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer flex items-center justify-between transition-all ${
            selectedMethod === 'upi'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#212121]">
                UPI Instant Payment (PhonePe, GPay, Paytm)
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Direct bank transfer via secure UPI gateway
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={selectedMethod === 'upi'}
            onChange={() => setSelectedMethod('upi')}
            className="accent-[#2E7D32]"
          />
        </label>

        {/* Card */}
        <label
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer flex items-center justify-between transition-all ${
            selectedMethod === 'card'
              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/15 bg-[#2E7D32]/5'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#212121]">
                Debit / Credit Card / NetBanking
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Visa, MasterCard, RuPay, Maestro &amp; 40+ banks
              </p>
            </div>
          </div>
          <input
            type="radio"
            name="payment"
            checked={selectedMethod === 'card'}
            onChange={() => setSelectedMethod('card')}
            className="accent-[#2E7D32]"
          />
        </label>
      </div>

      {/* Security Trust Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>256-Bit SSL Encrypted &amp; RBI Compliant Payment Gateway</span>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={handlePay}
            disabled={processing}
            className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {processing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {processing
                ? 'Processing...'
                : selectedMethod === 'cod'
                ? `Confirm Order with Cash on Delivery (₹${cartSubtotal})`
                : `Proceed to Pay with ${selectedMethod.toUpperCase()} (₹${cartSubtotal})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
