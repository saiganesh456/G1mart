import Link from 'next/link';
import { ArrowLeft, HelpCircle, Phone, Clock, MapPin } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does G1 Mart deliver groceries?',
      a: `We offer direct doorstep grocery delivery across ${STORE_CONFIG.address.city} (${STORE_CONFIG.delivery.cityEtaText}). For extended surrounding areas, delivery is completed in ${STORE_CONFIG.delivery.extendedEtaText}.`,
    },
    {
      q: 'What payment options are accepted?',
      a: 'We support Cash on Delivery (COD) as well as online payments including UPI (PhonePe, Google Pay, Paytm), debit cards, credit cards, and Net Banking.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once your order is placed, you can monitor its live preparation and delivery status in the "My Orders" tab.',
    },
    {
      q: 'What if an item is unavailable or out of stock?',
      a: 'If any item in your order is temporarily unavailable, our store team will contact you directly to confirm a suitable replacement or refund before dispatch.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">Help &amp; Support</h1>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Frequently Asked Questions
        </h2>

        <div className="space-y-2.5 divide-y divide-stone-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="pt-2.5 first:pt-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#212121]">{faq.q}</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Hub Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3 text-xs text-stone-600">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Store Information
        </h2>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            <span>
              {STORE_CONFIG.address.city}, {STORE_CONFIG.address.state}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            <span>
              Store Hours: {STORE_CONFIG.hours.open} – {STORE_CONFIG.hours.close}
            </span>
          </div>

          {STORE_CONFIG.contact.phone !== 'TODO_PHONE' && (
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <span>Contact Phone: {STORE_CONFIG.contact.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
