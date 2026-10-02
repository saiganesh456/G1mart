'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Plus, Minus, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DEMO_PRODUCTS } from '@/data/demo-seed';
import { STORE_CONFIG } from '@/config/store';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { cart, addToCart, updateCartQuantity, toggleWishlist, isWishlisted } = useCart();

  const product = DEMO_PRODUCTS.find((p) => p.id === slug);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-stone-500 text-sm">Product not found.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold"
        >
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const cartItem = cart.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 pt-2 sm:pt-4 px-3 sm:px-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-2xs hover:bg-stone-50 text-stone-400"
        >
          <Heart
            className={`w-4 h-4 ${
              wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'
            }`}
          />
        </button>
      </div>

      {/* Main Image Frame */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 flex items-center justify-center relative shadow-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-64 h-64 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://placehold.co/400x400/f1f8e9/2e7d32?text=G1+Mart';
          }}
        />
        {product.discountPercentage > 0 && product.inStock && (
          <span className="absolute top-3 left-3 bg-[#137333] text-white text-xs font-black px-2 py-0.5 rounded shadow-2xs uppercase">
            {product.discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
        <div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {product.brand} · {product.unit}
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#212121] mt-1 leading-snug">
            {product.name}
          </h1>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-stone-100">
          {product.price > 0 ? (
            <>
              <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through tabular-nums">
                  MRP ₹{product.originalPrice}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
              Price to be confirmed by store
            </span>
          )}
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-stone-100">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Product Details
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-stone-600">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <Truck className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span>{STORE_CONFIG.delivery.cityEtaText} Delivery</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span>Genuine Quality Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Add To Cart CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200">
        {product.inStock ? (
          quantity === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-12 flex items-center justify-between bg-stone-100 rounded-xl px-4 border border-stone-200">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(product.id, quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-2xs active:scale-95 text-stone-800"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>
                <span className="font-extrabold text-sm text-[#212121] tabular-nums">
                  {quantity} in cart
                </span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(product.id, quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center shadow-2xs active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <Link
                href="/cart"
                className="h-12 px-6 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center"
              >
                View Cart
              </Link>
            </div>
          )
        ) : (
          <div className="w-full h-12 bg-stone-200 text-stone-500 font-bold rounded-xl text-sm flex items-center justify-center">
            Currently Out of Stock
          </div>
        )}
      </div>
    </div>
  );
}
