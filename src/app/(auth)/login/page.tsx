'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.replace('/account');
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error') || searchParams.get('error_description');
    if (errorParam) {
      if (errorParam === 'auth_failed' || errorParam === 'no_code_provided') {
        setAuthError('Authentication failed. Please try again.');
      } else {
        setAuthError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return;
    setLoading(true);
    router.push(`/otp?phone=${encodeURIComponent(phoneNumber)}`);
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAuthError('');
      const res = await authService.signInWithGoogle();
      if (!res.success) {
        setAuthError(res.error || 'Failed to initialize Google Sign-In');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in error');
    } finally {
      setGoogleLoading(false);
    }
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
          Sign in with Google or enter your mobile number
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{authError}</span>
        </div>
      )}

      {/* Google Sign-In Option */}
      <button
        type="button"
        disabled={googleLoading || loading}
        onClick={handleGoogleSignIn}
        className="w-full h-12 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-colors active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
      >
        {googleLoading ? (
          <div className="w-5 h-5 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
          OR MOBILE NUMBER
        </span>
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
          <span>Continue with Phone</span>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-3xl p-8 text-center text-sm text-stone-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
