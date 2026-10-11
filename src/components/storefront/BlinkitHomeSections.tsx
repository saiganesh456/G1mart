'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, ShieldCheck, ArrowRight, Volume2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { soundAlerts } from '@/lib/soundAlerts';
import type { Category, Section } from '@/types';
import categoryTilesMap from '@/data/categoryTiles.json';

interface BlinkitHomeSectionsProps {
  sections?: Section[];
  categories: Category[];
}

// Reference tints per section sampled directly from target mobile/desktop UI
const SECTION_TINTS: Record<string, string> = {
  'grocery-kitchen': '#FAF7EE', // soft warm ivory
  'snacks-drinks': '#E8F4F3',   // soft clean mint
  'household': '#EEF5FB',       // soft sky blue
  'personal-care': '#EDF6F3',   // soft sage
  'local-specials': '#F7F6EE',  // soft warm golden ivory
};

/**
 * Individual rounded 16px light-tinted tile with cut-out product collage (no frames or boxes)
 * Fully responsive: fills column width on mobile, 2 lines max 13-14px medium weight label.
 */
function CategoryTileItem({ cat, sectionId }: { cat: Category; sectionId: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const tint = SECTION_TINTS[sectionId] || '#F8FAFC';
  const tileUrl = (categoryTilesMap as Record<string, string>)[cat.id] || cat.tile_image_url || `/categories/collages/${cat.id}.webp`;

  return (
    <div className="w-full">
      <Link
        href={`/category/${cat.id}`}
        data-category-tile="true"
        className="group flex flex-col items-center cursor-pointer focus:outline-hidden active:scale-95 transition-transform"
        aria-label={cat.name}
      >
        {/* Soft tinted rounded square tile (rounded-2xl/16px radius, soft shadow, no white box) */}
        <div
          style={{ backgroundColor: tint }}
          className="relative w-full aspect-square rounded-[16px] p-2 sm:p-2.5 lg:p-3 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-[1.04] group-hover:shadow-md border border-stone-200/50 shadow-2xs"
        >
          {/* Skeleton loader while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-stone-200/50 animate-pulse rounded-[16px]" />
          )}

          {/* Product Collage Cut-Out / SVG Icon (front-facing, transparent background cutouts, soft shadow) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tileUrl}
            alt={cat.name}
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageLoaded(true);
              (e.currentTarget as HTMLImageElement).src = `/categories/collages/${cat.id}.svg`;
            }}
            className={`w-[82%] h-[82%] object-contain select-none drop-shadow-sm transition-all duration-200 ${
              imageLoaded ? 'opacity-100 scale-100 group-hover:scale-108' : 'opacity-0 scale-95'
            }`}
          />
        </div>

        {/* Label under tile: 2 lines max, 13–14px, medium weight */}
        <div className="mt-1.5 w-full min-h-[34px] sm:min-h-[38px] flex items-start justify-center">
          <span className="text-[13px] sm:text-[14px] font-medium text-stone-800 text-center leading-[16px] sm:leading-[18px] line-clamp-2 w-full px-0.5 group-hover:text-[#2E7D32] transition-colors">
            {cat.name}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function BlinkitHomeSections({ sections, categories }: BlinkitHomeSectionsProps) {
  const { user } = useAuth();

  // Ordered Sections matching Blinkit & Flipkart Minutes specification:
  // 1. Grocery & Kitchen, 2. Snacks & Drinks, 3. Household Essentials, 4. Beauty & Personal Care, 5. Local Specials
  const orderedSections = [
    { id: 'grocery-kitchen', name: 'Grocery & Kitchen' },
    { id: 'snacks-drinks', name: 'Snacks & Drinks' },
    { id: 'household', name: 'Household Essentials' },
    { id: 'personal-care', name: 'Beauty & Personal Care' },
    { id: 'local-specials', name: 'Local Specials' },
  ];

  // Map categories by section, ensuring only populated categories appear
  const sectionsWithCategories = orderedSections
    .map((sec) => {
      const sectionCats = categories
        .filter((cat) => cat.section_id === sec.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      return {
        ...sec,
        categories: sectionCats,
      };
    })
    .filter((sec) => sec.categories.length > 0);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-9">
      {/* ── Rider Partner Quick Access Banner on Home Page ── */}
      {(user?.role === 'delivery_partner' || user?.role === 'rider') && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1A2E1C] via-[#162B18] to-[#0D1C0F] text-white border border-emerald-500/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Bike className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-black text-white">Rider Partner Mode Active</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  On Duty
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Logged in as <b>{user?.name || user?.email}</b>. Live delivery route & order dispatch available.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => soundAlerts.playRiderAssignmentChime()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Test notification sound chime"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Sound</span>
            </button>
            <Link
              href="/rider"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs sm:text-sm shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Open Rider Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Admin Panel Quick Access Banner on Home Page ── */}
      {user?.role === 'admin' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white border border-blue-500/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <h3 className="text-sm font-black text-white">Store Administrator Mode</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Full Access
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Quick access to darkstore inventory, order dispatch, photo queue, and delivery staff.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => soundAlerts.playRoleGrantedChime()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Test notification sound chime"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Sound</span>
            </button>
            <Link
              href="/admin"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs sm:text-sm shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {sectionsWithCategories.map((section) => (
        <section key={section.id} id={section.id} className="space-y-3 scroll-mt-20">
          {/* Plain section heading: no count pill, no See All link */}
          <div className="px-0.5">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              {section.name}
            </h2>
          </div>

          {/* 4-column grid (2 rows visible on mobile: 4 cols x 2 rows = 8 items) */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-2.5 gap-y-3.5 sm:gap-x-3.5 sm:gap-y-4 lg:gap-x-4 lg:gap-y-5">
            {section.categories.map((cat) => (
              <CategoryTileItem key={cat.id} cat={cat} sectionId={section.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
