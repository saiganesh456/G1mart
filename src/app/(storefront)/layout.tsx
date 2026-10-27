import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
import InstallAppPlacard from '@/components/common/InstallAppPlacard';
import AnimatedSplashScreen from '@/components/common/AnimatedSplashScreen';

/**
 * Storefront layout — wraps all public customer-facing pages.
 * Mobile layout is edge-to-edge with 16px page gutter managed per route.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip box-border">
      {/* 2-Phase Launch Splash Animation (Solid Brand Splash -> White Doorstep Micro-Journey) */}
      <AnimatedSplashScreen />
      <Header />
      <main className="flex-1 flex flex-col max-w-7xl w-full min-w-0 mx-auto px-0 sm:px-4 lg:px-6 box-border overflow-x-clip">
        {children}
      </main>
      <Footer />
      <InstallAppPlacard />
      <BottomNav />
    </div>
  );
}
