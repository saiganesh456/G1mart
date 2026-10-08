'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Plus, Minus, ShieldCheck, Truck, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CATALOG_PRODUCTS } from '@/data/productsCatalog';
import { productService } from '@/services/productService';
import { STORE_CONFIG } from '@/config/store';
import ProductImage from '@/components/storefront/ProductImage';
import ProductCard from '@/components/storefront/ProductCard';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { cart, addToCart, updateCartQuantity, getItemQuantity, toggleWishlist, isWishlisted } = useCart();

  const [product, setProduct] = useState<Product | null>(() => 
    CATALOG_PRODUCTS.find((p) => p.id === slug || p.slug === slug || String(p.itemNumber) === slug) || null
  );
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    let isMounted = true;
    productService.getProductById(slug).then((live) => {
      if (isMounted && live) {
        setProduct(live);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Size & Pack Selection Options
  const sizeVariants = useMemo(() => {
    if (!product) return [];

    // 1. If product has relational variants (from product_variants table), use them directly
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        id: v.id,
        label: v.size_label,
        price: v.price > 0 ? v.price : v.mrp || 0,
        originalPrice: v.mrp,
        discountText: v.mrp > v.price && v.mrp > 0 ? `${Math.round(((v.mrp - v.price) / v.mrp) * 100)}% OFF` : null,
        product,
        variant: v,
        multiplier: 1,
        isSibling: false,
        stock: v.stock,
      }));
    }

    // Find siblings in the catalog with same brand and matching core name
    const baseWords = product.name
      .toLowerCase()
      .replace(/\b(\d+(\.\d+)?\s*(kg|g|gm|l|ml|pc|pcs|pack|pk))\b/gi, '')
      .replace(/\(\s*\)/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const siblings = CATALOG_PRODUCTS.filter((p) => {
      if (p.id === product.id) return false;
      if (p.brand && product.brand && p.brand.toLowerCase() !== product.brand.toLowerCase()) return false;
      const pNameLower = p.name.toLowerCase();
      const matchCount = baseWords.filter((w) => pNameLower.includes(w)).length;
      return matchCount >= Math.min(2, Math.max(1, baseWords.length));
    });

    if (siblings.length > 0) {
      const all = [product, ...siblings.slice(0, 3)];
      return all.map((p) => ({
        id: p.id,
        label: p.unit || p.name,
        price: p.price > 0 ? p.price : p.originalPrice || 0,
        originalPrice: p.originalPrice,
        discountText: p.discountPercentage > 0 ? `${p.discountPercentage}% OFF` : null,
        product: p,
        multiplier: 1,
        isSibling: true,
      }));
    }

    // Default smart pack size variants
    const basePrice = product.price > 0 ? product.price : product.originalPrice || 0;
    const baseUnit = product.unit || 'Standard Pack';

    return [
      {
        id: `${product.id}-1x`,
        label: `${baseUnit} (1 unit)`,
        price: basePrice,
        originalPrice: product.originalPrice,
        discountText: null,
        product,
        multiplier: 1,
        isSibling: false,
      },
      {
        id: `${product.id}-2x`,
        label: `Pack of 2`,
        price: Math.round(basePrice * 2 * 0.95),
        originalPrice: basePrice * 2,
        discountText: '5% OFF',
        product,
        multiplier: 2,
        isSibling: false,
      },
      {
        id: `${product.id}-4x`,
        label: `Family Saver (4 units)`,
        price: Math.round(basePrice * 4 * 0.9),
        originalPrice: basePrice * 4,
        discountText: '10% OFF',
        product,
        multiplier: 4,
        isSibling: false,
      },
    ];
  }, [product]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  useEffect(() => {
    if (product) {
      const firstInStockVariant = product.variants?.find((v) => v.stock > 0);
      setSelectedVariantId(firstInStockVariant?.id || product.variants?.[0]?.id || product.id);
    }
  }, [product]);

  const activeVariant = useMemo(() => {
    return sizeVariants.find((v) => v.id === selectedVariantId) || sizeVariants[0] || null;
  }, [sizeVariants, selectedVariantId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return CATALOG_PRODUCTS.filter(
      (p) => p.id !== product.id && (p.category === product.category || (product.subCategory && p.subCategory === product.subCategory))
    ).slice(0, 6);
  }, [product]);

  if (!product && loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-500 text-xs font-semibold">Loading product details...</p>
      </div>
    );
  }

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

  const effectiveProduct = activeVariant?.isSibling && activeVariant.product ? activeVariant.product : product;
  const quantity = getItemQuantity(effectiveProduct.id, (activeVariant as any)?.variant?.id);
  const wishlisted = isWishlisted(effectiveProduct.id);

  const displayPrice = activeVariant ? activeVariant.price : (effectiveProduct.price > 0 ? effectiveProduct.price : effectiveProduct.originalPrice);
  const displayOriginalPrice = activeVariant ? activeVariant.originalPrice : effectiveProduct.originalPrice;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 pt-2 sm:pt-4 px-2.5 sm:px-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(effectiveProduct.id)}
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-2xs hover:bg-stone-50 text-stone-400 cursor-pointer"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${
              wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'
            }`}
          />
        </button>
      </div>

      {/* Main Image Frame */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 flex items-center justify-center relative shadow-2xs min-h-[260px] sm:min-h-[280px]">
        <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <ProductImage
            imageUrl={effectiveProduct.image_url || (effectiveProduct as any).imageUrl}
            imageStatus={effectiveProduct.image_status || (effectiveProduct as any).imageStatus}
            alt={effectiveProduct.name}
            priority
            className="w-full h-full object-contain"
            containerClassName="w-full h-full"
          />
        </div>
        {effectiveProduct.discountPercentage > 0 && effectiveProduct.inStock && (
          <span className="absolute top-3 left-3 bg-[#137333] text-white text-xs font-black px-2 py-0.5 rounded shadow-2xs uppercase">
            {effectiveProduct.discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
        <div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {effectiveProduct.brand || 'Authentic Grocery'} · {activeVariant?.label || effectiveProduct.unit}
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#212121] mt-1 leading-snug">
            {effectiveProduct.name}
          </h1>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-stone-100">
          {displayPrice > 0 ? (
            <>
              <span className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums">
                ₹{displayPrice}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-sm text-stone-400 line-through tabular-nums">
                  MRP ₹{displayOriginalPrice}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
              Price to be confirmed by store
            </span>
          )}
        </div>

        {/* Size / Pack Selection */}
        {sizeVariants.length > 1 && (
          <div className="pt-2.5 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Select Size / Pack
              </span>
              <span className="text-[10px] font-bold text-stone-500">
                {sizeVariants.length} sizes available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sizeVariants.map((v) => {
                const isSelected = selectedVariantId === v.id || (v.isSibling && effectiveProduct.id === v.product?.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      if (v.isSibling && v.product) {
                        setProduct(v.product);
                      }
                    }}
                    className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2E7D32] bg-emerald-50/60 ring-1 ring-[#2E7D32] shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    {v.discountText && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#E65100] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight shadow-2xs">
                        {v.discountText}
                      </span>
                    )}
                    <span className="text-xs font-bold text-stone-900 truncate block">
                      {v.label}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xs font-black text-[#212121] tabular-nums">
                        ₹{v.price}
                      </span>
                      {v.originalPrice && v.originalPrice > v.price && (
                        <span className="text-[10px] text-stone-400 line-through tabular-nums">
                          ₹{v.originalPrice}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="pt-2 border-t border-stone-100">
          <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Product Details
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {effectiveProduct.description || 'Authentic FMCG retail item from G1 Mart inventory.'}
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

      {/* Frequently Bought Together & Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="px-1">
            <h3 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Related Products &amp; Customers Also Bought
            </h3>
            <p className="text-[11px] text-stone-500 font-medium">
              Popular essentials in {effectiveProduct.category.replace(/-/g, ' ')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pb-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} compact />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Add To Cart CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg md:max-w-2xl mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200">
        {effectiveProduct.inStock ? (
          quantity === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(effectiveProduct, activeVariant?.multiplier || 1, (activeVariant as any)?.variant)}
              className="w-full h-12 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>
                Add {activeVariant?.multiplier && activeVariant.multiplier > 1 ? `${activeVariant.multiplier} Units` : 'to Cart'} (₹{displayPrice})
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-12 flex items-center justify-between bg-stone-100 rounded-xl px-4 border border-stone-200">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(effectiveProduct.id, quantity - 1, (activeVariant as any)?.variant?.id)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-2xs active:scale-95 text-stone-800 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>
                <span className="font-extrabold text-sm text-[#212121] tabular-nums">
                  {quantity} in cart
                </span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(effectiveProduct.id, quantity + 1, (activeVariant as any)?.variant?.id)}
                  className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <Link
                href="/cart"
                className="h-12 px-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center cursor-pointer"
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
