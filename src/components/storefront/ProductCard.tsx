'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const router = useRouter();
  const { cart, addToCart, updateCartQuantity, toggleWishlist, isWishlisted } = useCart();

  const cartItem = cart.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const wishlisted = isWishlisted(product.id);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
        compact ? 'p-1' : 'p-1.5 sm:p-2'
      }`}
    >
      {/* Image — sits directly on pure white canvas, no gray boxes or borders */}
      <div className="relative w-full aspect-square overflow-hidden bg-white flex items-center justify-center mb-1.5">
        {/* Discount badge - only if price confirmed and discount exists */}
        {product.priceConfirmed && product.discountPercentage > 0 && product.inStock && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-[#137333] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs tracking-tight uppercase">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Ambiguous product badge if flagged */}
        {product.is_ambiguous && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs tracking-tight uppercase">
            Review Flag
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
            <span className="bg-stone-800 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-400 hover:text-red-500 shadow-2xs transition-colors"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
              wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'
            }`}
          />
        </button>

        {/* Canonical product image with authentic status check */}
        <ProductImage
          imageUrl={product.image_url || (product as any).imageUrl}
          imageStatus={product.image_status || (product as any).imageStatus}
          alt={product.name}
          className="group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-stone-500 mb-0.5 truncate">
            {product.unit}
          </div>
          <h3 className="text-xs sm:text-[13px] font-bold text-stone-900 line-clamp-2 leading-snug h-8 min-h-[32px] group-hover:text-[#2E7D32] transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price + action */}
        <div className="pt-1.5 flex items-center justify-between gap-1 mt-1.5">
          <div className="flex items-baseline gap-1 min-w-0">
            {((product.price && product.price > 0) || (product.originalPrice && product.originalPrice > 0)) ? (
              <>
                <span className="text-xs sm:text-sm font-black text-stone-900 tabular-nums">
                  ₹{product.price > 0 ? product.price : product.originalPrice}
                </span>
                {product.originalPrice > product.price && product.price > 0 && (
                  <span className="text-[10px] text-stone-400 line-through tabular-nums">
                    ₹{product.originalPrice}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded tracking-tight">
                Price TBA
              </span>
            )}
          </div>

          {product.inStock ? (
            quantity === 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className="h-7 px-2.5 sm:px-3 rounded-lg border border-[#2E7D32] bg-white hover:bg-[#2E7D32] text-[#2E7D32] hover:text-white font-extrabold text-[11px] sm:text-xs tracking-wide transition-all active:scale-95 flex items-center gap-0.5 shadow-2xs shrink-0"
              >
                <span>ADD</span>
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="h-7 flex items-center bg-[#2E7D32] text-white rounded-lg shadow-xs px-1 shrink-0"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateCartQuantity(product.id, quantity - 1)}
                  className="w-5 h-6 flex items-center justify-center hover:bg-black/15 rounded active:scale-90"
                >
                  <Minus className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="w-5 text-center text-xs font-black tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateCartQuantity(product.id, quantity + 1)}
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
  );
}
