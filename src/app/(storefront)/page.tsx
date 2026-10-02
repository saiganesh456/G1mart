import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, Coffee, Cookie } from 'lucide-react';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import CategoryGrid from '@/components/storefront/CategoryGrid';
import ProductGrid from '@/components/storefront/ProductGrid';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/data/demo-seed';

export default function HomePage() {
  const popularProducts = DEMO_PRODUCTS.filter((p) => p.isPopular).slice(0, 10);
  const stapleProducts = DEMO_PRODUCTS.filter((p) => p.category === 'rice-dal-atta').slice(0, 10);
  const snackProducts = DEMO_PRODUCTS.filter((p) => p.category === 'snacks').slice(0, 10);
  const beverageProducts = DEMO_PRODUCTS.filter((p) => p.category === 'beverages').slice(0, 10);

  return (
    <div className="space-y-6 pb-20 sm:pb-12 pt-2 sm:pt-4 px-2 sm:px-0">
      {/* Hero Banner Carousel */}
      <BannerCarousel />

      {/* Categories Grid */}
      <CategoryGrid categories={DEMO_CATEGORIES} />

      {/* Popular Fast-Moving Items */}
      <section className="space-y-3 px-1 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#E65100]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Top Selling Essentials
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
          >
            <span>Explore all {DEMO_PRODUCTS.length} items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ProductGrid products={popularProducts} />
      </section>

      {/* Rice, Dals & Cooking Staples */}
      <section className="space-y-3 px-1 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🌾</span>
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Rice, Dals &amp; Atta Staples
            </h2>
          </div>
          <Link
            href="/category/rice-dal-atta"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ProductGrid products={stapleProducts} />
      </section>

      {/* Snacks, Biscuits & Chocolates */}
      <section className="space-y-3 px-1 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cookie className="w-4 h-4 text-[#FF9800]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Snacks &amp; Biscuits
            </h2>
          </div>
          <Link
            href="/category/snacks"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ProductGrid products={snackProducts} />
      </section>

      {/* Beverages & Tea */}
      <section className="space-y-3 px-1 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-[#512DA8]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Tea, Coffee &amp; Drinks
            </h2>
          </div>
          <Link
            href="/category/beverages"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ProductGrid products={beverageProducts} />
      </section>
    </div>
  );
}
