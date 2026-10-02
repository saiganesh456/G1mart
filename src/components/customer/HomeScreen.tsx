import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Tag,
  Clock,
  ShieldCheck,
  TrendingUp,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';

export const HomeScreen: React.FC = () => {
  const { products, navigate, setSelectedCategoryId, currentDeliveryZone } = useApp();
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      id: 1,
      title: 'Fresh groceries delivered fast',
      subtitle: `Farm fresh produce directly to your doorstep in ${currentDeliveryZone?.estimatedDeliveryTimeText || '30-60 mins'} across Nellore`,
      tag: 'SUPER FAST',
      image: '/assets/images/g1_grocery_delivery_hero_1790614094753.jpg',
      cta: 'Order Now',
      categoryId: 'fruits-vegetables',
    },
    {
      id: 2,
      title: 'Special offers on daily essentials',
      subtitle: 'Save up to 25% on atta, rice, dals, oils & household needs',
      tag: 'DAILY SAVINGS',
      image: '/assets/images/g1_special_offers_banner_1790614114336.jpg',
      cta: 'View Deals',
      categoryId: 'rice-dal-atta',
    },
    {
      id: 3,
      title: `Free delivery on orders above ₹${currentDeliveryZone?.freeDeliveryThreshold || 499}`,
      subtitle: `Zero delivery charges on eligible orders across ${currentDeliveryZone?.name || 'Nellore'}`,
      tag: 'ZERO FEE',
      image: '/assets/images/g1_dairy_bakery_showcase_1790614143664.jpg',
      cta: 'Shop Now',
      categoryId: 'dairy-bakery',
    },
  ];

  // Auto rotate banners every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const popularProducts = products.filter((p) => p.isPopular).slice(0, 8);
  const bestDealProducts = products.filter((p) => p.isBestDeal).slice(0, 8);

  const handleCategoryClick = (catId: string) => {
    setSelectedCategoryId(catId);
    navigate('category', { categoryId: catId });
  };

  const handlePrevBanner = () => {
    setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextBanner = () => {
    setActiveBanner((prev) => (prev + 1) % banners.length);
  };

  const productGridClass =
    'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

  return (
    <div className="flex-1 pb-20 space-y-5 sm:space-y-7 select-none">
      {/* Mobile Search Bar Trigger (Visible on mobile screens < md when header search isn't shown) */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => navigate('search')}
          className="w-full h-11 bg-white rounded-xl border border-stone-200/90 shadow-2xs px-3.5 flex items-center justify-between text-stone-400 hover:border-[#2E7D32] hover:text-stone-600 transition-all text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span className="text-xs text-stone-500 font-medium truncate">
              Search groceries, fruits and essentials...
            </span>
          </div>
          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
            FIND
          </span>
        </button>
      </div>

      {/* Hero Promotional Banner Carousel (Responsive height) */}
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:h-72 xl:h-80 bg-stone-900 shadow-md group">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                activeBanner === index ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-100 group-hover:scale-102 transition-transform duration-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://placehold.co/1200x500/1b5e20/ffffff?text=G1+Mart+Supermarket';
                }}
              />
              {/* Dark Gradient Overlay for optimal contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 p-4 sm:p-8 flex flex-col justify-end text-white">
                <span className="inline-block bg-[#FF9800] text-black text-[9px] sm:text-xs font-black px-2 py-0.5 rounded mb-1.5 w-max shadow-xs">
                  {banner.tag}
                </span>
                <h2 className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight line-clamp-1 max-w-xl">
                  {banner.title}
                </h2>
                <p className="text-[11px] sm:text-sm text-white/90 line-clamp-1 sm:line-clamp-2 mt-0.5 font-normal max-w-lg">
                  {banner.subtitle}
                </p>
                <div className="mt-2.5 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(banner.categoryId)}
                    className="h-7 sm:h-9 px-3.5 sm:px-5 bg-white hover:bg-stone-100 text-[#212121] text-xs sm:text-sm font-bold rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    {banner.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Prev/Next Buttons (Desktop and tablet visible) */}
          <button
            type="button"
            onClick={handlePrevBanner}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-800 items-center justify-center shadow-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextBanner}
            aria-label="Next slide"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-800 items-center justify-center shadow-md transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Banner Dots */}
          <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setActiveBanner(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeBanner === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trust Guarantees Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/80 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-center divide-x-0 md:divide-x divide-stone-100">
          <div className="flex items-center justify-center gap-2 text-stone-700">
            <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold block leading-tight">15-30 Mins</span>
              <span className="text-[10px] text-stone-400">Express Delivery</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-stone-700">
            <Zap className="w-4 h-4 text-[#FF9800] shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold block leading-tight">Direct Farm Fresh</span>
              <span className="text-[10px] text-stone-400">Handpicked Quality</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-stone-700">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold block leading-tight">COD Available</span>
              <span className="text-[10px] text-stone-400">Pay at Doorstep</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-stone-700">
            <RotateCcw className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold block leading-tight">Easy Returns</span>
              <span className="text-[10px] text-stone-400">Instant Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Category Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black text-[#212121] tracking-tight">
            Shop by Category
          </h2>
          <button
            type="button"
            onClick={() => navigate('category', { categoryId: INITIAL_CATEGORIES[0].id })}
            className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-0.5"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Grid for Desktop & Tablet (hidden on mobile < sm) */}
        <div className="hidden sm:grid sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs hover:border-[#2E7D32] hover:shadow-sm transition-all group text-center active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-50 group-hover:bg-[#2E7D32]/10 flex items-center justify-center text-2xl transition-colors mb-2">
                {cat.id === 'fruits-vegetables' && '🥦'}
                {cat.id === 'dairy-bakery' && '🥛'}
                {cat.id === 'rice-dal-atta' && '🌾'}
                {cat.id === 'snacks' && '🍪'}
                {cat.id === 'beverages' && '☕'}
                {cat.id === 'personal-care' && '✨'}
                {cat.id === 'household' && '🏠'}
                {cat.id === 'baby-care' && '👶'}
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-[#2E7D32] leading-tight line-clamp-2 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Carousel (Shown on mobile < sm) */}
        <div className="sm:hidden flex items-start gap-2.5 overflow-x-auto no-scrollbar pb-1 px-1">
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center min-w-[72px] max-w-[76px] group text-center shrink-0 active:scale-95 transition-transform"
            >
              <div className="w-15 h-15 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center group-hover:border-[#2E7D32] group-hover:bg-[#2E7D32]/5 transition-all mb-1.5">
                <span className="text-xl">
                  {cat.id === 'fruits-vegetables' && '🥦'}
                  {cat.id === 'dairy-bakery' && '🥛'}
                  {cat.id === 'rice-dal-atta' && '🌾'}
                  {cat.id === 'snacks' && '🍪'}
                  {cat.id === 'beverages' && '☕'}
                  {cat.id === 'personal-care' && '✨'}
                  {cat.id === 'household' && '🏠'}
                  {cat.id === 'baby-care' && '👶'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-stone-700 leading-tight line-clamp-2 group-hover:text-[#2E7D32] transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Best Deals Section with High-Converting Blinkit Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF9800]/15 text-[#FF9800] flex items-center justify-center">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#212121] tracking-tight">
              Best Deals of the Day
            </h2>
            <span className="text-[10px] font-extrabold text-[#FF9800] bg-[#FF9800]/10 px-2 py-0.5 rounded-full">
              Up to 25% Off
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('search')}
            className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Uniform 2-column Grid for Mobile / Responsive for Desktop */}
        <div className={productGridClass}>
          {bestDealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Popular Products Section with High-Converting Blinkit Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#212121] tracking-tight">
              Popular Groceries in {currentDeliveryZone?.name || 'Nellore'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('search')}
            className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-0.5"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Uniform 2-column Grid for Mobile / Responsive for Desktop */}
        <div className={productGridClass}>
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
