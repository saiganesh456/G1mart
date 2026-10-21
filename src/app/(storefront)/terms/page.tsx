import Link from 'next/link';
import { ArrowLeft, FileCheck2, Clock, Truck, ShieldAlert } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

export const metadata = {
  title: 'Terms of Service | G1mart',
  description: 'Terms and Conditions for ordering from G1mart mobile application.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 text-stone-800">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">Terms of Service</h1>
          <p className="text-xs text-stone-500">Effective Date: October 2026 · G1mart Customer Agreement</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-2xs space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            1. Overview &amp; Acceptance
          </h2>
          <p className="text-stone-600">
            Welcome to G1mart. By accessing our mobile application or web storefront to purchase groceries, packaged staples, dairy, beverages, and personal care goods, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            2. Grocery Ordering &amp; Pricing
          </h2>
          <ul className="space-y-2 list-disc list-inside text-stone-700 ml-2">
            <li><strong>Catalog Pricing:</strong> All prices listed are in Indian Rupees (INR) inclusive of applicable taxes (GST). Prices reflect printed Maximum Retail Price (MRP) and discounted store selling rates.</li>
            <li><strong>Stock Availability:</strong> All orders are fulfilled from our local store inventory in {STORE_CONFIG.address.city}. If an item becomes out of stock during picking, our store staff will contact you before dispatch to offer a verified substitution or an immediate refund.</li>
            <li><strong>Minimum Order:</strong> Orders have a minimum threshold of ₹{STORE_CONFIG.delivery.minOrderValue}. Free delivery applies to orders above ₹{STORE_CONFIG.delivery.cityFreeDeliveryAbove}.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            3. Doorstep Delivery
          </h2>
          <p className="text-stone-600">
            Deliveries operate daily between <strong>{STORE_CONFIG.hours.open} and {STORE_CONFIG.hours.close}</strong> within our designated delivery zones in Nellore. Delivery estimates ({STORE_CONFIG.delivery.cityEtaText}) are based on normal traffic, weather, and operational conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            4. Payments &amp; Settlement
          </h2>
          <p className="text-stone-600">
            We support multiple payment channels:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-stone-700 ml-2">
            <li><strong>Cash on Delivery (COD):</strong> Pay cash or UPI on delivery to the rider.</li>
            <li><strong>UPI &amp; Digital Payments:</strong> PhonePe, Google Pay, Paytm, Net Banking, and Cards processed securely via RBI-compliant payment gateways.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
          <p>
            For any dispute or query concerning your order, contact G1mart customer support via phone at {STORE_CONFIG.contact.phone} or email at {STORE_CONFIG.contact.email}.
          </p>
        </section>
      </div>
    </div>
  );
}
