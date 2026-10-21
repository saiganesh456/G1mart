import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

export const metadata = {
  title: 'Refund & Cancellation Policy | G1mart',
  description: 'G1mart policy regarding order cancellations, returns, and refunds for grocery items.',
};

export default function RefundPolicyPage() {
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
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">Refund &amp; Cancellation Policy</h1>
          <p className="text-xs text-stone-500">Customer Satisfaction &amp; Returns Assurance</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-2xs space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            1. Order Cancellation Policy
          </h2>
          <p className="text-stone-600">
            You may cancel an order free of cost before it has been marked as <em>&quot;Packed&quot;</em> or <em>&quot;Out for Delivery&quot;</em> directly through the app or by calling our store manager at <strong>{STORE_CONFIG.contact.phone}</strong>.
          </p>
          <p className="text-stone-600">
            Once a delivery rider has been dispatched with fresh perishable goods (such as milk, curd, or bread), cancellation requests may be restricted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            2. Returns at Doorstep &amp; Quality Issues
          </h2>
          <p className="text-stone-600">
            We follow a customer-first verification policy upon delivery:
          </p>
          <ul className="space-y-2 list-disc list-inside text-stone-700 ml-2">
            <li>
              <strong>Doorstep Inspection:</strong> You are encouraged to inspect sealed packages, dairy expiration dates, and package integrity when our rider arrives. If any item is damaged or leaking, you may refuse that specific item directly with the delivery partner.
            </li>
            <li>
              <strong>Damaged or Incorrect Item:</strong> If you discover a damaged or incorrect product after delivery, notify us within 24 hours through the app&apos;s Help section or WhatsApp at <strong>{STORE_CONFIG.contact.phone}</strong> with a quick photo of the item.
            </li>
            <li>
              <strong>Perishable Goods (Milk, Curd, Dairy):</strong> Any quality discrepancies in perishable daily staples must be reported on the same delivery date.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            3. Refund Settlement Timelines
          </h2>
          <p className="text-stone-600">
            When a refund is approved for an unfulfilled, returned, or cancelled order:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-stone-700 ml-2">
            <li><strong>UPI Payments:</strong> Refunds are initiated immediately via UPI reversal and typically reflect within 2 to 24 hours.</li>
            <li><strong>Credit/Debit Cards &amp; Net Banking:</strong> Processed through Razorpay/PhonePe within 3 to 5 business days per standard banking processing windows.</li>
            <li><strong>Cash on Delivery (COD):</strong> If an item is returned at doorstep, the rider adjusts the total bill before collecting cash, or provides store credit/direct UPI transfer.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
          <p>
            Questions? Contact G1mart Support at <a href={`mailto:${STORE_CONFIG.contact.email}`} className="text-[#2E7D32] underline">{STORE_CONFIG.contact.email}</a> or call <a href={`tel:${STORE_CONFIG.contact.phone.replace(/\s+/g, '')}`} className="text-[#2E7D32] underline">{STORE_CONFIG.contact.phone}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
