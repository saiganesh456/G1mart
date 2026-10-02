import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 sm:pb-12 pt-2 sm:pt-4 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base sm:text-lg font-black text-[#212121]">Order #{id}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs text-stone-400 font-semibold block">Order Status</span>
            <span className="text-sm font-extrabold text-[#2E7D32]">Order Received</span>
          </div>
          <span className="text-xs text-stone-500">TODO: Live status from Supabase</span>
        </div>

        {/* Timeline placeholder */}
        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span className="font-bold">Order Placed</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <Clock className="w-4 h-4" />
            <span>Packed at Hub</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <Clock className="w-4 h-4" />
            <span>Out for Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <Clock className="w-4 h-4" />
            <span>Delivered</span>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
          Order tracking will be connected to real-time status updates in Phase 2.
        </p>
      </div>
    </div>
  );
}
