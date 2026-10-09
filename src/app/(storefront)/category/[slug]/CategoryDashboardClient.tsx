'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { getBrandLogo } from '@/lib/brandLogos';
import type { Category, Product } from '@/types';

interface Props {
  category: Category;
  allCategories: Category[];
  products: Product[];
}

// Brand monogram background colors
const MONOGRAM_COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
];

function getMonogramColor(brand: string): string {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = (hash << 5) - hash + brand.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % MONOGRAM_COLORS.length;
  return MONOGRAM_COLORS[idx];
}

export default function CategoryDashboardClient({ category, products }: Props) {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Sync brand from URL query param
  useEffect(() => {
    if (brandParam) setSelectedBrand(brandParam);
  }, [brandParam]);

  // Extract sub-categories for this category
  const subCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const sub = p.subCategory || (p as any).sub_category;
      if (sub && sub !== 'General' && sub !== 'General Essentials') {
        set.add(sub);
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Filter products by sub-category first (to feed brand rail counts)
  const subFilteredProducts = useMemo(() => {
    if (selectedSubCategory === 'all') return products;
    return products.filter((p) => {
      const sub = p.subCategory || (p as any).sub_category;
      return sub === selectedSubCategory;
    });
  }, [products, selectedSubCategory]);

  // Build brand list: (brandName → { count, bestVerifiedCutout })
  // "All" first, "Local brands" last
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, { count: number; logoUrl: string | null }>();
    let localCount = 0;

    subFilteredProducts.forEach((p) => {
      const b = p.brand;
      const isLocal = !b || b === 'G1 Mart' || b === 'G1 Mart Fresh' || b === 'Local / Unbranded';

      if (isLocal) {
        localCount += 1;
      } else {
        const existing = brandMap.get(b);
        const officialLogo = getBrandLogo(b);
        if (!existing) {
          brandMap.set(b, {
            count: 1,
            logoUrl: officialLogo,
          });
        } else {
          existing.count += 1;
          if (!existing.logoUrl && officialLogo) {
            existing.logoUrl = officialLogo;
          }
        }
      }
    });

    const standardBrands = Array.from(brandMap.entries())
      .filter(([, data]) => data.count > 0)
      .sort((a, b) => b[1].count - a[1].count);

    return {
      brands: standardBrands,
      localCount,
    };
  }, [subFilteredProducts]);

  // Final filtered & sorted products
  // Rule 5: Order products with verified photos first, then by popularity!
  const filteredProducts = useMemo(() => {
    let list = subFilteredProducts;

    if (selectedBrand === 'local') {
      list = list.filter((p) => {
        const b = p.brand;
        return !b || b === 'G1 Mart' || b === 'G1 Mart Fresh' || b === 'Local / Unbranded';
      });
    } else if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    // Apply sort
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;

      // Primary: Verified photos first
      const aVer = a.image_status === 'verified' && a.image_url ? 1 : 0;
      const bVer = b.image_status === 'verified' && b.image_url ? 1 : 0;
      if (aVer !== bVer) return bVer - aVer;

      // Secondary: Popularity
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });

    return sorted;
  }, [subFilteredProducts, selectedBrand, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24 sm:pb-16 max-w-full overflow-x-hidden">
      {/* ── 2. Top Bar: back arrow + category name only + sort dropdown ── */}
      <div className="bg-white sticky top-0 z-20 border-b border-stone-100 px-3 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/categories"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shrink-0"
            aria-label="Back to all categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-[#212121] tracking-tight truncate">
              {category.name}
            </h1>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5 truncate">
              {filteredProducts.length} items
            </p>
          </div>
        </div>

        {/* Sort dropdown */}
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs font-bold bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] shrink-0"
        >
          <option value="popular">Popular</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {/* ── Under Top Bar: Horizontal Chip Row of Sub-Categories ── */}
      {subCategories.length > 0 && (
        <div className="bg-white border-b border-stone-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
          <button
            type="button"
            onClick={() => {
              setSelectedSubCategory('all');
              setSelectedBrand('all');
            }}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedSubCategory === 'all'
                ? 'bg-[#2E7D32] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {subCategories.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => {
                setSelectedSubCategory(sub);
                setSelectedBrand('all');
              }}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedSubCategory === sub
                  ? 'bg-[#2E7D32] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* ── Body: Left Brand Rail (~76px) + Right Product Grid ── */}
      <div className="flex flex-1 items-start min-w-0">
        {/* ── 3. LEFT RAIL: Brands (~76px wide, no overflow) ── */}
        <aside className="w-[76px] sm:w-24 md:w-28 shrink-0 bg-stone-50/60 border-r border-stone-200/80 sticky top-[95px] self-start h-[calc(100vh-95px)] overflow-y-auto no-scrollbar flex flex-col py-2 select-none">
          {/* "All" button first */}
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            className={`relative w-full py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBrand === 'all' ? 'bg-white' : 'hover:bg-white/60'
            }`}
          >
            {selectedBrand === 'all' && (
              <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2E7D32] rounded-r-md" />
            )}
            <div
              className={`w-[52px] h-[52px] rounded-full border flex items-center justify-center transition-all ${
                selectedBrand === 'all'
                  ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] font-black ring-2 ring-[#2E7D32]/20 shadow-2xs'
                  : 'border-stone-200 bg-white text-stone-600 font-bold'
              }`}
            >
              <span className="text-xs">All</span>
            </div>
            <span
              className={`text-[10px] mt-1 font-bold leading-tight ${
                selectedBrand === 'all' ? 'text-[#2E7D32]' : 'text-stone-600'
              }`}
            >
              All
            </span>
            <span className="text-[9px] text-stone-400 font-medium">
              {subFilteredProducts.length}
            </span>
          </button>

          {/* Individual Brands */}
          {availableBrands.brands.map(([brandName, { count, logoUrl }]) => {
            const isSelected = selectedBrand === brandName;
            const initial = (brandName[0] || 'B').toUpperCase();
            const monogramStyle = getMonogramColor(brandName);

            return (
              <button
                key={brandName}
                type="button"
                onClick={() => setSelectedBrand(brandName)}
                className={`relative w-full py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected ? 'bg-white' : 'hover:bg-white/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2E7D32] rounded-r-md" />
                )}

                {/* Round thumbnail (~56px / 52px) */}
                <div
                  className={`w-[52px] h-[52px] rounded-full border p-1 flex items-center justify-center overflow-hidden transition-all bg-white ${
                    isSelected
                      ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/25 shadow-2xs scale-105'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={brandName}
                      loading="lazy"
                      className="w-full h-full object-contain p-0.5 select-none"
                    />
                  ) : (
                    // Coloured monogram circle with brand initial
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center font-black text-sm select-none ${monogramStyle}`}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                {/* Brand name below */}
                <span
                  className={`text-[10px] leading-[11px] line-clamp-2 text-center mt-1 w-full px-0.5 break-words font-semibold ${
                    isSelected ? 'text-[#2E7D32] font-black' : 'text-stone-700'
                  }`}
                >
                  {brandName}
                </span>
                <span className="text-[9px] text-stone-400 font-medium">{count}</span>
              </button>
            );
          })}

          {/* "Local brands" last */}
          {availableBrands.localCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedBrand('local')}
              className={`relative w-full py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedBrand === 'local' ? 'bg-white' : 'hover:bg-white/60'
              }`}
            >
              {selectedBrand === 'local' && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2E7D32] rounded-r-md" />
              )}
              <div
                className={`w-[52px] h-[52px] rounded-full border p-1 flex items-center justify-center transition-all bg-white ${
                  selectedBrand === 'local'
                    ? 'border-[#2E7D32] bg-emerald-50 ring-2 ring-[#2E7D32]/20 shadow-2xs scale-105'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Jeevan Mart"
                  className="w-8 h-8 object-contain select-none"
                />
              </div>
              <span
                className={`text-[10px] leading-[11px] line-clamp-2 text-center mt-1 w-full px-0.5 font-semibold ${
                  selectedBrand === 'local' ? 'text-[#2E7D32] font-black' : 'text-stone-700'
                }`}
              >
                Local
              </span>
              <span className="text-[9px] text-stone-400 font-medium">
                {availableBrands.localCount}
              </span>
            </button>
          )}
        </aside>

        {/* ── 4. Product Grid: Responsive (2 cols on mobile, 3-6 cols on larger screens) ── */}
        <main className="flex-1 min-w-0 p-1.5 sm:p-3 lg:p-4">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-3.5 min-w-0">
              {filteredProducts.map((p) => (
                <ProductCard key={`${p.id}::${selectedBrand}`} product={p} compact />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-4">
              <span className="text-3xl">📦</span>
              <h3 className="text-sm font-bold text-stone-800">No products found</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                No products found for the selected brand or sub-category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedSubCategory('all');
                }}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Show All Products
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
