'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Terminal,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import RazorpayCheckoutButton from '@/components/payment/RazorpayCheckoutButton';

export default function RazorpayStandardDemoPage() {
  const [amountRupees, setAmountRupees] = useState<number>(10);
  const [customerName, setCustomerName] = useState<string>('Test Customer');
  const [customerEmail, setCustomerEmail] = useState<string>('customer@example.com');
  const [customerPhone, setCustomerPhone] = useState<string>('9876543210');
  const [logs, setLogs] = useState<Array<{ time: string; type: 'info' | 'success' | 'error'; message: string }>>([]);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    orderId: string;
    paymentId: string;
    signature: string;
  } | null>(null);

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, type, message }, ...prev]);
  };

  const amountInPaise = Math.round(amountRupees * 100);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/payment"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Checkout</span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Standard Web Checkout
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            Razorpay Standard Checkout Test
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Test the complete end-to-end integration: Order Creation (POST /api/create-order), Official Checkout Modal, and Signature Verification (POST /api/verify-payment).
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-stone-900">Payment Parameters</h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Amount Selection */}
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Amount in Rupees (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(Math.max(1, Number(e.target.value) || 1))}
                  className="w-32 px-3 py-2 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-emerald-600"
                />
                <span className="text-stone-500 font-medium">
                  = {amountInPaise} paise (Min: 100 paise)
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[1, 10, 50, 100, 250].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountRupees(preset)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      amountRupees === preset
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Mobile</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
            <div className="text-xs text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>HMAC-SHA256 Server Signature Verification</span>
            </div>

            <RazorpayCheckoutButton
              amountInPaise={amountInPaise}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              orderName="G1mart Supermarket"
              orderDescription={`Standard Checkout Demo - ₹${amountRupees}`}
              buttonText={`Pay ₹${amountRupees} with Razorpay`}
              onSuccess={(result) => {
                setPaymentSuccessData(result);
                addLog('success', `Payment Verified! Order: ${result.orderId}, Payment: ${result.paymentId}`);
              }}
              onError={(err) => {
                addLog('error', `Payment Error: ${err}`);
              }}
              onDismiss={() => {
                addLog('info', 'Payment modal dismissed by user.');
              }}
            />
          </div>
        </div>

        {/* Success Banner */}
        {paymentSuccessData && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Payment Successful &amp; Verified!</span>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 font-mono text-[11px] space-y-1 text-emerald-950">
              <p><span className="text-stone-500">Order ID:</span> {paymentSuccessData.orderId}</p>
              <p><span className="text-stone-500">Payment ID:</span> {paymentSuccessData.paymentId}</p>
              <p className="truncate"><span className="text-stone-500">Signature:</span> {paymentSuccessData.signature}</p>
            </div>
          </div>
        )}

        {/* Live Event Activity Log */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Integration Activity Log</span>
            </div>
            <button
              type="button"
              onClick={() => setLogs([])}
              className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-stone-500 italic">No events logged yet. Click the pay button above to start.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-stone-500 shrink-0">[{log.time}]</span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-stone-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
