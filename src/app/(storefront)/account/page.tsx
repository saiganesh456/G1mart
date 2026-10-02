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

      {/* Store Operations & Staff Management */}
      <div className="bg-gradient-to-br from-stone-900 to-[#1A2E1C] rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
              Store Staff &amp; Operations
            </span>
          </div>
          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/80">
            Staff Access
          </span>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          Manage live orders, mark orders dispatched, audit payments, and handle rider deliveries directly from your phone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <Link
            href="/admin"
            className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Admin Console</div>
                <div className="text-[10px] text-stone-300">Catalog, Orders &amp; Images</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>

          <Link
            href="/rider"
            className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Rider Delivery Portal</div>
                <div className="text-[10px] text-stone-300">Turn-by-Turn GPS &amp; Dispatch</div>
              </div>
            </div>
            <Navigation className="w-4 h-4 text-amber-400 fill-amber-400" />
          </Link>
        </div>
      </div>

      {/* Store Info Footer */}
      <div className="text-center text-xs text-stone-400 pt-4 space-y-1">
        <p>G1 Mart Customer Application</p>
        <p>Delivery Area: {STORE_CONFIG.address.city}</p>
      </div>
    </div>
  );
}
