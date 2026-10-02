'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { DEMO_PRODUCTS } from '@/data/demo-seed';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEMO_PRODUCTS;
    return DEMO_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-4 pb-20 sm:pb-12 pt-3 px-2 sm:px-0">
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-sm outline-none focus:border-[#2E7D32] shadow-2xs"
          autoFocus
        />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'} found
        </span>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[#2E7D32] font-semibold hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <ProductGrid products={filtered} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
