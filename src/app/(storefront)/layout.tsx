import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

/**
 * Storefront layout — wraps all public customer-facing pages.
 * Route group (storefront) does not affect URLs.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-0 sm:px-4 lg:px-6">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
