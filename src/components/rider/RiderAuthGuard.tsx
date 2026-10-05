'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Lock, ArrowRight, Store, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function RiderAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, signOut } = useAuth();
  const [checkingRole, setCheckingRole] = useState(false);
  const [verifiedRider, setVerifiedRider] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyRiderRole() {
      if (!isLoggedIn || !user) {
        setVerifiedRider(false);
        return;
      }

      // Admins and Riders both have clearance for rider delivery console
      if (
        user.role === 'delivery_partner' ||
        user.role === 'rider' ||
        user.role === 'admin' ||
        user.email?.toLowerCase().trim() === 'g1mart@gmail.com'
      ) {
        if (isMounted) setVerifiedRider(true);
        return;
      }

      // Re-verify against server in case newly registered
      setCheckingRole(true);
      try {
        const res = await fetch('/api/auth/role-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
        const data = await res.json();
        if (isMounted) {
          if (data.success && (data.isRider || data.isAdmin)) {
            setVerifiedRider(true);
          } else {
            setVerifiedRider(false);
          }
        }
      } catch (err) {
        console.error('Failed to verify rider status:', err);
        if (isMounted) setVerifiedRider(false);
      } finally {
        if (isMounted) setCheckingRole(false);
      }
    }

    if (!isLoading) {
      verifyRiderRole();
    }

    return () => {
      isMounted = false;
    };
  }, [isLoading, isLoggedIn, user]);

  const handleRiderGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await authService.signInWithGoogle('/rider');
    } catch (err) {
      console.error('Rider Google sign-in error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // 1. Loading
  if (isLoading || checkingRole) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center animate-spin mb-4 shadow-sm">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-stone-800">Verifying Delivery Clearance...</h2>
        <p className="text-xs text-stone-500 mt-1">Connecting to G1 Mart Rider Fleet Dispatch</p>
      </div>
    );
  }

  // 2. Not Logged In
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1A2E1C] text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Truck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
              Fleet Delivery Console
            </span>
            <h1 className="text-xl font-black text-stone-900 pt-2">Rider Login Required</h1>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Please sign in with your registered G1 Mart delivery partner email.
            </p>
          </div>

          <button
            type="button"
            disabled={googleLoading}
            onClick={handleRiderGoogleSignIn}
            className="w-full h-12 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-colors active:scale-[0.99] shadow-sm disabled:opacity-75"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
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
                <span>Sign in with Rider Google Account</span>
              </>
            )}
          </button>

          <Link
            href="/login?next=/rider&role=rider"
            className="w-full h-11 bg-[#1A2E1C] hover:bg-[#142416] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <span>Use Mobile / Phone Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
            >
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged in as customer, not rider or admin
  if (!verifiedRider) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
              Access Denied
            </span>
            <h1 className="text-xl font-black text-stone-900">Rider Clearance Required</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              You are currently signed in as <b>{user.email || user.name || 'a customer'}</b>. This
              account is not authorized as an express delivery rider.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-600 text-left space-y-1">
            <div className="font-bold text-stone-800">Fleet Operations Note:</div>
            <div>• To deliver orders, ask the store administrator (g1mart@gmail.com) to register your email in the Rider Directory.</div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push('/login?next=/rider&role=rider');
              }}
              className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out &amp; Switch Account</span>
            </button>

            <Link
              href="/"
              className="w-full h-11 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Return to Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Rider or Admin
  return <>{children}</>;
}
