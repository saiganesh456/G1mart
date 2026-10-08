'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Minus, ChevronDown, X, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/types';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Variant Bottom-Sheet
// ---------------------------------------------------------------------------

interface VariantSheetProps {
  product: Product;
  variants: ProductVariant[];
  activeVariant: ProductVariant | null;
  onSelect: (v: ProductVariant) => void;
  onClose: () => void;
}

function VariantSheet({ product, variants, activeVariant, onSelect, onClose }: VariantSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[61] bg-white rounded-t-2xl shadow-2xl max-w-md mx-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>
        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-stone-100">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{product.brand}</p>
            <h3 className="text-sm font-extrabold text-stone-900 leading-snug line-clamp-2">{product.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 shrink-0 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Variant List */}
        <div className="px-3 pt-2 space-y-1.5 overflow-y-auto max-h-[55vh]">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1 mb-2">Select Size / Pack</p>
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
                onClick={() => {
                  if (!outOfStock) {
                    onSelect(v);
                    onClose();
                  }
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all active:scale-[0.98] ${
                  outOfStock
                    ? 'opacity-40 cursor-not-allowed bg-stone-50'
                    : isActive
                      ? 'bg-emerald-50 border-2 border-[#2E7D32] shadow-xs'
                      : 'bg-white border border-stone-200 hover:border-[#2E7D32] hover:bg-emerald-50/30'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Check icon for selected */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isActive ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-stone-300'
                  }`}>
                    {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-bold text-stone-800 leading-tight">{v.size_label}</span>
                    {outOfStock && (
                      <span className="ml-2 text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {discount > 0 && !outOfStock && (
                    <span className="text-[10px] font-black text-[#137333] bg-emerald-50 px-1.5 py-0.5 rounded">
                      {discount}% OFF
                    </span>
                  )}
                  <div className="text-right">
                    <div className="text-xs font-black text-stone-900 tabular-nums">₹{v.price}</div>
                    {v.mrp > v.price && (
                      <div className="text-[10px] text-stone-400 line-through tabular-nums">₹{v.mrp}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Product Card
// ---------------------------------------------------------------------------

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addToCart, updateCartQuantity, getItemQuantity } = useCart();

  // -- Variants: prefer product.variants, otherwise empty
  const variants: ProductVariant[] = product.variants ?? [];

  // Initialise active variant as the cheapest in-stock one
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(firstInStock);
  const [sheetOpen, setSheetOpen] = useState(false);

  // -- Effective price / mrp from active variant (or product baseline)
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

  // -- Cart quantity for the current product+variant combo
  const quantity = getItemQuantity(product.id, activeVariant?.id);

  // -- Variant chip label (e.g. "75g ⌄")
  const chipLabel = activeVariant ? activeVariant.size_label : (product.unit || '1 unit');

  const handleAdd = useCallback(() => {
    addToCart(product, 1, activeVariant ?? undefined);
  }, [addToCart, product, activeVariant]);

  const handleIncrease = useCallback(() => {
    updateCartQuantity(product.id, quantity + 1, activeVariant?.id);
  }, [updateCartQuantity, product.id, quantity, activeVariant]);

  const handleDecrease = useCallback(() => {
    updateCartQuantity(product.id, quantity - 1, activeVariant?.id);
  }, [updateCartQuantity, product.id, quantity, activeVariant]);

  const handleVariantSelect = useCallback((v: ProductVariant) => {
    setActiveVariant(v);
  }, []);

  return (
    <>
      <div
        className={`group relative bg-white flex flex-col justify-between cursor-pointer select-none ${
          compact ? 'p-1' : 'p-1.5 sm:p-2'
        }`}
      >
        {/* Image area */}
        <div className="relative w-full aspect-square overflow-hidden bg-white flex items-center justify-center mb-1.5">
          {/* Discount badge */}
          {discount > 0 && effectiveInStock && (
            <span className="absolute top-1.5 left-1.5 z-10 bg-[#137333] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs tracking-tight uppercase">
              {discount}% OFF
            </span>
          )}

          {/* Out-of-stock overlay */}
          {!effectiveInStock && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
              <span className="bg-stone-800 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
                Out of Stock
              </span>
            </div>
          )}

          {/* Product image — cut-out packshot on white */}
          <ProductImage
            imageUrl={product.image_url || product.imageUrl}
            imageStatus={product.image_status || product.imageStatus}
            alt={product.name}
            className="group-hover:scale-105"
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between gap-1">
          {/* Brand */}
          <div className="text-[10px] font-bold text-stone-400 truncate uppercase tracking-wider leading-none">
            {product.brand}
          </div>

          {/* Product name — max 2 lines */}
          <h3 className="text-[11px] sm:text-xs font-extrabold text-stone-900 line-clamp-2 leading-snug min-h-[2.5em] group-hover:text-[#2E7D32] transition-colors">
            {product.name}
          </h3>

          {/* Size chip — tapping opens variant sheet */}
          {(variants.length > 0 || product.unit) && (
            <button
              type="button"
              onClick={() => variants.length > 1 && setSheetOpen(true)}
              className={`self-start flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[10px] font-bold transition-colors leading-none ${
                variants.length > 1
                  ? 'border-stone-200 bg-stone-50 text-stone-600 hover:border-[#2E7D32] hover:bg-emerald-50 hover:text-[#2E7D32] cursor-pointer'
                  : 'border-stone-100 bg-stone-50 text-stone-500 cursor-default'
              }`}
              aria-label={variants.length > 1 ? `Select size — currently ${chipLabel}` : chipLabel}
            >
              <span className="truncate max-w-[70px]">{chipLabel}</span>
              {variants.length > 1 && <ChevronDown className="w-2.5 h-2.5 shrink-0" />}
            </button>
          )}

          {/* Price + ADD button */}
          <div className="pt-0.5 flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 min-w-0">
              {effectivePrice > 0 ? (
                <>
                  <span className="text-xs sm:text-sm font-black text-stone-900 tabular-nums leading-none">
                    ₹{effectivePrice}
                  </span>
                  {effectiveMrp > effectivePrice && (
                    <span className="text-[10px] text-stone-400 line-through tabular-nums leading-none">
                      ₹{effectiveMrp}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded tracking-tight">
                  Price TBA
                </span>
              )}
            </div>

            {/* ADD / Stepper */}
            {effectiveInStock ? (
              quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="h-7 px-2 rounded-lg border border-[#2E7D32] bg-white hover:bg-[#2E7D32] text-[#2E7D32] hover:text-white font-extrabold text-[11px] tracking-wide transition-all active:scale-95 flex items-center gap-0.5 shadow-xs shrink-0"
                >
                  <span>ADD</span>
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              ) : (
                <div className="h-7 flex items-center bg-[#2E7D32] text-white rounded-lg shadow-xs px-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={handleDecrease}
                    className="w-5 h-6 flex items-center justify-center hover:bg-black/15 rounded active:scale-90"
                  >
                    <Minus className="w-3 h-3 stroke-[3]" />
                  </button>
                  <span className="w-5 text-center text-xs font-black tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={handleIncrease}
                    className="w-5 h-6 flex items-center justify-center hover:bg-black/15 rounded active:scale-90"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              )
            ) : (
              <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md shrink-0">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Variant Bottom Sheet (portal-style, rendered in DOM flow but fixed) */}
      {sheetOpen && variants.length > 1 && (
        <VariantSheet
          product={product}
          variants={variants}
          activeVariant={activeVariant}
          onSelect={handleVariantSelect}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
