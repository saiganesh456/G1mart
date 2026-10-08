import React, { useState } from 'react';
import { Product, Category } from '@/types';
import {
  Search,
  Filter,
  X,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import ProductImage from '@/components/storefront/ProductImage';

interface Props {
  products: Product[];
  categories: Category[];
  onViewProduct: (product: Product) => void;
  onQuickToggleStock?: (productId: string, inStock: boolean) => void;
  initialStockFilter?: string;
}

export default function InventoryTab({
  products,
  categories,
  onViewProduct,
  onQuickToggleStock,
  initialStockFilter = 'All',
}: Props) {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState(initialStockFilter);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Stock counts
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.inStock && p.stockCount > 0).length;
  const lowStockCount = products.filter(
    (p) => p.inStock && p.stockCount > 0 && p.stockCount <= 5
  ).length;
  const outOfStockCount = products.filter((p) => !p.inStock || p.stockCount === 0).length;

  const filteredProducts = products.filter((p) => {
    // 1. Search Query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      const matchRaw = (p.rawName || '').toLowerCase().includes(q);
      const matchItemNo = p.itemNumber && String(p.itemNumber).includes(q);
      if (!matchName && !matchBrand && !matchCat && !matchRaw && !matchItemNo) return false;
    }

    // 2. Stock Filter
    if (stockFilter === 'In Stock' && (!p.inStock || p.stockCount === 0)) return false;
    if (stockFilter === 'Low Stock' && (!p.inStock || p.stockCount > 5 || p.stockCount === 0))
      return false;
    if (stockFilter === 'Out of Stock' && p.inStock && p.stockCount > 0) return false;

    // 3. Category Filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full bg-[#F4F6F9] p-3 sm:p-6 pb-24">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Inventory &amp; Price Control
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              Showing {filteredProducts.length} of {totalCount} verified catalog items
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFilterDrawer(true)}
            className="sm:hidden px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Categories</span>
          </button>
        </div>

        {/* 4 Stock KPI Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setStockFilter('All')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              stockFilter === 'All'
                ? 'bg-emerald-50 border-emerald-500 shadow-2xs scale-101'
                : 'bg-stone-50 border-stone-200 hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Total Products
            </span>
            <p className="text-xl font-black text-stone-900 mt-0.5">{totalCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('In Stock')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              stockFilter === 'In Stock'
                ? 'bg-emerald-50 border-emerald-500 shadow-2xs scale-101'
                : 'bg-stone-50 border-stone-200 hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
              In Stock
            </span>
            <p className="text-xl font-black text-emerald-800 mt-0.5">{inStockCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('Low Stock')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              stockFilter === 'Low Stock'
                ? 'bg-amber-50 border-amber-500 shadow-2xs scale-101'
                : 'bg-stone-50 border-stone-200 hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block">
              Low Stock (≤ 5)
            </span>
            <p className="text-xl font-black text-amber-700 mt-0.5">{lowStockCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStockFilter('Out of Stock')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              stockFilter === 'Out of Stock'
                ? 'bg-rose-50 border-rose-500 shadow-2xs scale-101'
                : 'bg-stone-50 border-stone-200 hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">
              Out of Stock
            </span>
            <p className="text-xl font-black text-rose-700 mt-0.5">{outOfStockCount}</p>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by product name, brand, category or unit size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:bg-white transition-all"
          />
        </div>

        {/* Desktop Category Filters Bar */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#1B5E20] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-[#1B5E20] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid (1-col mobile, 2-col tablet, 3-4 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const isLow = product.inStock && product.stockCount > 0 && product.stockCount <= 5;
          const isOut = !product.inStock || product.stockCount === 0;

          return (
            <div
              key={product.id}
              onClick={() => onViewProduct(product)}
              className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group active:scale-[0.99]"
            >
              <div>
                {/* Product Packshot & Category Badge */}
                <div className="relative w-full aspect-square rounded-2xl bg-stone-50 border border-stone-100 p-3 flex items-center justify-center overflow-hidden mb-3 group-hover:border-emerald-200 transition-colors">
                  <ProductImage
                    imageUrl={product.image_url || product.imageUrl || product.image}
                    imageStatus={product.imageStatus || product.image_status || 'VERIFIED'}
                    alt={product.name}
                  />

                  {product.discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-2xs">
                      {product.discountPercentage}% OFF
                    </span>
                  )}

                  <span
                    className={`absolute bottom-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-2xs ${
                      isOut
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : isLow
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isOut ? 'Out of Stock' : isLow ? `Only ${product.stockCount} left` : `${product.stockCount} in stock`}
                  </span>
                </div>

                {/* Brand & Title */}
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-0.5 truncate">
                  {product.brand || 'G1 MART Brand'}
                </span>
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">{product.unit}</p>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-black text-stone-900">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-stone-400 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                {onQuickToggleStock && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickToggleStock(product.id, !product.inStock);
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold transition-colors ${
                      product.inStock
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black'
                    }`}
                  >
                    {product.inStock ? 'Mark Out' : 'Mark In Stock'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProduct(product);
                  }}
                  className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-8">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-stone-800">No Products Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search query or stock filter to view other catalog items.
          </p>
        </div>
      )}

      {/* Mobile Category Drawer Bottom Sheet */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto pb-10">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">Filter by Category</h3>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setShowFilterDrawer(false);
                }}
                className={`p-3 rounded-2xl text-xs font-bold text-left border ${
                  selectedCategory === 'All'
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                All Categories ({totalCount})
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setShowFilterDrawer(false);
                  }}
                  className={`p-3 rounded-2xl text-xs font-bold text-left border truncate ${
                    selectedCategory === c.id
                      ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
