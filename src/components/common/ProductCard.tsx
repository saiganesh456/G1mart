import React from 'react';
import { Heart, Plus, Minus, Clock } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const {
    cart,
    addToCart,
    updateCartQuantity,
    toggleWishlist,
    isWishlisted,
    navigate,
  } = useApp();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const wishlisted = isWishlisted(product.id);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    navigate('product_details', { productId: product.id });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer select-none ${
        compact ? 'p-2' : 'p-2.5 sm:p-3'
      }`}
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F8F9FA] border border-stone-100/90 flex items-center justify-center mb-2">
        {/* Discount Badge (Top-Left) */}
        {product.discountPercentage > 0 && product.inStock && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-[#137333] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs tracking-tight uppercase">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
            <span className="bg-stone-800 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button (Top-Right) */}
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

        {/* 15 Mins Delivery Tag (Bottom-Left) */}
        <div className="absolute bottom-1.5 left-1.5 z-10 bg-white/95 backdrop-blur-xs text-stone-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1 leading-none border border-stone-100">
          <Clock className="w-2.5 h-2.5 text-[#2E7D32]" />
          <span>15 MINS</span>
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://placehold.co/300x300/f1f8e9/2e7d32?text=G1+Fresh';
          }}
        />
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Unit / Weight */}
          <div className="text-[11px] font-semibold text-stone-500 mb-0.5 truncate">
            {product.unit}
          </div>

          {/* Product Name (Always 2 Lines for Uniform Grid Alignment) */}
          <h3 className="text-xs sm:text-[13px] font-bold text-stone-900 line-clamp-2 leading-snug h-8 min-h-[32px] group-hover:text-[#2E7D32] transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 mt-2">
          {/* Price lockup */}
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-xs sm:text-sm font-black text-stone-900 tabular-nums">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-stone-400 line-through tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Blinkit Style ADD Button or Stepper */}
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
};
