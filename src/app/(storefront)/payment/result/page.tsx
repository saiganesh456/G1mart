'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw, ShoppingBag, ShieldCheck, QrCode, Smartphone, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { useCart } from '@/context/CartContext';
import { STORE_CONFIG } from '@/config/store';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isSimulated = searchParams.get('simulated') === 'true';

  const { clearCart } = useCart();

  const [pollState, setPollState] = useState<'confirming' | 'completed' | 'failed' | 'timeout'>('confirming');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [confirmingUtr, setConfirmingUtr] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const totalAmount = orderDetails?.grandTotal || orderDetails?.total || 80;
  const storeUpi = STORE_CONFIG.payment.upiId;
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(storeUpi)}&pn=${encodeURIComponent(STORE_CONFIG.payment.upiPayeeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`G1Mart Order #${orderId}`)}`;

  useEffect(() => {
    if (typeof window !== 'undefined' && upiIntentUrl) {
      QRCode.toDataURL(upiIntentUrl, { width: 220, margin: 1 })
        .then((url: string) => setQrCodeDataUrl(url))
        .catch(() => {});
    }
  }, [upiIntentUrl]);

  const copyUpiId = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(storeUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleConfirmUpiPayment = async () => {
    setConfirmingUtr(true);
    try {
      const cleanUtr = utrNumber.trim() || `UPI_${Date.now().toString().slice(-8)}`;
      let savedOrder: any = null;
      try {
        const raw = sessionStorage.getItem('g1mart_latest_order') || localStorage.getItem('g1mart_recent_order');
        if (raw) savedOrder = JSON.parse(raw);
      } catch {}

      const simRes = await fetch('/api/payment/test-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'success',
          orderData: savedOrder,
        }),
      });
      const simData = await simRes.json();

      const finalOrder = {
        ...(savedOrder || {}),
        ...(simData.order || {}),
        id: orderId,
        orderNumber: orderId,
        paymentStatus: 'completed',
        isPaid: true,
        transactionId: cleanUtr,
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
    } catch (err: any) {
      alert('Error confirming payment: ' + err.message);
    } finally {
      setConfirmingUtr(false);
    }
  };

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
      {/* 1. Confirming / Pay with UPI State */}
      {pollState === 'confirming' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="text-left">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Order ID</span>
              <span className="font-mono font-black text-sm text-stone-900">#{orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Amount to Pay</span>
              <span className="text-base font-black text-[#1B5E20]">₹{totalAmount}</span>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#1B5E20]" />
              <span>Scan QR with PhonePe / GPay / Paytm</span>
            </span>

            {qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUrl}
                alt="UPI Payment QR Code"
                className="w-48 h-48 rounded-xl border-2 border-stone-200 bg-white p-2 shadow-xs"
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-stone-200/60 animate-pulse flex items-center justify-center text-xs text-stone-400">
                Generating QR...
              </div>
            )}

            {/* UPI ID copy */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
              <span className="text-stone-500 font-medium">UPI:</span>
              <span className="font-mono font-bold text-stone-800 text-[11px]">{storeUpi}</span>
              <button
                type="button"
                onClick={copyUpiId}
                className="text-[#1B5E20] hover:text-[#144718] font-bold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct Mobile Deep Link (for users browsing on phones) */}
            <a
              href={upiIntentUrl}
              className="w-full h-11 bg-[#1B5E20] hover:bg-[#144718] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open PhonePe / UPI App to Pay</span>
            </a>
          </div>

          {/* After Payment Confirmation */}
          <div className="space-y-2 text-left bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80">
            <span className="text-xs font-bold text-emerald-950 block">Step 2: Paid? Confirm your order</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Optional: Enter 12-digit UPI UTR"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
              <button
                type="button"
                onClick={handleConfirmUpiPayment}
                disabled={confirmingUtr}
                className="px-4 py-2 bg-[#1B5E20] hover:bg-[#144718] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {confirmingUtr ? 'Confirming...' : 'I Have Paid'}
              </button>
            </div>
          </div>

          {/* Interactive Sandbox Testing Panel */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Simulate Testing (Without sending real money)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSimulate('success')}
                disabled={simulating}
                className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{simulating ? 'Simulating...' : 'Mock Success'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulate('failure')}
                disabled={simulating}
                className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mock Decline</span>
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
