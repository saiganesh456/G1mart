import Link from 'next/link';
import { User, MapPin, Heart, HelpCircle, Shield, ShoppingBag, LogIn } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

export default function AccountPage() {
  /**
   * TODO (Phase 2):
   * Connect to real Supabase auth session.
   * Hardcoded personal email/name removed per AUDIT.md.
   */
  const isLoggedIn = false;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#212121]">
              {isLoggedIn ? 'Customer Account' : 'Welcome to G1 Mart'}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {isLoggedIn ? 'Manage your grocery orders & addresses' : 'Sign in to access your orders and saved addresses'}
            </p>
          </div>
        </div>

        {!isLoggedIn && (
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
