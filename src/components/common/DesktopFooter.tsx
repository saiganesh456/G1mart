import React from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CATEGORIES } from '../../data/mockData';

export const DesktopFooter: React.FC = () => {
  const { navigate, setSelectedCategoryId } = useApp();

  const nelloreHubs = [
    'Pogathota',
    'Magunta Layout',
    'VRC Centre',
    'Balaji Nagar',
    'Stonehousepet',
    'Haranathapuram',
    'Dargamitta',
    'Vedayapalem',
    'Santhapet',
    'BV Nagar',
    'Kovur (Within 30 km)',
    'Buchireddypalem (Within 30 km)',
    'Venkatachalam (Within 30 km)',
    'Indukurpet (Within 30 km)',
  ];

  return (
    <footer className="mt-16 bg-white border-t border-stone-200/90 text-stone-700 select-none hidden md:block">
      {/* Upper Features Strip */}
      <div className="border-b border-stone-100 bg-stone-50/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">15-30 Min Delivery</h4>
              <p className="text-xs text-stone-500 mt-0.5">Express delivery from your nearest dark store</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF9800]/10 text-[#FF9800] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Best Prices & Offers</h4>
              <p className="text-xs text-stone-500 mt-0.5">Cheaper than local supermarket prices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">100% Quality Assured</h4>
              <p className="text-xs text-stone-500 mt-0.5">Fresh farm vegetables, dairy & staples</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-200/70 text-stone-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Easy Payment Options</h4>
              <p className="text-xs text-stone-500 mt-0.5">Cash on Delivery, UPI, Cards & NetBanking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/images/g1_mart_banner_transparent.png"
                alt="G1 Mart"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
              G1 Mart is Nellore's trusted quick-commerce grocery delivery platform. Sourcing farm-fresh produce, dairy, grains, staples and daily household essentials delivered in 30 mins to 1 hour across the city, and within ~2 hours to surrounding villages.
            </p>
            <div className="pt-1 flex flex-col space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Headquarters: Trunk Road, Near VRC Centre, Pogathota, Nellore, Andhra Pradesh 524001</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Delivery Hours: 6:00 AM – 11:00 PM Every Day</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Customer Care: +91 861 234 5678 (Toll Free)</span>
              </div>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              {INITIAL_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      navigate('category', { categoryId: cat.id });
                    }}
                    className="hover:text-[#2E7D32] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="hover:text-[#2E7D32] transition-colors"
                >
                  Home Store
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('my_orders')}
                  className="hover:text-[#2E7D32] transition-colors"
                >
                  My Orders &amp; Invoices
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('wishlist')}
                  className="hover:text-[#2E7D32] transition-colors"
                >
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('cart')}
                  className="hover:text-[#2E7D32] transition-colors"
                >
                  Shopping Bag
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('profile')}
                  className="hover:text-[#2E7D32] transition-colors"
                >
                  Customer Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('help_support')}
                  className="hover:text-[#2E7D32] transition-colors"
                >
                  Help &amp; FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Service Areas Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Delivery Hubs (Nellore &amp; Surrounds)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {nelloreHubs.map((hub) => (
                <span
                  key={hub}
                  className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                >
                  {hub}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-3 leading-snug">
              Expanding rapidly to more mandals and villages across Nellore district.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Strip */}
      <div className="border-t border-stone-200/80 bg-stone-50 py-4 pb-20 lg:pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} G1 Mart Supermarket Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Refund &amp; Cancellation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
