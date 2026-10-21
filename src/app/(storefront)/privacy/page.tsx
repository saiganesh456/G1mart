import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, Smartphone, Camera, MapPin, Mail, Phone } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

export const metadata = {
  title: 'Privacy Policy | G1mart',
  description: 'Official privacy policy for G1mart mobile application and online store.',
};

export default function PrivacyPolicyPage() {
  const storePhone = STORE_CONFIG.contact.phone || '+91 91107 59629';
  const storeEmail = STORE_CONFIG.contact.email || 'support@g1mart.com';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 text-stone-800">
      {/* Back button & header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">Privacy Policy</h1>
          <p className="text-xs text-stone-500">Effective Date: October 2026 · Version 1.2</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-2xs space-y-6 text-sm leading-relaxed">
        {/* Summary Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-stone-700">
            <span className="font-bold text-[#2E7D32] block">Your Privacy Matters to G1mart</span>
            G1mart (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the G1mart mobile application and web platform. This document explains what personal information we collect, why we need it, and how your data is protected in accordance with Google Play Developer Policies and applicable data protection laws.
          </div>
        </div>

        {/* 1. Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            1. Information We Collect
          </h2>
          <p className="text-stone-600">
            When you use the G1mart app, we collect necessary personal details to process and deliver your grocery orders:
          </p>
          <ul className="space-y-2.5 list-disc list-inside text-stone-700 ml-2">
            <li>
              <strong>Account &amp; Contact Info:</strong> Your mobile phone number (used for secure OTP login), customer name, and optional email address.
            </li>
            <li>
              <strong>Delivery Addresses:</strong> Street address, landmarks, door number, and postal pincode ({STORE_CONFIG.address.pincode} Nellore delivery hub) required for rider dispatch.
            </li>
            <li>
              <strong>Order &amp; Transaction History:</strong> Purchased items, order timestamps, payment methods (Cash on Delivery or UPI/Online), and order receipts. We do <em>not</em> store your UPI PINs, credit card numbers, or CVVs.
            </li>
          </ul>
        </section>

        {/* 2. Device Permissions */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            2. Device Permissions &amp; Data Safety
          </h2>
          <p className="text-stone-600">
            In accordance with Google Play Store permission guidelines, G1mart requests only the permissions strictly essential to fulfill core quick-commerce functionality:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
                Location (Approximate &amp; Precise)
              </div>
              <p className="text-xs text-stone-600">
                Used solely to verify whether your delivery address falls within our active 15–30 minute delivery service radius in Nellore and to direct delivery riders to your doorstep.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                <Camera className="w-4 h-4 text-[#2E7D32]" />
                Camera &amp; Photo Storage
              </div>
              <p className="text-xs text-stone-600">
                Used exclusively if you use our &quot;Grocery Slip Scanner&quot; feature to take a photo of handwritten grocery shopping lists. Images are never used for advertising or facial recognition.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                <Smartphone className="w-4 h-4 text-[#2E7D32]" />
                Push Notifications
              </div>
              <p className="text-xs text-stone-600">
                Used to notify you about order status milestones (e.g. Order Placed, Packed, Out for Delivery, Delivered) and critical store updates.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs mb-1">
                <Lock className="w-4 h-4 text-[#2E7D32]" />
                Security &amp; Encryption
              </div>
              <p className="text-xs text-stone-600">
                All transmissions between the G1mart app and our servers use HTTPS/TLS 1.3 encryption. Your data is never shared with untrusted third parties.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Third-Party Service Providers */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            3. Trusted Third-Party Services
          </h2>
          <p className="text-stone-600">
            We partner with industry-standard, secure infrastructure providers to operate the store:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-stone-700 ml-2">
            <li><strong>Supabase:</strong> Encrypted cloud database and customer authentication.</li>
            <li><strong>PhonePe / Razorpay:</strong> RBI-authorized payment gateways for online transactions.</li>
            <li><strong>Firebase Cloud Messaging:</strong> Secure order notification delivery.</li>
          </ul>
        </section>

        {/* 4. Data Retention and Account Deletion */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            4. Data Retention &amp; Right to Delete
          </h2>
          <p className="text-stone-600">
            We retain customer information only as long as necessary to provide delivery services and comply with statutory legal and accounting obligations.
          </p>
          <p className="text-stone-600">
            In compliance with Google Play&apos;s Account Deletion Policy, you have the right to request deletion of your account and personal data at any time without having to call support. Visit our dedicated{' '}
            <Link href="/account-deletion" className="text-[#2E7D32] font-semibold underline">
              Account &amp; Data Deletion Page
            </Link>{' '}
            or submit a request via email.
          </p>
        </section>

        {/* 5. Contacting Us */}
        <section className="space-y-2 pt-2 border-t border-stone-100">
          <h2 className="text-base font-bold text-stone-900">5. Contact Our Privacy Grievance Officer</h2>
          <p className="text-stone-600 text-xs">
            If you have questions or concerns regarding this policy, reach us at:
          </p>
          <div className="text-xs text-stone-700 space-y-1">
            <p><strong>G1mart Supermarket</strong></p>
            <p>{STORE_CONFIG.address.line1}, {STORE_CONFIG.address.city}, {STORE_CONFIG.address.state} – {STORE_CONFIG.address.pincode}</p>
            <p>Email: <a href={`mailto:${storeEmail}`} className="text-[#2E7D32] underline">{storeEmail}</a></p>
            <p>Phone: <a href={`tel:${storePhone.replace(/\s+/g, '')}`} className="text-[#2E7D32] underline">{storePhone}</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
