import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { productService } from '@/services/productService';
import BlinkitHomeSections from '@/components/storefront/BlinkitHomeSections';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories & Departments | G1 Mart',
  description: 'Explore all supermarket grocery departments and daily essentials at G1 Mart.',
};

/**
 * Blinkit-style Categories page:
 * Grouped sections with the same collage tiles; tapping a tile opens that category detail.
 */
export default async function CategoriesPage() {
  const [categories, sections] = await Promise.all([
    productService.getCategories(),
    productService.getSections(),
  ]);

  return (
    <div className="w-full bg-white pb-24 sm:pb-16 pt-2.5 sm:pt-4 max-w-5xl mx-auto px-1 sm:px-0 space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-stone-100 pb-3 px-1">
        <Link
          href="/"
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors shrink-0"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121] leading-tight">
            All Categories
          </h1>
          <p className="text-[11px] text-stone-500 font-medium">
            Explore 24 departments with instant delivery
          </p>
        </div>
      </div>

      {/* Grouped sections with collage tiles */}
      <BlinkitHomeSections sections={sections} categories={categories} />
    </div>
  );
}
