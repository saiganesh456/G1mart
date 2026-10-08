'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { STORE_CONFIG } from '@/config/store';
import type { Category, Product } from '@/types';

interface Props {
  category: Category;
  allCategories: Category[];
  products: Product[];
}

export default function CategoryDashboardClient({ category, products }: Props) {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Sync brand from URL query param
  useEffect(() => {
    if (brandParam) setSelectedBrand(brandParam);
  }, [brandParam]);

  // Build brand list: (brandName → count), sorted by count desc
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    products.forEach((p) => {
      const b = p.brand && p.brand !== 'G1 Mart' && p.brand !== 'G1 Mart Fresh' ? p.brand : null;
      if (b) brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });
    return Array.from(brandMap.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [products]);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }
    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }, [products, selectedBrand, sortBy]);

  const deliveryText =
    STORE_CONFIG.delivery.cityEtaText && !STORE_CONFIG.delivery.cityEtaText.startsWith('TODO_')
      ? `Delivery: ${STORE_CONFIG.delivery.cityEtaText}`
      : 'Standard local delivery';

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24 sm:pb-16">
      {/* ── Top Bar: back arrow + title (no search bar) ── */}
      <div className="bg-white sticky top-0 z-20 border-b border-stone-100 px-3 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/categories"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shrink-0"
            aria-label="Back to all categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {category.icon && (
                <span className="text-xl leading-none">{category.icon}</span>
              )}
              <h1 className="text-base font-extrabold text-[#212121] tracking-tight truncate">
                {category.name}
              </h1>
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5 truncate">
              {filteredProducts.length} products · {deliveryText}
            </p>
          </div>
        </div>

        {/* Sort */}
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs font-bold bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] shrink-0"
        >
          <option value="popular">Popular</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {/* ── Body: Left Brand Rail + Right Product Grid ── */}
      <div className="flex flex-1 items-start">
        {/* Left Brand Rail (sticky, Blinkit style) */}
        <aside className="w-20 sm:w-24 shrink-0 bg-stone-50 border-r border-stone-200/80 sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto no-scrollbar">
          <div className="py-1">
            {/* All button */}
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className={`w-full text-center px-1 py-2.5 text-[11px] font-bold leading-tight transition-colors ${
                selectedBrand === 'all'
                  ? 'bg-white text-[#2E7D32] font-extrabold border-r-2 border-[#2E7D32]'
                  : 'text-stone-500 hover:bg-white/70'
              }`}
            >
              <span className="block">All</span>
              <span className={`text-[9px] ${selectedBrand === 'all' ? 'text-[#2E7D32]' : 'text-stone-400'}`}>
                {products.length}
              </span>
            </button>

            {availableBrands.map(([brandName, count]) => {
              const isSelected = selectedBrand === brandName;
              return (
                <button
                  key={brandName}
                  type="button"
                  onClick={() => setSelectedBrand(brandName)}
                  className={`w-full text-center px-1 py-2.5 text-[11px] leading-tight transition-colors ${
                    isSelected
                      ? 'bg-white text-[#2E7D32] font-extrabold border-r-2 border-[#2E7D32]'
                      : 'text-stone-500 font-medium hover:bg-white/70'
                  }`}
                >
                  <span className="block line-clamp-2 break-words">{brandName}</span>
                  <span className={`text-[9px] ${isSelected ? 'text-[#2E7D32]' : 'text-stone-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Product Grid (2 columns, strict) */}
        <main className="flex-1 min-w-0 p-2">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map((p) => (
                <ProductCard key={`${p.id}::${selectedBrand}`} product={p} compact />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
              <span className="text-3xl">📦</span>
              <h3 className="text-sm font-bold text-stone-800">No products found</h3>
              <p className="text-xs text-stone-500">
                No {selectedBrand !== 'all' ? selectedBrand : ''} products in {category.name}.
              </p>
              {selectedBrand !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Show All Brands
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
