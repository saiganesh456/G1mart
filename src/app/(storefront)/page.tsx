import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, Coffee, ShieldCheck, Zap } from 'lucide-react';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import HorizontalCategoryNav from '@/components/storefront/HorizontalCategoryNav';
import BlinkitCategorySection from '@/components/storefront/BlinkitCategorySection';
import ProductGrid from '@/components/storefront/ProductGrid';
import { productService } from '@/services/productService';

export default async function HomePage() {
  const allProducts = await productService.getProducts();

  const popularCandidates = allProducts.filter((p) => p.isPopular);
  const popularProducts = popularCandidates.length > 0 ? popularCandidates.slice(0, 10) : allProducts.slice(0, 10);

  const stapleProducts = allProducts.filter((p) => p.category === 'grocery-staples').slice(0, 10);
  const snackBeverageProducts = allProducts.filter((p) => p.category === 'snacks-beverages').slice(0, 10);
  const cleaningProducts = allProducts.filter((p) => p.category === 'household-cleaning').slice(0, 10);
  const poojaProducts = allProducts.filter((p) => p.category === 'pooja-essentials').slice(0, 10);
  const personalCareProducts = allProducts.filter((p) => p.category === 'personal-care').slice(0, 10);

  return (
    <div className="space-y-4 pb-20 sm:pb-12 pt-1 sm:pt-3 px-1 sm:px-0">
      {/* Compact Banner Carousel (<= 110px) */}
      <BannerCarousel />

      {/* Quick Action Row: Order Again & Upload List */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link
          href="/order-again"
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-base font-bold">↺</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-[#212121] leading-tight">Order Again</div>
            <p className="text-[10px] text-stone-500 truncate">1-tap repeat orders</p>
          </div>
        </Link>

        <Link
          href="/order-again?tab=list"
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/90 hover:bg-stone-100 transition-all shadow-2xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-700 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-base font-bold">📝</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-[#212121] leading-tight">Monthly List</div>
            <p className="text-[10px] text-stone-500 truncate">Saved essentials</p>
          </div>
        </Link>
      </div>

      {/* Top Departments Navigation Strip */}
      <HorizontalCategoryNav />

      {/* Popular Fast-Moving Items */}
      <section id="top-essentials" className="scroll-mt-32 space-y-3 px-1 sm:px-0">
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

      {/* Blinkit Style Categorized Department Sections (Pastel 4-Col Grids) */}
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
