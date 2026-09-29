import React from 'react';
import {
  Wifi,
  Signal,
  BatteryMedium,
  Smartphone,
  Maximize2,
  Users,
  ShieldCheck,
  Bike,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopFooter } from './DesktopFooter';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const {
    isMobileFrame,
    toggleMobileFrame,
    role,
    setRole,
    screen,
  } = useApp();

  // Current system clock for mobile frame simulator
  const currentTime = '9:48';

  // Certain screens like splash, onboarding, login, otp, admin, delivery don't need desktop sidebar
  const isFullScreenFlow =
    screen === 'splash' ||
    screen === 'onboarding' ||
    screen === 'login' ||
    screen === 'otp' ||
    screen === 'order_success';

  const isRoleDashboard = role === 'admin' || role === 'delivery_partner';

  // Views that have the sidebar on desktop (e-commerce catalog, home, category, search, product details, cart, wishlist, orders, profile)
  const showDesktopSidebar = !isFullScreenFlow && !isRoleDashboard && screen !== 'checkout' && screen !== 'payment';

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col text-[#212121]">
      {/* Top Testing & Viewport Control Bar (useful for switching roles and previewing simulated frame) */}
      <aside
        aria-label="Device controls and role switcher"
        className="w-full bg-stone-900 text-stone-200 px-4 py-1.5 border-b border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs z-50 select-none"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/images/g1_mart_banner_transparent.png"
            alt="G1 Mart"
            className="h-5 w-auto object-contain brightness-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
          <span className="font-bold text-white tracking-wide text-xs">
            G1 Mart
          </span>
          <span className="text-stone-400 hidden sm:inline text-[11px]">
            · Hyderabad Delivery
          </span>
        </div>

        {/* Roles & Device Toggle */}
        <div className="flex items-center gap-2">
          {/* User Role Switcher */}
          <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                role === 'customer'
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('delivery_partner')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                role === 'delivery_partner'
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Rider</span>
            </button>
          </div>

          {/* Toggle Phone Frame simulator vs Full Responsive View */}
          <button
            type="button"
            onClick={toggleMobileFrame}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 text-[11px] font-medium transition-colors"
            title="Toggle Phone Frame Simulation"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#66BB6A]" />
                <span className="hidden sm:inline">Responsive Web</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#66BB6A]" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`w-full flex-1 flex flex-col ${isMobileFrame ? 'items-center justify-start py-4 sm:py-8 bg-stone-200' : ''}`}>
        {isMobileFrame ? (
          /* Android Mobile Device Frame Simulator */
          <div className="relative w-full max-w-[420px] min-h-[100dvh] sm:min-h-[860px] sm:max-h-[900px] bg-white sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-stone-800 flex flex-col overflow-hidden sm:ring-1 sm:ring-black/10">
            {/* Punch Hole Camera */}
            <div className="hidden sm:flex absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-3.5 h-3.5 rounded-full bg-stone-900 ring-2 ring-stone-800/80 items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
            </div>

            {/* Android Status Bar */}
            <div className="w-full h-8 bg-white/95 px-5 flex items-center justify-between text-[11px] font-bold text-stone-800 select-none shrink-0 border-b border-stone-100 z-40">
              <span className="tabular-nums">{currentTime}</span>
              <div className="flex items-center gap-1.5 text-stone-600">
                <span className="text-[10px] font-extrabold tracking-tighter text-[#2E7D32]">5G</span>
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4 text-stone-800" />
              </div>
            </div>

            {/* Scrollable Content inside Mobile Simulator */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#F7F7F7] flex flex-col">
              {children}
            </div>

            {/* Home Navigation Indicator */}
            <div className="w-full h-4 bg-white flex items-center justify-center shrink-0 border-t border-stone-50 select-none">
              <div className="w-28 h-1 rounded-full bg-stone-300" />
            </div>
          </div>
        ) : (
          /* Natural Fully Responsive Web Layout */
          <div className="w-full flex-1 flex flex-col">
            {children}
            {!isFullScreenFlow && <DesktopFooter />}
          </div>
        )}
      </div>
    </div>
  );
};
