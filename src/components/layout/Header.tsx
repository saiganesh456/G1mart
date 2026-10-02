'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { STORE_CONFIG } from '@/config/store';

export default function Header() {
  const router = useRouter();
  const { cartItemCount, cartSubtotal } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
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
              aria-label="My account"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 text-stone-700"
            >
              <User className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>

        {/* Location strip — uses store config placeholder */}
        <div className="flex items-center gap-1.5 px-3 pb-2">
          <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
          <span className="text-xs text-stone-500 font-medium truncate">
            Delivering to&nbsp;
            <span className="font-bold text-[#212121]">{STORE_CONFIG.address.city}</span>
          </span>
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

          {/* Delivery location */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 shrink-0">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <span>
              Delivering to&nbsp;
              <strong className="text-[#212121]">{STORE_CONFIG.address.city}</strong>
            </span>
          </div>

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
              <User className="w-4 h-4" />
              Account
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
  );
}
