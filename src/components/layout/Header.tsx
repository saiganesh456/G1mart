'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingBag, User, MapPin, ChevronDown, Camera } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { STORE_CONFIG } from '@/config/store';
import LocationModal from './LocationModal';
import BarcodeScannerModal from '@/components/common/BarcodeScannerModal';
import SlipScannerModal from '@/components/storefront/SlipScannerModal';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { cartItemCount, cartSubtotal } = useCart();
  const { currentLocation, setIsModalOpen } = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isSlipScannerOpen, setIsSlipScannerOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const deliveryEta =
    STORE_CONFIG.delivery.cityEtaText && !STORE_CONFIG.delivery.cityEtaText.startsWith('TODO_')
      ? STORE_CONFIG.delivery.cityEtaText
      : currentLocation.zone?.estimatedDeliveryTimeText || 'Local Delivery';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200/80 shadow-xs">
        {/* ── Mobile Header ── */}
        <div className="lg:hidden">
          {/* Top row: logo + cart button + profile avatar */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <Link href="/" className="flex items-center gap-2" aria-label="G1 Mart home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/g1_mart_banner_transparent.png"
                alt="G1 Mart"
                style={{ height: '32px', maxHeight: '32px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
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
                className="relative flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs shadow-xs transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 ? (
                  <>
                    <span className="tabular-nums">{cartItemCount}</span>
                    <span className="hidden sm:inline text-white/80 tabular-nums">
                      · ₹{cartSubtotal}
                    </span>
                  </>
                ) : (
                  <span>Cart</span>
                )}
              </Link>

              {/* Profile avatar */}
              <Link
                href={isLoggedIn ? '/account' : '/login'}
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

          {/* Delivery strip — Removed from Home per Owner Design Rules */}
          {!isHomePage && (
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
          )}

          {/* One simple search bar — Shown ONLY on Home page */}
          {isHomePage && (
            <div className="px-3 pb-2.5">
              <form onSubmit={handleSearchSubmit} role="search">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search "sugar", "oil", "soap"'
                    className="w-full h-11 pl-10 pr-12 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:bg-white focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSlipScannerOpen(true)}
                    aria-label="Scan slip with camera"
                    title="Scan slip or handwritten list with camera"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#2E7D32] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>
              </form>
            </div>
          )}
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
                style={{ height: '36px', maxHeight: '36px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </Link>

            {/* Delivery Location Pill — Removed from Home per Owner Design Rules */}
            {!isHomePage && (
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
            )}

            {/* Search — Shown ONLY on Home page */}
            {isHomePage ? (
              <form onSubmit={handleSearchSubmit} role="search" className="flex-1 max-w-xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search "sugar", "oil", "soap"'
                    className="w-full h-10 pl-10 pr-24 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:bg-white focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-all placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSlipScannerOpen(true)}
                    aria-label="Scan slip with camera"
                    title="Scan handwritten slip or grocery list"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-[#2E7D32] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Camera className="w-4 h-4 stroke-[2.2]" />
                    <span>Scan Slip</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1" />
            )}

            {/* Nav links */}
            <nav className="flex items-center gap-1 shrink-0">
              <Link
                href="/orders"
                className="px-3 py-2 rounded-lg text-sm text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100 font-medium transition-colors"
              >
                Orders
              </Link>

              <Link
                href={isLoggedIn ? '/account' : '/login'}
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

          {/* Desktop category nav strip — Hidden on home */}
          {!isHomePage && (
            <div className="border-t border-stone-100 bg-stone-50/60">
              <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-semibold">
                {[
                  { href: '/category/household-cleaning', label: '🧼 Household & Cleaning' },
                  { href: '/category/personal-care', label: '✨ Personal Care' },
                  { href: '/category/pooja-essentials', label: '🪔 Pooja Essentials' },
                  { href: '/category/grocery-staples', label: '🌾 Grocery & Staples' },
                  { href: '/category/snacks-beverages', label: '🍪 Snacks & Beverages' },
                  { href: '/categories', label: '📑 All Departments' },
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
          )}
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
      />

      {/* Slip Scanner Modal */}
      <SlipScannerModal
        isOpen={isSlipScannerOpen}
        onClose={() => setIsSlipScannerOpen(false)}
      />
    </>
  );
}
