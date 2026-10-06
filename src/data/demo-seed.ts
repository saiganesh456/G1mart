import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS as ALL_PRODUCTS } from './productsCatalog';

const BASE_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    id: 'household-cleaning',
    name: 'Household & Cleaning',
    group: 'Household & Cleaning',
    icon: '🧼',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Detergents, dishwash bars, surface cleaners, scrubbers and fabric care',
    subcategories: [
      'Laundry & Fabric Care',
      'Dishwashing & Kitchen Care',
      'Floor & Surface Cleaners',
      'Pest Control & Cleaning Aids',
    ],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    group: 'Personal Care',
    icon: '✨',
    image: '/categories/personal-care.jpg',
    description: 'Ayurvedic & sandalwood bath soaps, talcum powders and baby soap',
    subcategories: ['Bath Soaps', 'Talcum Powder', 'Baby Care'],
  },
  {
    id: 'pooja-essentials',
    name: 'Pooja Essentials',
    group: 'Pooja Essentials',
    icon: '🪔',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Traditional agarbatti, fragrant rose & jasmine incense sticks and dhoop cups',
    subcategories: ['Agarbatti & Incense Sticks', 'Dhoop & Sambrani'],
  },
  {
    id: 'grocery-staples',
    name: 'Grocery & Staples',
    group: 'Grocery & Staples',
    icon: '🌾',
    image: '/categories/atta-rice-dal.jpg',
    description: 'Roasted vermicelli, semiya, Bombay suji rava and authentic Andhra pickles',
    subcategories: ['Cooking Staples & Flours', 'Pickles & Chutneys'],
  },
  {
    id: 'snacks-beverages',
    name: 'Snacks & Beverages',
    group: 'Snacks & Beverages',
    icon: '🍪',
    image: '/categories/tea-coffee.jpg',
    description: 'Wagh Bakri premium leaf tea, spiced elaichi chai, and premium dates',
    subcategories: ['Tea & Chai', 'Dry Fruits & Dates'],
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
