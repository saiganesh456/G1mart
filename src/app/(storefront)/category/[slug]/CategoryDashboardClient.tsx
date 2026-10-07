'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { STORE_CONFIG } from '@/config/store';
import type { Category, Product } from '@/types';

interface Props {
  category: Category;
  allCategories: Category[];
  products: Product[];
}

export default function CategoryDashboardClient({ category, allCategories, products }: Props) {
  const searchParams = useSearchParams();
  const subParam = searchParams.get('sub');

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Sync subcategory from URL query param if valid
  useEffect(() => {
    if (subParam && (category.subcategories || []).includes(subParam)) {
      setSelectedSubCategory(subParam);
    }
  }, [subParam, category.subcategories]);

  const subcategories = useMemo(() => category.subcategories || [], [category.subcategories]);

  // Filter products by selected subcategory
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedSubCategory !== 'all') {
      list = list.filter((p) => p.subCategory === selectedSubCategory);
    }

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }, [products, selectedSubCategory, sortBy]);

  // Compute item count per subcategory
  const subCatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of subcategories) {
      counts[sub] = products.filter((p) => p.subCategory === sub).length;
    }
    return counts;
  }, [subcategories, products]);

  // Delivery text from store config (no speed promises)
  const deliveryText =
    STORE_CONFIG.delivery.cityEtaText && !STORE_CONFIG.delivery.cityEtaText.startsWith('TODO_')
      ? `Delivery window: ${STORE_CONFIG.delivery.cityEtaText}`
      : 'Standard local delivery';

  return (
    <div className="space-y-4 pb-24 sm:pb-16 pt-2 sm:pt-4 px-1 sm:px-0">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/categories"
            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shrink-0"
            title="All Categories"
            aria-label="Back to all categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl leading-none">{category.icon}</span>
              <h1 className="text-base sm:text-lg font-extrabold text-[#212121] tracking-tight truncate">
                {category.name}
              </h1>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5 truncate">
              {filteredProducts.length} of {products.length} items · {deliveryText}
            </p>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <label htmlFor="sort-select" className="text-xs font-bold text-stone-500 hidden sm:inline">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
          >
            <option value="popular">Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Top Sub-Category Filter Chips (Mandatory Stage A Requirement) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        <button
          type="button"
          onClick={() => setSelectedSubCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer ${
            selectedSubCategory === 'all'
              ? 'bg-[#2E7D32] text-white shadow-2xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:border-[#2E7D32] hover:bg-stone-50'
          }`}
        >
          All Items ({products.length})
        </button>

        {subcategories.map((sub) => {
          const count = subCatCounts[sub] || 0;
          const isSelected = selectedSubCategory === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubCategory(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-[#2E7D32] text-white shadow-2xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-[#2E7D32] hover:bg-stone-50'
              }`}
            >
              <span>{sub}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Fixed Left Rail + Scrolling Product Grid */}
      <div className="flex items-start gap-2 sm:gap-4 min-h-[calc(100vh-140px)]">
        {/* Fixed Left Rail (Own Scroll Area, active highlight, works on Mobile & Desktop) */}
        <aside className="w-24 sm:w-48 lg:w-56 shrink-0 bg-stone-50 border-r border-stone-200/80 sticky top-28 sm:top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar py-1">
          <div className="space-y-1 pr-1">
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`w-full text-left p-2 rounded-xl text-[11px] sm:text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between transition-colors ${
                selectedSubCategory === 'all'
                  ? 'bg-white text-[#1B5E20] font-black border-l-4 border-[#2E7D32] shadow-2xs'
                  : 'text-stone-600 hover:bg-white/60 font-medium'
              }`}
            >
              <span className="truncate w-full">All Items</span>
              <span className="text-[10px] font-bold text-stone-400 mt-0.5 sm:mt-0">{products.length}</span>
            </button>

            {subcategories.map((sub) => {
              const count = subCatCounts[sub] || 0;
              const isSelected = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`w-full text-left p-2 rounded-xl text-[11px] sm:text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-white text-[#1B5E20] font-black border-l-4 border-[#2E7D32] shadow-2xs'
                      : 'text-stone-600 hover:bg-white/60 font-medium'
                  }`}
                >
                  <span className="line-clamp-2 w-full">{sub}</span>
                  <span className="text-[10px] font-bold text-stone-400 mt-0.5 sm:mt-0">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Product Cards Grid (Only the right-hand product grid scrolls with the page) */}
        <main className="flex-1 min-w-0 space-y-3 pb-24 sm:pb-12">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
              <span className="text-2xl">📦</span>
              <h3 className="text-sm font-bold text-stone-800">
                No items found in this section
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Browse all available products in {category.name}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedSubCategory('all')}
                className="inline-block px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition-colors"
              >
                View All {category.name} ({products.length})
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
