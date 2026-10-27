'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard, ShoppingBag } from 'lucide-react';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[G1mart Admin Error Boundary caught error]:', error);
  }, [error]);

  return (
    <div className="w-full max-w-2xl mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-stone-200/90 shadow-xl text-stone-900 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
            Admin Console Shield
          </span>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-1">
            Temporary Admin Display Issue
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            A temporary glitch occurred while updating an order status or input field. Your order updates were safely saved to the server.
          </p>
        </div>
      </div>

      {error?.message && (
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-xs font-mono break-all max-h-32 overflow-y-auto">
          {error.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full sm:w-auto px-5 py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Section</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/admin?tab=orders&status=All';
            }
          }}
          className="w-full sm:w-auto px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-stone-600" />
          <span>View All Orders</span>
        </button>

        <Link
          href="/admin"
          className="w-full sm:w-auto px-5 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4 text-stone-500" />
          <span>Admin Home</span>
        </Link>
      </div>
    </div>
  );
}
