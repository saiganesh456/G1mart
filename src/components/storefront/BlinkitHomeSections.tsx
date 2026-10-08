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
 * Includes a skeleton loader while loading and 2-line centered label beneath.
 */
function CategoryTileItem({ cat, index }: { cat: Category; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const tint = CATEGORY_TINTS[cat.id] || SAFE_TINTS[index % SAFE_TINTS.length];

  return (
    <Link
      href={`/category/${cat.id}`}
      className="group flex flex-col items-center cursor-pointer focus:outline-hidden active:scale-95 transition-transform"
      aria-label={cat.name}
    >
      {/* Light-tinted tile container (rounded, no frame or box) */}
      <div
        style={{ backgroundColor: tint }}
        className="relative w-full aspect-square rounded-2xl p-2 sm:p-2.5 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-[1.03]"
      >
        {/* Skeleton loader while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-stone-200/50 animate-pulse rounded-2xl" />
        )}

        {/* Cut-out product collage image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cat.tile_image_url || '/products/placeholder.svg'}
          alt={cat.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true);
            (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
          }}
          className={`w-full h-full object-contain select-none drop-shadow-xs transition-all duration-200 ${
            imageLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-95'
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

  // Map categories by section, strictly showing only categories with verified products (itemCount > 0)
  const sectionsWithCategories = orderedSections
    .map((sec) => {
      const sectionCats = categories
        .filter((cat) => cat.section_id === sec.id)
        .filter((cat) => (cat.itemCount ?? 0) > 0)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      return {
        ...sec,
        categories: sectionCats,
      };
    })
    .filter((sec) => sec.categories.length > 0);

  return (
    <div className="space-y-6 sm:space-y-7">
      {sectionsWithCategories.map((section) => (
        <section key={section.id} id={section.id} className="space-y-2.5">
          {/* Bold short heading per section */}
          <h2 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight px-0.5">
            {section.name}
          </h2>

          {/* 4 columns grid, rounded light-tinted tiles */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-3.5 sm:gap-x-3.5 sm:gap-y-4">
            {section.categories.map((cat, idx) => (
              <CategoryTileItem key={cat.id} cat={cat} index={idx} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
