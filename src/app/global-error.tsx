'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[G1mart Global Error]:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F7F7F7] font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 text-2xl font-black">
          !
        </div>
        <h1 className="text-xl font-extrabold text-[#212121] mb-2">Application Error</h1>
        <p className="text-sm text-stone-600 mb-6 max-w-sm">
          A critical rendering error occurred. Please refresh or try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          Reload App
        </button>
      </body>
    </html>
  );
}
