'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface CategoryCardItem {
  id: string;
  name: string;
  image: string;
  fallbackIcon: string;
  href: string;
  bgColor?: string;
  borderColor?: string;
}

export interface DepartmentGroup {
  id: string;
  title: string;
  icon: string;
  viewAllHref: string;
  themeColor: string;
  items: CategoryCardItem[];
}

export const DEPARTMENT_GROUPS: DepartmentGroup[] = [
  {
    id: 'grocery-kitchen',
    title: 'Grocery & Kitchen',
    icon: '🛒',
    viewAllHref: '/category/grocery-staples',
    themeColor: '#2E7D32',
    items: [
      {
        id: 'gk-veg-fruits',
        name: 'Vegetables & Fruits',
        image: '/categories/fruits-vegetables.jpg',
        fallbackIcon: '🍎',
        href: '/category/grocery-staples',
        bgColor: 'bg-emerald-50/70',
        borderColor: 'border-emerald-100',
      },
      {
        id: 'gk-atta-rice-dal',
        name: 'Atta, Rice & Dal',
        image: '/categories/atta-rice-dal.jpg',
        fallbackIcon: '🌾',
        href: '/category/grocery-staples?sub=Atta%2C%20Flours%20%26%20Sooji',
        bgColor: 'bg-amber-50/60',
        borderColor: 'border-amber-100',
      },
      {
        id: 'gk-oil-masala',
        name: 'Oil, Ghee & Masala',
        image: '/categories/masala-oil.jpg',
        fallbackIcon: '🫒',
        href: '/category/grocery-staples',
        bgColor: 'bg-orange-50/60',
        borderColor: 'border-orange-100',
      },
      {
        id: 'gk-dairy-eggs',
        name: 'Dairy, Bread & Eggs',
        image: '/categories/dairy-bread-eggs.jpg',
        fallbackIcon: '🥛',
        href: '/category/grocery-staples',
        bgColor: 'bg-sky-50/70',
        borderColor: 'border-sky-100',
      },
      {
        id: 'gk-bakery-biscuits',
        name: 'Bakery & Biscuits',
        image: '/categories/bakery-biscuits.jpg',
        fallbackIcon: '🍪',
        href: '/category/snacks-beverages?sub=Biscuits%20%26%20Cookies',
        bgColor: 'bg-yellow-50/70',
        borderColor: 'border-yellow-100',
      },
      {
        id: 'gk-dryfruits-cereals',
        name: 'Dry Fruits & Cereals',
        image: '/categories/breakfast-instant.jpg',
        fallbackIcon: '🥣',
        href: '/category/snacks-beverages?sub=Dry%20Fruits%20%26%20Dates',
        bgColor: 'bg-stone-50',
        borderColor: 'border-stone-200/80',
      },
      {
        id: 'gk-instant-noodles',
        name: 'Instant Noodles & Pasta',
        image: '/products/packshots/maggi-noodles.jpg',
        fallbackIcon: '🍜',
        href: '/category/snacks-beverages?sub=Noodles%20%26%20Pasta',
        bgColor: 'bg-rose-50/60',
        borderColor: 'border-rose-100',
      },
      {
        id: 'gk-kitchenware',
        name: 'Kitchenware & Utensils',
        image: '/products/packshots/vim-bar.jpg',
        fallbackIcon: '🍳',
        href: '/category/household-cleaning?sub=Dishwashing%20%26%20Kitchen%20Care',
        bgColor: 'bg-teal-50/60',
        borderColor: 'border-teal-100',
      },
    ],
  },
  {
    id: 'snacks-drinks',
    title: 'Snacks & Drinks',
    icon: '🍪',
    viewAllHref: '/category/snacks-beverages',
    themeColor: '#E65100',
    items: [
      {
        id: 'sd-chips-namkeen',
        name: 'Chips & Namkeen',
        image: '/categories/snacks-munchies.jpg',
        fallbackIcon: '🍿',
        href: '/category/snacks-beverages?sub=Chips%20%26%20Namkeen',
        bgColor: 'bg-amber-50/70',
        borderColor: 'border-amber-100',
      },
      {
        id: 'sd-sweets-chocolates',
        name: 'Sweets & Chocolates',
        image: '/categories/sweets-chocolates.jpg',
        fallbackIcon: '🍫',
        href: '/category/snacks-beverages?sub=Chocolates%20%26%20Bars',
        bgColor: 'bg-pink-50/70',
        borderColor: 'border-pink-100',
      },
      {
        id: 'sd-drinks-juices',
        name: 'Drinks & Juices',
        image: '/categories/cold-drinks-juices.jpg',
        fallbackIcon: '🧃',
        href: '/category/snacks-beverages',
        bgColor: 'bg-cyan-50/70',
        borderColor: 'border-cyan-100',
      },
      {
        id: 'sd-tea-coffee',
        name: 'Tea, Coffee & Chai',
        image: '/categories/tea-coffee.jpg',
        fallbackIcon: '☕',
        href: '/category/snacks-beverages?sub=Tea%20%26%20Chai',
        bgColor: 'bg-orange-50/70',
        borderColor: 'border-orange-100',
      },
    ],
  },
  {
    id: 'household-lifestyle',
    title: 'Household & Cleaning',
    icon: '🧼',
    viewAllHref: '/category/household-cleaning',
    themeColor: '#1E88E5',
    items: [
      {
        id: 'hl-cleaning-essentials',
        name: 'Cleaning Essentials',
        image: '/categories/cleaning-essentials.jpg',
        fallbackIcon: '🧴',
        href: '/category/household-cleaning',
        bgColor: 'bg-blue-50/70',
        borderColor: 'border-blue-100',
      },
      {
        id: 'hl-laundry-care',
        name: 'Laundry & Fabric Care',
        image: '/products/packshots/surf-excel.jpg',
        fallbackIcon: '🧺',
        href: '/category/household-cleaning?sub=Laundry%20%26%20Fabric%20Care',
        bgColor: 'bg-indigo-50/60',
        borderColor: 'border-indigo-100',
      },
      {
        id: 'hl-dishwashing',
        name: 'Dishwashing & Scrubbers',
        image: '/products/packshots/exo-scrubber.jpg',
        fallbackIcon: '🧽',
        href: '/category/household-cleaning?sub=Dishwashing%20%26%20Kitchen%20Care',
        bgColor: 'bg-emerald-50/60',
        borderColor: 'border-emerald-100',
      },
      {
        id: 'hl-pooja-essentials',
        name: 'Pooja Essentials',
        image: '/products/photos/pooja-camphor.jpg',
        fallbackIcon: '🪔',
        href: '/category/pooja-essentials',
        bgColor: 'bg-amber-50/70',
        borderColor: 'border-amber-100',
      },
      {
        id: 'hl-floor-surface',
        name: 'Floor & Surface Cleaners',
        image: '/products/packshots/ariel-front-liq.jpg',
        fallbackIcon: '✨',
        href: '/category/household-cleaning?sub=Floor%20%26%20Surface%20Cleaners',
        bgColor: 'bg-cyan-50/60',
        borderColor: 'border-cyan-100',
      },
      {
        id: 'hl-pest-control',
        name: 'Pest Control & Clean Aids',
        image: '/products/photos/cleaning-wash.jpg',
        fallbackIcon: '🛡️',
        href: '/category/household-cleaning?sub=Pest%20Control%20%26%20Cleaning%20Aids',
        bgColor: 'bg-purple-50/60',
        borderColor: 'border-purple-100',
      },
    ],
  },
  {
    id: 'personal-care-group',
    title: 'Personal Care & Hygiene',
    icon: '✨',
    viewAllHref: '/category/personal-care',
    themeColor: '#7B1FA2',
    items: [
      {
        id: 'pc-bath-soaps',
        name: 'Bath Soaps & Body Wash',
        image: '/categories/personal-care.jpg',
        fallbackIcon: '🫧',
        href: '/category/personal-care?sub=Bath%20Soaps',
        bgColor: 'bg-rose-50/70',
        borderColor: 'border-rose-100',
      },
      {
        id: 'pc-oral-care',
        name: 'Oral Care & Dental',
        image: '/products/packshots/colgate-toothpaste.jpg',
        fallbackIcon: '🪥',
        href: '/category/personal-care',
        bgColor: 'bg-sky-50/70',
        borderColor: 'border-sky-100',
      },
      {
        id: 'pc-talc-deo',
        name: 'Talcum Powder & Soaps',
        image: '/products/packshots/dettol-soap.jpg',
        fallbackIcon: '🌸',
        href: '/category/personal-care?sub=Talcum%20Powder',
        bgColor: 'bg-amber-50/60',
        borderColor: 'border-amber-100',
      },
      {
        id: 'pc-baby-care',
        name: 'Baby Care Essentials',
        image: '/products/packshots/amul-milk.jpg',
        fallbackIcon: '👶',
        href: '/category/personal-care?sub=Baby%20Care',
        bgColor: 'bg-emerald-50/70',
        borderColor: 'border-emerald-100',
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl leading-none select-none">
                {group.icon}
              </span>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {group.title}
              </h2>
            </div>
            <Link
              href={group.viewAllHref}
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1b5e20] flex items-center gap-0.5 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Blinkit Style 4-Column Responsive Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {group.items.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center cursor-pointer focus:outline-hidden transition-transform active:scale-95"
              >
                {/* Rounded pastel card with image */}
                <div
                  className={`w-full aspect-square rounded-2xl ${
                    cat.bgColor || 'bg-stone-50'
                  } border ${
                    cat.borderColor || 'border-stone-200/80'
                  } p-1.5 sm:p-2 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-md group-hover:border-[#2E7D32] relative`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to icon display if image doesn't load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const span = document.createElement('span');
                        span.className = 'fallback-icon text-3xl select-none leading-none';
                        span.textContent = cat.fallbackIcon;
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>

                {/* Clean, legible title beneath card */}
                <span className="text-[11px] sm:text-xs font-bold text-stone-800 text-center leading-tight line-clamp-2 mt-1.5 px-0.5 w-full group-hover:text-[#2E7D32] transition-colors">
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
