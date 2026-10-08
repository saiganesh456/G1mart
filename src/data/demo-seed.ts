import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS as ALL_PRODUCTS } from './productsCatalog';

const BASE_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    id: 'personal-care',
    name: 'Personal Care & Hygiene',
    group: 'Personal Care',
    parent_id: null,
    display_order: 1,
    icon: 'Heart',
    image: '/categories/personal-care.jpg',
    description: 'Bathing soaps, hair care, toothpastes, baby care and personal grooming',
    subcategories: [
      'Bath Soaps',
      'Hair Oils & Care',
      'Oral Care',
      'Skin & Baby Care',
      'Personal Care Essentials',
    ],
  },
  {
    id: 'household-cleaning',
    name: 'Household & Cleaning',
    group: 'Household & Cleaning',
    parent_id: null,
    display_order: 2,
    icon: 'ShieldCheck',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Detergents, dishwash bars, surface cleaners, scrubbers and pest control',
    subcategories: [
      'Laundry & Detergents',
      'Dishwashing & Utensil Care',
      'Cleaners & Pest Control',
      'Cleaning Essentials',
      'Electricals & Batteries',
    ],
  },
  {
    id: 'grocery-staples',
    name: 'Grocery & Staples',
    group: 'Grocery & Staples',
    parent_id: null,
    display_order: 3,
    icon: 'Sparkles',
    image: '/categories/atta-rice-dal.jpg',
    description: 'Atta, flours, edible cooking oils, dals, pulses, spices and daily kitchen staples',
    subcategories: [
      'Atta, Flours & Sooji',
      'Edible Cooking Oils & Ghee',
      'Dals & Pulses',
      'Salt, Sugar & Jaggery',
      'Spices, Masalas & Seeds',
      'Rice, Poha & Vermicelli',
      'Cooking Essentials & Tamarind',
      'Kitchen Staples',
    ],
  },
  {
    id: 'snacks-beverages',
    name: 'Snacks & Beverages',
    group: 'Snacks & Beverages',
    parent_id: null,
    display_order: 4,
    icon: 'Coffee',
    image: '/categories/tea-coffee.jpg',
    description: 'Tea, coffee, biscuits, chocolates, chips, cold drinks and Arun ice creams',
    subcategories: [
      'Biscuits, Rusks & Cookies',
      'Chocolates & Sweets',
      'Tea, Chai & Coffee',
      'Chips & Namkeen',
      'Cold Drinks & Health Juices',
      'Dairy & Ice Creams',
      'Packaged Foods',
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
    description: 'Traditional agarbatti, fragrant rose & sandalwood incense sticks and dhoop cups',
    subcategories: ['Pooja Agarbatti & Dhoop'],
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
