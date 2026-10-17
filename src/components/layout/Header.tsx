'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Camera, Bike, ShieldCheck, UserRound, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import BarcodeScannerModal from '@/components/common/BarcodeScannerModal';
import SlipScannerModal from '@/components/storefront/SlipScannerModal';
import CameraMascotPeeker from '@/components/storefront/CameraMascotPeeker';

/** Rotating placeholder words for the home search bar */
const SEARCH_WORDS = ['soap', 'atta', 'oil', 'milk', 'biscuits', 'rice', 'tea'];

function AnimatedSearchPlaceholder() {
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'visible' | 'exiting' | 'entering'>('visible');
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const cycle = setInterval(() => {
      setPhase('exiting');
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % SEARCH_WORDS.length);
        setPhase('entering');
        setTimeout(() => setPhase('visible'), 260);
      }, 260);
    }, 2400);
    return () => clearInterval(cycle);
  }, [prefersReduced]);

  const word = SEARCH_WORDS[wordIdx];
  const cls = phase === 'exiting' ? 'g1-word-exit' : phase === 'entering' ? 'g1-word-enter' : '';

  return (
    <span className="flex items-center gap-1 pointer-events-none text-[var(--g1-text-secondary)] select-none overflow-hidden h-full">
      Search for&nbsp;
      <span className={`inline-block ${cls}`} style={{ minWidth: 32 }}>
        {word}
      </span>
    </span>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { currentLocation, setIsModalOpen } = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { cartItemCount, cartSubtotal } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isSlipScannerOpen, setIsSlipScannerOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleOpenSlip = () => setIsSlipScannerOpen(true);
    window.addEventListener('g1mart:open-slip-scan', handleOpenSlip);
    return () => window.removeEventListener('g1mart:open-slip-scan', handleOpenSlip);
  }, []);

  if (pathname.startsWith('/rider')) {
    return null;
  }

  const etaMins = currentLocation.eta_min ?? currentLocation.etaMin;
  const deliveryEta = etaMins
    ? `~${etaMins} min`
    : (currentLocation.zone?.estimatedDeliveryTimeText || '~61 min');

  const shortAddress =
    currentLocation.area ||
    currentLocation.street ||
    (currentLocation.formattedAddress ? currentLocation.formattedAddress.split(',')[0] : 'Venkatachalam, Nellore');


  return (
    <>
      {/* ═══════════════════════════════════════════
          MOBILE HEADER (lg:hidden)
          Only on Home page.
          Row 1: logo (28px high) + profile avatar (40px circle) — scrolls away
          Row 2: delivery text ~36px — scrolls away
          Row 3: search bar 52px, radius 14 — sticky
          Inner pages render 56px InnerPageHeader with back button + title.
      ══════════════════════════════════════════ */}
      {isHomePage && (
        <header className="lg:hidden w-full bg-[var(--g1-bg)] z-30">
          {/* Rider / Admin banner */}
          {(user?.role === 'delivery_partner' || user?.role === 'rider') && (
            <div className="bg-[#1A2E1C] text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
                <span>Delivery Partner Mode</span>
              </div>
              <Link href="/rider" className="bg-emerald-600 text-white text-[11px] font-black px-3 py-0.5 rounded-full">
                Open Console →
              </Link>
            </div>
          )}
          {user?.role === 'admin' && (
            <div className="bg-[#0f172a] text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Store Administrator Mode</span>
              </div>
              <Link href="/admin" className="bg-blue-600 text-white text-[11px] font-black px-3 py-0.5 rounded-full">
                Open Admin →
              </Link>
            </div>
          )}

          {/* Row 1: logo (28px high) + profile avatar + cart button */}
          <div className="relative z-40 flex items-center justify-between px-4 pt-3 pb-1">
            <Link href="/" aria-label="G1 Mart home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/g1_mart_banner_transparent.png"
                alt="G1 Mart"
                style={{ height: 28, width: 'auto', maxWidth: 130, objectFit: 'contain' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile Cart button */}
              <Link
                href="/cart"
                aria-label={`View cart with ${cartItemCount} items`}
                className="relative w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all g1-press shrink-0"
                style={{
                  backgroundColor: cartItemCount > 0 ? 'var(--g1-primary)' : 'var(--g1-surface)',
                  color: cartItemCount > 0 ? '#FFFFFF' : 'var(--g1-primary)',
                }}
              >
                <ShoppingCart className="w-[20px] h-[20px]" strokeWidth={1.8} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center justify-center shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Row 2: Delivery location — single line ~36px, tap opens location sheet */}
          <div className="px-4 pb-2" style={{ minHeight: 36, display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-left cursor-pointer"
              aria-label="Change delivery location"
            >
              <span className="text-[13px] font-bold" style={{ color: 'var(--g1-text)' }}>
                Delivery in {deliveryEta} · {shortAddress}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} style={{ color: 'var(--g1-text-secondary)' }} />
            </button>
          </div>

          {/* Row 3: Search bar — 52px, radius 14, surface bg, 1px border. Sticky! */}
          <div
            className="sticky top-0 z-30 bg-[var(--g1-bg)]/95 backdrop-blur-md px-4 pb-2.5 pt-1"
            style={{ boxShadow: '0 1px 0 var(--g1-border)' }}
          >
            <form onSubmit={handleSearchSubmit} role="search">
              <div className="relative flex items-center" style={{ height: 52 }}>
                {/* Magnifier icon left */}
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ width: 20, height: 20, color: 'var(--g1-text-secondary)', strokeWidth: 1.75 }}
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder=""
                  aria-label="Search products"
                  className="relative z-20 w-full h-full pl-12 pr-12 text-sm outline-none transition-colors"
                  style={{
                    borderRadius: 14,
                    backgroundColor: 'var(--g1-surface)',
                    border: `1px solid ${searchFocused ? 'var(--g1-primary)' : 'var(--g1-border)'}`,
                    boxShadow: searchFocused ? `0 0 0 3px var(--g1-primary-tint)` : 'none',
                    color: 'var(--g1-text)',
                  }}
                />

                {/* Animated placeholder without quotes */}
                {!searchQuery && !searchFocused && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none text-sm z-20" style={{ right: 52 }}>
                    <AnimatedSearchPlaceholder />
                  </div>
                )}
                {!searchQuery && searchFocused && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none text-sm z-20" style={{ right: 52, color: 'var(--g1-text-secondary)' }}>
                    Search for soap
                  </div>
                )}

                {/* 3D Mascot Peeking above the Camera Scan Button */}
                {isHomePage && <CameraMascotPeeker />}

                {/* Camera / scan icon right */}
                <button
                  type="button"
                  onClick={() => setIsSlipScannerOpen(true)}
                  aria-label="Scan slip with camera"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl g1-press transition-colors z-30"
                  style={{ color: 'var(--g1-primary)' }}
                >
                  <Camera className="w-[22px] h-[22px]" strokeWidth={1.75} />
                </button>
              </div>
            </form>
          </div>
        </header>
      )}

      {/* ═══════════════════════════════════════════
          DESKTOP HEADER (hidden on mobile)
          Header cart button removed everywhere per Acceptance Criteria 7
      ══════════════════════════════════════════ */}
      <header className="hidden lg:block sticky top-0 z-30 w-full bg-[var(--g1-bg)] border-b"
        style={{ borderColor: 'var(--g1-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" aria-label="G1 Mart home" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/g1_mart_banner_transparent.png"
              alt="G1 Mart"
              style={{ height: 36, width: 'auto', maxWidth: 160, objectFit: 'contain' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
            />
          </Link>

          {/* Delivery location pill — only on home */}
          {isHomePage && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-left shrink-0 cursor-pointer"
              style={{ borderColor: 'var(--g1-border)', backgroundColor: 'var(--g1-surface)', maxWidth: 240 }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--g1-text)' }}>
                    Delivery in {deliveryEta}
                  </span>
                  <ChevronDown className="w-3 h-3 shrink-0" style={{ color: 'var(--g1-text-secondary)' }} strokeWidth={1.75} />
                </div>
                <p className="text-[11px] truncate" style={{ color: 'var(--g1-text-secondary)' }}>
                  {shortAddress}
                </p>
              </div>
            </button>
          )}

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} role="search" className="flex-1 max-w-2xl">
            <div className="relative flex items-center" style={{ height: 44 }}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ width: 18, height: 18, color: 'var(--g1-text-secondary)', strokeWidth: 1.75 }} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for groceries, staples, snacks…"
                aria-label="Search products"
                className="w-full h-full pl-10 pr-24 text-sm outline-none transition-colors"
                style={{
                  borderRadius: 12,
                  backgroundColor: 'var(--g1-surface)',
                  border: `1px solid var(--g1-border)`,
                  color: 'var(--g1-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setIsSlipScannerOpen(true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                style={{ color: 'var(--g1-primary)' }}
              >
                <Camera className="w-4 h-4" strokeWidth={1.75} />
                <span>Scan Slip</span>
              </button>
            </div>
          </form>

          {/* Desktop nav links */}
          <nav className="flex items-center gap-1 shrink-0 ml-auto">
            {(user?.role === 'delivery_partner' || user?.role === 'rider') && (
              <Link href="/rider" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors"
                style={{ background: '#1A2E1C', color: '#4ade80', borderColor: 'rgba(74,222,128,.3)' }}>
                <Bike className="w-4 h-4 animate-pulse" />
                <span>Rider Console</span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-colors"
                style={{ background: '#0f172a', color: '#60a5fa', borderColor: 'rgba(96,165,250,.3)' }}>
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
            <Link href="/" className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${pathname === '/' ? 'font-bold' : ''}`}
              style={{ color: pathname === '/' ? 'var(--g1-primary)' : 'var(--g1-text-secondary)', backgroundColor: pathname === '/' ? 'var(--g1-primary-tint)' : 'transparent' }}>
              Home
            </Link>
            <Link href="/categories" className="px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: pathname.startsWith('/categor') ? 'var(--g1-primary)' : 'var(--g1-text-secondary)', backgroundColor: pathname.startsWith('/categor') ? 'var(--g1-primary-tint)' : 'transparent' }}>
              Categories
            </Link>
            <Link href="/orders" className="px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: pathname.startsWith('/orders') ? 'var(--g1-primary)' : 'var(--g1-text-secondary)', backgroundColor: pathname.startsWith('/orders') ? 'var(--g1-primary-tint)' : 'transparent' }}>
              Orders
            </Link>
            <Link href={isLoggedIn ? '/account' : '/login'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: pathname.startsWith('/account') ? 'var(--g1-primary)' : 'var(--g1-text-secondary)', backgroundColor: pathname.startsWith('/account') ? 'var(--g1-primary-tint)' : 'transparent' }}>
              <UserRound className="w-4 h-4" strokeWidth={1.75} />
              <span>{isLoggedIn ? (user?.name ? user.name.split(' ')[0] : 'Account') : 'Sign In'}</span>
            </Link>

            {/* Desktop Cart Button */}
            <Link
              href="/cart"
              aria-label={`View cart with ${cartItemCount} items`}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all g1-press cursor-pointer border"
              style={{
                backgroundColor: cartItemCount > 0 ? 'var(--g1-primary)' : 'var(--g1-surface)',
                color: cartItemCount > 0 ? '#FFFFFF' : 'var(--g1-text)',
                borderColor: cartItemCount > 0 ? 'var(--g1-primary)' : 'var(--g1-border)',
                boxShadow: cartItemCount > 0 ? 'var(--g1-e1)' : 'none',
              }}
            >
              <ShoppingCart className="w-4 h-4" strokeWidth={2} />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="flex items-center gap-1 font-black text-xs bg-white text-[var(--g1-primary)] px-2 py-0.5 rounded-full shadow-xs">
                  <span>{cartItemCount}</span>
                  {cartSubtotal > 0 && <span className="opacity-90">· ₹{cartSubtotal}</span>}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <BarcodeScannerModal isOpen={isBarcodeModalOpen} onClose={() => setIsBarcodeModalOpen(false)} />
      <SlipScannerModal isOpen={isSlipScannerOpen} onClose={() => setIsSlipScannerOpen(false)} />
    </>
  );
}
