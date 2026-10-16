'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, X, Check, Search, ChevronDown, IndianRupee } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import InnerPageHeader from '@/components/layout/InnerPageHeader';
import { useLocation } from '@/context/LocationContext';
import type { Category, Product } from '@/types';

interface Props {
  category: Category;
  allCategories: Category[];
  products: Product[];
}

/**
 * STRICT CATEGORY ENFORCEMENT
 * Products are pre-filtered by category_id in page.tsx (server-side).
 * This client component applies an additional guard to guarantee no
 * cross-category leakage happens, regardless of sub_category label mismatches.
 */
function isProductInCategory(p: Product, categoryId: string): boolean {
  const catId = p.category_id || p.category;
  return catId === categoryId;
}

/**
 * Checks if a brand is G1Mart private label or generic unbranded.
 */
function isG1MartOrLocal(brand?: string | null): boolean {
  if (!brand) return true;
  const b = brand.trim().toLowerCase();
  return (
    b === 'g1 mart' ||
    b === 'g1mart' ||
    b === 'g1 mart fresh' ||
    b === 'g1 mart loose staples' ||
    b === 'g1 mart hygiene' ||
    b === 'g1 mart utility' ||
    b === 'g1 mart puja' ||
    b === 'g1 mart puja essentials' ||
    b === 'g1 mart kitchenware' ||
    b === 'local / unbranded' ||
    b === 'unbranded' ||
    b === 'staples' ||
    b.startsWith('g1 mart') ||
    b.startsWith('g1mart')
  );
}

