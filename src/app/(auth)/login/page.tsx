'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return;

    /**
     * TODO (Phase 2 — Real Supabase Phone Auth):
     * 1. Call authService.signInWithOtp(phoneNumber)
     * 2. Supabase sends real SMS OTP via configured SMS provider (e.g. Twilio / MessageBird)
     * 3. On success, redirect to /otp?phone=...
     *
     * Fake auto-login bypass has been REMOVED per AUDIT.md.
     */
    setLoading(true);
    // Passing phone number to OTP screen stub
    router.push(`/otp?phone=${encodeURIComponent(phoneNumber)}`);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/g1_mart_banner_transparent.png"
          alt="G1 Mart"
          className="h-10 w-auto mx-auto object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.png';
          }}
        />
        <h1 className="text-xl font-extrabold text-[#212121]">Sign In / Register</h1>
        <p className="text-xs text-stone-500">
          Enter your mobile number to receive a verification OTP
        </p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Notice (Phase 1):</span> Real SMS OTP delivery requires SMS gateway keys in Supabase dashboard.
        </div>
      </div>

      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
              +91
            </span>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="98765 43210"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold tracking-wider outline-none focus:border-[#2E7D32] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={phoneNumber.length !== 10 || loading}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
        <span>Your personal data is encrypted &amp; protected</span>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs font-bold text-stone-500 hover:text-[#2E7D32] transition-colors"
        >
          ← Continue as Guest to Store
        </Link>
      </div>
    </div>
  );
}
