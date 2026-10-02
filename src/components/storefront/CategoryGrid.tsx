'use client';

import Link from 'next/link';
import type { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

/**
 * Category grid — server component, uses Link for navigation.
 * No client JS needed.
 */
export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="px-2 sm:px-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
          Shop by Category
        </h2>
        <span className="text-xs font-semibold text-stone-500">
          {categories.length} categories
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            {/* Photographic Image Tile */}
            <div className="w-full aspect-square rounded-2xl bg-[#F0F4F8] border border-stone-200/70 p-2 sm:p-2.5 flex items-center justify-center overflow-hidden shadow-2xs group-hover:shadow-md group-hover:border-[#2E7D32]/40 group-hover:bg-[#E8F5E9]/30 transition-all duration-200">
              {cat.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://placehold.co/200x200/e8f5e9/2e7d32?text=' + encodeURIComponent(cat.name);
                  }}
                />
              ) : (
                <span className="text-3xl leading-none">{cat.icon}</span>
              )}
            </div>

            {/* Category Label */}
            <span className="text-[11px] sm:text-xs font-bold text-stone-800 group-hover:text-[#2E7D32] text-center leading-snug mt-1.5 line-clamp-2 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
