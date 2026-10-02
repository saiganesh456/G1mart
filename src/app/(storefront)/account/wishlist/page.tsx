'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DEMO_PRODUCTS } from '@/data/demo-seed';
import ProductGrid from '@/components/storefront/ProductGrid';

export default function WishlistPage() {
  const { wishlistIds } = useCart();
  const wishlistedProducts = DEMO_PRODUCTS.filter((p) => wishlistIds.has(p.id));

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">Saved Wishlist</h1>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#212121]">No saved items</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Tap the heart icon on any product to save it here for later.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <ProductGrid products={wishlistedProducts} />
      )}
    </div>
  );
}
