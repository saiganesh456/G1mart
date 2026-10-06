import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { productService } from '@/services/productService';
import HorizontalCategoryNav from '@/components/storefront/HorizontalCategoryNav';
import CategoryTile from '@/components/storefront/CategoryTile';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | G1 Mart Supermarket',
  description: 'Explore all supermarket grocery departments and daily essentials at G1 Mart.',
};

// Visual image mapping for quick-commerce subcategories
const SUBCAT_IMAGE_MAP: Record<string, { image: string; fallback: string; bg: string }> = {
  'Laundry & Fabric Care': { image: '/products/packshots/surf-excel.jpg', fallback: '🧺', bg: 'bg-indigo-50/70' },
  'Dishwashing & Kitchen Care': { image: '/products/packshots/exo-scrubber.jpg', fallback: '🧽', bg: 'bg-emerald-50/70' },
  'Floor & Surface Cleaners': { image: '/products/packshots/ariel-front-liq.jpg', fallback: '✨', bg: 'bg-cyan-50/70' },
  'Pest Control & Cleaning Aids': { image: '/products/photos/cleaning-wash.jpg', fallback: '🛡️', bg: 'bg-purple-50/70' },
  'Bath Soaps': { image: '/categories/personal-care.jpg', fallback: '🫧', bg: 'bg-rose-50/70' },
  'Talcum Powder': { image: '/products/packshots/dettol-soap.jpg', fallback: '🌸', bg: 'bg-amber-50/70' },
  'Baby Care': { image: '/products/packshots/amul-milk.jpg', fallback: '👶', bg: 'bg-pink-50/70' },
  'Oral Care': { image: '/products/packshots/colgate-toothpaste.jpg', fallback: '🪥', bg: 'bg-sky-50/70' },
  'Agarbatti & Incense Sticks': { image: '/products/photos/pooja-camphor.jpg', fallback: '🪔', bg: 'bg-amber-50/70' },
  'Dhoop & Sambrani': { image: '/products/photos/pooja-camphor.jpg', fallback: '🕯️', bg: 'bg-yellow-50/70' },
  'Cooking Staples & Flours': { image: '/categories/atta-rice-dal.jpg', fallback: '🌾', bg: 'bg-amber-50/70' },
  'Atta, Flours & Sooji': { image: '/products/packshots/aashirvaad-atta-1kg.jpg', fallback: '🌾', bg: 'bg-amber-50/70' },
  'Pickles & Chutneys': { image: '/categories/masala-oil.jpg', fallback: '🫙', bg: 'bg-orange-50/70' },
  'Salt, Sugar & Jaggery': { image: '/products/packshots/tata-salt.jpg', fallback: '🧂', bg: 'bg-stone-50' },
  'Vermicelli & Sevai': { image: '/products/photos/vermicelli.jpg', fallback: '🍜', bg: 'bg-rose-50/70' },
  'Chips & Namkeen': { image: '/categories/snacks-munchies.jpg', fallback: '🍿', bg: 'bg-amber-50/70' },
  'Biscuits & Cookies': { image: '/categories/bakery-biscuits.jpg', fallback: '🍪', bg: 'bg-yellow-50/70' },
  'Chocolates & Bars': { image: '/categories/sweets-chocolates.jpg', fallback: '🍫', bg: 'bg-pink-50/70' },
  'Tea & Chai': { image: '/categories/tea-coffee.jpg', fallback: '☕', bg: 'bg-orange-50/70' },
  'Cold Drinks & Juices': { image: '/categories/cold-drinks-juices.jpg', fallback: '🧃', bg: 'bg-cyan-50/70' },
  'Noodles & Pasta': { image: '/products/packshots/maggi-noodles.jpg', fallback: '🍜', bg: 'bg-rose-50/70' },
  'Dry Fruits & Dates': { image: '/categories/breakfast-instant.jpg', fallback: '🥣', bg: 'bg-teal-50/70' },
};

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    productService.getCategories(),
    productService.getProducts(),
  ]);

  // Compute sub-category counts dynamically from products
  const subCategoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.subCategory) {
      const key = `${p.category}:${p.subCategory}`;
      subCategoryCounts[key] = (subCategoryCounts[key] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6 pb-24 sm:pb-16 pt-2 sm:pt-4 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 px-1">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
            aria-label="Back to store"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#212121]">All Supermarket Departments</h1>
            <p className="text-[11px] text-stone-500 font-semibold">
              {categories.length} Verified Departments · {products.length} Products Available
            </p>
          </div>
        </div>
      </div>

      {/* Flipkart Minutes Quick Category Scroller */}
      <HorizontalCategoryNav />

      {/* Group Headings with Pastel Sub-Category Cards (Like Flipkart Minutes / Blinkit) */}
      <div className="space-y-8 px-1">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-32 space-y-3">
            {/* Group Heading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{cat.icon}</span>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
                    {cat.name}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {cat.description}
                  </p>
                </div>
              </div>

              <Link
                href={`/category/${cat.id}`}
                className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 shrink-0 transition-colors"
              >
                <span>View All ({cat.itemCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Grid of Sub-Category Pastel Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {cat.subcategories.map((sub) => {
                const count = subCategoryCounts[`${cat.id}:${sub}`] || 0;
                const meta = SUBCAT_IMAGE_MAP[sub] || {
                  image: cat.image || '/categories/cleaning-essentials.jpg',
                  fallback: cat.icon || '🛍️',
                  bg: 'bg-emerald-50/60',
                };

                return (
                  <CategoryTile
                    key={sub}
                    href={`/category/${cat.id}?sub=${encodeURIComponent(sub)}`}
                    name={sub}
                    count={count}
                    image={meta.image}
                    fallbackIcon={meta.fallback}
                    bgColor={meta.bg}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
