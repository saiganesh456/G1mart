'use client';

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

/**
 * Category tile — identical bg across ALL sections (var(--g1-surface) / 6% tint).
 * No per-section colour overrides.
 */
function CategoryTileItem({ cat }: { cat: Category }) {
  const rawUrl = (categoryTilesMap as Record<string, string>)[cat.id]
    || cat.tile_image_url
    || `/categories/collages/${cat.id}.webp`;
  const tileUrl = rawUrl.includes('?') ? rawUrl : `${rawUrl}?v=20261013-fmcg`;

  return (
    <Link
      href={`/category/${cat.id}`}
      data-category-tile="true"
      className="group flex flex-col items-center cursor-pointer g1-press focus:outline-none"
      aria-label={cat.name}
    >
      {/* Tile: 1:1, radius 16, e1 shadow, uniform tint */}
      <div
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
        style={{
          borderRadius: 'var(--g1-r-tile)',
          backgroundColor: 'var(--g1-surface)',
          border: '1px solid var(--g1-border)',
          boxShadow: 'var(--g1-e1)',
          transition: 'transform var(--g1-motion)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tileUrl}
          alt={cat.name}
          loading="eager"
          decoding="async"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            if (!t.src.includes('.svg')) t.src = `/categories/collages/${cat.id}.svg`;
          }}
          className="w-[90%] h-[90%] object-contain select-none transition-transform duration-200 group-hover:scale-108"
          style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.1))' }}
        />
      </div>

      {/* Label — 12–13px, 500 weight, max 2 lines, centred */}
      <div className="mt-1.5 w-full min-h-[32px] flex items-start justify-center px-0.5">
        <span
          className="text-center line-clamp-2 leading-[1.25] group-hover:text-[var(--g1-primary)] transition-colors"
          style={{ fontSize: 12, fontWeight: 500, color: 'var(--g1-text)' }}
        >
          {cat.name}
        </span>
      </div>
    </Link>
  );
}

export default function BlinkitHomeSections({ sections, categories }: BlinkitHomeSectionsProps) {
  const { user } = useAuth();

  const orderedSections = [
    { id: 'grocery-kitchen', name: 'Grocery & Kitchen' },
    { id: 'snacks-drinks', name: 'Snacks & Drinks' },
    { id: 'household', name: 'Household Essentials' },
    { id: 'personal-care', name: 'Beauty & Personal Care' },
    { id: 'local-specials', name: 'Local Specials' },
  ];

  const sectionsWithCategories = orderedSections
    .map((sec) => ({
      ...sec,
      categories: categories
        .filter((cat) => cat.section_id === sec.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }))
    .filter((sec) => sec.categories.length > 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Rider banner */}
      {(user?.role === 'delivery_partner' || user?.role === 'rider') && (
        <div className="p-4 rounded-2xl text-white border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: '#1A2E1C', borderColor: 'rgba(74,222,128,.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)' }}>
              <Bike className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-black text-white">Rider Partner Mode Active</h3>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Logged in as <b>{user?.name || user?.email}</b>. Live delivery route available.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" onClick={() => soundAlerts.playRiderAssignmentChime()}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,.1)', color: '#4ade80' }}>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Sound</span>
            </button>
            <Link href="/rider"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5"
              style={{ background: '#4ade80', color: '#052e16' }}>
              <span>Open Rider Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Admin banner */}
      {user?.role === 'admin' && (
        <div className="p-4 rounded-2xl text-white border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: '#0f172a', borderColor: 'rgba(96,165,250,.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(96,165,250,.15)', border: '1px solid rgba(96,165,250,.3)' }}>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <h3 className="text-sm font-black text-white">Store Administrator Mode</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Quick access to inventory, orders, photo queue, and delivery staff.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" onClick={() => soundAlerts.playRoleGrantedChime()}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,.1)', color: '#60a5fa' }}>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Sound</span>
            </button>
            <Link href="/admin"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <span>Open Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {sectionsWithCategories.map((section) => (
        <section key={section.id} id={section.id} className="space-y-3 scroll-mt-20">
          {/* Section heading — 18–20px/700 */}
          <h2 className="font-bold tracking-tight" style={{ fontSize: 18, color: 'var(--g1-text)' }}>
            {section.name}
          </h2>

          {/* 4-column grid, gap 12 */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-4 sm:gap-x-3.5 sm:gap-y-5">
            {section.categories.map((cat) => (
              <CategoryTileItem key={cat.id} cat={cat} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
