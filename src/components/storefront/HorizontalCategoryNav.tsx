'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface QuickCategoryItem {
  id: string;
  name: string;
  shortLabel: string;
  image: string; // Professional authentic product packshot
  href: string;
}

export const QUICK_CATEGORIES: QuickCategoryItem[] = [
  {
    id: 'all',
    name: 'All Departments',
    shortLabel: 'All Store',
    image: '/products/itc-001.jpg',
    href: '/categories',
  },
  {
    id: 'staples',
    name: 'Atta, Rice & Dals',
    shortLabel: 'Atta & Dals',
    image: '/products/itc-001.jpg',
    href: '/category/grocery-staples?sub=Atta%2C%20Flours%20%26%20Sooji',
  },
  {
    id: 'oils',
    name: 'Cooking Oils & Ghee',
    shortLabel: 'Edible Oils',
    image: '/products/g1-prod-134.jpg',
    href: '/search?q=oil',
  },
  {
    id: 'sugar',
    name: 'Sugar, Salt & Jaggery',
    shortLabel: 'Sugar & Salt',
    image: '/products/hw-026.jpg',
    href: '/search?q=sugar',
  },
  {
    id: 'tea-coffee',
    name: 'Chai, Tea & Coffee',
    shortLabel: 'Tea & Chai',
    image: '/products/pdf1-004.jpg',
    href: '/category/snacks-beverages?sub=Tea%20%26%20Chai',
  },
  {
    id: 'biscuits',
    name: 'Biscuits, Rusks & Cookies',
    shortLabel: 'Biscuits',
    image: '/products/st-005.jpg',
    href: '/category/snacks-beverages?sub=Biscuits%20%26%20Cookies',
  },
  {
    id: 'sweets',
    name: 'Chocolates & Sweets',
    shortLabel: 'Chocolates',
    image: '/products/st-001.jpg',
    href: '/category/snacks-beverages?sub=Chocolates%20%26%20Bars',
  },
  {
    id: 'laundry',
    name: 'Detergents & Fabric Care',
    shortLabel: 'Detergents',
    image: '/products/g1-prod-020.jpg',
    href: '/category/household-cleaning?sub=Laundry%20%26%20Fabric%20Care',
  },
  {
    id: 'dishwash',
    name: 'Dishwash & Kitchen Care',
    shortLabel: 'Dishwash',
    image: '/products/pdf1-009.jpg',
    href: '/category/household-cleaning?sub=Dishwashing%20%26%20Kitchen%20Care',
  },
  {
    id: 'soaps',
    name: 'Soaps & Bathing Care',
    shortLabel: 'Bath Soaps',
    image: '/products/pdf1-001.jpg',
    href: '/category/personal-care?sub=Bath%20Soaps',
  },
  {
    id: 'pooja',
    name: 'Pooja Agarbatti & Dhoop',
    shortLabel: 'Pooja Needs',
    image: '/products/pdf1-091.jpg',
    href: '/category/pooja-essentials',
  },
];

interface HorizontalCategoryNavProps {
  activeId?: string;
}

export default function HorizontalCategoryNav({ activeId = 'all' }: HorizontalCategoryNavProps) {
  const [selected, setSelected] = useState(activeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-white border-y border-stone-200/80 py-2.5 px-1 shadow-2xs">
      {/* Desktop scroll buttons */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-stone-200 shadow-md text-stone-700 hover:text-[#2E7D32] items-center justify-center transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
        className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-stone-200 shadow-md text-stone-700 hover:text-[#2E7D32] items-center justify-center transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Touch swipe horizontal row for mobile */}
      <div
        ref={scrollRef}
        className="flex items-start gap-2.5 sm:gap-3.5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 no-scrollbar"
      >
        {QUICK_CATEGORIES.map((item) => {
          const isActive = selected === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setSelected(item.id)}
              className="snap-start shrink-0 flex flex-col items-center group cursor-pointer w-[66px] sm:w-[76px] transition-transform active:scale-95"
            >
              {/* Product Packshot Frame with Clean Border & Background */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 flex items-center justify-center overflow-hidden transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 border-2 border-[#2E7D32] shadow-sm'
                    : 'bg-[#F8F9FA] border border-stone-200/90 group-hover:border-[#2E7D32] group-hover:bg-white'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain select-none group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              {/* Clear Label with high contrast */}
              <span
                className={`text-[11px] font-bold text-center leading-tight mt-1.5 line-clamp-1 w-full transition-colors ${
                  isActive ? 'text-[#2E7D32]' : 'text-stone-800 group-hover:text-[#2E7D32]'
                }`}
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
