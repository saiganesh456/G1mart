import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

/**
 * Storefront layout — wraps all public customer-facing pages.
 * Route group (storefront) does not affect URLs.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden box-border">
      <Header />
      <main className="flex-1 flex flex-col max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-4 lg:px-6 box-border overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
