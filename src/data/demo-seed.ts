import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS } from './catalog';

const BASE_CATEGORIES: Omit<Category, 'itemCount'>[] = [
  {
    id: 'rice-dal-atta',
    name: 'Atta, Rice & Dal',
    icon: '🌾',
    image: '/categories/atta-rice-dal.jpg',
    description: 'Rice, pulses, whole wheat atta, grains & staples',
    subcategories: ['Atta & Flours', 'Rice & Grains', 'Dals & Pulses', 'Salt & Sugar'],
  },
  {
    id: 'edible-oils',
    name: 'Masala, Oil & More',
    icon: '🛢️',
    image: '/categories/masala-oil.jpg',
    description: 'Cooking oils, pure ghee, spice powders & whole seeds',
    subcategories: ['Cooking Oils & Ghee', 'Spices & Masalas', 'Whole Spices & Seeds', 'Deepam & Pooja Oil'],
  },
  {
    id: 'dairy-bakery',
    name: 'Dairy, Bread & Ice Creams',
    icon: '🥛',
    image: '/categories/dairy-bread-eggs.jpg',
    description: 'Fresh milk, curd, butter, bakery items & ice creams',
    subcategories: ['Milk & Curd', 'Ice Creams & Frozen Treats', 'Bread & Bakery', 'Eggs'],
  },
  {
    id: 'snacks',
    name: 'Snacks & Munchies',
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
    name: 'Cleaning & Essentials',
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
    id: 'fruits-vegetables',
    name: 'Fresh Fruits & Veggies',
    icon: '🥦',
    image: '/categories/fruits-vegetables.jpg',
    description: 'Fresh coconuts, vegetables & seasonal fruits',
    subcategories: ['Fresh Produce & Fruits', 'Daily Vegetables'],
  },
];

// Dynamically compute exact item count for each category from active catalogue
export const DEMO_CATEGORIES: Category[] = BASE_CATEGORIES.map((cat) => ({
  ...cat,
  itemCount: CATALOG_PRODUCTS.filter((p) => p.category === cat.id).length,
}));

// All active products in catalogue
export const DEMO_PRODUCTS: Product[] = CATALOG_PRODUCTS;

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
