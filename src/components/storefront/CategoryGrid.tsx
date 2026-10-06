'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

/**
 * Stage A: Horizontal circular category bar with swipe, scroll-snap,
 * partially visible peek item, hidden scrollbar, and desktop arrow buttons.
 */
export default function CategoryGrid({ categories }: CategoryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="px-1 sm:px-0 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 bg-[#2E7D32] rounded-full inline-block" />
          <h2 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/categories"
          className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
        >
          <span>All Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Relative wrapper for desktop arrow navigation */}
      <div className="relative group/carousel">
        {/* Desktop Left Scroll Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll categories left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-8 z-10 w-8 h-8 rounded-full bg-white border border-stone-200/90 shadow-md text-stone-700 hover:text-[#2E7D32] hover:border-[#2E7D32] items-center justify-center transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Desktop Right Scroll Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll categories right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-8 z-10 w-8 h-8 rounded-full bg-white border border-stone-200/90 shadow-md text-stone-700 hover:text-[#2E7D32] hover:border-[#2E7D32] items-center justify-center transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Horizontal Row of Circular Category Items */}
        <div
          ref={scrollRef}
          className="flex items-start gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="snap-start shrink-0 flex flex-col items-center group cursor-pointer w-[76px] sm:w-[84px] focus:outline-hidden"
            >
              {/* Circular Avatar / Badge */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#E8F5E9]/70 border-2 border-emerald-100/90 group-hover:border-[#2E7D32] group-hover:bg-[#E8F5E9] shadow-2xs group-hover:shadow-md flex items-center justify-center transition-all duration-200 overflow-hidden active:scale-95">
                {cat.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl select-none leading-none">
                    {cat.icon || '🛍️'}
                  </span>
                )}
              </div>

              {/* Category Label Under Circle */}
              <span className="text-[11px] sm:text-xs font-bold text-stone-800 group-hover:text-[#2E7D32] text-center leading-tight line-clamp-2 mt-2 w-full transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
