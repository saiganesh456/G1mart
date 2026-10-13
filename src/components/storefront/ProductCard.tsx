'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Minus, ChevronDown, X, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/types';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Variant Bottom-Sheet (unchanged logic, only style tokens)
// ---------------------------------------------------------------------------

interface VariantSheetProps {
  product: Product;
  variants: ProductVariant[];
  activeVariant: ProductVariant | null;
  onSelect: (v: ProductVariant) => void;
  onClose: () => void;
  onAddToCart?: (v: ProductVariant) => void;
}

function VariantSheet({ product, variants, activeVariant, onSelect, onClose, onAddToCart }: VariantSheetProps) {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[61] bg-[var(--g1-bg)] rounded-t-2xl shadow-2xl max-w-md mx-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--g1-border)' }} />
        </div>
        <div className="px-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--g1-border)' }}>
          <div className="min-w-0">
            {product.brand && (
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--g1-text-secondary)' }}>
                {product.brand}
              </p>
            )}
            <h3 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: 'var(--g1-text)' }}>
              {product.name}
            </h3>
          </div>
          <button type="button" onClick={onClose}
            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text)' }}
            aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-3 pt-2 space-y-1.5 overflow-y-auto max-h-[50vh]">
          <p className="text-[11px] font-bold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--g1-text-secondary)' }}>
            Select Size / Pack
          </p>
          {variants.map((v) => {
            const outOfStock = v.stock <= 0;
            const isActive = activeVariant?.id === v.id;
            const discount = v.mrp > v.price && v.mrp > 0
              ? Math.round(((v.mrp - v.price) / v.mrp) * 100)
              : 0;

            return (
              <button
                key={v.id}
                type="button"
                disabled={outOfStock}
                onClick={() => { if (!outOfStock) { onSelect(v); } }}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all g1-press cursor-pointer"
                style={{
                  opacity: outOfStock ? 0.4 : 1,
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                  backgroundColor: isActive ? 'var(--g1-primary-tint)' : 'var(--g1-bg)',
                  border: isActive ? '2px solid var(--g1-primary)' : '1px solid var(--g1-border)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isActive ? 'var(--g1-primary)' : 'transparent', borderColor: isActive ? 'var(--g1-primary)' : 'var(--g1-border)' }}>
                    {isActive && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-bold" style={{ color: 'var(--g1-text)' }}>{v.size_label}</span>
                    {outOfStock && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)' }}>
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {discount > 0 && !outOfStock && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--g1-yellow-bg)', color: '#7A4F00' }}>
                      {discount}% OFF
                    </span>
                  )}
                  <div className="text-right">
                    <div className="text-xs font-black tabular-nums" style={{ color: 'var(--g1-text)' }}>₹{v.price}</div>
                    {v.mrp > v.price && (
                      <div className="text-[10px] line-through tabular-nums" style={{ color: 'var(--g1-text-secondary)' }}>₹{v.mrp}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {onAddToCart && activeVariant && (
          <div className="px-4 pt-3 border-t flex items-center justify-between gap-3 mt-1" style={{ borderColor: 'var(--g1-border)' }}>
            <div className="min-w-0">
              <span className="text-[11px] truncate block" style={{ color: 'var(--g1-text-secondary)' }}>
                {activeVariant.size_label}
              </span>
              <span className="text-base font-black tabular-nums" style={{ color: 'var(--g1-text)' }}>
                ₹{activeVariant.price}
              </span>
            </div>
            <button
              type="button"
              disabled={activeVariant.stock <= 0}
              onClick={() => {
                if (activeVariant.stock > 0) {
                  onAddToCart(activeVariant);
                  onClose();
                }
              }}
              className="h-10 px-5 rounded-xl font-extrabold text-xs text-white g1-press flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              style={{ backgroundColor: 'var(--g1-primary)' }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>ADD TO CART</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a clean unit display string only when BOTH quantity AND unit exist.
 * Returns null (and logs to DATA_ISSUES) when data is incomplete.
 */
function formatUnit(product: Product, variant: ProductVariant | null): string | null {
  // Prefer variant size_label (already formatted, e.g. "1 kg")
  if (variant?.size_label && variant.size_label.trim() && variant.size_label !== '1 unit') {
    return variant.size_label;
  }
  const unit = product.unit?.trim();
  // Guard: bare "g" or "1 unit" without context — hide and log
  if (!unit || unit === 'g' || unit === 'unit' || unit === '1 unit') {
    return null;
  }
  return unit;
}

/**
 * Returns the brand if it's not a local/unbranded marker.
 * The "LOCAL / UNBRANDED" label is suppressed per spec.
 */
function getBrand(product: Product): string | null {
  const b = product.brand?.trim();
  if (!b) return null;
  // Suppress generic unbranded labels
  if (/local\s*\/?\s*unbranded/i.test(b)) return null;
  if (/^unbranded$/i.test(b)) return null;
  return b;
}

// ---------------------------------------------------------------------------
// Product Card
// ---------------------------------------------------------------------------

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addToCart, updateCartQuantity, getItemQuantity } = useCart();

  const variants: ProductVariant[] = product.variants ?? [];
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(firstInStock);
  const [sheetOpen, setSheetOpen] = useState(false);

  const effectivePrice = activeVariant?.price ?? product.price;
  const effectiveMrp = activeVariant?.mrp ?? product.originalPrice;
  const effectiveInStock =
    variants.length > 0
      ? Boolean(activeVariant && activeVariant.stock > 0)
      : product.inStock;
  const discount =
    effectiveMrp > effectivePrice && effectiveMrp > 0
      ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100)
      : product.discountPercentage;

  const quantity = getItemQuantity(product.id, activeVariant?.id);
  const unitLabel = formatUnit(product, activeVariant);
  const brandLabel = getBrand(product);

  const handleAdd = useCallback(() => {
    addToCart(product, 1, activeVariant ?? undefined);
  }, [addToCart, product, activeVariant]);

  const handleIncrease = useCallback(() => {
    updateCartQuantity(product.id, quantity + 1, activeVariant?.id);
  }, [updateCartQuantity, product.id, quantity, activeVariant]);

  const handleDecrease = useCallback(() => {
    updateCartQuantity(product.id, quantity - 1, activeVariant?.id);
  }, [updateCartQuantity, product.id, quantity, activeVariant]);

  return (
    <>
      <div
        className="group relative flex flex-col justify-between min-w-0 select-none bg-[var(--g1-bg)]"
        style={{
          padding: compact ? 6 : 8,
          borderRadius: 'var(--g1-r-card)',
          border: '1px solid var(--g1-border)',
          boxShadow: 'var(--g1-e1)',
        }}
      >
        {/* Image area — 1:1, object-fit contain, no background behind cut-outs */}
        <Link
          href={`/product/${product.id}`}
          className="relative w-full aspect-square overflow-hidden flex items-center justify-center mb-2 block"
          style={{ backgroundColor: 'var(--g1-bg)' }}
        >
          {/* Discount badge — yellow accent, only when real MRP > price */}
          {discount > 0 && effectiveInStock && (
            <span
              className="absolute top-1.5 left-1.5 z-10 text-[9px] font-black px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--g1-yellow)', color: '#000' }}
            >
              {discount}% OFF
            </span>
          )}

          {/* Out-of-stock overlay */}
          {!effectiveInStock && (
            <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center p-2 text-center">
              <span className="text-[10px] font-bold px-2 py-1 rounded-md"
                style={{ backgroundColor: 'var(--g1-text)', color: '#fff' }}>
                Out of Stock
              </span>
            </div>
          )}

          {/* Product image */}
          <ProductImage
            imageUrl={activeVariant?.image_url || product.image_url || product.imageUrl}
            imageStatus={product.image_status || product.imageStatus}
            alt={product.name}
            name={product.name}
            brand={product.brand}
            category={product.category}
            subCategory={product.subCategory}
            className="group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between gap-1 min-w-0">
          {/* Brand — 12px secondary, one line, only if branded */}
          {brandLabel && (
            <div className="text-[11px] truncate uppercase tracking-wider leading-none"
              style={{ color: 'var(--g1-text-secondary)', fontWeight: 500 }}>
              {brandLabel}
            </div>
          )}

          {/* Product name link */}
          <Link href={`/product/${product.id}`} className="block">
            <h3
              className="line-clamp-2 leading-snug group-hover:text-[var(--g1-primary)] transition-colors"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--g1-text)', minHeight: '2.5em' }}
            >
              {product.name}
            </h3>
          </Link>

          {/* Unit / Variant Selector */}
          {variants.length > 1 ? (
            <div className="flex flex-wrap items-center gap-1 my-0.5">
              {variants.slice(0, 2).map((v) => {
                const isSelected = activeVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveVariant(v);
                    }}
                    className="px-1.5 py-0.5 text-[11px] font-bold rounded transition-all g1-press whitespace-nowrap"
                    style={{
                      backgroundColor: isSelected ? 'var(--g1-primary)' : 'var(--g1-surface)',
                      color: isSelected ? '#FFFFFF' : 'var(--g1-text-secondary)',
                      border: isSelected ? '1px solid var(--g1-primary)' : '1px solid var(--g1-border)',
                    }}
                  >
                    {v.size_label}
                  </button>
                );
              })}
              {variants.length > 2 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSheetOpen(true);
                  }}
                  className="px-1.5 py-0.5 text-[11px] font-semibold rounded transition-all flex items-center gap-0.5"
                  style={{
                    backgroundColor: 'var(--g1-surface)',
                    color: 'var(--g1-primary)',
                    border: '1px dashed var(--g1-primary)',
                  }}
                >
                  +{variants.length - 2} more <ChevronDown className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ) : unitLabel ? (
            <div
              className="self-start px-1.5 py-0.5 leading-none text-[11px] font-medium"
              style={{
                borderRadius: 'var(--g1-r-chip)',
                backgroundColor: 'var(--g1-surface)',
                color: 'var(--g1-text-secondary)',
                border: '1px solid var(--g1-border)',
              }}
            >
              {unitLabel}
            </div>
          ) : null}

          {/* Price + ADD/stepper */}
          <div className={`pt-1 flex gap-1 min-w-0 ${compact ? 'flex-col items-stretch' : 'items-center justify-between'}`}>
            <div className="flex items-baseline gap-1 min-w-0 shrink-0">
              {effectivePrice > 0 ? (
                <>
                  <span className="font-bold tabular-nums leading-none" style={{ fontSize: 14, color: 'var(--g1-text)' }}>
                    ₹{effectivePrice}
                  </span>
                  {effectiveMrp > effectivePrice && (
                    <span className="text-[11px] line-through tabular-nums leading-none" style={{ color: 'var(--g1-text-secondary)' }}>
                      ₹{effectiveMrp}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold px-1 py-0.5 rounded"
                  style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                  Price TBA
                </span>
              )}
            </div>

            {/* ADD / stepper — 32px high, outlined green, radius 8, becomes solid green */}
            {effectiveInStock ? (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex items-center justify-center gap-0.5 g1-press transition-all ${compact ? 'w-full' : ''}`}
                  style={{
                    height: 32, paddingLeft: 8, paddingRight: 8,
                    border: '1.5px solid var(--g1-primary)',
                    borderRadius: 8,
                    color: 'var(--g1-primary)',
                    backgroundColor: 'var(--g1-bg)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  <span>ADD</span>
                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                </button>
              ) : (
                <div
                  className={`flex items-center justify-between ${compact ? 'w-full' : ''}`}
                  style={{
                    height: 32, minWidth: compact ? '100%' : 80,
                    borderRadius: 8,
                    backgroundColor: 'var(--g1-primary)',
                    color: '#fff',
                    padding: '0 4px',
                  }}
                >
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={handleDecrease}
                    className="w-7 h-7 flex items-center justify-center rounded active:bg-black/15"
                  >
                    <Minus className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                  <span className="w-6 text-center text-xs font-black tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={handleIncrease}
                    className="w-7 h-7 flex items-center justify-center rounded active:bg-black/15"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              )
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text-secondary)' }}>
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>

      {sheetOpen && variants.length > 1 && (
        <VariantSheet
          product={product}
          variants={variants}
          activeVariant={activeVariant}
          onSelect={(v) => setActiveVariant(v)}
          onAddToCart={(v) => addToCart(product, 1, v)}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
