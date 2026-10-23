'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[G1mart Root Error Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F7F7F7]">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 text-2xl font-black">
        !
      </div>
      <h1 className="text-xl font-extrabold text-[#212121] mb-2">Something went wrong</h1>
      <p className="text-sm text-stone-600 mb-6 max-w-sm">
        We encountered a temporary issue while loading this page. Please try again or return to the storefront.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl transition-colors shadow-2xs"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
