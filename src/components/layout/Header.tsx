'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingBag, User, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import LocationModal from './LocationModal';

export default function Header() {
  const router = useRouter();
  const { cartItemCount, cartSubtotal } = useCart();
  const { currentLocation, setIsModalOpen } = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const deliveryEta = currentLocation.zone?.estimatedDeliveryTimeText || '30-60 mins';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200/80 shadow-sm">
        {/* ── Mobile Header ── */}
        <div className="lg:hidden">
          {/* Top row: logo + cart */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <Link href="/" className="flex items-center gap-2" aria-label="G1 Mart home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/g1_mart_banner_transparent.png"
                alt="G1 Mart"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* Cart button */}
              <Link
                href="/cart"
                aria-label={`Cart — ${cartItemCount} items`}
                className="relative flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#2E7D32] text-white font-bold text-xs shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <>
                    <span className="tabular-nums">{cartItemCount}</span>
                    <span className="hidden sm:inline text-white/80 tabular-nums">
                      · ₹{cartSubtotal}
                    </span>
                  </>
                )}
                {cartItemCount === 0 && <span>Cart</span>}
              </Link>

              <Link
                href="/account"
                aria-label={isLoggedIn ? (user?.name || 'My account') : 'Sign In'}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 text-stone-700 overflow-hidden"
              >
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-4.5 h-4.5" />
                )}
              </Link>
            </div>
          </div>

          {/* Location strip (Blinkit style dropdown) */}
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between gap-1.5 p-1.5 rounded-xl hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-black text-[#212121] uppercase tracking-tight">
                      Delivery in {deliveryEta}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium truncate leading-tight">
                    {currentLocation.street || currentLocation.area}, {currentLocation.city}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                CHANGE
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 pb-3">
            <form onSubmit={handleSearchSubmit} role="search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groceries, brands…"
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-stone-100 border border-stone-200 text-sm outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-colors"
                />
              </div>
            </form>
          </div>
        </div>

        {/* ── Desktop Header ── */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="shrink-0" aria-label="G1 Mart home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/g1_mart_banner_transparent.png"
                alt="G1 Mart"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </Link>

            {/* Delivery Location Pill (Blinkit style) */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200 hover:border-[#2E7D32] hover:bg-stone-50/70 transition-all text-left shrink-0 max-w-xs group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-[#212121]">
                    Delivery in {deliveryEta}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#2E7D32] transition-colors" />
                </div>
                <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                  {currentLocation.formattedAddress}
                </p>
              </div>
            </button>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} role="search" className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groceries, brands, categories…"
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-stone-100 border border-stone-200 text-sm outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-colors"
                />
              </div>
            </form>

            {/* Nav links */}
            <nav className="flex items-center gap-1 shrink-0">
              <Link
                href="/orders"
                className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100 font-medium transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100 font-medium transition-colors"
              >
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-stone-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{isLoggedIn ? (user?.name ? user.name.split(' ')[0] : 'Account') : 'Sign In'}</span>
              </Link>
              <Link
                href="/cart"
                className="relative ml-1 flex items-center gap-2 h-9 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-sm shadow-sm transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="flex items-center gap-1 tabular-nums">
                    <span className="bg-white/20 rounded-md px-1.5 py-0.5 text-xs">
                      {cartItemCount}
                    </span>
                    <span className="text-white/80">·</span>
                    <span>₹{cartSubtotal}</span>
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Desktop category nav strip */}
          <div className="border-t border-stone-100 bg-stone-50/60">
            <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-semibold">
              {[
                { href: '/category/fruits-vegetables', label: '🥦 Fruits & Veg' },
                { href: '/category/dairy-bakery', label: '🥛 Dairy & Bakery' },
                { href: '/category/rice-dal-atta', label: '🌾 Rice, Dal & Atta' },
                { href: '/category/snacks', label: '🍪 Snacks' },
                { href: '/category/beverages', label: '☕ Beverages' },
                { href: '/category/personal-care', label: '✨ Personal Care' },
                { href: '/category/household', label: '🏠 Household' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap px-3 py-1.5 rounded-lg text-stone-600 hover:text-[#2E7D32] hover:bg-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal />
    </>
  );
}
