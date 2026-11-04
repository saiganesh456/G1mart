'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const nextParam = searchParams.get('next');
  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      let target = nextParam;
      if (!target && typeof window !== 'undefined') {
        const saved = localStorage.getItem('g1mart_auth_next');
        if (saved) {
          target = saved;
        }
      }
      // Security: Validate that target is a safe relative internal route to prevent open-redirect attacks
      const isSafeInternalUrl = (url: string | null): boolean => {
        if (!url) return false;
        return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
      };

      if (!isSafeInternalUrl(target)) {
        target = null;
      }

      if (target && target !== '/account' && target !== '/') {
        router.replace(target);
      } else if (user?.role === 'admin') {
        router.replace('/admin');
      } else if (user?.role === 'delivery_partner' || user?.role === 'rider') {
        router.replace('/rider');
      } else {
        router.replace(target || '/account');
      }
    }
  }, [authLoading, isLoggedIn, user, nextParam, router]);

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

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAuthError('');
      const targetNext =
        nextParam || (roleParam === 'admin' ? '/admin' : roleParam === 'rider' ? '/rider' : '/account');
      const res = await authService.signInWithGoogle(targetNext);
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
        <h1 className="text-xl font-extrabold text-[#212121]">
          {roleParam === 'admin'
            ? 'Administrator Sign In'
            : roleParam === 'rider'
            ? 'Rider Portal Sign In'
            : 'Sign In to G1 Mart'}
        </h1>
        <p className="text-xs text-stone-500">
          {roleParam === 'admin'
            ? 'Sign in with your authorized admin Google account (e.g. g1mart@gmail.com)'
            : roleParam === 'rider'
            ? 'Sign in with your registered delivery partner account'
            : 'Sign in with Google to continue'}
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
        disabled={googleLoading}
        onClick={handleGoogleSignIn}
        className="w-full h-12 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-colors active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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
