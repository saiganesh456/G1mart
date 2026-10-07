import Link from 'next/link';
import { ArrowLeft, Phone, Clock, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

export default function HelpPage() {
  const storePhone = STORE_CONFIG.contact.phone || '+91 98765 43210';
  const whatsappNumber = STORE_CONFIG.contact.whatsapp || '919876543210';

  const faqs = [
    {
      q: 'How does G1 Mart deliver groceries?',
      a: `We offer direct doorstep grocery delivery from our local store hub. Operating hours: ${STORE_CONFIG.hours.open} to ${STORE_CONFIG.hours.close}.`,
    },
    {
      q: 'What payment options are accepted?',
      a: 'We accept Cash on Delivery (COD) as well as direct UPI (PhonePe, Google Pay, Paytm, BHIM) and cards.',
    },
    {
      q: 'Can I reorder my previous monthly grocery basket?',
      a: 'Yes! Use the "Order Again" tab or save your shopping cart as your "Monthly Essentials" list for instant 1-tap reordering.',
    },
    {
      q: 'What if an item is temporarily out of stock?',
      a: 'Our store staff verifies items on the store floor. If any item is unavailable, we call your mobile number to confirm an immediate substitution or refund before rider dispatch.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 sm:pb-12 pt-2 px-2 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base sm:text-lg font-black text-[#212121]">Store Help &amp; Support</h1>
          <p className="text-xs text-stone-500">Direct helpline &amp; customer care</p>
        </div>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href={`tel:${storePhone.replace(/\s+/g, '')}`}
          className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center gap-3 hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-[#212121] block">Call Store Manager</span>
            <p className="text-xs font-bold text-[#2E7D32] truncate mt-0.5">{storePhone}</p>
          </div>
        </a>

        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 bg-stone-50 border border-stone-200/90 rounded-2xl flex items-center gap-3 hover:bg-stone-100 transition-colors shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-[#212121] block">WhatsApp Support</span>
            <p className="text-xs text-stone-500 truncate mt-0.5">Instant chat with store</p>
          </div>
        </a>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3 text-xs text-stone-700">
        <h2 className="text-xs font-black text-stone-500 uppercase tracking-wider">
          Store Details &amp; Fulfillment
        </h2>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Store Location</span>
              <span className="text-stone-500">MDR032, Venkatachalam, Andhra Pradesh</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Customer Service Hours</span>
              <span className="text-stone-500">
                {STORE_CONFIG.hours.open} – {STORE_CONFIG.hours.close} ({STORE_CONFIG.hours.daysOpen})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
        <h2 className="text-xs font-black text-stone-500 uppercase tracking-wider">
          Common Questions
        </h2>

        <div className="space-y-3 divide-y divide-stone-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="pt-3 first:pt-0">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900">{faq.q}</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>Official G1 Mart Neighbourhood Store Customer Support</span>
      </div>
    </div>
  );
}
