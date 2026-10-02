'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    /**
     * TODO (Phase 2 — Real OTP Verification):
     * 1. Call supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
     * 2. If valid session returned, persist session cookie via @supabase/ssr
     * 3. Redirect to /account or previously requested checkout page
     *
     * Fake OTP bypass has been completely removed.
     */
    setError('Phase 1 Notice: Real OTP verification requires Supabase SMS integration in Phase 2.');
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs font-bold text-stone-500 uppercase">Verification</span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-[#212121]">Verify Mobile Number</h1>
        <p className="text-xs text-stone-500">
          Enter the 6-digit OTP code sent to{' '}
          <strong className="text-stone-800">+91 {phone || 'XXXXXXXXXX'}</strong>
        </p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Notice (Phase 1):</span> Fake OTP bypass (&quot;1234&quot; or any 4 digits) has been removed. Real SMS verification will be enabled in Phase 2.
        </div>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • • • •"
            className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] rounded-xl bg-stone-50 border border-stone-300 outline-none focus:border-[#2E7D32] focus:bg-white"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-semibold text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={otp.length < 4}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.99] transition-all disabled:opacity-50"
        >
          Verify &amp; Continue
        </button>
      </form>

      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs font-bold text-stone-500 hover:text-[#2E7D32] transition-colors"
        >
          ← Return to Store
        </Link>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading...</div>}>
      <OtpContent />
    </Suspense>
  );
}
