'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatIndianPhoneDisplay, sanitizeIndianPhone } from '@/lib/phone';
import { verifyFirebaseOtp, sendFirebaseOtp, getStoredConfirmation } from '@/lib/firebase/phoneAuth';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLocalUser } = useAuth();

  const rawPhone = searchParams.get('phone') || '';
  const phone = sanitizeIndianPhone(rawPhone);
  const nextParam = searchParams.get('next');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check if session exists on load
  useEffect(() => {
    const confirmation = getStoredConfirmation();
    if (!confirmation && !phone) {
      setError('No active verification session found. Please enter your mobile number.');
    }
  }, [phone]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await verifyFirebaseOtp(otp);

      if (!res.success) {
        setError(res.error || 'Invalid OTP code. Please try again.');
        setLoading(false);
        return;
      }

      const verifiedUser = res.user;
      const profile: UserProfile = {
        id: verifiedUser?.uid || `phone-${phone}`,
        name: verifiedUser?.displayName || 'Customer',
        phone: verifiedUser?.phoneNumber || `+91${phone}`,
        email: verifiedUser?.email || '',
        avatar: verifiedUser?.photoURL || '',
        memberSince: new Date().toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
        role: 'customer',
      };

      setLocalUser(profile);

      // Successfully authenticated — navigate to requested destination
      if (nextParam) {
        router.replace(nextParam);
      } else {
        router.replace('/account');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code and try again.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending || !phone) return;
    setResending(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await sendFirebaseOtp(phone, 'recaptcha-container-resend');
      if (res.success) {
        setSuccessNotice('A fresh 6-digit OTP code has been sent to your phone.');
        setResendCooldown(60);
      } else {
        setError(res.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Verification</span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-[#212121]">Verify Mobile Number</h1>
        <p className="text-xs text-stone-500">
          Enter the 6-digit OTP code sent to{' '}
          <strong className="text-stone-800">
            {phone ? formatIndianPhoneDisplay(phone) : '+91 XXXXX XXXXX'}
          </strong>
        </p>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <input
            type="text"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • • • •"
            className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] rounded-xl bg-stone-50 border border-stone-300 outline-none focus:border-[#2E7D32] focus:bg-white transition-colors"
          />
        </div>

        {/* Invisible reCAPTCHA container for Resend OTP */}
        <div id="recaptcha-container-resend" />

        <button
          type="submit"
          disabled={otp.length !== 6 || loading}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify &amp; Continue</span>
          )}
        </button>
      </form>

      {/* Resend OTP Section */}
      <div className="text-center pt-1">
        {resendCooldown > 0 ? (
          <p className="text-xs text-stone-400 font-medium">
            Resend OTP in <span className="font-bold text-stone-600">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            disabled={resending}
            onClick={handleResendOtp}
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] transition-colors inline-flex items-center gap-1.5"
          >
            {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Resend OTP Code</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
        <span>End-to-end encrypted mobile verification</span>
      </div>

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
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading verification...</div>}>
      <OtpContent />
    </Suspense>
  );
}
