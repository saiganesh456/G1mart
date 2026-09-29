import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { navigate, isLoggedIn } = useApp();

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between items-center bg-gradient-to-b from-white via-[#E8F5E9]/50 to-[#2E7D32]/10 p-6 text-center select-none max-w-lg mx-auto w-full my-auto py-10">
      {/* Top spacing */}
      <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
        <Sparkles className="w-3.5 h-3.5" />
        <span>HYDERABAD'S TRUSTED SUPERMARKET</span>
      </div>

      {/* Center Brand Identity with Official Logo */}
      <div className="flex flex-col items-center my-auto py-8">
        <div className="relative mb-6">
          <img
            src="/assets/images/g1_mart_banner_transparent.png"
            alt="G1 Mart"
            className="h-20 sm:h-24 w-auto object-contain drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#212121] tracking-tight">
          G1 Mart
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#2E7D32] mt-1 tracking-wider uppercase">
          Fresh Supermarket &amp; Express Grocery Delivery
        </p>

        <p className="text-xs sm:text-sm text-stone-600 mt-4 max-w-sm font-normal leading-relaxed">
          Fresh vegetables, dairy, farm produce and daily essentials delivered to your doorstep in 15-30 minutes across Hyderabad.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white/90 backdrop-blur-xs px-4 py-2 rounded-full border border-stone-200/80 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Express Delivery Active Across Hyderabad</span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="w-full max-w-xs space-y-2.5 pb-6">
        <button
          type="button"
          onClick={() => (isLoggedIn ? navigate('home') : navigate('onboarding'))}
          className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate('home')}
          className="w-full py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          Skip to Store
        </button>
      </div>
    </div>
  );
};
