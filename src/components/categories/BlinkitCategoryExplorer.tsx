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
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
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

  // Brands available for current category & subcategory
  const availableBrands = useMemo(() => {
    let baseList = categoryProducts;
    if (selectedSubCategory !== 'all') {
      baseList = baseList.filter((p) => p.subCategory === selectedSubCategory);
    }
    const brandMap = new Map<string, number>();
    baseList.forEach((p) => {
      const b = p.brand || 'Local / Unbranded';
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });
    return Array.from(brandMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [categoryProducts, selectedSubCategory]);

  // Filtered products by subcategory, brand, and search query
  const displayedProducts = useMemo(() => {
    let list = categoryProducts;
    if (selectedSubCategory !== 'all') {
      list = list.filter((p) => p.subCategory === selectedSubCategory);
    }
    if (selectedBrand !== 'all') {
      list = list.filter((p) => (p.brand || 'Local / Unbranded') === selectedBrand);
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
  }, [categoryProducts, selectedSubCategory, selectedBrand, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    setSelectedSubCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] bg-white overflow-hidden">
      {/* ── Left Category Rail (Blinkit Style, ~72px mobile) ── */}
      <aside className="w-[72px] sm:w-56 shrink-0 bg-white border-r border-stone-100 overflow-y-auto no-scrollbar flex flex-col py-1.5 select-none">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`relative px-1 py-2 sm:px-4 sm:py-3.5 flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left transition-all cursor-pointer ${
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
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg p-0.5 flex items-center justify-center shrink-0 transition-transform overflow-hidden ${
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
                  <span className="text-lg">🛍️</span>
                )}
              </div>

              {/* Title & Count */}
              <div className="mt-1 sm:mt-0 min-w-0">
                <span
                  className={`text-[10px] sm:text-xs leading-tight line-clamp-2 block text-center sm:text-left ${
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
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Category Header & Filters (No search bar per Stage 2 Owner Rules) */}
        <div className="p-2 sm:p-4 border-b border-stone-100 space-y-2 shrink-0 bg-white">
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
                onClick={() => {
                  setSelectedSubCategory('all');
                  setSelectedBrand('all');
                }}
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
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setSelectedBrand('all');
                  }}
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

          {/* Brand Filter Shelf (e.g. Santoor, Mysore Sandal, Cinthol, etc.) */}
          {availableBrands.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider shrink-0 px-1">
                Brand:
              </span>
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className={`shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedBrand === 'all'
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/70'
                }`}
              >
                All Brands
              </button>
              {availableBrands.map(([bName, bCount]) => (
                <button
                  key={bName}
                  type="button"
                  onClick={() => setSelectedBrand(bName)}
                  className={`shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedBrand === bName
                      ? 'bg-[#2E7D32] text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/70'
                  }`}
                >
                  <span>{bName}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                      selectedBrand === bName ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {bCount}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Products Grid with Clean Packshots */}
        <div className="flex-1 overflow-y-auto p-1.5 sm:p-4 min-w-0">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-3.5 pb-8 min-w-0">
              {displayedProducts.map((product) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
