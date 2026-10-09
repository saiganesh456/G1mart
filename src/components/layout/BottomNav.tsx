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
const HIDDEN_PATHS = ['/login', '/checkout', '/cart', '/payment'];

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItemCount, cartSubtotal } = useCart();
  const { user } = useAuth();

  // Hide on auth, checkout, cart, and payment pages
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
    /* Only visible on mobile/tablet — desktop uses the header nav */
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto pointer-events-none">
      {/* Floating Rider Mode switcher pill */}
      {showRiderPill && !showFloatingCart && (
        <div className="p-3 pointer-events-auto">
          <Link
            href="/rider"
            className="w-full h-11 bg-[#1A2E1C] hover:bg-black text-white rounded-2xl px-4 flex items-center justify-between shadow-lg active:scale-[0.99] transition-all border border-emerald-500/30"
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

      {/* Floating green "View cart - N items" pill */}
      {showFloatingCart && (
        <div className="p-3 pointer-events-auto">
          <Link
            href="/cart"
            aria-label={`View cart with ${cartItemCount} items`}
            className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-2xl px-4 flex items-center justify-between shadow-lg shadow-[#2E7D32]/25 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                {cartItemCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  View cart - {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-[11px] font-medium text-white/80 tabular-nums leading-none mt-0.5">
                  ₹{cartSubtotal}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide">
              <span>VIEW CART</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Tab bar (Home, Categories, Orders, Account) */}
      <nav
        className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-sm px-2 py-1 flex items-center justify-around h-16 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)]"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.matchPaths);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 min-h-[48px] flex flex-col items-center justify-center relative active:scale-95 transition-transform"
              aria-current={active ? 'page' : undefined}
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-xl transition-colors ${
                  active ? 'text-[#2E7D32]' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight font-medium mt-0.5 ${
                  active ? 'text-[#2E7D32] font-bold' : 'text-stone-500'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2E7D32]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
