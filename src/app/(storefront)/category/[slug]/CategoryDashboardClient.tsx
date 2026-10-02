'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal, Check } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import type { Category, Product } from '@/types';

interface Props {
  category: Category;
  allCategories: Category[];
  products: Product[];
}

// Subcategory thumbnail icon mapper for authentic Blinkit appearance
const SUBCAT_THUMBNAILS: Record<string, string> = {
  // Rice Dal Atta
  'Atta & Flours': '/products/prod-2.jpg',
  'Rice & Grains': '/products/prod-6.jpg',
  'Dals & Pulses': '/products/photos/toor-dal.jpg',
  'Salt & Sugar': '/products/photos/crystal-salt.jpg',

  // Oils & Masala
  'Cooking Oils & Ghee': '/products/prod-3.jpg',
  'Spices & Masalas': '/products/photos/spices-cloves.jpg',
  'Whole Spices & Seeds': '/products/photos/spices-cloves.jpg',
  'Sunflower Oil': '/products/prod-3.jpg',
  'Groundnut & Other Oils': '/products/photos/cooking-oil.jpg',
  'Deepam & Pooja Oil': '/products/photos/pooja-camphor.jpg',
  'Pure Ghee': '/products/photos/ghee.jpg',

  // Dairy Bakery
  'Milk & Curd': '/products/prod-4.jpg',
  'Ice Creams & Frozen Treats': '/categories/dairy-bread-eggs.jpg',
  'Bread & Bakery': '/products/prod-5.jpg',
  'Eggs': '/products/prod-4.jpg',

  // Snacks
  'Biscuits & Cookies': '/products/photos/biscuits-pack.jpg',
  'Chips & Namkeen': '/products/photos/chips-namkeen.jpg',
  'Chocolates & Sweets': '/products/prod-41.jpg',
  'Dry Fruits & Nuts': '/products/photos/cashews.jpg',
  'Papads & Fryums': '/products/photos/chips-namkeen.jpg',
  'Instant Noodles & Pasta': '/products/prod-22.jpg',

  // Beverages
  'Tea & Chai': '/products/prod-26.jpg',
  'Instant Coffee': '/products/prod-28.jpg',
  'Cold Drinks & Soda': '/products/photos/cold-drink-bottle.jpg',
  'Health Drinks': '/products/prod-30.jpg',

  // Personal Care
  'Bath Soaps': '/products/prod-31.jpg',
  'Oral Care': '/products/prod-10.jpg',
  'Hair Care & Shampoo': '/products/prod-35.jpg',
  'Hair Care': '/products/prod-35.jpg',
  'Skincare & Hygiene': '/products/prod-43.jpg',

  // Household
  'Detergent & Fabric Care': '/products/prod-9.jpg',
  'Dishwash & Kitchen': '/products/prod-37.jpg',
  'Floor & Cleaners': '/products/prod-39.jpg',
  'Pooja Needs': '/products/photos/pooja-camphor.jpg',
  'Home Utilities & Stationery': '/products/photos/cleaning-wash.jpg',
  'Home Utilities': '/products/photos/cleaning-wash.jpg',

  // Fruits & Veg
  'Daily Vegetables': '/products/prod-13.jpg',
  'Fresh Produce & Fruits': '/products/prod-11.jpg',
};

export default function CategoryDashboardClient({ category, allCategories, products }: Props) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

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

  return (
    <div className="space-y-4 pb-24 sm:pb-16 pt-2 sm:pt-4 px-2 sm:px-0">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl leading-none">{category.icon}</span>
              <h1 className="text-base sm:text-xl font-extrabold text-[#212121] tracking-tight">
                {category.name}
              </h1>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Showing {filteredProducts.length} of {products.length} products · Express delivery in 30 mins
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

      {/* Main 2-Column Blinkit Category Dashboard Layout */}
      <div className="flex items-start gap-3 sm:gap-5">
        {/* Left Vertical Subcategory Rail (Matching Blinkit Image 3) */}
        <aside className="w-24 sm:w-32 md:w-44 shrink-0 bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden sticky top-20 self-start max-h-[calc(100vh-6.5rem)] overflow-y-auto no-scrollbar">
          <div className="p-2 border-b border-stone-100">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block px-1">
              Subcategories
            </span>
          </div>

          <div className="p-1.5 space-y-1">
            {/* All Products Option */}
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`w-full text-left p-2 rounded-xl flex flex-col items-center gap-1 transition-all text-center ${
                selectedSubCategory === 'all'
                  ? 'bg-[#E8F5E9] text-[#1B5E20] font-extrabold border-l-4 border-[#2E7D32] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-50 font-semibold'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-lg shadow-2xs">
                {category.icon}
              </div>
              <span className="text-[11px] leading-tight line-clamp-2">
                All ({products.length})
              </span>
            </button>

            {/* Individual Subcategories */}
            {subcategories.map((sub) => {
              const count = subCatCounts[sub] || 0;
              const thumb = SUBCAT_THUMBNAILS[sub] || category.image || '/products/photos/test-rice.jpg';
              const isSelected = selectedSubCategory === sub;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`w-full p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? 'bg-[#E8F5E9] text-[#1B5E20] font-extrabold border-l-4 border-[#2E7D32] shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-50 font-semibold'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-stone-200/80 overflow-hidden flex items-center justify-center p-1 shadow-2xs shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={sub}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://placehold.co/100x100/e8f5e9/2e7d32?text=' + encodeURIComponent(sub.slice(0, 3));
                      }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] leading-tight line-clamp-2">
                    {sub}
                  </span>
                  {count > 0 && (
                    <span className="text-[9px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick jump to other categories */}
          <div className="p-2 border-t border-stone-100 mt-2">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block px-1 mb-1">
              Other Stores
            </span>
            <div className="space-y-1">
              {allCategories
                .filter((c) => c.id !== category.id)
                .slice(0, 5)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.id}`}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] font-bold text-stone-600 hover:bg-[#E8F5E9]/50 hover:text-[#2E7D32] transition-colors"
                  >
                    <span>{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                  </Link>
                ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area (Matching Blinkit Image 3) */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* Subcategory Banner */}
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-stone-200/70">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121]">
                {selectedSubCategory === 'all' ? `All ${category.name}` : selectedSubCategory}
              </h2>
              <span className="text-xs text-stone-500 font-semibold">
                {filteredProducts.length} items found
              </span>
            </div>

            {selectedSubCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedSubCategory('all')}
                className="text-xs font-bold text-[#2E7D32] hover:underline"
              >
                View all ({products.length})
              </button>
            )}
          </div>

          {/* Product Cards Grid with Real Photographic FMCG Cutouts */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
              <span className="text-4xl">📦</span>
              <h3 className="text-base font-bold text-stone-800">
                No items in this subcategory yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We are actively adding fresh stocks to this shelf. Check out other items in {category.name}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedSubCategory('all')}
                className="inline-block px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition-colors"
              >
                View All {category.name}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
