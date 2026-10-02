import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import CategoryGrid from '@/components/storefront/CategoryGrid';
import ProductGrid from '@/components/storefront/ProductGrid';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/data/demo-seed';

export default function HomePage() {
  const popularProducts = DEMO_PRODUCTS.filter((p) => p.isPopular);
  const bestDealProducts = DEMO_PRODUCTS.filter((p) => p.isBestDeal);

  return (
    <div className="space-y-6 pb-20 sm:pb-12 pt-2 sm:pt-4 px-2 sm:px-0">
      {/* Hero Banner Carousel */}
      <BannerCarousel />

      {/* Categories Grid */}
      <CategoryGrid categories={DEMO_CATEGORIES} />

      {/* Popular Essentials Section */}
      <section className="space-y-3 px-1 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF9800]" />
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Popular Essentials
            </h2>
          </div>
          <Link
            href="/category/fruits-vegetables"
            className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ProductGrid products={popularProducts} />
      </section>

      {/* Best Value Section */}
      <section className="space-y-3 px-1 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏷️</span>
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Everyday Staples
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
        <ProductGrid products={bestDealProducts} />
      </section>
    </div>
  );
}