export default function CategoryDashboardClient({ category, products }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');
  const { currentLocation } = useLocation();

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-100' | '100-200' | 'above-200'>('all');

  // Filter Modals
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Ref to scroll products to top on subcategory or filter change
  const productContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (brandParam) setSelectedBrand(brandParam);
  }, [brandParam]);

  // Base list: enforce strict category membership
  const categoryProducts = useMemo(
    () => products.filter((p) => isProductInCategory(p, category.id)),
    [category.id, products]
  );

  // Extract clean sub-categories for this category only
  const subCategoriesWithImage = useMemo(() => {
    interface SubInfo {
      name: string;
      image: string | null;
      count: number;
      isBrandedImage: boolean;
    }
    const subMap = new Map<string, SubInfo>();

    categoryProducts.forEach((p) => {
      const sub = p.subCategory || (p as any).sub_category;
      if (!sub || sub === 'General' || sub === 'General Essentials') {
        return;
      }

      const existing = subMap.get(sub);
      const isBranded = !isG1MartOrLocal(p.brand);
      const hasVerifiedImg = Boolean(
        (p.image_status === 'verified' || (p as any).imageStatus === 'verified' || (p as any).imageStatus === 'VERIFIED') &&
        ((p.image_url && !p.image_url.includes('placeholder')) || (p.imageUrl && !p.imageUrl.includes('placeholder')))
      );
      const img = (p.image_url && !p.image_url.includes('placeholder')) ? p.image_url
        : (p.imageUrl && !p.imageUrl.includes('placeholder')) ? p.imageUrl
        : null;

      if (!existing) {
        subMap.set(sub, { name: sub, image: img, count: 1, isBrandedImage: isBranded && hasVerifiedImg });
      } else {
        existing.count += 1;
        if (isBranded && hasVerifiedImg && (!existing.isBrandedImage || !existing.image)) {
          existing.image = img;
          existing.isBrandedImage = true;
        } else if (!existing.image && img) {
          existing.image = img;
        }
      }
    });

    return Array.from(subMap.values()).sort((a, b) => b.count - a.count);
  }, [category.id, categoryProducts]);

  // Filter by selected sub-category
  const subFilteredProducts = useMemo(() => {
    if (selectedSubCategory === 'all') return categoryProducts;
    return categoryProducts.filter((p) => {
      const sub = p.subCategory || (p as any).sub_category;
      return sub === selectedSubCategory;
    });
  }, [categoryProducts, selectedSubCategory]);

  // Available brands in the currently selected subcategory
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    let g1MartCount = 0;
    let localCount = 0;

    subFilteredProducts.forEach((p) => {
      const b = p.brand?.trim();
      const isG1 = b && (b.toLowerCase().includes('g1') || b.toLowerCase().includes('g1mart'));
      const isLocal = !b || /local\s*\/?\s*unbranded/i.test(b) || /^unbranded$/i.test(b);

      if (isG1) {
        g1MartCount += 1;
      } else if (isLocal) {
        localCount += 1;
      } else if (b) {
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });

    const brands = Array.from(brandMap.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => {
        if (a[0].toLowerCase() === 'aashirvaad') return -1;
        if (b[0].toLowerCase() === 'aashirvaad') return 1;
        return b[1] - a[1];
      });

    return { brands, g1MartCount, localCount };
  }, [subFilteredProducts]);

  // Final filtered products
  const displayedProducts = useMemo(() => {
    let list = subFilteredProducts;

    // 1. Brand filtering
    if (selectedBrand === 'g1-mart' || selectedBrand === 'jeevan-mart') {
      list = list.filter((p) => {
        const b = p.brand?.trim();
        return b && (b.toLowerCase().includes('g1') || b.toLowerCase().includes('g1mart'));
      });
    } else if (selectedBrand === 'local') {
      list = list.filter((p) => {
        const b = p.brand?.trim();
        return !b || /local\s*\/?\s*unbranded/i.test(b) || /^unbranded$/i.test(b);
      });
    } else if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand?.trim() === selectedBrand);
    }

    // 2. Price filtering
    if (priceFilter === 'under-100') {
      list = list.filter((p) => p.price < 100);
    } else if (priceFilter === '100-200') {
      list = list.filter((p) => p.price >= 100 && p.price <= 200);
    } else if (priceFilter === 'above-200') {
      list = list.filter((p) => p.price > 200);
    }

    // 3. Sorting & Hierarchy
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;

      const aIsG1 = isG1MartOrLocal(a.brand);
      const bIsG1 = isG1MartOrLocal(b.brand);

      if (aIsG1 !== bIsG1) {
        return aIsG1 ? 1 : -1;
      }

      const aHasImg = (a.image_status === 'verified' || (a as any).imageStatus === 'verified' || (a as any).imageStatus === 'VERIFIED') &&
        ((a.image_url && !a.image_url.includes('placeholder')) || (a.imageUrl && !a.imageUrl.includes('placeholder'))) ? 1 : 0;
      const bHasImg = (b.image_status === 'verified' || (b as any).imageStatus === 'verified' || (b as any).imageStatus === 'VERIFIED') &&
        ((b.image_url && !b.image_url.includes('placeholder')) || (b.imageUrl && !b.imageUrl.includes('placeholder'))) ? 1 : 0;
      if (aHasImg !== bHasImg) return bHasImg - aHasImg;

      const aBrand = (a.brand || '').toLowerCase();
      const bBrand = (b.brand || '').toLowerCase();
      if (aBrand === 'aashirvaad' && bBrand !== 'aashirvaad') return -1;
      if (bBrand === 'aashirvaad' && aBrand !== 'aashirvaad') return 1;

      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [subFilteredProducts, selectedBrand, priceFilter, sortBy]);

  const handleSelectSubCategory = (subName: string) => {
    setSelectedSubCategory(subName);
    setSelectedBrand('all'); // reset brand when subcategory changes to prevent 0 results
    setPriceFilter('all');
    productContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setIsBrandModalOpen(false);
    productContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSortSelect = (sort: 'popular' | 'price-asc' | 'price-desc') => {
    setSortBy(sort);
    setIsSortModalOpen(false);
    productContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handlePriceSelect = (price: 'all' | 'under-100' | '100-200' | 'above-200') => {
    setPriceFilter(price);
    setIsPriceModalOpen(false);
    productContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Filtered brands for the modal search
  const filteredBrandsList = useMemo(() => {
    const query = brandSearchQuery.trim().toLowerCase();
    if (!query) return availableBrands.brands;
    return availableBrands.brands.filter(([bName]) => bName.toLowerCase().includes(query));
  }, [availableBrands.brands, brandSearchQuery]);

  const currentBrandLabel = useMemo(() => {
    if (selectedBrand === 'all') return null;
    if (selectedBrand === 'g1-mart' || selectedBrand === 'jeevan-mart') return 'G1Mart';
    if (selectedBrand === 'local') return 'Local';
    return selectedBrand;
  }, [selectedBrand]);

  const currentPriceLabel = useMemo(() => {
    if (priceFilter === 'all') return null;
    if (priceFilter === 'under-100') return '< ₹100';
    if (priceFilter === '100-200') return '₹100 - ₹200';
    if (priceFilter === 'above-200') return '> ₹200';
    return null;
  }, [priceFilter]);

  const shortAddress = useMemo(() => {
    if (!currentLocation) return undefined;
    return (
      currentLocation.area ||
      currentLocation.street ||
      (currentLocation.formattedAddress ? currentLocation.formattedAddress.split(',')[0] : undefined)
    );
  }, [currentLocation]);

  const hasAnyFilterActive = selectedBrand !== 'all' || sortBy !== 'popular' || priceFilter !== 'all';

  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-10 flex flex-col bg-[var(--g1-bg)] overflow-hidden lg:static lg:h-[calc(100vh-80px)]">
      {/* 1. Top Header: 56px sticky inner header (back button + title + location subtitle + search + cart) */}
      <div className="shrink-0">
        <InnerPageHeader
          title={category.name}
          subtitle={shortAddress ? `Delivering to : ${shortAddress}` : undefined}
          showSearch
          onSearchClick={() => router.push('/search')}
        />
      </div>

      {/* 2. Blinkit-style Compact Filter Bar (Height: 42px, single row, compact pills) */}
      <div
        className="shrink-0 h-11 px-3 bg-[var(--g1-bg)] border-b flex items-center justify-between gap-2 overflow-x-auto no-scrollbar"
        style={{ borderColor: 'var(--g1-border)' }}
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Brand Filter Pill */}
          {selectedBrand === 'all' ? (
            <button
              type="button"
              onClick={() => {
                setBrandSearchQuery('');
                setIsBrandModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--g1-surface)] text-[var(--g1-text)] border border-[var(--g1-border)] hover:bg-stone-100 transition-colors shrink-0 cursor-pointer g1-press"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--g1-text-secondary)]" />
              <span>Brand</span>
              <ChevronDown className="w-3 h-3 text-[var(--g1-text-secondary)]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--g1-primary)] text-white shadow-sm shrink-0">
              <span
                onClick={() => {
                  setBrandSearchQuery('');
                  setIsBrandModalOpen(true);
                }}
                className="cursor-pointer"
              >
                {currentBrandLabel}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBrand('all');
                }}
                className="w-4 h-4 ml-1 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                aria-label="Remove brand filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Sort Pill */}
          {sortBy === 'popular' ? (
            <button
              type="button"
              onClick={() => setIsSortModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--g1-surface)] text-[var(--g1-text)] border border-[var(--g1-border)] hover:bg-stone-100 transition-colors shrink-0 cursor-pointer g1-press"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--g1-text-secondary)]" />
              <span>Sort</span>
              <ChevronDown className="w-3 h-3 text-[var(--g1-text-secondary)]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--g1-primary)] text-white shadow-sm shrink-0">
              <span onClick={() => setIsSortModalOpen(true)} className="cursor-pointer">
                {sortBy === 'price-asc' ? 'Price ↑' : 'Price ↓'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSortBy('popular');
                }}
                className="w-4 h-4 ml-1 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                aria-label="Reset sort"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Price Filter Pill */}
          {priceFilter === 'all' ? (
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--g1-surface)] text-[var(--g1-text)] border border-[var(--g1-border)] hover:bg-stone-100 transition-colors shrink-0 cursor-pointer g1-press"
            >
              <span>Price</span>
              <ChevronDown className="w-3 h-3 text-[var(--g1-text-secondary)]" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--g1-primary)] text-white shadow-sm shrink-0">
              <span onClick={() => setIsPriceModalOpen(true)} className="cursor-pointer">
                {currentPriceLabel}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPriceFilter('all');
                }}
                className="w-4 h-4 ml-1 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                aria-label="Remove price filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Reset all active filters button */}
          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('all');
                setSortBy('popular');
                setPriceFilter('all');
              }}
              className="text-xs text-[var(--g1-primary)] font-bold hover:underline shrink-0 ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Item count badge */}
        <span className="text-[11px] font-medium text-[var(--g1-text-secondary)] shrink-0 whitespace-nowrap pl-2">
          {displayedProducts.length} items
        </span>
      </div>

      {/* 3. Main Split-Pane Viewport: Left Sidebar (Constant) + Right Products Grid (Scrolling) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left rail: 76px width, CONSTANT / INDEPENDENT SCROLL, never moves when right side scrolls */}
        <aside
          className="w-[76px] sm:w-20 shrink-0 h-full overflow-y-auto no-scrollbar bg-[var(--g1-surface)] border-r flex flex-col py-2 select-none"
          style={{ borderColor: 'var(--g1-border)' }}
        >
          {/* "All" subcategory button */}
          <button
            type="button"
            onClick={() => handleSelectSubCategory('all')}
            className="relative w-full py-2.5 px-1 flex flex-col items-center justify-center transition-all cursor-pointer g1-press"
            style={{
              backgroundColor: selectedSubCategory === 'all' ? 'var(--g1-bg)' : 'transparent',
            }}
          >
            {selectedSubCategory === 'all' && (
              <div
                className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-md"
                style={{ backgroundColor: 'var(--g1-primary)' }}
              />
            )}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden"
              style={{
                backgroundColor: selectedSubCategory === 'all' ? 'var(--g1-primary-tint)' : 'var(--g1-bg)',
                border: `1.5px solid ${selectedSubCategory === 'all' ? 'var(--g1-primary)' : 'var(--g1-border)'}`,
              }}
            >
              {category.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={category.image} alt="All" className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-xs font-bold" style={{ color: 'var(--g1-primary)' }}>All</span>
              )}
            </div>
            <span
              className="text-[11px] mt-1 text-center leading-tight px-0.5 line-clamp-2"
              style={{
                fontWeight: selectedSubCategory === 'all' ? 700 : 500,
                color: selectedSubCategory === 'all' ? 'var(--g1-primary)' : 'var(--g1-text)',
              }}
            >
              All
            </span>
          </button>

          {/* Sub-categories */}
          {subCategoriesWithImage.map((sub) => {
            const isSelected = selectedSubCategory === sub.name;
            return (
              <button
                key={sub.name}
                type="button"
                onClick={() => handleSelectSubCategory(sub.name)}
                className="relative w-full py-2.5 px-1 flex flex-col items-center justify-center transition-all cursor-pointer g1-press"
                style={{
                  backgroundColor: isSelected ? 'var(--g1-bg)' : 'transparent',
                }}
              >
                {isSelected && (
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-md"
                    style={{ backgroundColor: 'var(--g1-primary)' }}
                  />
                )}
                {/* 48px circle image */}
                <div
                  className="w-12 h-12 rounded-full p-1 flex items-center justify-center transition-all overflow-hidden"
                  style={{
                    backgroundColor: isSelected ? 'var(--g1-primary-tint)' : 'var(--g1-bg)',
                    border: `1.5px solid ${isSelected ? 'var(--g1-primary)' : 'var(--g1-border)'}`,
                  }}
                >
                  {sub.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sub.image} alt={sub.name} className="w-8 h-8 object-contain select-none" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)' }}
                    >
                      {sub.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* 11px label */}
                <span
                  className="text-[11px] mt-1 text-center leading-tight px-0.5 line-clamp-2"
                  style={{
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--g1-primary)' : 'var(--g1-text)',
                  }}
                >
                  {sub.name}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Right Main: INDEPENDENT PRODUCT SCROLL (Smooth 2-column Blinkit-style grid) */}
        <main
          ref={productContainerRef}
          className="flex-1 h-full overflow-y-auto overscroll-contain p-2 sm:p-3 pb-32"
        >
          {/* Subcategory title banner */}
          <div className="mb-2 pb-1.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--g1-border)' }}>
            <h2 className="text-xs font-bold text-[var(--g1-text)]">
              {selectedSubCategory === 'all' ? `All in ${category.name}` : selectedSubCategory}
            </h2>
            <span className="text-[11px] text-[var(--g1-text-secondary)]">
              {displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 min-w-0">
              {displayedProducts.map((p) => (
                <ProductCard key={`${p.id}::${selectedBrand}::${priceFilter}`} product={p} compact />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--g1-surface)' }}
              >
                <span className="text-xl">📦</span>
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--g1-text)' }}>No products found</h3>
              <p className="text-xs max-w-xs" style={{ color: 'var(--g1-text-secondary)' }}>
                No products match the selected filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedSubCategory('all');
                  setSortBy('popular');
                  setPriceFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white g1-press cursor-pointer"
                style={{ backgroundColor: 'var(--g1-primary)' }}
              >
                Show All Products
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BRAND FILTER BOTTOM SHEET MODAL
      ══════════════════════════════════════════════════════════ */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsBrandModalOpen(false)}
          />

          {/* Modal Container */}
          <div
            className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Filter by Brand</h3>
                <p className="text-xs text-stone-500">
                  {category.name} ({subFilteredProducts.length} items)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
                aria-label="Close brand filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Brand Search Bar */}
            <div className="p-3 border-b border-stone-100 bg-stone-50/60">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                  placeholder="Search brands (e.g. Dove, Sunsilk)..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-[var(--g1-primary)] transition-colors"
                />
                {brandSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBrandSearchQuery('')}
                    className="absolute right-2.5 p-0.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Brand List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-stone-100">
              {/* Option: All Brands */}
              {!brandSearchQuery && (
                <button
                  type="button"
                  onClick={() => handleBrandSelect('all')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    selectedBrand === 'all'
                      ? 'bg-[var(--g1-primary-tint)] font-bold text-[var(--g1-primary)]'
                      : 'hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedBrand === 'all'
                          ? 'border-[var(--g1-primary)] bg-[var(--g1-primary)]'
                          : 'border-stone-300'
                      }`}
                    >
                      {selectedBrand === 'all' && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs">All Brands</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {subFilteredProducts.length} items
                  </span>
                </button>
              )}

              {/* Option: G1Mart Private Label */}
              {availableBrands.g1MartCount > 0 &&
                (!brandSearchQuery || 'g1mart'.includes(brandSearchQuery.toLowerCase()) || 'g1 mart'.includes(brandSearchQuery.toLowerCase())) && (
                  <button
                    type="button"
                    onClick={() => handleBrandSelect('g1-mart')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedBrand === 'g1-mart'
                        ? 'bg-[var(--g1-primary-tint)] font-bold text-[var(--g1-primary)]'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedBrand === 'g1-mart'
                            ? 'border-[var(--g1-primary)] bg-[var(--g1-primary)]'
                            : 'border-stone-300'
                        }`}
                      >
                        {selectedBrand === 'g1-mart' && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs">G1Mart</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {availableBrands.g1MartCount} items
                    </span>
                  </button>
                )}

              {/* Individual Brands */}
              {filteredBrandsList.map(([bName, bCount]) => {
                const isSelected = selectedBrand === bName;
                return (
                  <button
                    key={bName}
                    type="button"
                    onClick={() => handleBrandSelect(bName)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--g1-primary-tint)] font-bold text-[var(--g1-primary)]'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[var(--g1-primary)] bg-[var(--g1-primary)]'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs">{bName}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {bCount} {bCount === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                );
              })}

              {/* Option: Local / Unbranded */}
              {availableBrands.localCount > 0 &&
                (!brandSearchQuery || 'local'.includes(brandSearchQuery.toLowerCase())) && (
                  <button
                    type="button"
                    onClick={() => handleBrandSelect('local')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedBrand === 'local'
                        ? 'bg-[var(--g1-primary-tint)] font-bold text-[var(--g1-primary)]'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedBrand === 'local'
                            ? 'border-[var(--g1-primary)] bg-[var(--g1-primary)]'
                            : 'border-stone-300'
                        }`}
                      >
                        {selectedBrand === 'local' && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs">Local / Unbranded</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {availableBrands.localCount} items
                    </span>
                  </button>
                )}

              {filteredBrandsList.length === 0 && (
                <div className="py-8 text-center text-xs text-stone-400">
                  No brands found matching &quot;{brandSearchQuery}&quot;
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleBrandSelect('all')}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white cursor-pointer g1-press"
                style={{ backgroundColor: 'var(--g1-primary)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SORT OPTIONS BOTTOM SHEET MODAL
      ══════════════════════════════════════════════════════════ */}
      {isSortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsSortModalOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-xs bg-white rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">Sort By</h3>
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 space-y-1">
              {[
                { id: 'popular', label: 'Popularity (Default)' },
                { id: 'price-asc', label: 'Price: Low to High' },
                { id: 'price-desc', label: 'Price: High to Low' },
              ].map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSortSelect(opt.id as typeof sortBy)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--g1-primary-tint)] font-bold text-[var(--g1-primary)]'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--g1-primary)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PRICE FILTER BOTTOM SHEET MODAL
      ══════════════════════════════════════════════════════════ */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsPriceModalOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-xs bg-white rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900">Filter by Price</h3>
              <button
                type="button"
                onClick={() => setIsPriceModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 space-y-1">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-100', label: 'Under ₹100' },
                { id: '100-200', label: '₹100 - ₹200' },
                { id: 'above-200', label: 'Above ₹200' },
              ].map((opt) => {
                const isSelected = priceFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePriceSelect(opt.id as typeof priceFilter)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--g1-primary-tint)] font-bold text-[var(--g1-primary)]'
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--g1-primary)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
