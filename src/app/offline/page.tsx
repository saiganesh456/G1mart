'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 text-center select-none">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 p-8 shadow-sm space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2E7D32]">
            <WifiOff className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            No Internet Connection
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            You&apos;re Currently Offline
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            G1mart needs an active internet connection to check live inventory, prices, and deliver your groceries.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-3.5 px-6 bg-[#2E7D32] hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Connection &amp; Retry</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-400">
          G1mart Supermarket · Nellore Quick-Commerce
        </div>
      </div>
    </div>
  );
}
