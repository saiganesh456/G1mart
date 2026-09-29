import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../common/ProductCard';

export const WishlistScreen: React.FC = () => {
  const { wishlistIds, products, navigate, isMobileFrame } = useApp();

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const gridClass = isMobileFrame
    ? 'grid grid-cols-2 gap-2.5'
    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

  return (
    <div className="flex-1 pb-24 p-3.5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#212121]">
            My Wishlist
          </h2>
          <p className="text-xs text-stone-500">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className={gridClass}>
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200/80">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#212121]">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
            Tap the heart icon on any product to save it here for fast reordering.
          </p>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="mt-4 px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl"
          >
            Explore Groceries
          </button>
        </div>
      )}
    </div>
  );
};
