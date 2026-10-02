import Link from 'next/link';
import { Package, Clock, ArrowRight } from 'lucide-react';

export default function OrdersPage() {
  /**
   * TODO (Phase 2):
   * Fetch authenticated user's real orders from Supabase `orders` table.
   * Fake pre-seeded orders have been cleaned out per AUDIT.md.
   */
  const orders: any[] = [];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      <h1 className="text-base sm:text-lg font-black text-[#212121]">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#212121]">No orders yet</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              When you place an order, you can track its live status and receipts here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs hover:shadow-md transition-all space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-extrabold text-xs text-[#212121]">#{order.id}</span>
                  <p className="text-[11px] text-stone-500">{order.date}</p>
                </div>
                <span className="text-xs font-bold text-[#2E7D32]">{order.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
