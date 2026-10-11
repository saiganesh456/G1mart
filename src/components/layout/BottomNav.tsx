'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Package, User, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home, matchPaths: ['/'] },
  { href: '/categories', label: 'Categories', icon: LayoutGrid, matchPaths: ['/categories', '/category'] },
  { href: '/orders', label: 'Orders', icon: Package, matchPaths: ['/orders', '/order-again'] },
  { href: '/account', label: 'Account', icon: User, matchPaths: ['/account'] },
] as const;

/** Pages where the bottom nav is not shown */
const HIDDEN_PATHS = ['/login', '/checkout', '/cart', '/payment', '/product'];

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItemCount, cartSubtotal } = useCart();
  const { user } = useAuth();

  const shouldHide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const isRider = user?.role === 'delivery_partner' || user?.role === 'rider';
  const showRiderPill = isRider && !pathname.startsWith('/rider');

  const isActive = (matchPaths: readonly string[]) =>
    matchPaths.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)));

  const showFloatingCart =
    cartItemCount > 0 &&
    !pathname.startsWith('/cart') &&
    !pathname.startsWith('/checkout') &&
    !pathname.startsWith('/payment');

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Rider Mode pill */}
      {showRiderPill && !showFloatingCart && (
        <div className="px-3 pb-2 pointer-events-auto">
          <Link
            href="/rider"
            className="w-full h-11 bg-[#1A2E1C] text-white rounded-2xl px-4 flex items-center justify-between shadow-lg active:scale-[0.99] transition-transform border border-emerald-500/30"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Truck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Rider Mode Active</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400">
              <span>OPEN CONSOLE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}

      {/* Sticky cart bar — 56px, only when items in cart */}
      {showFloatingCart && (
        <div className="px-3 pb-2 pointer-events-auto">
          <Link
            href="/cart"
            aria-label={`View cart with ${cartItemCount} items, total ₹${cartSubtotal}`}
            className="w-full h-14 rounded-2xl px-4 flex items-center justify-between shadow-[var(--g1-e2)] active:scale-[0.98] transition-transform"
            style={{ backgroundColor: 'var(--g1-primary)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {cartItemCount}
              </div>
              <span className="text-sm font-bold text-white">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} · ₹{cartSubtotal}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-white">
              <span>View cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Tab bar — 64px + safe area */}
      <nav
        className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-[var(--g1-border)] px-1 flex items-center justify-around"
        style={{
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -1px 0 var(--g1-border)',
        }}
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.matchPaths);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 h-full flex flex-col items-center justify-center relative g1-press"
              aria-current={active ? 'page' : undefined}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {/* Active indicator bar at top */}
              {active && <span className="g1-nav-bar" />}

              {/* Icon */}
              <Icon
                className="w-6 h-6"
                style={{
                  color: active ? 'var(--g1-primary)' : 'var(--g1-text-secondary)',
                  strokeWidth: active ? 2.2 : 1.75,
                }}
              />

              {/* Label — 11px, never overlaps icon */}
              <span
                className="text-[11px] font-medium mt-0.5 leading-none"
                style={{ color: active ? 'var(--g1-primary)' : 'var(--g1-text-secondary)', fontWeight: active ? 700 : 500 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
