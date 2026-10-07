'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface CategoryCardItem {
  id: string;
  name: string;
  image: string; // Professional authentic packshot from database
  href: string;
}

export interface DepartmentGroup {
  id: string;
  title: string;
  viewAllHref: string;
  items: CategoryCardItem[];
}

export const DEPARTMENT_GROUPS: DepartmentGroup[] = [
  {
    id: 'grocery-kitchen',
    title: '🌾 Atta, Rice, Dal & Staples',
    viewAllHref: '/category/grocery-staples',
    items: [
      {
        id: 'gk-atta',
        name: 'Atta & Flours',
        image: '/products/itc-001.jpg',
        href: '/category/grocery-staples?sub=Atta%2C%20Flours%20%26%20Sooji',
      },
      {
        id: 'gk-dal',
        name: 'Dals & Pulses',
        image: '/products/pdf1-007.jpg',
        href: '/category/grocery-staples?sub=Cooking%20Staples%20%26%20Flours',
      },
      {
        id: 'gk-oil',
        name: 'Edible Oils',
        image: '/products/g1-prod-134.jpg',
        href: '/search?q=oil',
      },
      {
        id: 'gk-sugar',
        name: 'Sugar & Salt',
        image: '/products/hw-026.jpg',
        href: '/search?q=sugar',
      },
    ],
  },
  {
    id: 'snacks-drinks',
    title: '🍪 Snacks, Munchies & Chai',
    viewAllHref: '/category/snacks-beverages',
    items: [
      {
        id: 'sd-tea',
        name: 'Tea & Chai',
        image: '/products/pdf1-004.jpg',
        href: '/category/snacks-beverages?sub=Tea%20%26%20Chai',
      },
      {
        id: 'sd-biscuits',
        name: 'Biscuits & Rusks',
        image: '/products/st-005.jpg',
        href: '/category/snacks-beverages?sub=Biscuits%20%26%20Cookies',
      },
      {
        id: 'sd-sweets',
        name: 'Chocolates & Sweets',
        image: '/products/st-001.jpg',
        href: '/category/snacks-beverages?sub=Chocolates%20%26%20Bars',
      },
      {
        id: 'sd-dryfruits',
        name: 'Dry Fruits & Nuts',
        image: '/products/jg-001.jpg',
        href: '/category/snacks-beverages?sub=Dry%20Fruits%20%26%20Dates',
      },
    ],
  },
  {
    id: 'household-lifestyle',
    title: '🧼 Household & Cleaning Care',
    viewAllHref: '/category/household-cleaning',
    items: [
      {
        id: 'hl-laundry',
        name: 'Laundry Detergents',
        image: '/products/g1-prod-020.jpg',
        href: '/category/household-cleaning?sub=Laundry%20%26%20Fabric%20Care',
      },
      {
        id: 'hl-dishwashing',
        name: 'Dishwash Bars & Tubs',
        image: '/products/pdf1-009.jpg',
        href: '/category/household-cleaning?sub=Dishwashing%20%26%20Kitchen%20Care',
      },
      {
        id: 'hl-surface',
        name: 'Floor & Surface Cleaners',
        image: '/products/pdf1-016.jpg',
        href: '/category/household-cleaning?sub=Floor%20%26%20Surface%20Cleaners',
      },
      {
        id: 'hl-pooja',
        name: 'Pooja Agarbatti & Dhoop',
        image: '/products/pdf1-091.jpg',
        href: '/category/pooja-essentials',
      },
    ],
  },
  {
    id: 'personal-care-group',
    title: '✨ Personal Care & Soaps',
    viewAllHref: '/category/personal-care',
    items: [
      {
        id: 'pc-soaps',
        name: 'Bath Soaps & Bars',
        image: '/products/pdf1-001.jpg',
        href: '/category/personal-care?sub=Bath%20Soaps',
      },
      {
        id: 'pc-ayurvedic',
        name: 'Ayurvedic Soaps',
        image: '/products/pdf1-024.jpg',
        href: '/category/personal-care?sub=Bath%20Soaps',
      },
      {
        id: 'pc-handwash',
        name: 'Handwash & Care',
        image: '/products/pdf1-031.jpg',
        href: '/category/personal-care?sub=Handwash%20%26%20Sanitizers',
      },
      {
        id: 'pc-talc',
        name: 'Talcum Powders',
        image: '/products/pdf1-020.jpg',
        href: '/category/personal-care?sub=Talcum%20Powder',
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
          className="scroll-mt-32 space-y-2.5 px-1 sm:px-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
              {group.title}
            </h2>
            <Link
              href={group.viewAllHref}
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Clean 3-Column Mobile Grid with Cut-Out Images Directly on White Canvas */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {group.items.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center cursor-pointer focus:outline-hidden transition-transform active:scale-95"
              >
                {/* 1:1 Transparent Cut-out Canvas (sitting directly on pure white) */}
                <div className="w-full aspect-square bg-white p-1 flex items-center justify-center overflow-hidden transition-all duration-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Clean 2-Line High-Contrast Label Underneath */}
                <span className="text-[12px] sm:text-xs font-bold text-stone-900 text-center leading-tight line-clamp-2 mt-1 px-0.5 w-full group-hover:text-[#2E7D32] transition-colors">
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
