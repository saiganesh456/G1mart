import Link from 'next/link';
import { ArrowRight, Flame, ClipboardList } from 'lucide-react';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import HorizontalCategoryNav from '@/components/storefront/HorizontalCategoryNav';
import BlinkitCategorySection from '@/components/storefront/BlinkitCategorySection';
import ProductGrid from '@/components/storefront/ProductGrid';
import { productService } from '@/services/productService';

export default async function HomePage() {
  const allProducts = await productService.getProducts();

  // Pick top 6 verified fast-moving staples with confirmed rates & images
  const popularProducts = allProducts
    .filter((p) => p.priceConfirmed && p.price > 0 && p.imageStatus === 'VERIFIED')
    .slice(0, 6);

  return (
    <div className="space-y-4 pb-20 sm:pb-12 pt-1 sm:pt-3 px-1 sm:px-0">
      {/* 1. Hero Promotional Banner Carousel */}
      <BannerCarousel />

      {/* 2. Monthly Grocery List & Slip Scanner Shortcut */}
      <Link
        href="/monthly-list"
        className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#1b5e20] to-[#2E7D32] text-white shadow-sm hover:shadow-md active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-tight">Monthly Grocery Essentials</span>
              <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                1,267 Items
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 truncate">
              Pre-curated family staples • Scan paper slip with camera
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white group-hover:text-[#2E7D32] flex items-center justify-center transition-colors shrink-0">
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>

      {/* 3. Horizontal Category Rail (Flipkart Minutes Floating Cutout Style — NO boxes) */}
      <HorizontalCategoryNav />

      {/* 4. Category & Department Showcases (Flipkart Minutes & Blinkit Clean Grid) */}
      <BlinkitCategorySection />

      {/* 5. Compact Verified Fast-Moving Essentials Strip */}
      {popularProducts.length > 0 && (
        <section id="top-essentials" className="scroll-mt-36 space-y-3 px-1 sm:px-0 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#E65100]" />
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                Verified Store Bestsellers
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>Explore all {allProducts.length} items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={popularProducts} />
        </section>
      )}
    </div>
  );
}
