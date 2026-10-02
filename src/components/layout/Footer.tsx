import Link from 'next/link';
import { MapPin, Clock, Phone, Truck, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import { DEMO_CATEGORIES } from '@/data/demo-seed';
import { STORE_CONFIG } from '@/config/store';

/**
 * Site-wide footer — server component, no client JS needed.
 * All navigation uses Next.js Link.
 */
export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-stone-200/90 text-stone-700 select-none hidden md:block">

      {/* Feature strip */}
      <div className="border-b border-stone-100 bg-stone-50/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Fast Delivery</h4>
              <p className="text-xs text-stone-500 mt-0.5">
                {STORE_CONFIG.delivery.cityEtaText} across the city
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF9800]/10 text-[#FF9800] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Best Prices</h4>
              <p className="text-xs text-stone-500 mt-0.5">Competitive prices on daily essentials</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Quality Assured</h4>
              <p className="text-xs text-stone-500 mt-0.5">Fresh vegetables, dairy &amp; staples</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-200/70 text-stone-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Easy Payment</h4>
              <p className="text-xs text-stone-500 mt-0.5">Cash on Delivery, UPI &amp; Cards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/g1_mart_banner_transparent.png"
              alt="G1 Mart"
              className="h-9 w-auto object-contain"
            />
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
              {/* TODO: Replace with owner-approved store description */}
              G1 Mart — your trusted local grocery delivery service. Fresh produce, dairy,
              grains and daily household essentials delivered to your door.
            </p>
            <div className="pt-1 flex flex-col space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0" />
                {/* TODO: Replace with real store address from STORE_CONFIG once confirmed */}
                <span>{STORE_CONFIG.address.city} — {STORE_CONFIG.address.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Delivery Hours: {STORE_CONFIG.hours.open} – {STORE_CONFIG.hours.close}</span>
              </div>
              {STORE_CONFIG.contact.phone !== 'TODO_PHONE' && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
                  <span>Customer Care: {STORE_CONFIG.contact.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              {DEMO_CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="hover:text-[#2E7D32] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              {[
                { href: '/', label: 'Home Store' },
                { href: '/orders', label: 'My Orders' },
                { href: '/account/wishlist', label: 'Saved Wishlist' },
                { href: '/cart', label: 'Shopping Bag' },
                { href: '/account', label: 'Customer Account' },
                { href: '/help', label: 'Help & FAQs' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#2E7D32] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Legal strip */}
      <div className="border-t border-stone-200/80 bg-stone-50 py-4 pb-20 lg:pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span>© {new Date().getFullYear()} G1 Mart. All rights reserved.</span>
          <div className="flex items-center gap-4 font-medium">
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
}
