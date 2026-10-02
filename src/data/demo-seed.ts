import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS } from './catalog';

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'rice-dal-atta',
    name: 'Rice, Dal & Atta',
    icon: '🌾',
    description: 'Rice, pulses, whole wheat atta, grains & masalas',
    itemCount: 160,
    subcategories: ['Dals & Pulses', 'Atta & Flours', 'Rice & Rava', 'Salt, Sugar & Spices'],
  },
  {
    id: 'edible-oils',
    name: 'Edible Oils & Ghee',
    icon: '🛢️',
    description: 'Cooking oils, sunflower oil, groundnut oil & pure ghee',
    itemCount: 25,
    subcategories: ['Sunflower Oil', 'Groundnut Oil', 'Deepam Oil', 'Pure Ghee'],
  },
  {
    id: 'dairy-bakery',
    name: 'Dairy & Bakery',
    icon: '🥛',
    description: 'Milk, curd, butter, paneer, bread & eggs',
    itemCount: 20,
    subcategories: ['Milk & Curd', 'Bread & Buns', 'Eggs & Batter'],
  },
  {
    id: 'snacks',
    name: 'Snacks & Biscuits',
    icon: '🍪',
    description: 'Chips, namkeen, cookies, chocolates, dry fruits & instant noodles',
    itemCount: 110,
    subcategories: ['Biscuits & Cookies', 'Chips & Crisps', 'Dry Fruits & Nuts', 'Chocolates & Sweets'],
  },
  {
    id: 'beverages',
    name: 'Beverages & Tea',
    icon: '☕',
    description: 'Tea powders, instant coffee, health drinks & cold drinks',
    itemCount: 35,
    subcategories: ['Tea & Chai', 'Instant Coffee', 'Cold Drinks & Soda', 'Health Drinks'],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '✨',
    description: 'Soaps, shampoos, toothpastes, skincare & hair oils',
    itemCount: 65,
    subcategories: ['Oral Care', 'Bath Soaps', 'Hair Care', 'Face & Skincare'],
  },
  {
    id: 'household',
    name: 'Household & Cleaning',
    icon: '🧼',
    description: 'Detergents, dishwash, floor cleaners, mops & pooja needs',
    itemCount: 50,
    subcategories: ['Detergent & Fabric Care', 'Dishwash', 'Cleaning Essentials', 'Pooja Needs'],
  },
  {
    id: 'fruits-vegetables',
    name: 'Fresh Essentials',
    icon: '🥦',
    description: 'Onions, coconuts & daily fresh staples',
    itemCount: 7,
    subcategories: ['Daily Veggies', 'Fresh Staples'],
  },
];

// All 472 products from Item Sales Detail report
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
