'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingBag, User, MapPin, ChevronDown, Camera, Home, Package, LayoutGrid, Bike, ShieldCheck } from 'lucide-react';
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
        {/* Rider Banner if user is delivery partner */}
        {(user?.role === 'delivery_partner' || user?.role === 'rider') && (
          <div className="bg-[#1A2E1C] text-white px-3 sm:px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b border-emerald-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🛵 Delivery Partner Mode Active</span>
            </div>
            <Link
              href="/rider"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-3 py-0.5 rounded-full transition-colors shadow-xs"
            >
              Open Rider Console →
            </Link>
          </div>
        )}

        {/* Admin Banner if user is admin */}
        {user?.role === 'admin' && (
          <div className="bg-[#0f172a] text-white px-3 sm:px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>🛡️ Store Administrator Mode</span>
            </div>
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black px-3 py-0.5 rounded-full transition-colors shadow-xs"
            >
              Open Admin Console →
            </Link>
          </div>
        )}
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
          <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-2.5 flex items-center justify-between gap-3 xl:gap-4">
            {/* Left: Logo & Location Selector (Pushed to the left corner) */}
            <div className="flex items-center gap-3 xl:gap-4 shrink-0">
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

              {/* Delivery Location Pill — Visible across all pages so desktop users always see delivery address */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200/90 hover:border-[#2E7D32] hover:bg-stone-50 transition-all text-left shrink-0 max-w-[210px] xl:max-w-[260px] group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#212121]">
                      Delivery in {deliveryEta}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-[#2E7D32] transition-colors" />
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium truncate">
                    {currentLocation.formattedAddress}
                  </p>
                </div>
              </button>
            </div>

            {/* Center: Search Bar (Smooth flexible width with Camera button) */}
            <form onSubmit={handleSearchSubmit} role="search" className="flex-1 max-w-2xl mx-2 xl:mx-4 min-w-0">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search "sugar", "oil", "soap", "atta"...'
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

            {/* Right: Desktop Navigation links (Anchored firmly to the right corner) */}
            <nav className="flex items-center gap-1.5 xl:gap-2 shrink-0 ml-auto">
              <Link
                href="/"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isHomePage ? 'text-[#2E7D32] bg-emerald-50 font-bold' : 'text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                href="/categories"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/categor') ? 'text-[#2E7D32] bg-emerald-50 font-bold' : 'text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Categories</span>
              </Link>

              {/* Rider Console Direct Button (If user has rider rights) */}
              {(user?.role === 'delivery_partner' || user?.role === 'rider') && (
                <Link
                  href="/rider"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A2E1C] hover:bg-black text-emerald-400 font-extrabold text-xs border border-emerald-500/50 shadow-xs transition-all active:scale-95"
                  title="Open Rider Delivery Console"
                >
                  <Bike className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Rider Console</span>
                </Link>
              )}

              {/* Admin Panel Direct Button (If user has admin rights) */}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f172a] hover:bg-black text-blue-400 font-extrabold text-xs border border-blue-500/50 shadow-xs transition-all active:scale-95"
                  title="Open Admin Management Console"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <Link
                href="/orders"
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/orders') ? 'text-[#2E7D32] bg-emerald-50 font-bold' : 'text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Orders</span>
              </Link>

              <Link
                href={isLoggedIn ? '/account' : '/login'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pathname.startsWith('/account') ? 'text-[#2E7D32] bg-emerald-50 font-bold' : 'text-stone-600 hover:text-[#2E7D32] hover:bg-stone-100'
                }`}
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

              {/* Cart Button — Anchored at the far right corner */}
              <Link
                href="/cart"
                className="relative ml-1 flex items-center gap-2 h-10 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-sm shadow-sm transition-all active:scale-98 shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="flex items-center gap-1 tabular-nums font-black">
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

          {/* Desktop category nav strip — comprehensive full-width edge-to-edge access */}
          <div className="border-t border-stone-200/60 bg-stone-50/90">
            <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
              <Link
                href="/categories"
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-emerald-100 text-[#1B5E20] hover:bg-emerald-200 shadow-2xs font-black shrink-0 transition-colors"
              >
                📑 All Departments (24)
              </Link>

              <div className="h-4 w-px bg-stone-300 mx-1 shrink-0" />

              {/* Master Department Quick Jump Anchors */}
              <Link
                href="/#grocery-kitchen"
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-[#2E7D32] hover:bg-white shrink-0 transition-colors"
              >
                🥦 Grocery & Kitchen (6)
              </Link>
              <Link
                href="/#snacks-drinks"
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-[#2E7D32] hover:bg-white shrink-0 transition-colors"
              >
                🍿 Snacks & Drinks (7)
              </Link>
              <Link
                href="/#household"
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-[#2E7D32] hover:bg-white shrink-0 transition-colors"
              >
                🧹 Household (5)
              </Link>
              <Link
                href="/#personal-care"
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-[#2E7D32] hover:bg-white shrink-0 transition-colors"
              >
                ✨ Personal Care (6)
              </Link>

              <div className="h-4 w-px bg-stone-300 mx-1 shrink-0" />

              {/* Direct links to categories */}
              {[
                { href: '/category/vegetables-fruits', label: 'Vegetables & Fruits' },
                { href: '/category/atta-rice-dal', label: 'Atta, Rice & Dal' },
                { href: '/category/oil-ghee-masala', label: 'Oil & Ghee' },
                { href: '/category/dairy-bread-eggs', label: 'Dairy & Eggs' },
                { href: '/category/dry-fruits-cereals', label: 'Dry Fruits' },
                { href: '/category/chips-namkeen', label: 'Chips & Namkeen' },
                { href: '/category/biscuits-bakery', label: 'Biscuits & Bakery' },
                { href: '/category/drinks-juices', label: 'Cold Drinks' },
                { href: '/category/instant-food', label: 'Instant Food' },
                { href: '/category/laundry-detergents', label: 'Laundry & Cleaning' },
                { href: '/category/dishwash', label: 'Dishwash' },
                { href: '/category/pooja-needs', label: 'Pooja Needs' },
                { href: '/category/soaps-bath', label: 'Soaps & Bath' },
                { href: '/category/oral-care', label: 'Oral Care' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-[#2E7D32] hover:bg-white shrink-0 transition-colors"
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
