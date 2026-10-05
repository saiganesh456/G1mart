'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { CATALOG_PRODUCTS } from '@/data/productsCatalog';
import { productService } from '@/services/productService';
import type { Product } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>(CATALOG_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    productService.getProducts().then((liveList) => {
      if (isMounted && liveList && liveList.length > 0) {
        setProducts(liveList);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.rawName && p.rawName.toLowerCase().includes(q))
    );
  }, [query, products]);

  return (
    <div className="space-y-4 pb-20 sm:pb-12 pt-3 px-2 sm:px-0">
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 470+ authentic products, brands..."
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
            className="text-[#2E7D32] font-semibold hover:underline cursor-pointer"
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
