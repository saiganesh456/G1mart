import { productService } from '@/services/productService';
import BlinkitHomeSections from '@/components/storefront/BlinkitHomeSections';
import InnerPageHeader from '@/components/layout/InnerPageHeader';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'All Categories | G1mart',
  description: 'Browse all supermarket grocery departments and daily essentials at G1mart, Nellore.',
};

/**
 * /categories — reuses the same CategoryTileItem from Home.
 * 56px header with back button + title 18/700.
 * Removed "Explore 24 departments..." subtitle.
 */
export default async function CategoriesPage() {
  const [categories, sections] = await Promise.all([
    productService.getCategories(),
    productService.getSections(),
  ]);

  return (
    <>
      <InnerPageHeader title="All Categories" />
      <div className="w-full pb-28 sm:pb-16 pt-4 max-w-7xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden lg:block pt-3 pb-2 border-b border-stone-200/80">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium">
            <a href="/" className="hover:text-stone-900 transition-colors">Home</a>
            <span>/</span>
            <span className="text-stone-900 font-bold">All Categories</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">All Grocery Departments</h1>
          <p className="text-xs text-stone-500 mt-0.5">Explore our complete supermarket selection with fast delivery across Nellore</p>
        </div>
        <BlinkitHomeSections sections={sections} categories={categories} />
      </div>
    </>
  );
}
