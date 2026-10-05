'use client';

import Link from 'next/link';
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
} from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { user, isLoggedIn, signOut, isLoading } = useAuth();

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
