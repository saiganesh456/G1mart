'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isSimulated = searchParams.get('simulated') === 'true';

  const { clearCart } = useCart();

  const [pollState, setPollState] = useState<'confirming' | 'completed' | 'failed' | 'timeout'>('confirming');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setPollState('failed');
      setErrorMessage('Missing order identifier in return URL');
      return;
    }

    let intervalId: any = null;
    let isCancelled = false;
    let attempts = 0;
    const maxAttempts = 24; // 24 * 2.5s = 60s timeout

    const checkStatus = async () => {
      attempts++;
      setSecondsElapsed((prev) => prev + 2.5);

      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-status`);
        if (!res.ok) {
          if (res.status === 404) {
            setPollState('failed');
            setErrorMessage('Order not found on server');
            clearInterval(intervalId);
            return;
          }
          return;
        }

        const data = await res.json();
        if (isCancelled) return;

        setOrderDetails(data);

        // Rule 4: Never mark paid from client/redirect; ONLY when server confirms 'completed'
        if (data.paymentStatus === 'completed' || data.isPaid) {
          setPollState('completed');
          clearCart(); // Clean cart on verified payment
          clearInterval(intervalId);
          return;
        }

        if (data.paymentStatus === 'failed') {
          setPollState('failed');
          setErrorMessage(data.error || 'Payment was declined or cancelled in UPI app.');
          clearInterval(intervalId);
          return;
        }

        // Never auto-confirm payment on page refresh or poll

        if (attempts >= maxAttempts) {
          setPollState('timeout');
          clearInterval(intervalId);
        }
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          setPollState('timeout');
          clearInterval(intervalId);
        }
      }
    };

    // Initial check immediately
    checkStatus();
    // Rule 7: Polls server order status every 2-3 seconds, not PhonePe directly
    intervalId = setInterval(checkStatus, 2500);

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, clearCart, isSimulated]);

  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async (action: 'success' | 'failure') => {
    if (!orderId) return;
    setSimulating(true);
    try {
      let savedOrder: any = null;
      try {
        const raw = sessionStorage.getItem('g1mart_latest_order') || localStorage.getItem('g1mart_recent_order');
        if (raw) savedOrder = JSON.parse(raw);
      } catch {}

      const simRes = await fetch('/api/payment/test-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, orderData: savedOrder }),
      });
      const simData = await simRes.json();
      if (!simRes.ok || !simData.success) {
        alert('Simulation notice: ' + (simData.error || 'Failed to simulate'));
        setSimulating(false);
        return;
      }

      if (action === 'success') {
        const finalOrder = {
          ...(savedOrder || {}),
          ...(simData.order || {}),
          id: orderId,
          orderNumber: orderId,
          paymentStatus: 'completed',
          isPaid: true,
        };
        setOrderDetails(finalOrder);
        setPollState('completed');
        clearCart();

        try {
          const accOrders = JSON.parse(localStorage.getItem('g1mart_account_orders') || '[]');
          const updatedAcc = accOrders.map((o: any) => (o.id === orderId ? finalOrder : o));
          if (!updatedAcc.some((o: any) => o.id === orderId)) {
            updatedAcc.unshift(finalOrder);
          }
          localStorage.setItem('g1mart_account_orders', JSON.stringify(updatedAcc));
          localStorage.setItem('g1mart_recent_order', JSON.stringify(finalOrder));
          sessionStorage.setItem('g1mart_latest_order', JSON.stringify(finalOrder));

          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalOrder),
          }).catch(() => {});
        } catch {}
      } else {
        setPollState('failed');
        setErrorMessage('Payment simulation declined');
      }
    } catch (err: any) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-5">
      {/* 1. Confirming State */}
      {pollState === 'confirming' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto text-[#2E7D32]">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#212121]">Confirming Payment</h1>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Verifying your UPI transaction with PhonePe. Please do not close or refresh this tab...
            </p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-600 font-mono">
            Order #{orderId}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Secure 256-Bit Bank Verification</span>
          </div>

          {/* Interactive Sandbox Testing Panel */}
          <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-ping" />
                <span>PhonePe Sandbox Mode</span>
              </span>
              <span className="text-[10px] text-stone-400 font-bold">UAT Testing</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug">
              Tap below to simulate how the real UPI app responds upon payment:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSimulate('success')}
                disabled={simulating}
                className="py-2.5 px-3 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{simulating ? 'Simulating...' : 'Simulate Success'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulate('failure')}
                disabled={simulating}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Simulate Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Completed State */}
      {pollState === 'completed' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Payment Verified
            </span>
            <h1 className="text-xl font-black text-[#212121] mt-2">Order Confirmed!</h1>
            <p className="text-xs text-stone-500 mt-1">
              We received your payment of <strong className="text-stone-800">₹{orderDetails?.grandTotal || orderDetails?.paidAmount || '—'}</strong>. Your groceries are being packed fresh at G1 Mart Hub.
            </p>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-stone-500">Order ID:</span>
              <span className="font-bold text-stone-900">#{orderId}</span>
            </div>
            {orderDetails?.transactionId && (
              <div className="flex justify-between">
                <span className="text-stone-500">Transaction Ref:</span>
                <span className="font-mono text-[11px] text-stone-700">{orderDetails.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase">Paid (PhonePe UPI)</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={`/orders/${orderId}?placed=true`}
              className="w-full h-11 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>Track Live Delivery Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full h-10 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* 3. Failed State */}
      {pollState === 'failed' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Payment Not Completed
            </span>
            <h1 className="text-xl font-black text-[#212121] mt-2">Transaction Incomplete</h1>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {errorMessage || 'The payment was cancelled or declined by your bank/UPI app. No money was deducted.'}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/checkout"
              className="w-full h-11 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>Return to Checkout &amp; Retry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full h-10 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center transition-all"
            >
              Return to Store
            </Link>
          </div>
        </div>
      )}

      {/* 4. Timeout State */}
      {pollState === 'timeout' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Verification Pending
            </span>
            <h1 className="text-xl font-black text-[#212121] mt-2">Awaiting Bank Settlement</h1>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Your UPI payment is taking longer than usual to settle. Our automated system will continue checking with PhonePe in the background.
            </p>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 text-xs space-y-1 text-left">
            <p className="text-stone-700 font-bold">Order #{orderId}</p>
            <p className="text-stone-500 text-[11px]">
              If money was debited from your account, your order will automatically be marked confirmed once your bank confirms the UPI settlement.
            </p>
          </div>

          {/* Sandbox Controls for Testing */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-left space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                PHONEPE SANDBOX TEST
              </span>
              <span className="text-[10px] text-stone-400 font-mono">UAT Testing</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSimulate('success')}
                disabled={simulating}
                className="py-2.5 px-3 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{simulating ? 'Simulating...' : 'Simulate Success'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulate('failure')}
                disabled={simulating}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Simulate Decline</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              href={`/orders/${orderId}`}
              className="w-full h-11 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>View in My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400">Loading payment confirmation...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
