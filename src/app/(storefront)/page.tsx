import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, Coffee, ShieldCheck, Zap, ClipboardList, ScanLine } from 'lucide-react';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import HorizontalCategoryNav from '@/components/storefront/HorizontalCategoryNav';
import BlinkitCategorySection from '@/components/storefront/BlinkitCategorySection';
import ProductGrid from '@/components/storefront/ProductGrid';
import { productService } from '@/services/productService';

export default async function HomePage() {
  const allProducts = await productService.getProducts();

  const popularCandidates = allProducts.filter((p) => p.isPopular);
  const popularProducts = popularCandidates.length > 0 ? popularCandidates : allProducts.slice(0, 12);

  const stapleProducts = allProducts.filter((p) => p.category === 'grocery-staples').slice(0, 10);
  const snackBeverageProducts = allProducts.filter((p) => p.category === 'snacks-beverages').slice(0, 10);
  const cleaningProducts = allProducts.filter((p) => p.category === 'household-cleaning').slice(0, 10);
  const poojaProducts = allProducts.filter((p) => p.category === 'pooja-essentials').slice(0, 10);
  const personalCareProducts = allProducts.filter((p) => p.category === 'personal-care').slice(0, 10);

  return (
    <div className="space-y-4 pb-20 sm:pb-12 pt-1 sm:pt-3 px-1 sm:px-0">
      {/* Compact Banner Carousel (<= 110px) */}
      <BannerCarousel />

      {/* Monthly Grocery List & Slip Scanner Shortcut */}
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
                ₹2,000–₹3,000 Basket
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

      {/* Sticky Category Navigation Strip (Fixed under header while scrolling) */}
      <HorizontalCategoryNav />

      {/* Popular Fast-Moving Items */}
      <section id="top-essentials" className="scroll-mt-36 space-y-3 px-1 sm:px-0">
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
            <span>Explore all {allProducts.length} items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ProductGrid products={popularProducts} />
      </section>

      {/* Explore by Category: Blinkit 4-Col Grid of Verified Packshots */}
      <BlinkitCategorySection />

      {/* Grocery & Staples Department Showcase */}
      {stapleProducts.length > 0 && (
        <section id="grocery-kitchen" className="scroll-mt-32 space-y-3 px-1 sm:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🌾</span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                Atta, Rice, Dal &amp; Staples
              </h2>
            </div>
            <Link
              href="/category/grocery-staples"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all ({allProducts.filter((p) => p.category === 'grocery-staples').length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={stapleProducts} />
        </section>
      )}

      {/* Snacks & Beverages Showcase */}
      {snackBeverageProducts.length > 0 && (
        <section id="snacks-drinks" className="scroll-mt-32 space-y-3 px-1 sm:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-[#512DA8]" />
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                Snacks, Munchies &amp; Chai
              </h2>
            </div>
            <Link
              href="/category/snacks-beverages"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all ({allProducts.filter((p) => p.category === 'snacks-beverages').length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={snackBeverageProducts} />
        </section>
      )}

      {/* Household & Cleaning Department Showcase */}
      {cleaningProducts.length > 0 && (
        <section id="household-lifestyle" className="scroll-mt-32 space-y-3 px-1 sm:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🧼</span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                Household, Detergents &amp; Kitchen Care
              </h2>
            </div>
            <Link
              href="/category/household-cleaning"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all ({allProducts.filter((p) => p.category === 'household-cleaning').length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={cleaningProducts} />
        </section>
      )}

      {/* Pooja Essentials Department Showcase */}
      {poojaProducts.length > 0 && (
        <section id="pooja-section" className="scroll-mt-32 space-y-3 px-1 sm:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🪔</span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                Pooja Essentials, Agarbatti &amp; Dhoop
              </h2>
            </div>
            <Link
              href="/category/pooja-essentials"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all ({allProducts.filter((p) => p.category === 'pooja-essentials').length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={poojaProducts} />
        </section>
      )}

      {/* Personal Care Department Showcase */}
      {personalCareProducts.length > 0 && (
        <section id="personal-care-section" className="scroll-mt-32 space-y-3 px-1 sm:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                Bath Soaps, Grooming &amp; Personal Care
              </h2>
            </div>
            <Link
              href="/category/personal-care"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all ({allProducts.filter((p) => p.category === 'personal-care').length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ProductGrid products={personalCareProducts} />
        </section>
      )}

      {/* Complete Product Catalog */}
      <section className="space-y-3 px-1 sm:px-0 pt-2 border-t border-stone-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛒</span>
            <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              All Supermarket Products ({allProducts.length})
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            Verified In-Store Inventory
          </span>
        </div>
        <ProductGrid products={allProducts} />
      </section>
    </div>
  );
}
