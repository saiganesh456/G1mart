'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Camera } from 'lucide-react';
import SlipScannerModal from './SlipScannerModal';

export default function StickyHomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const handleOpen = () => setIsSlipOpen(true);
    window.addEventListener('g1mart:open-slip-scan', handleOpen);
    return () => window.removeEventListener('g1mart:open-slip-scan', handleOpen);
  }, []);

  return (
    <>
      <div data-sticky-search-wrapper="true" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-2.5 border-b border-stone-200/80 shadow-xs">
        <form onSubmit={handleSubmit} role="search">
          <div className="relative flex items-center max-w-xl mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search "sugar", "oil", "soap"'
              className="w-full h-11 pl-10 pr-12 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:bg-white focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-all placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={() => setIsSlipOpen(true)}
              aria-label="Scan slip with camera"
              title="Scan slip or handwritten list with camera"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#2E7D32] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </form>
      </div>

      {isSlipOpen && (
        <SlipScannerModal isOpen={isSlipOpen} onClose={() => setIsSlipOpen(false)} />
      )}
    </>
  );
}
