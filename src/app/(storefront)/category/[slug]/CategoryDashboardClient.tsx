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

      {/* Main Content Area */}
      <div className="flex items-start gap-4">
        {/* Left Side Subcategory Rail (Desktop only) */}
        <aside className="hidden lg:block w-52 shrink-0 bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden sticky top-20 self-start">
          <div className="p-3 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
              Sub-categories
            </span>
          </div>

          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                selectedSubCategory === 'all'
                  ? 'bg-[#E8F5E9] text-[#1B5E20] font-bold border-l-4 border-[#2E7D32]'
                  : 'text-stone-700 hover:bg-stone-50 font-medium'
              }`}
            >
              <span>All Products</span>
              <span className="text-[10px] font-bold text-stone-400">{products.length}</span>
            </button>

            {subcategories.map((sub) => {
              const count = subCatCounts[sub] || 0;
              const isSelected = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#E8F5E9] text-[#1B5E20] font-bold border-l-4 border-[#2E7D32]'
                      : 'text-stone-700 hover:bg-stone-50 font-medium'
                  }`}
                >
                  <span className="truncate pr-1">{sub}</span>
                  <span className="text-[10px] font-bold text-stone-400">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Other departments jump */}
          <div className="p-3 border-t border-stone-100 mt-2 bg-stone-50/50">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block mb-2">
              Other Departments
            </span>
            <div className="space-y-1">
              {allCategories
                .filter((c) => c.id !== category.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.id}`}
                    className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-[#2E7D32] hover:bg-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{c.icon}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <ChevronRight className="w-3 h-3 text-stone-400" />
                  </Link>
                ))}
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <main className="flex-1 min-w-0 space-y-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
              <span className="text-3xl">📦</span>
              <h3 className="text-sm sm:text-base font-bold text-stone-800">
                No items found in this section
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Check back soon or browse all available products in {category.name}.
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
