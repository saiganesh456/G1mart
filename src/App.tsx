import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrame } from './components/common/MobileFrame';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { DesktopSidebar } from './components/common/DesktopSidebar';

// Customer Screens
import { SplashScreen } from './components/customer/SplashScreen';
import { OnboardingScreen } from './components/customer/OnboardingScreen';
import { LoginScreen } from './components/customer/LoginScreen';
import { OtpScreen } from './components/customer/OtpScreen';
import { HomeScreen } from './components/customer/HomeScreen';
import { SearchScreen } from './components/customer/SearchScreen';
import { CategoryScreen } from './components/customer/CategoryScreen';
import { ProductDetailsScreen } from './components/customer/ProductDetailsScreen';
import { CartScreen } from './components/customer/CartScreen';
import { AddressListScreen } from './components/customer/AddressListScreen';
import { AddAddressScreen } from './components/customer/AddAddressScreen';
import { CheckoutScreen } from './components/customer/CheckoutScreen';
import { PaymentScreen } from './components/customer/PaymentScreen';
import { OrderSuccessScreen } from './components/customer/OrderSuccessScreen';
import { MyOrdersScreen } from './components/customer/MyOrdersScreen';
import { OrderTrackingScreen } from './components/customer/OrderTrackingScreen';
import { WishlistScreen } from './components/customer/WishlistScreen';
import { ProfileScreen } from './components/customer/ProfileScreen';
import { NotificationsScreen } from './components/customer/NotificationsScreen';
import { HelpSupportScreen } from './components/customer/HelpSupportScreen';

// Role Dashboards
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';

const AppContent: React.FC = () => {
  const { screen, role, isMobileFrame } = useApp();

  const renderScreen = () => {
    // Check specific role overrides
    if (role === 'admin' || screen === 'admin_dashboard') {
      return <AdminDashboard />;
    }
    if (role === 'delivery_partner' || screen === 'delivery_dashboard') {
      return <DeliveryDashboard />;
    }

    switch (screen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'category':
        return <CategoryScreen />;
      case 'product_details':
        return <ProductDetailsScreen />;
      case 'cart':
        return <CartScreen />;
      case 'address_list':
        return <AddressListScreen />;
      case 'add_address':
        return <AddAddressScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'order_success':
        return <OrderSuccessScreen />;
      case 'my_orders':
        return <MyOrdersScreen />;
      case 'order_tracking':
        return <OrderTrackingScreen />;
      case 'wishlist':
        return <WishlistScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'help_support':
        return <HelpSupportScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isAuthOrSpecial =
    screen === 'splash' ||
    screen === 'onboarding' ||
    screen === 'login' ||
    screen === 'otp';

  const isBrowseWithSidebar =
    !isMobileFrame &&
    role === 'customer' &&
    (screen === 'home' ||
      screen === 'category' ||
      screen === 'search' ||
      screen === 'wishlist');

  return (
    <MobileFrame>
      <Header />

      {/* Main Responsive Content Router */}
      <main className="flex-1 flex flex-col min-h-0">
        {isMobileFrame || isAuthOrSpecial ? (
          // In phone simulation mode or auth flow: rendered clean & centered
          <div className="w-full flex-1 flex flex-col">
            {renderScreen()}
          </div>
        ) : isBrowseWithSidebar ? (
          // On desktop/tablet for browsing screens: full-width container with desktop sidebar
          <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6 xl:gap-8 items-start flex-1">
            <DesktopSidebar />
            <div className="flex-1 min-w-0">
              {renderScreen()}
            </div>
          </div>
        ) : (
          // Full-width container for product details, cart, checkout, orders, admin, rider
          <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col">
            {renderScreen()}
          </div>
        )}
      </main>

      <BottomNav />
    </MobileFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
