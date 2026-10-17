'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, X, Clock, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import InnerPageHeader from '@/components/layout/InnerPageHeader';
import { productService, MIGRATED_PRODUCT_LIST } from '@/services/productService';
import { rankAndFilterProducts } from '@/utils/searchEngine';
import type { Product } from '@/types';

const RECENT_SEARCHES_KEY = 'g1mart_recent_searches';
const POPULAR_TAGS = ['sugar', 'oil', 'surf', 'kandipappu', 'minapappu', 'tea', 'soap'];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>(MIGRATED_PRODUCT_LIST);

  useEffect(() => {
    productService.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 6));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSelectSearch = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
  };

  const filtered = useMemo(() => {
    return rankAndFilterProducts(query, products);
  }, [query, products]);

  return (
    <>
      <InnerPageHeader title="Search" />
      <div className="w-full max-w-2xl mx-auto space-y-4 pb-28 pt-2 px-4 sm:px-0">
        {/* Search Input Box — 52px height, 14px radius, no quotes */}
        <div className="relative" style={{ height: 52 }}>
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: 20, height: 20, color: 'var(--g1-text-secondary)', strokeWidth: 1.75 }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveRecentSearch(query);
              }
            }}
            placeholder="Search for sugar, oil, surf, kandipappu…"
            aria-label="Search products"
            className="w-full h-full pl-12 pr-10 text-sm outline-none transition-colors"
            style={{
              borderRadius: 14,
              backgroundColor: 'var(--g1-surface)',
              border: '1px solid var(--g1-border)',
              color: 'var(--g1-text)',
            }}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors g1-press"
              style={{ color: 'var(--g1-text-secondary)' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggested Quick Tags & Recent Searches */}
        {!query && (
          <div className="space-y-4 pt-1">
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--g1-text-secondary)' }}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem(RECENT_SEARCHES_KEY);
                    }}
                    className="font-normal text-[11px] hover:underline"
                    style={{ color: 'var(--g1-text-secondary)' }}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectSearch(term)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors g1-press"
                      style={{
                        backgroundColor: 'var(--g1-surface)',
                        border: '1px solid var(--g1-border)',
                        color: 'var(--g1-text)',
                      }}
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold block" style={{ color: 'var(--g1-text-secondary)' }}>Popular Groceries</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectSearch(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all g1-press"
                    style={{
                      backgroundColor: 'var(--g1-primary-tint)',
                      color: 'var(--g1-primary)',
                      border: '1px solid var(--g1-border)',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {query && (
          <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--g1-text-secondary)' }}>
            <span className="font-semibold">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found for &ldquo;{query}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="font-bold hover:underline"
              style={{ color: 'var(--g1-primary)' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Results Grid or Empty State */}
        {query ? (
          filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pb-8 min-w-0">
              {filtered.map((product) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-[var(--g1-r-card)] border p-8 text-center space-y-3 mt-4 bg-[var(--g1-bg)]"
              style={{ borderColor: 'var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
            >
              <span className="text-3xl block">🔍</span>
              <h3 className="text-base font-bold" style={{ color: 'var(--g1-text)' }}>
                No matching products found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--g1-text-secondary)' }}>
                Try searching with another spelling, Telugu name (e.g. <em>kandipappu</em>, <em>nune</em>), or browse by category.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/categories')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 g1-press"
                  style={{ backgroundColor: 'var(--g1-primary)' }}
                >
                  <span>Browse Departments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
