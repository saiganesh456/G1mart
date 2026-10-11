import { productService } from '@/services/productService';
import BlinkitHomeSections from '@/components/storefront/BlinkitHomeSections';
import InnerPageHeader from '@/components/layout/InnerPageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories | G1 Mart',
  description: 'Browse all supermarket grocery departments and daily essentials at G1 Mart, Nellore.',
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
      <div className="w-full pb-28 sm:pb-16 pt-4 max-w-5xl mx-auto space-y-4 px-4 sm:px-0">
        <BlinkitHomeSections sections={sections} categories={categories} />
      </div>
    </>
  );
}
