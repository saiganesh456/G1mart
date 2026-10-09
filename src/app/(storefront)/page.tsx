import { productService } from '@/services/productService';
import BlinkitHomeSections from '@/components/storefront/BlinkitHomeSections';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import StickyHomeSearchBar from '@/components/storefront/StickyHomeSearchBar';

export const metadata = {
  title: 'G1 Mart Supermarket — Fresh Groceries & Daily Essentials',
  description: 'Shop fresh groceries, staples, snacks, household care and personal essentials at G1 Mart.',
};

/**
 * Mobile-first Blinkit & Flipkart Minutes style Home Page
 * 1. Logo & profile row scrolls away
 * 2. Sticky search bar with camera scan stays pinned
 * 3. Auto-rotating banner carousel (2.2:1 rounded 16px)
 * 4. 4 sectioned category collage grids
 */
export default async function HomePage() {
  const [sections, categories] = await Promise.all([
    productService.getSections(),
    productService.getCategories(),
  ]);

  return (
    <div className="w-full bg-white pb-24 sm:pb-14 pt-0 space-y-4 sm:space-y-5">
      {/* 2. Sticky search bar with camera scan */}
      <StickyHomeSearchBar />

      {/* 3. Auto-rotating banner carousel */}
      <BannerCarousel />

      {/* 4. Sectioned grids: Grocery & Kitchen, Snacks & Drinks, Household, Personal Care */}
      <BlinkitHomeSections sections={sections} categories={categories} />
    </div>
  );
}
