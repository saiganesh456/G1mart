'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

export interface QuickCategoryItem {
  id: string;
  name: string;
  shortLabel: string;
  icon: string; // Emoji or image/symbol
  targetSectionId?: string;
  href: string;
  badge?: string;
}

export const QUICK_CATEGORIES: QuickCategoryItem[] = [
  {
    id: 'all',
    name: 'All Essentials',
    shortLabel: 'For You',
    icon: '🛍️',
    href: '#top-essentials',
    targetSectionId: 'top-essentials',
  },
  {
    id: 'fresh',
    name: 'Fresh Fruits & Veggies',
    shortLabel: 'Fresh',
    icon: '🍎',
    href: '#grocery-kitchen',
    targetSectionId: 'grocery-kitchen',
  },
  {
    id: 'grocery',
    name: 'Atta, Rice & Staples',
    shortLabel: 'Grocery',
    icon: '🌾',
    href: '#grocery-kitchen',
    targetSectionId: 'grocery-kitchen',
  },
  {
    id: 'snacks',
    name: 'Chips, Namkeen & Biscuits',
    shortLabel: 'Snacks',
    icon: '🍿',
    href: '#snacks-drinks',
    targetSectionId: 'snacks-drinks',
  },
  {
    id: 'dairy',
    name: 'Dairy, Bread & Eggs',
    shortLabel: 'Dairy',
    icon: '🥛',
    href: '#grocery-kitchen',
    targetSectionId: 'grocery-kitchen',
  },
  {
    id: 'tea-coffee',
    name: 'Tea, Coffee & Drinks',
    shortLabel: 'Chai & Drinks',
    icon: '☕',
    href: '#snacks-drinks',
    targetSectionId: 'snacks-drinks',
  },
  {
    id: 'household',
    name: 'Cleaning & Detergents',
    shortLabel: 'Household',
    icon: '🧼',
    href: '#household-lifestyle',
    targetSectionId: 'household-lifestyle',
  },
  {
    id: 'pooja',
    name: 'Pooja Essentials & Agarbatti',
    shortLabel: 'Pooja',
    icon: '🪔',
    href: '#pooja-section',
    targetSectionId: 'pooja-section',
  },
  {
    id: 'personal-care',
    name: 'Soaps & Personal Care',
    shortLabel: 'Personal Care',
    icon: '✨',
    href: '#personal-care-section',
    targetSectionId: 'personal-care-section',
  },
  {
    id: 'instant-food',
    name: 'Instant Noodles & Pasta',
    shortLabel: 'Instant Food',
    icon: '🍜',
    href: '#snacks-drinks',
    targetSectionId: 'snacks-drinks',
  },
  {
    id: 'kitchen',
    name: 'Kitchenware & Utensils',
    shortLabel: 'Kitchen',
    icon: '🍳',
    href: '#household-lifestyle',
    targetSectionId: 'household-lifestyle',
  },
  {
    id: 'sweets',
    name: 'Sweets & Chocolates',
    shortLabel: 'Chocolates',
    icon: '🍫',
    href: '#snacks-drinks',
    targetSectionId: 'snacks-drinks',
  },
];

interface HorizontalCategoryNavProps {
  activeId?: string;
  onSelectCategory?: (id: string) => void;
}

export default function HorizontalCategoryNav({
  activeId = 'all',
  onSelectCategory,
}: HorizontalCategoryNavProps) {
  const [selected, setSelected] = useState(activeId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleItemClick = (e: React.MouseEvent, item: QuickCategoryItem) => {
    setSelected(item.id);
    if (onSelectCategory) {
      onSelectCategory(item.id);
    }

    if (item.targetSectionId) {
      const targetElement = document.getElementById(item.targetSectionId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 130;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div className="relative w-full bg-white border-b border-stone-200/70 shadow-2xs py-2 px-1">
      {/* Desktop scroll arrows */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-stone-200 shadow-md text-stone-700 hover:text-[#2E7D32] items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-stone-200 shadow-md text-stone-700 hover:text-[#2E7D32] items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Horizontal scrolling strip */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 px-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {QUICK_CATEGORIES.map((item) => {
          const isActive = selected === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => handleItemClick(e, item)}
              className="snap-start shrink-0 flex flex-col items-center group cursor-pointer w-[68px] sm:w-[74px] focus:outline-hidden transition-transform active:scale-95"
            >
              {/* Category Icon Capsule / Rounded Box */}
              <div
                className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20 scale-105'
                    : 'bg-stone-50 hover:bg-emerald-50/80 border border-stone-200/70 text-stone-700 group-hover:border-emerald-300'
                }`}
              >
                <span className="text-2xl sm:text-2xl select-none leading-none drop-shadow-2xs">
                  {item.icon}
                </span>

                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1 py-0.2 rounded-full uppercase">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-bold text-center leading-tight mt-1.5 line-clamp-1 w-full transition-colors ${
                  isActive ? 'text-[#2E7D32]' : 'text-stone-700 group-hover:text-[#2E7D32]'
                }`}
              >
                {item.shortLabel}
              </span>

              {/* Underline indicator */}
              <div
                className={`h-0.5 w-6 rounded-full mt-0.5 transition-all duration-200 ${
                  isActive ? 'bg-[#2E7D32] scale-100' : 'bg-transparent scale-0'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
