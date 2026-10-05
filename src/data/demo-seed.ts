import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS as ALL_PRODUCTS } from './productsCatalog';

const BASE_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    icon: '🥦',
    image: '/categories/fruits-vegetables.jpg',
    description: 'Farm fresh fruits, leafy greens & organic vegetables',
    subcategories: ['Fresh Produce & Fruits', 'Daily Vegetables'],
  },
  {
    id: 'dairy-bakery',
    name: 'Dairy & Bakery',
    icon: '🥛',
    image: '/categories/dairy-bread-eggs.jpg',
    description: 'Fresh milk, curd, butter, bakery items & ice creams',
    subcategories: ['Milk & Curd', 'Ice Creams & Frozen Treats', 'Bread & Bakery', 'Eggs'],
  },
  {
    id: 'rice-dal-atta',
    name: 'Rice, Dal & Atta',
    icon: '🌾',
    image: '/categories/atta-rice-dal.jpg',
    description: 'Rice, pulses, whole wheat atta, grains & staples',
    subcategories: ['Atta & Flours', 'Rice & Grains', 'Dals & Pulses', 'Salt & Sugar'],
  },
  {
    id: 'snacks',
    name: 'Snacks & Biscuits',
    icon: '🍪',
    image: '/categories/snacks-munchies.jpg',
    description: 'Chips, namkeen, cookies, chocolates, sweets, dry fruits & papads',
    subcategories: [
      'Biscuits & Cookies',
      'Chips & Namkeen',
      'Chocolates & Sweets',
      'Dry Fruits & Nuts',
      'Papads & Fryums',
      'Instant Noodles & Pasta',
    ],
  },
  {
    id: 'beverages',
    name: 'Tea, Coffee & Drinks',
    icon: '☕',
    image: '/categories/tea-coffee.jpg',
    description: 'Tea powders, instant coffee, health drinks & cold drinks',
    subcategories: ['Tea & Chai', 'Instant Coffee', 'Health Drinks', 'Cold Drinks & Soda'],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '✨',
    image: '/categories/personal-care.jpg',
    description: 'Bath soaps, shampoos, oral care, toothbrushes & hygiene',
    subcategories: ['Bath Soaps', 'Oral Care', 'Hair Care & Shampoo', 'Skincare & Hygiene'],
  },
  {
    id: 'household',
    name: 'Household & Cleaning',
    icon: '🧼',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Detergents, dishwash, surface cleaners, utilities & pooja needs',
    subcategories: [
      'Detergent & Fabric Care',
      'Floor & Cleaners',
      'Home Utilities & Stationery',
      'Pooja Needs',
      'Dishwash & Kitchen',
    ],
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    icon: '👶',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Baby diapers, wipes, soaps, baby shampoo and hygiene essentials',
    subcategories: ['Diapers & Wipes', 'Baby Bath & Skincare'],
  },
];

// Dynamically compute exact item count for each category from active catalogue
export const DEMO_CATEGORIES: Category[] = BASE_CATEGORIES.map((cat) => ({
  ...cat,
  itemCount: ALL_PRODUCTS.filter((p) => p.category === cat.id).length,
}));

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
