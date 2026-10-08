'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface CategoryCardItem {
  id: string;
  name: string;
  image: string;
  href: string;
  bgTint: string;
}

export interface DepartmentGroup {
  id: string;
  title: string;
  viewAllHref: string;
  items: CategoryCardItem[];
}

export const DEPARTMENT_GROUPS: DepartmentGroup[] = [
  {
    id: 'bathing-cleaning',
    title: '🧼 Bathing & Cleaning Care',
    viewAllHref: '/category/personal-care',
    items: [
      {
        id: 'bc-soaps',
        name: 'Bath Soaps',
        image: '/products/packshots/mysore-sandal-soap.jpg',
        href: '/category/personal-care?sub=Bath%20Soaps',
        bgTint: '#FFF1F2', // Soft pastel rose
      },
      {
        id: 'bc-hair',
        name: 'Hair Oils & Care',
        image: '/products/packshots/amul-milk.jpg',
        href: '/category/personal-care?sub=Hair%20Oils%20%26%20Care',
        bgTint: '#F0FDF4', // Soft pastel mint
      },
      {
        id: 'bc-laundry',
        name: 'Laundry & Detergents',
        image: '/products/packshots/surf-excel.jpg',
        href: '/category/household-cleaning?sub=Laundry%20%26%20Detergents',
        bgTint: '#EFF6FF', // Soft pastel sky blue
      },
      {
        id: 'bc-dishwash',
        name: 'Dishwashing Care',
        image: '/products/packshots/vim-bar.jpg',
        href: '/category/household-cleaning?sub=Dishwashing%20%26%20Utensil%20Care',
        bgTint: '#ECFDF5', // Soft pastel emerald
      },
      {
        id: 'bc-oral',
        name: 'Oral & Toothpastes',
        image: '/products/packshots/colgate-toothpaste.jpg',
        href: '/category/personal-care?sub=Oral%20Care',
        bgTint: '#F5F3FF', // Soft pastel lavender
      },
      {
        id: 'bc-cleaners',
        name: 'Cleaners & Pest Control',
        image: '/products/packshots/exo-scrubber.jpg',
        href: '/category/household-cleaning?sub=Cleaners%20%26%20Pest%20Control',
        bgTint: '#FFFBEB', // Soft pastel amber
      },
    ],
  },
  {
    id: 'groceries-staples',
    title: '🌾 Groceries & Kitchen Staples',
    viewAllHref: '/category/grocery-staples',
    items: [
      {
        id: 'gk-atta',
        name: 'Atta, Flours & Sooji',
        image: '/products/packshots/aashirvaad-atta.jpg',
        href: '/category/grocery-staples?sub=Atta%2C%20Flours%20%26%20Sooji',
        bgTint: '#FEF3C7', // Soft warm wheat
      },
      {
        id: 'gk-oil',
        name: 'Edible Cooking Oils',
        image: '/products/packshots/sunflower-oil.jpg',
        href: '/category/grocery-staples?sub=Edible%20Cooking%20Oils%20%26%20Ghee',
        bgTint: '#FFF7ED', // Soft warm orange
      },
      {
        id: 'gk-dal',
        name: 'Dals & Pulses',
        image: '/products/packshots/toor-dal.jpg',
        href: '/category/grocery-staples?sub=Dals%20%26%20Pulses',
        bgTint: '#FFF1F2', // Soft pastel coral
      },
      {
        id: 'gk-spices',
        name: 'Spices & Masalas',
        image: '/products/packshots/aashirvaad-crystal-salt.jpg',
        href: '/category/grocery-staples?sub=Spices%2C%20Masalas%20%26%20Seeds',
        bgTint: '#FEFCE8', // Soft warm yellow
      },
      {
        id: 'gk-salt',
        name: 'Salt, Sugar & Jaggery',
        image: '/products/packshots/tata-salt.jpg',
        href: '/category/grocery-staples?sub=Salt%2C%20Sugar%20%26%20Jaggery',
        bgTint: '#F0FDF4', // Soft mint
      },
      {
        id: 'gk-rice',
        name: 'Rice, Poha & Vermicelli',
        image: '/products/packshots/aashirvaad-suji-rava.jpg',
        href: '/category/grocery-staples?sub=Rice%2C%20Poha%20%26%20Vermicelli',
        bgTint: '#F8FAFC', // Soft cool grey
      },
    ],
  },
  {
    id: 'snacks-beverages',
    title: '🍪 Snacks, Munchies & Beverages',
    viewAllHref: '/category/snacks-beverages',
    items: [
      {
        id: 'sd-biscuits',
        name: 'Biscuits & Cookies',
        image: '/products/packshots/good-day.jpg',
        href: '/category/snacks-beverages?sub=Biscuits%2C%20Rusks%20%26%20Cookies',
        bgTint: '#F0F9FF', // Soft ice blue
      },
      {
        id: 'sd-chocolates',
        name: 'Chocolates & Sweets',
        image: '/products/packshots/cadbury-5-star.jpg',
        href: '/category/snacks-beverages?sub=Chocolates%20%26%20Sweets',
        bgTint: '#FAF5FF', // Soft violet
      },
      {
        id: 'sd-tea',
        name: 'Tea, Chai & Coffee',
        image: '/products/packshots/red-label-tea.jpg',
        href: '/category/snacks-beverages?sub=Tea%2C%20Chai%20%26%20Coffee',
        bgTint: '#FEF3C7', // Soft warm tea amber
      },
      {
        id: 'sd-chips',
        name: 'Chips & Namkeen',
        image: '/products/packshots/lays-chips.jpg',
        href: '/category/snacks-beverages?sub=Chips%20%26%20Namkeen',
        bgTint: '#FFF1F2', // Soft warm rose
      },
      {
        id: 'sd-drinks',
        name: 'Cold Drinks & Juices',
        image: '/products/packshots/thums-up.jpg',
        href: '/category/snacks-beverages?sub=Cold%20Drinks%20%26%20Health%20Juices',
        bgTint: '#EFF6FF', // Soft blue
      },
      {
        id: 'sd-icecream',
        name: 'Dairy & Arun Ice Cream',
        image: '/products/packshots/arun-bites.jpg',
        href: '/category/snacks-beverages?sub=Dairy%20%26%20Ice%20Creams',
        bgTint: '#FDF2F8', // Soft pink
      },
    ],
  },
];

interface BlinkitCategorySectionProps {
  groups?: DepartmentGroup[];
}

export default function BlinkitCategorySection({
  groups = DEPARTMENT_GROUPS,
}: BlinkitCategorySectionProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="scroll-mt-32 space-y-3 px-1 sm:px-0"
        >
          {/* Minimal Clean Department Headline */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>{group.title}</span>
            </h2>
            <Link
              href={group.viewAllHref}
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Flipkart Minutes / Blinkit Style: Soft tinted pastel tiles with floating cutouts (NO harsh borders) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
            {group.items.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center cursor-pointer focus:outline-hidden transition-transform active:scale-95"
              >
                {/* Floating Cutout Canvas: Subtle pastel tint, rounded corners, NO dark lines or boxes */}
                <div
                  style={{ backgroundColor: cat.bgTint }}
                  className="w-full aspect-square rounded-2xl p-2.5 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain select-none drop-shadow-xs transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/products/placeholder.svg';
                    }}
                  />
                </div>

                {/* Clean, high-contrast label directly underneath */}
                <span className="text-[11px] sm:text-xs font-bold text-stone-900 text-center leading-tight line-clamp-2 mt-1.5 px-0.5 w-full group-hover:text-[#2E7D32] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
