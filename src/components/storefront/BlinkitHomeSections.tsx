'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category, Section } from '@/types';

interface BlinkitHomeSectionsProps {
  sections: Section[];
  categories: Category[];
}

const CATEGORY_TINTS: Record<string, string> = {
  // Grocery & Kitchen
  'vegetables-fruits': '#F0FDF4',
  'atta-rice-dal': '#FEF9C3',
  'oil-ghee-masala': '#FEF3C7',
  'dairy-bread-eggs': '#F8FAFC',
  'dry-fruits-cereals': '#FFFBEB',
  'sugar-salt-staples': '#F1F5F9',

  // Snacks & Drinks
  'chips-namkeen': '#FEF3C7',
  'biscuits-bakery': '#FEF9C3',
  'sweets-chocolates': '#FEF3C7',
  'drinks-juices': '#EFF6FF',
  'tea-coffee-milk-drinks': '#FEF3C7',
  'instant-food': '#FFFBEB',
  'sauces-spreads': '#FEF3C7',

  // Household
  'laundry-detergents': '#EFF6FF',
  'dishwash': '#ECFDF5',
  'floor-surface-cleaners': '#F0F9FF',
  'pooja-needs': '#FFFBEB',
  'kitchenware': '#F8FAFC',

  // Personal Care
  'soaps-bath': '#F0FDF4',
  'oral-care': '#EFF6FF',
  'hair-care': '#F0FDF4',
  'skin-care': '#FFFBEB',
  'baby-care': '#F0FDF4',
  'hygiene': '#ECFDF5',
};

const SAFE_TINTS = ['#F0FDF4', '#FEF3C7', '#EFF6FF', '#FFFBEB', '#F8FAFC', '#ECFDF5', '#FEF9C3'];

/**
 * Individual rounded light-tinted tile with cut-out product collage (no frames or boxes)
 * Fully responsive: compact on mobile, proportioned on tablets, laptops, and ultra-wide desktops.
 */
function CategoryTileItem({ cat, index }: { cat: Category; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const tint = CATEGORY_TINTS[cat.id] || SAFE_TINTS[index % SAFE_TINTS.length];
  const tileImgSrc = cat.tile_image_url || `/categories/collages/${cat.id}.svg`;

  return (
    <div className="w-full max-w-[105px] sm:max-w-[120px] md:max-w-[125px] lg:max-w-[130px] mx-auto">
      <Link
        href={`/category/${cat.id}`}
        className="group flex flex-col items-center cursor-pointer focus:outline-hidden active:scale-95 transition-transform"
        aria-label={cat.name}
      >
        {/* Light-tinted tile container (rounded, compact aspect-square) */}
        <div
          style={{ backgroundColor: tint }}
          className="relative w-full aspect-square rounded-2xl p-2 sm:p-2.5 lg:p-3 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-[1.04] group-hover:shadow-md border border-stone-200/50"
        >
          {/* Skeleton loader while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-stone-200/50 animate-pulse rounded-2xl" />
          )}

          {/* Cut-out product collage image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tileImgSrc}
            alt={cat.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageLoaded(true);
              (e.currentTarget as HTMLImageElement).src = `/categories/collages/${cat.id}.svg`;
            }}
            className={`w-full h-full object-contain select-none drop-shadow-xs transition-all duration-200 ${
              imageLoaded ? 'opacity-100 scale-100 group-hover:scale-108' : 'opacity-0 scale-95'
            }`}
          />
        </div>

        {/* 2-line centered label under each tile */}
        <div className="mt-1.5 w-full h-[28px] sm:h-[32px] flex items-start justify-center">
          <span className="text-[11px] sm:text-xs font-semibold text-stone-800 text-center leading-[13px] sm:leading-[15px] line-clamp-2 w-full px-0.5 group-hover:text-[#2E7D32] transition-colors">
            {cat.name}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function BlinkitHomeSections({ sections, categories }: BlinkitHomeSectionsProps) {
  // Define default 4 sections if none passed or ordering them strictly
  const orderedSections = [
    { id: 'grocery-kitchen', name: 'Grocery & Kitchen' },
    { id: 'snacks-drinks', name: 'Snacks & Drinks' },
    { id: 'household', name: 'Household' },
    { id: 'personal-care', name: 'Personal Care' },
  ];

  // Map categories by section, strictly showing all active categories
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
      {/* Master Department Quick Jump Pills — Guarantees laptop users immediately see all 4 departments */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 border-b border-stone-100">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 hidden sm:inline">
          Departments:
        </span>
        {sectionsWithCategories.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-[#2E7D32] border border-stone-200/80 hover:border-emerald-300 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5"
          >
            <span>{sec.name}</span>
            <span className="bg-white text-stone-600 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold border border-stone-200/70">
              {sec.categories.length}
            </span>
          </a>
        ))}
      </div>

      {sectionsWithCategories.map((section) => (
        <section key={section.id} id={section.id} className="space-y-3 scroll-mt-24">
          {/* Section heading with category count badge */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base lg:text-lg font-black text-stone-900 tracking-tight">
                {section.name}
              </h2>
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                {section.categories.length} departments
              </span>
            </div>
            <Link
              href="/categories"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] hover:underline"
            >
              See All →
            </Link>
          </div>

          {/* Responsive Quick-Commerce Grid:
              - Mobile (<640px): 4 columns
              - Small & Medium Tablet (sm/md): 6 columns
              - Laptop (lg): 6 columns (Symmetrically fits 6-department rows without blank gaps)
              - Large Desktop (xl/2xl): 7-8 columns
          */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-2 gap-y-3.5 sm:gap-x-3.5 sm:gap-y-4 lg:gap-x-4 lg:gap-y-5">
            {section.categories.map((cat, idx) => (
              <CategoryTileItem key={cat.id} cat={cat} index={idx} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
