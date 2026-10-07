import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { productService } from '@/services/productService';
import BlinkitCategoryExplorer from '@/components/categories/BlinkitCategoryExplorer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories & Departments | G1 Mart',
  description: 'Explore all supermarket grocery departments and daily essentials at G1 Mart.',
};

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    productService.getCategories(),
    productService.getProducts(),
  ]);

  return (
    <div className="space-y-3 pb-24 sm:pb-16 pt-2 sm:pt-4 max-w-6xl mx-auto px-1 sm:px-0">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5 px-2">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
            aria-label="Back to store"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#212121]">All Departments</h1>
            <p className="text-[11px] text-stone-500 font-semibold">
              {categories.length} Departments • {products.length} Products with Instant Delivery
            </p>
          </div>
        </div>
      </div>

      {/* Blinkit Split Screen Category & Product Explorer */}
      <BlinkitCategoryExplorer categories={categories} products={products} />
    </div>
  );
}
