import { productService } from '@/services/productService';
import BlinkitHomeSections from '@/components/storefront/BlinkitHomeSections';
import BannerCarousel from '@/components/storefront/BannerCarousel';
import MascotPopUp from '@/components/storefront/MascotPopUp';
import StickyHomeSearchBar from '@/components/storefront/StickyHomeSearchBar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'G1 Mart Supermarket — Fresh Groceries & Daily Essentials',
  description: 'Shop fresh groceries, staples, snacks, household care and personal essentials at G1 Mart.',
};

/**
 * Mobile-first Blinkit & Flipkart Minutes style Home Page
 * 1. Logo & profile row scrolls away
 * 2. Sticky search bar with camera scan stays pinned
 * 3. 3D Pop-Up between Search & Banner + Auto-rotating banner carousel
 * 4. 4 sectioned category collage grids
 */
export default async function HomePage() {
  const [sections, categories] = await Promise.all([
    productService.getSections(),
    productService.getCategories(),
  ]);

  return (
    <div className="w-full bg-[var(--g1-bg)] pb-28 sm:pb-16 pt-0 space-y-4 sm:space-y-5 px-4 sm:px-0">
      {/* 2. Sticky search bar with camera scan */}
      <StickyHomeSearchBar />

      {/* 3. 3D Animated Slip Scanner Pop-Up (Between Search & Banner) */}
      <MascotPopUp />

      {/* 4. Promotional Banner Carousel (Sent down below the pop-up) */}
      <BannerCarousel />

      {/* 5. Sectioned grids: Grocery & Kitchen, Snacks & Drinks, Household, Personal Care */}
      <BlinkitHomeSections sections={sections} categories={categories} />
    </div>
  );
}
