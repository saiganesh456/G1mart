'use client';

import { useState, useMemo } from 'react';
import { Category, Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import { Search } from 'lucide-react';

interface Props {
  categories: Category[];
  products: Product[];
}

// DATA_ISSUES logging helper (client-side, console only)
function logDataIssue(productName: string, field: string, problem: string) {
  if (typeof window !== 'undefined') {
    console.warn(`[DATA_ISSUE] Product: "${productName}" | Field: ${field} | Problem: ${problem}`);
  }
}

export default function BlinkitCategoryExplorer({ categories, products }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id || 'grocery-staples'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  // Products belonging to the active category
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === activeCategoryId);
  }, [products, activeCategoryId]);

  // Available brands for current category
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    categoryProducts.forEach((p) => {
      const b = p.brand?.trim();
      if (b && !/local\s*\/?\s*unbranded/i.test(b) && !/^unbranded$/i.test(b)) {
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });
    return Array.from(brandMap.entries())
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [categoryProducts]);

  // Filtered products — by brand and search
  const displayedProducts = useMemo(() => {
    let list = categoryProducts;

    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand?.trim() === selectedBrand);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }
    return list;
  }, [categoryProducts, selectedBrand, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    setSelectedBrand('all');
    setSearchQuery('');
  };

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100svh - 56px - 64px)' }}>
      {/*
        Left rail — 76px fixed, sub-categories as 48px circle + 11px label.
        No 22%-wide rail; rail is fixed 76px per spec.
      */}
      <aside
        className="shrink-0 overflow-y-auto no-scrollbar flex flex-col py-1.5 select-none"
        style={{
          width: 76,
          backgroundColor: 'var(--g1-surface)',
          borderRight: '1px solid var(--g1-border)',
        }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className="relative px-1 py-2.5 flex flex-col items-center text-center transition-all cursor-pointer"
              style={{
                backgroundColor: isActive ? 'var(--g1-bg)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--g1-primary)' : '3px solid transparent',
              }}
            >
              {/* 48px circle image */}
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isActive ? 'var(--g1-primary-tint)' : 'var(--g1-bg)',
                  border: `1px solid ${isActive ? 'var(--g1-primary)' : 'var(--g1-border)'}`,
                }}
              >
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--g1-border)' }} />
                )}
              </div>

              {/* 11px label */}
              <span
                className="mt-1 line-clamp-2 leading-tight"
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? 'var(--g1-primary)' : 'var(--g1-text-secondary)',
                }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Right content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--g1-bg)' }}>
        {/* Brand chips — top chip row = brands only (All + brand names) */}
        <div
          className="shrink-0 px-3 py-2"
          style={{ borderBottom: '1px solid var(--g1-border)', backgroundColor: 'var(--g1-bg)' }}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className="shrink-0 px-3 py-1 text-[12px] font-bold transition-all cursor-pointer g1-press"
              style={{
                borderRadius: 'var(--g1-r-chip)',
                backgroundColor: selectedBrand === 'all' ? 'var(--g1-primary)' : 'var(--g1-surface)',
                color: selectedBrand === 'all' ? '#fff' : 'var(--g1-text-secondary)',
                border: selectedBrand === 'all' ? 'none' : '1px solid var(--g1-border)',
              }}
            >
              All
            </button>
            {availableBrands.map(([bName]) => (
              <button
                key={bName}
                type="button"
                onClick={() => setSelectedBrand(bName)}
                className="shrink-0 px-3 py-1 text-[12px] font-bold transition-all cursor-pointer g1-press"
                style={{
                  borderRadius: 'var(--g1-r-chip)',
                  backgroundColor: selectedBrand === bName ? 'var(--g1-primary)' : 'var(--g1-surface)',
                  color: selectedBrand === bName ? '#fff' : 'var(--g1-text-secondary)',
                  border: selectedBrand === bName ? 'none' : '1px solid var(--g1-border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {bName}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid — scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {displayedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: 'var(--g1-surface)' }}>
                <Search className="w-6 h-6" style={{ color: 'var(--g1-text-secondary)' }} strokeWidth={1.75} />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--g1-text)' }}>No items found</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--g1-text-secondary)' }}>
                Try selecting a different brand or category.
              </p>
            </div>
          ) : (
            /*
              2 columns up to 390px, 3 columns from 480px
              Using CSS grid with auto-fill
            */
            <div
              className="grid gap-2 pb-8"
              style={{
                gridTemplateColumns: 'repeat(2, 1fr)',
              }}
            >
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
