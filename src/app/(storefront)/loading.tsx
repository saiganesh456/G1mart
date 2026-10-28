import HomeSkeleton from '@/components/storefront/HomeSkeleton';

/**
 * Next.js Storefront route loading fallback (React Suspense boundary).
 * Renders identical layout skeleton matching the home page to guarantee zero CLS.
 */
export default function StorefrontLoading() {
  return <HomeSkeleton />;
}
