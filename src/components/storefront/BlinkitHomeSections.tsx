'use client';

import { useState } from 'react';
import Link from 'next/link';
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
};

/**
 * Individual rounded 16px light-tinted tile with cut-out product collage (no frames or boxes)
 * 2-line centered label below the tile.
 */
function CategoryTileItem({ cat, sectionId }: { cat: Category; sectionId: string }) {
  const tint = SECTION_TINTS[sectionId] || '#F8FAFC';
  const tileUrl = (categoryTilesMap as Record<string, string>)[cat.id] || cat.tile_image_url || `/categories/collages/${cat.id}.webp`;

  return (
    <Link
      href={`/category/${cat.id}`}
      data-category-tile="true"
      className="group flex flex-col items-center cursor-pointer focus:outline-hidden active:scale-95 transition-transform"
      aria-label={cat.name}
    >
      {/* Soft tinted rounded square tile (16px radius, soft shadow, no white box) */}
      <div
        style={{ backgroundColor: tint }}
        className="relative w-full aspect-square rounded-[16px] p-2 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-[1.03] shadow-2xs"
      >
        {/* Product Collage Cut-Out / SVG Icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tileUrl}
          alt={cat.name}
          loading="eager"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `/categories/collages/${cat.id}.svg`;
          }}
          className="w-full h-full object-contain select-none transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* 2-line centered label below the tile */}
      <div className="mt-1.5 w-full h-[28px] sm:h-[32px] flex items-start justify-center">
        <span className="text-[11px] sm:text-xs font-semibold text-stone-800 text-center leading-[14px] line-clamp-2 w-full px-0.5 group-hover:text-[#2E7D32] transition-colors">
          {cat.name}
        </span>
      </div>
    </Link>
  );
}

export default function BlinkitHomeSections({ categories }: BlinkitHomeSectionsProps) {
  // Ordered Sections matching Blinkit & Flipkart Minutes specification
  const orderedSections = [
    { id: 'grocery-kitchen', name: 'Grocery & Kitchen' },
    { id: 'snacks-drinks', name: 'Snacks & Drinks' },
    { id: 'household', name: 'Household Essentials' },
    { id: 'personal-care', name: 'Beauty & Personal Care' },
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
    <div className="space-y-6 sm:space-y-7">
      {sectionsWithCategories.map((section) => (
        <section key={section.id} id={section.id} className="space-y-2.5">
          {/* Bold section heading */}
          <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight px-0.5">
            {section.name}
          </h2>

          {/* 4 columns grid, 8px gap (gap-2), soft tinted rounded square tiles */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
            {section.categories.map((cat) => (
              <CategoryTileItem key={cat.id} cat={cat} sectionId={section.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
