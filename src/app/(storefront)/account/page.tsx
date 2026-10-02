'use client';

import Link from 'next/link';
import { User, MapPin, Heart, HelpCircle, Shield, ShoppingBag, LogIn, LogOut } from 'lucide-react';
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

      {/* Store Info Footer */}
      <div className="text-center text-xs text-stone-400 pt-4 space-y-1">
        <p>G1 Mart Customer Application</p>
        <p>Delivery Area: {STORE_CONFIG.address.city}</p>
      </div>
    </div>
  );
}
