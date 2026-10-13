'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface QuickCategoryItem {
  id: string;
  name: string;
  shortLabel: string;
  image: string;
  href: string;
  bgTint?: string;
}

export const QUICK_CATEGORIES: QuickCategoryItem[] = [
  {
    id: 'chips',
    name: 'Chips & Namkeen',
    shortLabel: 'Chips & Snacks',
    image: '/categories/collages/chips-namkeen.webp',
    href: '/category/chips-namkeen',
    bgTint: 'rgba(254, 243, 199, 0.7)',
  },
  {
    id: 'cold-drinks',
    name: 'Cold Drinks & Juices',
    shortLabel: 'Cold Drinks',
    image: '/categories/collages/drinks-juices.webp',
    href: '/category/drinks-juices',
    bgTint: 'rgba(240, 253, 250, 0.7)',
  },
  {
    id: 'ice-creams',
    name: 'Ice Creams & Frozen Desserts',
    shortLabel: 'Ice Creams',
    image: '/categories/collages/ice-creams.webp',
    href: '/category/ice-creams',
    bgTint: 'rgba(255, 241, 242, 0.7)',
  },
  {
    id: 'chocolates',
    name: 'Chocolates & Sweets',
    shortLabel: 'Chocolates',
    image: '/categories/collages/sweets-chocolates.webp',
    href: '/category/sweets-chocolates',
    bgTint: 'rgba(250, 245, 255, 0.7)',
  },
  {
    id: 'biscuits',
    name: 'Biscuits, Cookies & Rusks',
    shortLabel: 'Biscuits',
    image: '/categories/collages/biscuits-bakery.webp',
    href: '/category/biscuits-bakery',
    bgTint: 'rgba(240, 249, 255, 0.7)',
  },
  {
    id: 'tea-chai',
    name: 'Tea, Coffee & Health Drinks',
    shortLabel: 'Chai & Coffee',
    image: '/categories/collages/tea-coffee-milk-drinks.webp',
    href: '/category/tea-coffee-milk-drinks',
    bgTint: 'rgba(254, 243, 199, 0.7)',
  },
  {
    id: 'dairy',
    name: 'Dairy, Bread & Eggs',
    shortLabel: 'Fresh Dairy',
    image: '/categories/collages/dairy-bread-eggs.webp',
    href: '/category/dairy-bread-eggs',
    bgTint: 'rgba(240, 253, 244, 0.7)',
  },
  {
    id: 'instant-food',
    name: 'Noodles & Instant Food',
    shortLabel: 'Instant Food',
    image: '/categories/collages/instant-food.webp',
    href: '/category/instant-food',
    bgTint: 'rgba(254, 249, 195, 0.7)',
  },
  {
    id: 'soaps',
    name: 'Bath Soaps',
    shortLabel: 'Bath Soaps',
    image: '/categories/collages/soaps-bath.webp',
    href: '/category/soaps-bath',
    bgTint: 'rgba(254, 242, 242, 0.7)',
  },
  {
    id: 'atta',
    name: 'Atta, Flours & Sooji',
    shortLabel: 'Atta & Flours',
    image: '/categories/collages/atta-rice-dal.webp',
    href: '/category/atta-rice-dal',
    bgTint: 'rgba(254, 243, 199, 0.7)',
  },
  {
    id: 'oils',
    name: 'Edible Cooking Oils',
    shortLabel: 'Cooking Oils',
    image: '/categories/collages/oil-ghee-masala.webp',
    href: '/category/oil-ghee-masala',
    bgTint: 'rgba(255, 247, 237, 0.7)',
  },
  {
    id: 'laundry',
    name: 'Laundry & Detergents',
    shortLabel: 'Detergents',
    image: '/categories/collages/laundry-detergents.webp',
    href: '/category/laundry-detergents',
    bgTint: 'rgba(238, 242, 255, 0.7)',
  },
  {
    id: 'dishwash',
    name: 'Dishwash & Kitchen',
    shortLabel: 'Dishwash',
    image: '/categories/collages/dishwash.webp',
    href: '/category/dishwash',
    bgTint: 'rgba(236, 253, 245, 0.7)',
  },
  {
    id: 'pooja',
    name: 'Pooja Essentials',
    shortLabel: 'Pooja Needs',
    image: '/categories/collages/pooja-needs.webp',
    href: '/category/pooja-needs',
    bgTint: 'rgba(255, 247, 237, 0.7)',
  },
];

interface HorizontalCategoryNavProps {
  activeId?: string;
}

export default function HorizontalCategoryNav({ activeId = 'soaps' }: HorizontalCategoryNavProps) {
  const [selected, setSelected] = useState(activeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-stone-50/80 to-transparent py-2 px-1">
      {/* Desktop scroll buttons */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-stone-200/80 shadow-md text-stone-700 hover:text-[#2E7D32] items-center justify-center transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
        className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-stone-200/80 shadow-md text-stone-700 hover:text-[#2E7D32] items-center justify-center transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Seamless Floating Cutout Rail (Flipkart Minutes & Blinkit style — NO harsh boxes, NO circular borders) */}
      <div
        ref={scrollRef}
        className="flex items-start gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 no-scrollbar"
      >
        {QUICK_CATEGORIES.map((item) => {
          const isActive = selected === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setSelected(item.id)}
              className="snap-start shrink-0 flex flex-col items-center group cursor-pointer w-[64px] sm:w-[72px] transition-transform active:scale-95"
            >
              {/* Pure Floating Cutout Canvas: Adapted seamlessly to background, subtle soft tint */}
              <div
                style={{ backgroundColor: item.bgTint || 'transparent' }}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'ring-2 ring-[#2E7D32] ring-offset-1 shadow-sm scale-105'
                    : 'hover:scale-105'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain select-none drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                  }}
                />
              </div>

              {/* Minimal Clean Label Underneath */}
              <span
                className={`text-[11px] font-bold text-center leading-tight mt-1.5 line-clamp-1 w-full tracking-tight transition-colors ${
                  isActive ? 'text-[#2E7D32] font-black' : 'text-stone-800 group-hover:text-[#2E7D32]'
                }`}
              >
                {item.shortLabel}
              </span>

              {/* Active Underline Pill */}
              {isActive && (
                <div className="w-4 h-1 bg-[#2E7D32] rounded-full mt-1" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
