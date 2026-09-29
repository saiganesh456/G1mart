import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';

type SortOption = 'relevance' | 'price_low_high' | 'price_high_low' | 'popularity';

export const SearchScreen: React.FC = () => {
  const { products, searchQuery, setSearchQuery, isMobileFrame } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [discountOnly, setDiscountOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(700);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  const gridClass = isMobileFrame
    ? 'grid grid-cols-2 gap-2.5'
    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

  const suggestions = [
    'Milk',
    'Atta',
    'Oil',
    'Salt',
    'Rice',
    'Bread',
    'Apples',
    'Toothpaste',
  ];

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCategory && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Availability filter
        if (inStockOnly && !p.inStock) {
          return false;
        }

        // Discount filter
        if (discountOnly && p.discountPercentage <= 0) {
          return false;
        }

        // Max price filter
        if (p.price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low_high') {
          return a.price - b.price;
        }
        if (sortBy === 'price_high_low') {
          return b.price - a.price;
        }
        if (sortBy === 'popularity') {
          return b.reviewsCount - a.reviewsCount;
        }
        // Relevance default
        return 0;
      });
  }, [products, searchQuery, selectedCategory, inStockOnly, discountOnly, maxPrice, sortBy]);

  return (
    <div className="flex-1 pb-24 flex flex-col">
      {/* Sticky Search Input & Control Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200/80 px-3.5 py-3 shadow-2xs space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#2E7D32] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries, fruits & essentials..."
            className="w-full h-11 pl-9 pr-9 bg-stone-100 rounded-xl text-xs sm:text-sm font-medium text-[#212121] placeholder-stone-400 outline-hidden focus:ring-2 focus:ring-[#2E7D32]/20 focus:bg-white border border-transparent focus:border-[#2E7D32] transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 w-5 h-5 rounded-full bg-stone-300 hover:bg-stone-400 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Horizontal Category Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#2E7D32] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Items
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#2E7D32] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Controls Row: Sort & Filter Toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-stone-100 text-stone-700 font-semibold py-1 px-2 rounded-lg border-0 outline-hidden cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setShowFilterDrawer(true)}
            className="flex items-center gap-1 text-[#2E7D32] font-bold py-1 px-2.5 rounded-lg bg-[#2E7D32]/10 hover:bg-[#2E7D32]/15 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {(inStockOnly || discountOnly || maxPrice < 700) ? '•' : ''}</span>
          </button>
        </div>
      </div>

      {/* Popular Suggestions (shown when query is empty) */}
      {!searchQuery && (
        <div className="px-3.5 py-3 border-b border-stone-200/50 bg-white">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
            Trending Searches in Hyderabad
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setSearchQuery(sug)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#2E7D32]/10 hover:text-[#2E7D32] text-stone-600 text-xs font-medium transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Area */}
      <div className="p-3.5 flex-1">
        <div className="flex items-center justify-between mb-3 text-xs text-stone-500">
          <span>
            Found <strong className="text-stone-800 tabular-nums">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
          {searchQuery && (
            <span className="truncate max-w-[160px]">for "{searchQuery}"</span>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className={gridClass}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* No Products Found State */
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#212121]">
              No products found
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1 leading-relaxed">
              We couldn't find matches for "{searchQuery}". Try searching for daily staples like milk, atta, oil, salt or bread.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setInStockOnly(false);
                setDiscountOnly(false);
                setMaxPrice(700);
              }}
              className="mt-4 px-4 py-2 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Reset Filters & Search
            </button>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet Drawer */}
      {showFilterDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0"
          onClick={() => setShowFilterDrawer(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-[#212121]">Filter Groceries</h3>
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(false);
                  setDiscountOnly(false);
                  setMaxPrice(700);
                  setSelectedCategory('all');
                }}
                className="text-xs font-semibold text-[#2E7D32]"
              >
                Reset All
              </button>
            </div>

            {/* Max Price Slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-stone-700">Max Price: ₹{maxPrice}</span>
                <span className="text-stone-400">Up to ₹700</span>
              </div>
              <input
                type="range"
                min={20}
                max={700}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#2E7D32]"
              />
            </div>

            {/* Availability Toggle */}
            <div className="mb-4 flex items-center justify-between py-2 border-t border-stone-100">
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  In Stock Only
                </span>
                <span className="text-[11px] text-stone-500">
                  Exclude unavailable or out of stock items
                </span>
              </div>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-5 h-5 accent-[#2E7D32] rounded"
              />
            </div>

            {/* Discount Toggle */}
            <div className="mb-6 flex items-center justify-between py-2 border-t border-stone-100">
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  Discounted Deals Only
                </span>
                <span className="text-[11px] text-stone-500">
                  Show products on sale with active discount
                </span>
              </div>
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => setDiscountOnly(e.target.checked)}
                className="w-5 h-5 accent-[#2E7D32] rounded"
              />
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={() => setShowFilterDrawer(false)}
              className="w-full h-11 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs rounded-xl shadow-md"
            >
              Apply Filters ({filteredProducts.length} Items)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
