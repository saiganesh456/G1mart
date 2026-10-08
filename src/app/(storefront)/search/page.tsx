'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, X, Clock, ArrowRight } from 'lucide-react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { productService, MIGRATED_PRODUCT_LIST } from '@/services/productService';
import { DEFAULT_SEARCH_SYNONYMS } from '@/data/searchSynonyms';
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

  // Load recent searches from localStorage
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

  // Instant Typo-Tolerant & Regional Synonym Filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Expanded tokens from synonyms table
    const expandedTokens = new Set<string>();
    expandedTokens.add(q);
    q.split(/\s+/).forEach((tok) => tok && expandedTokens.add(tok));

    DEFAULT_SEARCH_SYNONYMS.forEach((item) => {
      if (q.includes(item.term) || item.synonyms.some((s) => q.includes(s))) {
        expandedTokens.add(item.term);
        item.synonyms.forEach((s) => expandedTokens.add(s));
      }
    });

    const tokens = Array.from(expandedTokens);

    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const sub = (p.subCategory || '').toLowerCase();
      const unit = (p.unit || '').toLowerCase();
      const raw = (p.rawName || '').toLowerCase();

      // Direct match
      if (name.includes(q) || brand.includes(q) || cat.includes(q) || sub.includes(q) || raw.includes(q)) {
        return true;
      }

      // Synonym & token match
      return tokens.some((token) =>
        name.includes(token) ||
        brand.includes(token) ||
        cat.includes(token) ||
        sub.includes(token) ||
        unit.includes(token)
      );
    });
  }, [query, products]);

  return (
    <div className="space-y-4 pb-24 sm:pb-12 pt-2 px-1 sm:px-0">
      {/* Search Input Box */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveRecentSearch(query);
            }
          }}
          placeholder="Search 'sugar', 'oil', 'surf', 'kandipappu'…"
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-stone-200 text-sm outline-none focus:border-[#2E7D32] shadow-2xs placeholder:text-stone-400"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Quick Tags & Recent Searches (When query is empty) */}
      {!query && (
        <div className="space-y-4 pt-2">
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-500">
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
                  className="text-stone-400 hover:text-stone-600 font-normal text-[11px]"
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
                    className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-[#2E7D32] text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-500 block">Popular Groceries</span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectSearch(tag)}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-200/60 hover:bg-[#2E7D32] hover:text-white text-xs font-bold transition-all"
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
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span className="font-semibold">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found for &ldquo;{query}&rdquo;
          </span>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[#2E7D32] font-bold hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Results Grid or Empty State */}
      {query ? (
        filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center space-y-3 mt-4">
            <span className="text-3xl block">🔍</span>
            <h3 className="text-base font-bold text-stone-800">
              No matching products found for &ldquo;{query}&rdquo;
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Try searching with another spelling, Telugu name (e.g. <em>kandipappu</em>, <em>nune</em>), or browse by category.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/categories')}
                className="px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1b5e20] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Browse Departments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
