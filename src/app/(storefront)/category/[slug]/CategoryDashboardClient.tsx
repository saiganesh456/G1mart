'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/storefront/ProductCard';
import InnerPageHeader from '@/components/layout/InnerPageHeader';
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
 *
 * Rule: A product belongs to this category page if and only if its
 * category_id OR category field equals the current category's id.
 * Sub-category labels are never used for category membership decisions.
 */
function isProductInCategory(p: Product, categoryId: string): boolean {
  const catId = p.category_id || p.category;
  return catId === categoryId;
}

/**
 * Checks if a brand is Jeevan Mart / G1 Mart private label or generic unbranded.
 */
function isJeevanMartOrLocal(brand?: string | null): boolean {
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
    b === 'jeevan mart' ||
    b === 'jeevan mart fresh' ||
    b === 'local / unbranded' ||
    b === 'unbranded' ||
    b === 'staples' ||
    b.startsWith('g1 mart') ||
    b.startsWith('jeevan mart')
  );
}

export default function CategoryDashboardClient({ category, products }: Props) {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  useEffect(() => {
    if (brandParam) setSelectedBrand(brandParam);
  }, [brandParam]);


  // Base list: enforce strict category membership (category_id must match)
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
      const isBranded = !isJeevanMartOrLocal(p.brand);
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
        // Prioritize branded visual packshots for subcategory tiles
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

  // Available brands for top chip row: All Brands, Branded Brands, Jeevan Mart, Local
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    let jeevanMartCount = 0;
    let localCount = 0;

    subFilteredProducts.forEach((p) => {
      const b = p.brand?.trim();
      const isJeevan = b && (b.toLowerCase().includes('g1') || b.toLowerCase().includes('jeevan'));
      const isLocal = !b || /local\s*\/?\s*unbranded/i.test(b) || /^unbranded$/i.test(b);

      if (isJeevan) {
        jeevanMartCount += 1;
      } else if (isLocal) {
        localCount += 1;
      } else if (b) {
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });

    // Sort branded brands: Aashirvaad first, then by count descending
    const brands = Array.from(brandMap.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => {
        if (a[0].toLowerCase() === 'aashirvaad') return -1;
        if (b[0].toLowerCase() === 'aashirvaad') return 1;
        return b[1] - a[1];
      });

    return { brands, jeevanMartCount, localCount };
  }, [subFilteredProducts]);

  // Final filtered products:
  // "Keep the branded items first and Jeevan Mart branded give the next.
  // First we need all branded images visual first after need Jeevan Mart brand also."
  const displayedProducts = useMemo(() => {
    let list = subFilteredProducts;

    if (selectedBrand === 'jeevan-mart') {
      list = list.filter((p) => {
        const b = p.brand?.trim();
        return b && (b.toLowerCase().includes('g1') || b.toLowerCase().includes('jeevan'));
      });
    } else if (selectedBrand === 'local') {
      list = list.filter((p) => {
        const b = p.brand?.trim();
        return !b || /local\s*\/?\s*unbranded/i.test(b) || /^unbranded$/i.test(b);
      });
    } else if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand?.trim() === selectedBrand);
    }

    return [...list].sort((a, b) => {
      // 1. Explicit user price sorting
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;

      // 2. Branded vs Jeevan Mart hierarchy:
      // Branded items ALWAYS come FIRST, Jeevan Mart / G1 Mart branded items come NEXT
      const aIsJeevan = isJeevanMartOrLocal(a.brand);
      const bIsJeevan = isJeevanMartOrLocal(b.brand);

      if (aIsJeevan !== bIsJeevan) {
        // false (branded) comes before true (Jeevan Mart)
        return aIsJeevan ? 1 : -1;
      }

      // 3. Visual Packshot Priority: Products with verified authentic visual images come first
      const aHasImg = (a.image_status === 'verified' || (a as any).imageStatus === 'verified' || (a as any).imageStatus === 'VERIFIED') &&
        ((a.image_url && !a.image_url.includes('placeholder')) || (a.imageUrl && !a.imageUrl.includes('placeholder'))) ? 1 : 0;
      const bHasImg = (b.image_status === 'verified' || (b as any).imageStatus === 'verified' || (b as any).imageStatus === 'VERIFIED') &&
        ((b.image_url && !b.image_url.includes('placeholder')) || (b.imageUrl && !b.imageUrl.includes('placeholder'))) ? 1 : 0;
      if (aHasImg !== bHasImg) return bHasImg - aHasImg;

      // 4. Special brand priority among branded items (e.g., Aashirvaad at top of flours)
      const aBrand = (a.brand || '').toLowerCase();
      const bBrand = (b.brand || '').toLowerCase();
      if (aBrand === 'aashirvaad' && bBrand !== 'aashirvaad') return -1;
      if (bBrand === 'aashirvaad' && aBrand !== 'aashirvaad') return 1;

      // 5. Popularity rank
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [subFilteredProducts, selectedBrand, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--g1-bg)] pb-24 sm:pb-16 max-w-full overflow-x-hidden">
      {/* 1. Header: 56px inner header (back button + title 18/700) */}
      <InnerPageHeader title={category.name} />

      {/* 2. Top chip row: Brands ONLY (All, Aashirvaad, Local) */}
      <div
        className="shrink-0 flex items-center justify-between px-3 py-2 bg-[var(--g1-bg)] border-b gap-2"
        style={{ borderColor: 'var(--g1-border)' }}
      >
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          {/* All Brands chip */}
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            className="shrink-0 px-3 py-1 text-xs font-bold transition-all cursor-pointer g1-press whitespace-nowrap"
            style={{
              borderRadius: 'var(--g1-r-chip)',
              backgroundColor: selectedBrand === 'all' ? 'var(--g1-primary)' : 'var(--g1-surface)',
              color: selectedBrand === 'all' ? '#FFFFFF' : 'var(--g1-text-secondary)',
              border: selectedBrand === 'all' ? 'none' : '1px solid var(--g1-border)',
            }}
          >
            All Brands
          </button>

          {/* Individual Brands */}
          {availableBrands.brands.map(([bName, bCount]) => (
            <button
              key={bName}
              type="button"
              onClick={() => setSelectedBrand(bName)}
              className="shrink-0 px-3 py-1 text-xs font-bold transition-all cursor-pointer g1-press whitespace-nowrap"
              style={{
                borderRadius: 'var(--g1-r-chip)',
                backgroundColor: selectedBrand === bName ? 'var(--g1-primary)' : 'var(--g1-surface)',
                color: selectedBrand === bName ? '#FFFFFF' : 'var(--g1-text-secondary)',
                border: selectedBrand === bName ? 'none' : '1px solid var(--g1-border)',
              }}
            >
              {bName} ({bCount})
            </button>
          ))}

          {/* Jeevan Mart Brand Chip */}
          {availableBrands.jeevanMartCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedBrand('jeevan-mart')}
              className="shrink-0 px-3 py-1 text-xs font-bold transition-all cursor-pointer g1-press whitespace-nowrap"
              style={{
                borderRadius: 'var(--g1-r-chip)',
                backgroundColor: selectedBrand === 'jeevan-mart' ? 'var(--g1-primary)' : 'var(--g1-surface)',
                color: selectedBrand === 'jeevan-mart' ? '#FFFFFF' : 'var(--g1-text-secondary)',
                border: selectedBrand === 'jeevan-mart' ? 'none' : '1px solid var(--g1-border)',
              }}
            >
              Jeevan Mart ({availableBrands.jeevanMartCount})
            </button>
          )}

          {/* Local Brands */}
          {availableBrands.localCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedBrand('local')}
              className="shrink-0 px-3 py-1 text-xs font-bold transition-all cursor-pointer g1-press whitespace-nowrap"
              style={{
                borderRadius: 'var(--g1-r-chip)',
                backgroundColor: selectedBrand === 'local' ? 'var(--g1-primary)' : 'var(--g1-surface)',
                color: selectedBrand === 'local' ? '#FFFFFF' : 'var(--g1-text-secondary)',
                border: selectedBrand === 'local' ? 'none' : '1px solid var(--g1-border)',
              }}
            >
              Local ({availableBrands.localCount})
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          aria-label="Sort products"
          className="text-xs font-bold rounded-lg px-2 py-1 ml-2 shrink-0 cursor-pointer outline-none"
          style={{
            backgroundColor: 'var(--g1-surface)',
            border: '1px solid var(--g1-border)',
            color: 'var(--g1-text)',
          }}
        >
          <option value="popular">Popular</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>

      {/* 3. Main Body: Left rail 76px (sub-categories) + Right Product Grid */}
      <div className="flex flex-1 items-start min-w-0">
        {/* Left rail: 76px fixed = Sub-categories (48px circle image + 11px label) */}
        <aside
          className="shrink-0 bg-[var(--g1-surface)] border-r sticky top-[56px] self-start overflow-y-auto no-scrollbar flex flex-col py-2 select-none"
          style={{
            width: 76,
            height: 'calc(100vh - 56px - 44px)',
            borderColor: 'var(--g1-border)',
          }}
        >
          {/* "All" subcategory button */}
          <button
            type="button"
            onClick={() => setSelectedSubCategory('all')}
            className="relative w-full py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer g1-press"
            style={{
              backgroundColor: selectedSubCategory === 'all' ? 'var(--g1-bg)' : 'transparent',
            }}
          >
            {selectedSubCategory === 'all' && (
              <div
                className="absolute left-0 top-1 bottom-1 w-1 rounded-r"
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
                onClick={() => setSelectedSubCategory(sub.name)}
                className="relative w-full py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer g1-press"
                style={{
                  backgroundColor: isSelected ? 'var(--g1-bg)' : 'transparent',
                }}
              >
                {isSelected && (
                  <div
                    className="absolute left-0 top-1 bottom-1 w-1 rounded-r"
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

        {/* 4. Product grid: 2 columns up to 390px, 3 from 480px */}
        <main className="flex-1 min-w-0 p-2 sm:p-3">
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 min-w-0">
              {displayedProducts.map((p) => (
                <ProductCard key={`${p.id}::${selectedBrand}`} product={p} compact />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--g1-surface)' }}
              >
                <span className="text-xl">📦</span>
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--g1-text)' }}>No products found</h3>
              <p className="text-xs max-w-xs" style={{ color: 'var(--g1-text-secondary)' }}>
                No products match the selected brand and sub-category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedSubCategory('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white g1-press"
                style={{ backgroundColor: 'var(--g1-primary)' }}
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
