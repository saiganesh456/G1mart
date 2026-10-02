import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Navigation } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  // Placeholder coordinates for demo/display until loaded from Supabase
  const sampleLat = 14.4426;
  const sampleLng = 79.9865;
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${sampleLat},${sampleLng}`;

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
          <span className="text-xs text-stone-500 font-medium">Doorstep Delivery</span>
        </div>

        {/* Timeline */}
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

        {/* Rider Navigation Direct Link */}
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Delivery GPS Pin</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              GPS ATTACHED
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Delivery partners &amp; admin can tap to open turn-by-turn route navigation directly to customer gate.
          </p>
          <a
            href={googleMapsNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs mt-1"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            <span>Open in Google Maps Navigation →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
