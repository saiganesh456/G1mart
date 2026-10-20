'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category } from '@/types';
import {
  ArrowLeft,
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
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  Plus,
} from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
  onViewProduct: (product: Product) => void;
  onAddNewProduct?: () => void;
  onQuickToggleStock?: (productId: string, inStock: boolean) => void;
  initialStockFilter?: string;
  onStockFilterChange?: (filter: string) => void;
  onBackToDashboard?: () => void;
}

export default function InventoryTab({
  products,
  categories,
  onViewProduct,
  onAddNewProduct,
  onQuickToggleStock,
  initialStockFilter = 'All',
  onStockFilterChange,
  onBackToDashboard,
}: Props) {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState(initialStockFilter);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    if (initialStockFilter && initialStockFilter !== stockFilter) {
      setStockFilter(initialStockFilter);
    }
  }, [initialStockFilter]);

  // Stock counts
  const totalCount = products.length;
  const inStockCount = useMemo(
    () => products.filter((p) => p.inStock && (p.stockCount === undefined || p.stockCount > 0)).length,
    [products]
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.inStock && p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 5).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => !p.inStock || p.stockCount === 0).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        const matchId = (p.id || '').toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCat && !matchId && !matchSku) return false;
      }

      // 2. Stock Filter
      if (stockFilter === 'In Stock' && (!p.inStock || p.stockCount === 0)) return false;
      if (stockFilter === 'Low Stock' && (!p.inStock || p.stockCount === undefined || p.stockCount > 5 || p.stockCount === 0)) {
        return false;
      }
      if (stockFilter === 'Out of Stock' && p.inStock && (p.stockCount === undefined || p.stockCount > 0)) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      return true;
    });
  }, [products, search, stockFilter, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full bg-[#F4F6F9] p-3 sm:p-5 pb-32 space-y-4">
      {/* 1. TOP HEADER & SEARCH CARD */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                title="Back to Admin Dashboard Home"
              >
                <ArrowLeft className="w-4 h-4 text-stone-600" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
                Stock &amp; Price Control
              </h1>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Showing {filteredProducts.length} of {totalCount} supermarket products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onAddNewProduct && (
              <button
                type="button"
                onClick={onAddNewProduct}
                className="flex-1 sm:flex-initial h-10 px-4 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>＋ Add Product</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilterDrawer(true)}
              className="sm:hidden h-10 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>Categories</span>
            </button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by product name, brand, SKU (e.g. Atta, Oil, Salt)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#087F5B] focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'All', label: 'All Products', count: totalCount },
            { key: 'In Stock', label: 'In Stock', count: inStockCount },
            { key: 'Out of Stock', label: 'Out of Stock', count: outOfStockCount },
            { key: 'Low Stock', label: 'Low Stock', count: lowStockCount },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setStockFilter(f.key);
                onStockFilterChange?.(f.key);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                stockFilter === f.key
                  ? 'bg-[#087F5B] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  stockFilter === f.key ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop Category Filter Bar */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-stone-100 pt-2.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-stone-900 text-white'
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
              className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. COMPACT PRODUCT LIST (THE "SMALL VIEW SECTION") */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-black text-stone-800">No products match your search</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try searching for a different keyword or change category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const isOut = !product.inStock || product.stockCount === 0;
            const isLow = product.inStock && product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 5;
            const imgUrl = product.imageUrl || product.image || (product as any).image_url || '/products/placeholder.svg';

            return (
              <div
                key={product.id}
                onClick={() => onViewProduct(product)}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-stone-200/80 hover:border-[#087F5B]/50 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] group"
              >
                {/* Left: Product Thumbnail + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Small 52x52 thumbnail container (Not oversized!) */}
                  <div className="w-13 h-13 rounded-xl bg-stone-50 border border-stone-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {product.brand && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F5B] block truncate">
                        {product.brand}
                      </span>
                    )}
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-[#087F5B] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                      <span>{product.unit || '1 unit'}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-mono text-[10px] text-stone-400">#{product.id}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price + Stock Badge + Edit Button */}
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-sm sm:text-base font-black text-stone-900">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[11px] text-stone-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Compact Stock Badge with 1-Tap Toggle */}
                    <span
                      onClick={(e) => {
                        if (onQuickToggleStock) {
                          e.stopPropagation();
                          onQuickToggleStock(product.id, isOut);
                        }
                      }}
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 transition-transform active:scale-90 cursor-pointer ${
                        isOut
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : isLow
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title="Tap to toggle stock"
                    >
                      {isOut ? 'Out of Stock' : isLow ? `${product.stockCount} left` : 'In Stock'}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-stone-50 group-hover:bg-[#087F5B] group-hover:text-white text-stone-400 flex items-center justify-center transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MOBILE CATEGORY DRAWER BOTTOM SHEET */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto pb-10">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">Filter by Category</h3>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center cursor-pointer"
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
                className={`p-3 rounded-2xl text-xs font-bold text-left border cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#087F5B] text-white border-[#087F5B]'
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
                  className={`p-3 rounded-2xl text-xs font-bold text-left border truncate cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#087F5B] text-white border-[#087F5B]'
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
