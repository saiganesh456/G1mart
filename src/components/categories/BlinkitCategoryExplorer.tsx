'use client';

import { useState, useMemo } from 'react';
import { Category, Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import { Search, Sparkles, Filter } from 'lucide-react';

interface Props {
  categories: Category[];
  products: Product[];
}

export default function BlinkitCategoryExplorer({ categories, products }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id || 'grocery-staples'
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  // Products belonging to the active category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === activeCategoryId);
  }, [products, activeCategoryId]);

  // Subcategories available for active category
  const subCategories = useMemo(() => {
    const set = new Set<string>();
    categoryProducts.forEach((p) => {
      if (p.subCategory) set.add(p.subCategory);
    });
    return Array.from(set);
  }, [categoryProducts]);

  // Filtered products by subcategory and search query
  const displayedProducts = useMemo(() => {
    let list = categoryProducts;
    if (selectedSubCategory !== 'all') {
      list = list.filter((p) => p.subCategory === selectedSubCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }
    return list;
  }, [categoryProducts, selectedSubCategory, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    setSelectedSubCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] bg-white overflow-hidden">
      {/* ── Left Category Rail (Blinkit Style) ── */}
      <aside className="w-22 sm:w-56 shrink-0 bg-white border-r border-stone-100 overflow-y-auto no-scrollbar flex flex-col py-2 select-none">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`relative px-2 py-3 sm:px-4 sm:py-3.5 flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#2E7D32] font-black shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-[#2E7D32] rounded-r-md" />
              )}

              {/* Category Icon / Packshot */}
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-1 flex items-center justify-center shrink-0 transition-transform overflow-hidden ${
                  isActive ? 'bg-emerald-50 border-2 border-[#2E7D32] scale-105 shadow-2xs' : 'bg-white border border-stone-200/70'
                }`}
              >
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain select-none"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xl">🛍️</span>
                )}
              </div>

              {/* Title & Count */}
              <div className="mt-1 sm:mt-0 min-w-0">
                <span
                  className={`text-[11px] sm:text-xs leading-tight line-clamp-2 block ${
                    isActive ? 'font-black text-[#2E7D32]' : 'font-semibold text-stone-700'
                  }`}
                >
                  {cat.name}
                </span>
                <span className="hidden sm:block text-[10px] text-stone-400 font-medium mt-0.5">
                  {cat.itemCount} items
                </span>
              </div>
            </button>
          );
        })}
      </aside>

      {/* ── Right Content Area: Products Grid ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {/* Category Header & Filters (No search bar per Stage 2 Owner Rules) */}
        <div className="p-3 sm:p-4 border-b border-stone-100 space-y-2 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] leading-tight">
                {activeCategory?.name}
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                {displayedProducts.length} items with instant delivery
              </p>
            </div>
          </div>

          {/* Subcategory Pills Strip */}
          {subCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedSubCategory('all')}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
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
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
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
        </div>

        {/* Scrollable Products Grid with Clean Packshots */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4">
          {displayedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                <Search className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-sm font-bold text-stone-600">No items found</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Try clearing your search query or selecting a different subcategory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 pb-8">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
