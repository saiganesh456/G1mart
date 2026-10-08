'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  MapPin,
  Heart,
  HelpCircle,
  Shield,
  ShoppingBag,
  LogIn,
  LogOut,
  Store,
  ShieldCheck,
  Truck,
  Navigation,
  ArrowRight,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';
import { useAuth } from '@/context/AuthContext';
import { isAppInstalled, executeInstallFlow } from '@/lib/installState';

export default function AccountPage() {
  const { user, isLoggedIn, signOut, isLoading } = useAuth();
  const [appInstalled, setAppInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setAppInstalled(isAppInstalled(user?.id));
  }, [user]);

  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      await executeInstallFlow(user?.id, '/downloads/g1mart.apk');
      setAppInstalled(true);
    } catch (err) {
      console.error('Failed to install app:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shadow-xs shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0 font-extrabold text-base">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-[#212121] truncate">
              {isLoggedIn ? (user?.name || 'Customer Account') : 'Welcome to G1 Mart'}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {isLoggedIn
                ? (user?.email || user?.phone || 'Logged in via Google')
                : 'Sign in to access your orders and saved addresses'}
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={signOut}
            className="px-3.5 py-2 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-stone-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* Blinkit-Style App Installation Card */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-stone-50 rounded-2xl border border-emerald-200/80 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <Image
                src="/logo.png"
                alt="G1 Mart App"
                width={44}
                height={44}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-extrabold text-stone-900">G1 Mart Mobile App</h2>
                {appInstalled ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#2E7D32]">
                    <CheckCircle2 className="w-3 h-3" /> Installed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <Sparkles className="w-2.5 h-2.5" /> Blinkit Speed
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {appInstalled
                  ? 'Official APK is active on this device. You will receive faster updates.'
                  : 'Fast 10-minute grocery delivery & exclusive app offers.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
            <span>★ 4.8 Rating</span>
            <span>•</span>
            <span>12 MB</span>
            <span>•</span>
            <span>Android APK</span>
          </div>

          <button
            type="button"
            onClick={handleInstallApp}
            disabled={isInstalling}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 ${
              appInstalled
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                : 'bg-[#2E7D32] hover:bg-[#1b5e20] text-white'
            }`}
          >
            {isInstalling ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Downloading APK...</span>
              </>
            ) : appInstalled ? (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Re-download APK</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Install APK Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account Menu Items */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs divide-y divide-stone-100 overflow-hidden text-xs">
        <Link
          href="/orders"
          className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-stone-700">
            <ShoppingBag className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold">My Orders</span>
          </div>
          <span className="text-stone-400">→</span>
        </Link>

        <Link
          href="/account/addresses"
          className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-stone-700">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold">Saved Delivery Addresses</span>
          </div>
          <span className="text-stone-400">→</span>
        </Link>

        <Link
          href="/account/wishlist"
          className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-stone-700">
            <Heart className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold">Saved Wishlist</span>
          </div>
          <span className="text-stone-400">→</span>
        </Link>

        <Link
          href="/help"
          className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-stone-700">
            <HelpCircle className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold">Help &amp; Support / FAQs</span>
          </div>
          <span className="text-stone-400">→</span>
        </Link>
      </div>

      {/* Discreet Staff Shortcut - ONLY visible if user is an authenticated Admin or Rider */}
      {isLoggedIn && user?.role === 'admin' && (
        <div className="bg-emerald-950 text-white rounded-2xl p-4 border border-emerald-500/30 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300">Administrator Access</div>
              <div className="text-[11px] text-stone-300">{user.email || 'Store Admin'}</div>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <span>Open Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isLoggedIn && (user?.role === 'delivery_partner' || user?.role === 'rider') && (
        <div className="bg-amber-950 text-white rounded-2xl p-4 border border-amber-500/30 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">Rider Partner Access</div>
              <div className="text-[11px] text-stone-300">{user.email || 'Delivery Partner'}</div>
            </div>
          </div>
          <Link
            href="/rider"
            className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <span>Open Console</span>
            <Navigation className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Store Info Footer */}
      <div className="text-center text-xs text-stone-400 pt-4 space-y-1">
        <p>G1 Mart Customer Application</p>
        <p>Delivery Area: {STORE_CONFIG.address.city}</p>
      </div>
    </div>
  );
}
