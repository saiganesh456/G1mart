import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const {
    screen,
    navigate,
    cartItemCount,
    cartGrandTotal,
    role,
  } = useApp();

  // Hide bottom nav on specific fullscreen flows, or if not customer
  const hideNavScreens = [
    'splash',
    'onboarding',
    'login',
    'otp',
    'order_success',
    'admin_dashboard',
    'delivery_dashboard',
  ];

  if (hideNavScreens.includes(screen) || role !== 'customer') {
    return null;
  }

  const showFloatingCart =
    cartItemCount > 0 &&
    screen !== 'cart' &&
    screen !== 'checkout' &&
    screen !== 'payment';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, target: 'home' as const },
    { id: 'category', label: 'Categories', icon: LayoutGrid, target: 'category' as const },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, target: 'my_orders' as const },
    { id: 'profile', label: 'Profile', icon: User, target: 'profile' as const },
  ];

  const isActive = (itemTarget: string) => {
    if (itemTarget === 'home' && screen === 'home') return true;
    if (itemTarget === 'category' && screen === 'category') return true;
    if (itemTarget === 'my_orders' && (screen === 'my_orders' || screen === 'order_tracking')) return true;
    if (itemTarget === 'profile' && (screen === 'profile' || screen === 'address_list' || screen === 'help_support')) return true;
    return false;
  };

  return (
    /* Only visible on mobile/tablets (< lg); on laptops/desktops (lg+), desktop header & sidebar are used */
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto pointer-events-none">
      {/* Floating View Cart Pill for Mobile */}
      {showFloatingCart && (
        <div className="p-3 pointer-events-auto">
          <button
            type="button"
            onClick={() => navigate('cart')}
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
                  ₹{cartGrandTotal}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide">
              <span>VIEW CART</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Bottom Tab Bar */}
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-sm px-2 py-1 flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.target);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.target)}
              className="flex-1 min-h-[48px] flex flex-col items-center justify-center relative active:scale-95 transition-transform"
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
            </button>
          );
        })}
      </nav>
    </div>
  );
};
