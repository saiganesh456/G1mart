import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';

export const CategoryScreen: React.FC = () => {
  const {
    products,
    selectedCategoryId,
    setSelectedCategoryId,
  } = useApp();

  const currentCategory =
    INITIAL_CATEGORIES.find((c) => c.id === selectedCategoryId) ||
    INITIAL_CATEGORIES[0];

  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');

  // Filter products by selected category and subcategory
  const categoryProducts = products.filter((p) => {
    if (p.category !== currentCategory.id) return false;
    if (activeSubcategory !== 'All' && p.subCategory !== activeSubcategory) {
      return false;
    }
    return true;
  });

  const gridClass =
    'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

  return (
    <div className="flex-1 pb-20 flex flex-col space-y-4 select-none">
      {/* Category Horizontal Header (visible on mobile/tablet < lg) */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-stone-200/80 -mx-3.5 px-3.5 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {INITIAL_CATEGORIES.map((cat) => {
            const isSelected = cat.id === currentCategory.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setActiveSubcategory('All');
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>
                  {cat.id === 'fruits-vegetables' && '🥦'}
                  {cat.id === 'dairy-bakery' && '🥛'}
                  {cat.id === 'rice-dal-atta' && '🌾'}
                  {cat.id === 'snacks' && '🍪'}
                  {cat.id === 'beverages' && '☕'}
                  {cat.id === 'personal-care' && '✨'}
                  {cat.id === 'household' && '🏠'}
                  {cat.id === 'baby-care' && '👶'}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Header Banner with Subcategory Filter Tabs */}
      <div className="bg-gradient-to-r from-[#2E7D32]/10 via-[#66BB6A]/10 to-stone-50 rounded-2xl p-4 sm:p-6 border border-[#2E7D32]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">
                {currentCategory.id === 'fruits-vegetables' && '🥦'}
                {currentCategory.id === 'dairy-bakery' && '🥛'}
                {currentCategory.id === 'rice-dal-atta' && '🌾'}
                {currentCategory.id === 'snacks' && '🍪'}
                {currentCategory.id === 'beverages' && '☕'}
                {currentCategory.id === 'personal-care' && '✨'}
                {currentCategory.id === 'household' && '🏠'}
                {currentCategory.id === 'baby-care' && '👶'}
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-[#212121]">
                {currentCategory.name}
              </h1>
            </div>
            <p className="text-xs text-stone-500">
              Showing {categoryProducts.length} fresh items delivered in 15-30 minutes
            </p>
          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setActiveSubcategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSubcategory === 'All'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              All {currentCategory.name.split(' ')[0]}
            </button>
            {currentCategory.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setActiveSubcategory(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeSubcategory === sub
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {categoryProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8">
          <p className="text-sm font-semibold text-stone-600">
            No products found in this subcategory right now.
          </p>
          <button
            type="button"
            onClick={() => setActiveSubcategory('All')}
            className="mt-3 px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold"
          >
            Show All {currentCategory.name}
          </button>
        </div>
      ) : (
        <div className={gridClass}>
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
