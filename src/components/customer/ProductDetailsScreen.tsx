import React, { useState } from 'react';
import {
  Heart,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../common/ProductCard';

export const ProductDetailsScreen: React.FC = () => {
  const {
    selectedProduct,
    products,
    cart,
    addToCart,
    updateCartQuantity,
    toggleWishlist,
    isWishlisted,
    navigate,
    currentLocation,
  } = useApp();

  const product = selectedProduct || products[0];
  const wishlisted = isWishlisted(product.id);
  const cartItem = cart.find((i) => i.product.id === product.id);
  const [localQty, setLocalQty] = useState<number>(cartItem?.quantity || 1);

  // Similar products in the same category
  const similarProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, localQty);
  };

  const handleBuyNow = () => {
    addToCart(product, localQty);
    navigate('cart');
  };

  const savings = Math.max(0, product.originalPrice - product.price);

  return (
    <div className="flex-1 pb-20 flex flex-col space-y-8 select-none">
      {/* Breadcrumb Navigation on Desktop */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="hover:text-[#2E7D32] transition-colors"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <button
          type="button"
          onClick={() => navigate('category', { categoryId: product.category })}
          className="hover:text-[#2E7D32] transition-colors capitalize"
        >
          {product.category.replace('-', ' ')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-800 font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </div>

      {/* Main PDP 2-Column Split Module */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 p-5 sm:p-8">
          {/* Left Column: Image Stage */}
          <div className="flex flex-col space-y-4">
            <div className="relative w-full aspect-4/3 sm:aspect-square rounded-2xl bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://placehold.co/600x600/e8f5e9/2e7d32?text=G1+Mart+Fresh';
                }}
              />

              {/* Discount Badge */}
              {product.discountPercentage > 0 && (
                <span className="absolute top-4 left-4 bg-[#2E7D32] text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                  {product.discountPercentage}% OFF
                </span>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md flex items-center justify-center text-stone-600 hover:text-red-500 active:scale-90 transition-all"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Out of Stock Overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl tracking-wider uppercase">
                    Currently Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Trust Features under image */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                <Truck className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-stone-700 block">15-30 Mins</span>
                <span className="text-[9px] text-stone-400">Doorstep Delivery</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                <RotateCcw className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-stone-700 block">Easy Return</span>
                <span className="text-[9px] text-stone-400">At delivery check</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-center">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-stone-700 block">100% Quality</span>
                <span className="text-[9px] text-stone-400">Guaranteed Fresh</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Brand and Net Weight */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] bg-[#2E7D32]/10 px-2.5 py-0.5 rounded-md">
                  {product.brand}
                </span>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  Pack Size: {product.unit}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-[#212121] leading-snug">
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded-md text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-stone-500">
                  {product.reviewsCount} verified customer ratings
                </span>
              </div>

              {/* Price & Savings */}
              <div className="pt-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#212121] tabular-nums">
                    ₹{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm sm:text-base text-stone-400 line-through tabular-nums">
                      MRP ₹{product.originalPrice}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save ₹{savings}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  (Inclusive of all taxes)
                </span>
              </div>

              {/* Delivery ETA Badge */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-medium">
                  <Clock className="w-4 h-4 text-[#2E7D32]" />
                  <span>Delivery in 15-30 mins to <strong>{currentLocation.split(',')[0]}</strong></span>
                </div>
                <span className="text-[10px] font-bold text-[#2E7D32] uppercase">Express</span>
              </div>

              {/* Description */}
              <div className="pt-1">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Product Overview
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Purchase Controls & CTAs */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              {product.inStock ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-stone-600">Quantity:</span>
                    <div className="flex items-center bg-stone-100 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm tabular-nums">
                        {localQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLocalQty((q) => q + 1)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="h-12 bg-white hover:bg-stone-50 text-[#2E7D32] border-2 border-[#2E7D32] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#2E7D32]/25 active:scale-98 transition-all"
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  disabled
                  className="w-full h-12 bg-stone-100 text-stone-400 font-bold text-xs rounded-xl cursor-not-allowed"
                >
                  Product Currently Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Responsive Grid */}
      {similarProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-black text-[#212121]">
              Similar Items in this Category
            </h3>
            <button
              type="button"
              onClick={() => navigate('category', { categoryId: product.category })}
              className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
