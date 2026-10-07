import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS as ALL_PRODUCTS } from './productsCatalog';

const BASE_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    id: 'grocery-staples',
    name: 'Grocery & Staples',
    group: 'Grocery & Staples',
    parent_id: null,
    display_order: 1,
    icon: 'Sparkles',
    image: '/categories/atta-rice-dal.jpg',
    description: 'Roasted vermicelli, semiya, Bombay suji rava, dals and authentic Andhra pickles',
    subcategories: [
      'Cooking Staples & Flours',
      'Atta, Flours & Sooji',
      'Vermicelli & Sevai',
      'Salt, Sugar & Jaggery',
      'Pickles & Chutneys',
      'Packaged Groceries',
    ],
  },
  {
    id: 'snacks-beverages',
    name: 'Snacks & Beverages',
    group: 'Snacks & Beverages',
    parent_id: null,
    display_order: 2,
    icon: 'Coffee',
    image: '/categories/tea-coffee.jpg',
    description: 'Wagh Bakri tea, biscuits, cookies, rusks, traditional sweets and dry fruits',
    subcategories: [
      'Tea & Chai',
      'Tea & Coffee',
      'Biscuits & Cookies',
      'Biscuits & Crackers',
      'Rusks & Toast',
      'Chips & Namkeen',
      'Traditional Indian Snacks',
      'Traditional Indian Sweets',
      'Chocolates & Bars',
      'Dry Fruits & Dates',
      'Dry Fruits & Nuts',
      'Packaged Groceries',
    ],
  },
  {
    id: 'household-cleaning',
    name: 'Household & Cleaning',
    group: 'Household & Cleaning',
    parent_id: null,
    display_order: 3,
    icon: 'ShieldCheck',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Detergents, dishwash bars, surface cleaners, scrubbers and fabric care',
    subcategories: [
      'Laundry & Fabric Care',
      'Dishwashing & Kitchen Care',
      'Floor & Surface Cleaners',
      'Pest Control & Cleaning Aids',
      'Stationery & Utility',
      'Packaged Groceries',
    ],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    group: 'Personal Care',
    parent_id: null,
    display_order: 4,
    icon: 'Heart',
    image: '/categories/personal-care.jpg',
    description: 'Ayurvedic & sandalwood bath soaps, talcum powders, handwash and personal grooming',
    subcategories: [
      'Bath Soaps',
      'Handwash & Sanitizers',
      'Hair Care',
      'Talcum Powder',
      'Baby Care',
      'Feminine Hygiene',
      'Health & Wellness',
      'Packaged Groceries',
    ],
  },
  {
    id: 'pooja-essentials',
    name: 'Pooja Essentials',
    group: 'Pooja Essentials',
    parent_id: null,
    display_order: 5,
    icon: 'Flame',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Traditional agarbatti, fragrant rose & jasmine incense sticks and dhoop cups',
    subcategories: ['Agarbatti & Incense Sticks', 'Dhoop & Sambrani'],
  },
];

// Dynamically compute exact item count for each category from active catalogue and exclude empty categories
export const DEMO_CATEGORIES: Category[] = BASE_CATEGORIES.map((cat) => ({
  ...cat,
  itemCount: ALL_PRODUCTS.filter((p) => p.category === cat.id).length,
})).filter((cat) => cat.itemCount > 0);

// All active products in catalogue (All 472 products fallback)
export const DEMO_PRODUCTS: Product[] = ALL_PRODUCTS;

/** Convenience helpers */
export function getDemoProductById(id: string): Product | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id);
}

export function getDemoProductsByCategory(categoryId: string): Product[] {
  return DEMO_PRODUCTS.filter((p) => p.category === categoryId);
}

export function getDemoCategoryById(id: string): Category | undefined {
  return DEMO_CATEGORIES.find((c) => c.id === id);
}
