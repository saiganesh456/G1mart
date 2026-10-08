import { productService } from '@/services/productService';
import BlinkitHomeSections from '@/components/storefront/BlinkitHomeSections';

export const metadata = {
  title: 'G1 Mart Supermarket — Fresh Groceries & Daily Essentials',
  description: 'Shop fresh groceries, staples, snacks, household care and personal essentials at G1 Mart.',
};

/**
 * Mobile-first Blinkit & Flipkart Minutes style Home Page
 * White background, G1 Mart deep green as the only accent, 4 sectioned category grids.
 */
export default async function HomePage() {
  const [sections, categories] = await Promise.all([
    productService.getSections(),
    productService.getCategories(),
  ]);

  return (
    <div className="w-full bg-white pb-24 sm:pb-14 pt-2.5 sm:pt-4">
      {/* 4 sectioned grids: Grocery & Kitchen, Snacks & Drinks, Household, Personal Care */}
      <BlinkitHomeSections sections={sections} categories={categories} />
    </div>
  );
}
