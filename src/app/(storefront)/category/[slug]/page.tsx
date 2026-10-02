import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/data/demo-seed';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = DEMO_CATEGORIES.find((c) => c.id === slug);

  if (!category) {
    notFound();
  }

  const products = DEMO_PRODUCTS.filter((p) => p.category === slug);

  return (
    <div className="space-y-4 pb-20 sm:pb-12 pt-3 px-2 sm:px-0">
      {/* Category Header */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
        <Link
          href="/"
          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#212121]">
              {category.name}
            </h1>
            <p className="text-xs text-stone-500">
              {products.length} {products.length === 1 ? 'item' : 'items'} available
            </p>
          </div>
        </div>
      </div>

      {/* Subcategory Pills */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold bg-[#2E7D32] text-white px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xs">
            All
          </span>
          {category.subcategories.map((sub) => (
            <span
              key={sub}
              className="text-xs font-semibold bg-white text-stone-600 border border-stone-200 px-3 py-1.5 rounded-xl whitespace-nowrap"
            >
              {sub}
            </span>
          ))}
        </div>
      )}

      {/* Product List */}
      <ProductGrid products={products} />
    </div>
  );
}
