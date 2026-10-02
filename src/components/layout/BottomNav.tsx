'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, User, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home, matchPaths: ['/'] },
  { href: '/category/fruits-vegetables', label: 'Categories', icon: LayoutGrid, matchPaths: ['/category'] },
  { href: '/orders', label: 'Orders', icon: ShoppingBag, matchPaths: ['/orders'] },
  { href: '/account', label: 'Account', icon: User, matchPaths: ['/account', '/help'] },
] as const;

/** Pages where the bottom nav is not shown */
const HIDDEN_PATHS = ['/login', '/checkout', '/cart'];

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItemCount, cartSubtotal } = useCart();

  // Hide on auth, checkout, and cart pages
  const shouldHide = HIDDEN_PATHS.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const isActive = (matchPaths: readonly string[]) =>
    matchPaths.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)));

  const showFloatingCart =
    cartItemCount > 0 &&
    !pathname.startsWith('/cart') &&
    !pathname.startsWith('/checkout');

  return (
    /* Only visible on mobile/tablet — desktop uses the header nav */
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto pointer-events-none">

      {/* Floating view-cart pill */}
      {showFloatingCart && (
        <div className="p-3 pointer-events-auto">
          <Link
            href="/cart"
            className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-2xl px-4 flex items-center justify-between shadow-lg shadow-[#2E7D32]/25 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                {cartItemCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-medium text-white/80 leading-none">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in cart
                </span>
                <span className="text-xs font-bold leading-tight tabular-nums mt-0.5">
                  ₹{cartSubtotal}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide">
              <span>VIEW CART</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Tab bar */}
      <nav
        className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-sm px-2 py-1 flex items-center justify-around h-16"
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
