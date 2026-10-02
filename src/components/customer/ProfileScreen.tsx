import React from 'react';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Bell,
  HelpCircle,
  Wallet,
  ShieldCheck,
  Bike,
  LogOut,
  ChevronRight,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const { user, logout, navigate, setRole, addresses, wishlistIds, orders } = useApp();

  return (
    <div className="flex-1 pb-24 space-y-5 max-w-4xl mx-auto w-full">
      {/* User Info Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-xl shadow-md">
          {user.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#212121] truncate">
              {user.name}
            </h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
              GOLD
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">{user.phone}</p>
          <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#1b5e20] text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">
              G1 Mart Wallet
            </span>
            <span className="text-lg font-black tabular-nums">
              ₹{user.walletBalance}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Added ₹100 cashback to your G1 Mart wallet!')}
          className="px-3 py-1.5 bg-white text-[#2E7D32] hover:bg-stone-100 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          Add Money
        </button>
      </div>

      {/* Quick Menu Links */}
      <div className="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => navigate('my_orders')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#212121] block">
                My Orders
              </span>
              <span className="text-[11px] text-stone-400">
                {orders.length} orders placed
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('address_list')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#212121] block">
                Saved Delivery Addresses
              </span>
              <span className="text-[11px] text-stone-400">
                {addresses.length} addresses saved in Nellore
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('wishlist')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#212121] block">
                Wishlist & Favorites
              </span>
              <span className="text-[11px] text-stone-400">
                {wishlistIds.length} items saved
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('notifications')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#212121] block">
                Notifications & Alerts
              </span>
              <span className="text-[11px] text-stone-400">
                Order updates & discounts
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          type="button"
          onClick={() => navigate('help_support')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#212121] block">
                Help & 24/7 Support
              </span>
              <span className="text-[11px] text-stone-400">
                FAQs, live chat & call hotline
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Switch Application Mode Panel */}
      <div className="bg-stone-100 rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
          Switch Portal View
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left flex items-center gap-2 shadow-2xs transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <div>
              <span className="text-xs font-bold text-stone-800 block leading-tight">
                Admin Panel
              </span>
              <span className="text-[10px] text-stone-500">
                Catalog & orders
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('delivery_partner')}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left flex items-center gap-2 shadow-2xs transition-all"
          >
            <Bike className="w-4 h-4 text-[#FF9800]" />
            <div>
              <span className="text-xs font-bold text-stone-800 block leading-tight">
                Rider Portal
              </span>
              <span className="text-[10px] text-stone-500">
                Deliveries & map
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-3 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of G1 Mart</span>
      </button>
    </div>
  );
};
