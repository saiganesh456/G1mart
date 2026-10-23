'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Plus, Minus, ShieldCheck, Truck, Check, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { resolveLegacyId } from '@/lib/legacyIdMap';
import { productService, MIGRATED_PRODUCT_LIST } from '@/services/productService';
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
  const { cart, addToCart, updateCartQuantity, getItemQuantity, toggleWishlist, isWishlisted, cartItemCount } = useCart();

  const canonicalId = resolveLegacyId(slug) || slug;
  const [product, setProduct] = useState<Product | null>(() => 
    MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId || p.id === slug) || null
  );
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    let isMounted = true;
    productService.getProductById(canonicalId).then((cached) => {
      if (isMounted && cached) {
        setProduct(cached);
        setLoading(false);
      }
    });

    // Real-time server revalidation for updated MRP, price, or photo from admin
    fetch(`/api/products?id=${encodeURIComponent(canonicalId)}&_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success && data?.product) {
          setProduct(data.product);
          setLoading(false);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [canonicalId]);

  // Size & Pack Selection Options
  const sizeVariants = useMemo(() => {
    if (!product) return [];

    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        id: v.id,
        label: v.size_label || (v as any).name || (v as any).unit || 'Standard Pack',
        price: v.price > 0 ? v.price : v.mrp || 0,
        originalPrice: v.mrp,
        discountText: v.mrp > v.price && v.mrp > 0 ? `${Math.round(((v.mrp - v.price) / v.mrp) * 100)}% OFF` : null,
        product,
        variant: v,
        multiplier: 1,
        isSibling: false,
        stock: v.stock !== undefined ? v.stock : ((v as any).in_stock !== false ? 50 : 0),
      }));
    }

    const baseWords = product.name
      .toLowerCase()
      .replace(/\b(\d+(\.\d+)?\s*(kg|g|gm|l|ml|pc|pcs|pack|pk))\b/gi, '')
      .replace(/\(\s*\)/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const siblings = MIGRATED_PRODUCT_LIST.filter((p) => {
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

    const basePrice = product.price > 0 ? product.price : product.originalPrice || 0;
    const baseUnit = product.unit || 'Standard Pack';

    return [
      {
        id: product.id,
        label: baseUnit,
        price: basePrice,
        originalPrice: product.originalPrice,
        discountText: product.discountPercentage > 0 ? `${product.discountPercentage}% OFF` : null,
        product,
        multiplier: 1,
        isSibling: false,
      },
    ];
  }, [product]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  useEffect(() => {
    if (product) {
      const firstInStockVariant = product.variants?.find((v) => {
        if (v.stock !== undefined && v.stock !== null) return v.stock > 0;
        return (v as any).in_stock !== false;
      });
      setSelectedVariantId(firstInStockVariant?.id || product.variants?.[0]?.id || product.id);
    }
  }, [product]);

  const activeVariant = useMemo(() => {
    return sizeVariants.find((v) => v.id === selectedVariantId) || sizeVariants[0] || null;
  }, [sizeVariants, selectedVariantId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return MIGRATED_PRODUCT_LIST.filter(
      (p) => p.id !== product.id && (p.category === product.category || (product.subCategory && p.subCategory === product.subCategory))
    ).slice(0, 6);
  }, [product]);

  const brandProducts = useMemo(() => {
    if (!product || !product.brand || /local\s*\/?\s*unbranded/i.test(product.brand) || /^unbranded$/i.test(product.brand)) return [];
    return MIGRATED_PRODUCT_LIST.filter(
      (p) => p.id !== product.id && p.brand && p.brand.toLowerCase() === product.brand.toLowerCase()
    ).slice(0, 6);
  }, [product]);

  if (!product && loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[var(--g1-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold" style={{ color: 'var(--g1-text-secondary)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4 px-4">
        <p className="text-sm font-bold" style={{ color: 'var(--g1-text)' }}>Product not found.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white g1-press"
          style={{ backgroundColor: 'var(--g1-primary)' }}
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
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  const brandText = effectiveProduct.brand && !/local\s*\/?\s*unbranded/i.test(effectiveProduct.brand) && !/^unbranded$/i.test(effectiveProduct.brand)
    ? effectiveProduct.brand
    : null;

  return (
    <div className="w-full max-w-2xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 lg:space-y-6 pb-28 lg:pb-8 pt-2 sm:pt-4 px-4 sm:px-6 box-border">
      {/* Desktop Breadcrumbs Bar */}
      <div className="hidden lg:block pb-1">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <span>/</span>
          {effectiveProduct.category && (
            <>
              <Link href={`/category/${effectiveProduct.category}`} className="hover:text-stone-900 transition-colors capitalize">
                {effectiveProduct.category.replace(/-/g, ' ')}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-stone-900 font-bold truncate max-w-md">{effectiveProduct.name}</span>
        </div>
      </div>

      {/* 56px Top Header: Mobile only (40px circle back button + wishlist + cart buttons) */}
      <div className="flex lg:hidden items-center justify-between" style={{ height: 56 }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors g1-press shrink-0 cursor-pointer"
          style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}
          aria-label="Back"
        >
          <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={1.75} style={{ color: 'var(--g1-text)' }} />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(effectiveProduct.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors g1-press shrink-0 cursor-pointer"
            style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className="w-[20px] h-[20px]"
              strokeWidth={1.75}
              style={{
                color: wishlisted ? 'var(--g1-error)' : 'var(--g1-text-secondary)',
                fill: wishlisted ? 'var(--g1-error)' : 'none',
              }}
            />
          </button>

          <Link
            href="/cart"
            aria-label={`View cart with ${cartItemCount} items`}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors g1-press shrink-0 relative cursor-pointer"
            style={{
              backgroundColor: cartItemCount > 0 ? 'var(--g1-primary)' : 'var(--g1-surface)',
              border: `1px solid ${cartItemCount > 0 ? 'var(--g1-primary)' : 'var(--g1-border)'}`,
              color: cartItemCount > 0 ? '#FFFFFF' : 'var(--g1-text)',
            }}
          >
            <ShoppingCart className="w-[19px] h-[19px]" strokeWidth={1.75} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center justify-center shadow-xs">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Main Responsive Grid: 2 Columns on Desktop */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* Left Column: Image Card */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 space-y-3">
          <div
            className="rounded-[var(--g1-r-card)] border p-6 flex items-center justify-center relative overflow-hidden bg-[var(--g1-bg)]"
            style={{ borderColor: 'var(--g1-border)', boxShadow: 'var(--g1-e1)', minHeight: 280 }}
          >
        <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <ProductImage
            imageUrl={(activeVariant as any)?.variant?.image || (activeVariant as any)?.variant?.image_url || (activeVariant as any)?.variant?.imageUrl || effectiveProduct.image_url || (effectiveProduct as any).imageUrl || (effectiveProduct as any).image}
            imageStatus={effectiveProduct.image_status || (effectiveProduct as any).imageStatus}
            alt={effectiveProduct.name}
            name={effectiveProduct.name}
            brand={effectiveProduct.brand}
            category={effectiveProduct.category}
            subCategory={effectiveProduct.subCategory}
            priority
            className="w-full h-full object-contain"
            containerClassName="w-full h-full"
          />
        </div>
        {discount > 0 && effectiveProduct.inStock && (
          <span
            className="absolute top-3 left-3 text-xs font-black px-2 py-0.5 rounded shadow-2xs uppercase"
            style={{ backgroundColor: 'var(--g1-yellow)', color: '#000000' }}
          >
            {discount}% OFF
          </span>
        )}
          </div>
        </div>

        {/* Right Column: Product Details & Purchase Actions */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4 mt-4 lg:mt-0">
          {/* Product Details Card */}
      <div
        className="rounded-[var(--g1-r-card)] border p-4 sm:p-5 space-y-3 bg-[var(--g1-bg)]"
        style={{ borderColor: 'var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
      >
        <div>
          {brandText && (
            <span
              className="text-xs font-bold uppercase tracking-wider block"
              style={{ color: 'var(--g1-text-secondary)' }}
            >
              {brandText}
            </span>
          )}
          <h1
            className="font-bold mt-1 leading-snug"
            style={{ fontSize: 18, color: 'var(--g1-text)' }}
          >
            {effectiveProduct.name}
          </h1>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-2 border-t" style={{ borderColor: 'var(--g1-border)' }}>
          {displayPrice > 0 ? (
            <>
              <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--g1-text)' }}>
                ₹{displayPrice}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-sm line-through tabular-nums" style={{ color: 'var(--g1-text-secondary)' }}>
                  ₹{displayOriginalPrice}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
              Price to be confirmed
            </span>
          )}
        </div>

        {/* Size / Pack Selection */}
        {sizeVariants.length > 1 && (
          <div className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--g1-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--g1-text)' }}>
                Select Size / Pack
              </span>
              <span className="text-[11px]" style={{ color: 'var(--g1-text-secondary)' }}>
                {sizeVariants.length} sizes available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sizeVariants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const isOutOfStock = (v as any).stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedVariantId(v.id)}
                    className="p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-between g1-press"
                    style={{
                      border: isSelected ? '2px solid var(--g1-primary)' : '1px solid var(--g1-border)',
                      backgroundColor: isSelected ? 'var(--g1-primary-tint)' : 'var(--g1-surface)',
                      opacity: isOutOfStock ? 0.4 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate" style={{ color: 'var(--g1-text)' }}>
                        {v.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--g1-primary)' }} strokeWidth={2.5} />}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xs font-black tabular-nums" style={{ color: 'var(--g1-text)' }}>
                        ₹{v.price}
                      </span>
                      {v.discountText && (
                        <span className="text-[10px] font-bold" style={{ color: 'var(--g1-primary)' }}>
                          {v.discountText}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* In-Card Primary Add To Cart / Stepper Action (Directly in product card) */}
        <div className="pt-3 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" style={{ borderColor: 'var(--g1-border)' }}>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--g1-text-secondary)' }}>
              Selected: {activeVariant?.label || effectiveProduct.unit}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums" style={{ color: 'var(--g1-text)' }}>
                ₹{displayPrice}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-xs line-through tabular-nums" style={{ color: 'var(--g1-text-secondary)' }}>
                  ₹{displayOriginalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {effectiveProduct.inStock ? (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={() => addToCart(effectiveProduct, activeVariant?.multiplier || 1, (activeVariant as any)?.variant)}
                  className="w-full sm:w-auto h-12 px-8 rounded-xl font-extrabold text-sm text-white g1-press flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--g1-primary)' }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>ADD TO CART</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div
                    className="h-12 flex-1 sm:flex-initial flex items-center justify-between rounded-xl px-3 gap-3 text-white shadow-sm"
                    style={{ backgroundColor: 'var(--g1-primary)' }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateCartQuantity(effectiveProduct.id, quantity - 1, (activeVariant as any)?.variant?.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center active:bg-black/15 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-black tabular-nums">{quantity} in cart</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateCartQuantity(effectiveProduct.id, quantity + 1, (activeVariant as any)?.variant?.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center active:bg-black/15 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                  <Link
                    href="/cart"
                    className="h-12 px-5 rounded-xl text-xs font-bold flex items-center justify-center g1-press transition-colors cursor-pointer"
                    style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)', color: 'var(--g1-text)' }}
                  >
                    View Cart →
                  </Link>
                </div>
              )
            ) : (
              <div
                className="w-full sm:w-auto h-12 px-6 rounded-xl text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)', border: '1px solid var(--g1-border)' }}
              >
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 pt-3 text-xs" style={{ borderTop: '1px solid var(--g1-border)' }}>
          <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}>
            <Truck className="w-4 h-4 shrink-0" strokeWidth={1.75} style={{ color: 'var(--g1-primary)' }} />
            <span style={{ color: 'var(--g1-text)' }}>Delivery in ~61 min</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)' }}>
            <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} style={{ color: 'var(--g1-primary)' }} />
            <span style={{ color: 'var(--g1-text)' }}>Genuine Store Quality</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="pt-2 border-t" style={{ borderColor: 'var(--g1-border)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--g1-text-secondary)' }}>
            Product Details
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--g1-text)' }}>
            {effectiveProduct.description || 'Authentic FMCG supermarket item fulfilling from G1mart darkstore.'}
          </p>
        </div>
      </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-2 space-y-3">
          <div>
            <h3 className="font-bold tracking-tight" style={{ fontSize: 16, color: 'var(--g1-text)' }}>
              Related Products
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--g1-text-secondary)' }}>
              Popular items in {effectiveProduct.category.replace(/-/g, ' ')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 pb-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} compact />
            ))}
          </div>
        </div>
      )}

      {/* More from brand */}
      {brandProducts.length > 0 && (
        <div className="pt-2 space-y-3">
          <div>
            <h3 className="font-bold tracking-tight" style={{ fontSize: 16, color: 'var(--g1-text)' }}>
              More from {effectiveProduct.brand}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 pb-4">
            {brandProducts.map((bp) => (
              <ProductCard key={bp.id} product={bp} compact />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Add To Cart CTA (Mobile only) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t px-4 py-3"
        style={{
          borderColor: 'var(--g1-border)',
          boxShadow: 'var(--g1-e2)',
          paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] truncate" style={{ color: 'var(--g1-text-secondary)' }}>
              {activeVariant?.label || effectiveProduct.unit}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--g1-text)' }}>
                ₹{displayPrice}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-xs line-through tabular-nums" style={{ color: 'var(--g1-text-secondary)' }}>
                  ₹{displayOriginalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {effectiveProduct.inStock ? (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={() => addToCart(effectiveProduct, activeVariant?.multiplier || 1, (activeVariant as any)?.variant)}
                  className="h-12 px-6 rounded-xl font-bold text-sm text-white g1-press flex items-center gap-2"
                  style={{ backgroundColor: 'var(--g1-primary)' }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>ADD TO CART</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="h-12 flex items-center rounded-xl px-2 gap-3 text-white"
                    style={{ backgroundColor: 'var(--g1-primary)' }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateCartQuantity(effectiveProduct.id, quantity - 1, (activeVariant as any)?.variant?.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center active:bg-black/15"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-black tabular-nums">{quantity} in cart</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateCartQuantity(effectiveProduct.id, quantity + 1, (activeVariant as any)?.variant?.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center active:bg-black/15"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                  <Link
                    href="/cart"
                    className="h-12 px-4 rounded-xl text-xs font-bold flex items-center justify-center g1-press"
                    style={{ backgroundColor: 'var(--g1-surface)', border: '1px solid var(--g1-border)', color: 'var(--g1-text)' }}
                  >
                    View Cart →
                  </Link>
                </div>
              )
            ) : (
              <div className="h-12 px-5 rounded-xl text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)' }}>
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
