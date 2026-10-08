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
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Sync subcategory from URL query param if valid
  useEffect(() => {
    if (subParam && (category.subcategories || []).includes(subParam)) {
      setSelectedSubCategory(subParam);
      setSelectedBrand('all');
    }
  }, [subParam, category.subcategories]);

  const subcategories = useMemo(() => category.subcategories || [], [category.subcategories]);

  // Compute available brands for the current subcategory selection
  const availableBrands = useMemo(() => {
    let baseList = products;
    if (selectedSubCategory !== 'all') {
      baseList = baseList.filter((p) => p.subCategory === selectedSubCategory);
    }
    const brandMap = new Map<string, number>();
    baseList.forEach((p) => {
      const b = p.brand && p.brand !== 'G1 Mart Fresh' ? p.brand : 'Other';
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });
    return Array.from(brandMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [products, selectedSubCategory]);

  // Filter products by selected subcategory and brand
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedSubCategory !== 'all') {
      list = list.filter((p) => p.subCategory === selectedSubCategory);
    }
    if (selectedBrand !== 'all') {
      list = list.filter((p) => (p.brand || 'Other') === selectedBrand);
    }

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }, [products, selectedSubCategory, selectedBrand, sortBy]);

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
    <div className="space-y-4 pb-24 sm:pb-16 pt-2 sm:pt-4 px-1 sm:px-0 bg-white">
      {/* Top Header & Breadcrumbs — Clean borderless header on pure white */}
      <div className="bg-white pb-3 flex items-center justify-between gap-3 border-b border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/categories"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shrink-0"
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

      {/* Brand Shelf Strip (e.g. Santoor, Mysore Sandal, Cinthol, etc.) */}
      {availableBrands.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 bg-stone-50/70 p-1.5 rounded-2xl border border-stone-100">
          <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-2 shrink-0">
            Brand:
          </span>
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedBrand === 'all'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            All Brands
          </button>
          {availableBrands.map(([bName, bCount]) => (
            <button
              key={bName}
              type="button"
              onClick={() => setSelectedBrand(bName)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                selectedBrand === bName
                  ? 'bg-[#2E7D32] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <span>{bName}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full font-black ${
                  selectedBrand === bName ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {bCount}
              </span>
            </button>
          ))}
        </div>
      )}

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
