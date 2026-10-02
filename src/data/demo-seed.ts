import type { Product, Category } from '@/types';
import { CATALOG_PRODUCTS } from './catalog';

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'rice-dal-atta',
    name: 'Atta, Rice & Dal',
    icon: '🌾',
    image: '/categories/atta-rice-dal.jpg',
    description: 'Rice, pulses, whole wheat atta, grains & masalas',
    itemCount: 160,
    subcategories: ['Atta & Flours', 'Rice & Grains', 'Dals & Pulses', 'Salt & Sugar', 'Spices & Masalas'],
  },
  {
    id: 'edible-oils',
    name: 'Masala, Oil & More',
    icon: '🛢️',
    image: '/categories/masala-oil.jpg',
    description: 'Cooking oils, sunflower oil, groundnut oil & pure ghee',
    itemCount: 25,
    subcategories: ['Sunflower Oil', 'Groundnut & Other Oils', 'Deepam & Pooja Oil', 'Pure Ghee'],
  },
  {
    id: 'dairy-bakery',
    name: 'Dairy, Bread & Eggs',
    icon: '🥛',
    image: '/categories/dairy-bread-eggs.jpg',
    description: 'Fresh milk, curd, butter, brown bread, pav & eggs',
    itemCount: 20,
    subcategories: ['Milk & Curd', 'Bread & Bakery', 'Eggs'],
  },
  {
    id: 'snacks',
    name: 'Snacks & Munchies',
    icon: '🍪',
    image: '/categories/snacks-munchies.jpg',
    description: 'Chips, namkeen, cookies, chocolates, dry fruits & instant noodles',
    itemCount: 110,
    subcategories: ['Biscuits & Cookies', 'Chips & Namkeen', 'Chocolates & Sweets', 'Dry Fruits & Nuts', 'Instant Noodles & Pasta'],
  },
  {
    id: 'beverages',
    name: 'Tea, Coffee & Drinks',
    icon: '☕',
    image: '/categories/tea-coffee.jpg',
    description: 'Tea powders, instant coffee, health drinks & cold drinks',
    itemCount: 35,
    subcategories: ['Tea & Chai', 'Instant Coffee', 'Cold Drinks & Soda', 'Health Drinks'],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '✨',
    image: '/categories/personal-care.jpg',
    description: 'Soaps, shampoos, toothpastes, skincare & hair oils',
    itemCount: 65,
    subcategories: ['Bath Soaps', 'Oral Care', 'Hair Care', 'Skincare & Hygiene'],
  },
  {
    id: 'household',
    name: 'Cleaning Essentials',
    icon: '🧼',
    image: '/categories/cleaning-essentials.jpg',
    description: 'Detergents, dishwash, floor cleaners, mops & pooja needs',
    itemCount: 50,
    subcategories: ['Detergent & Fabric Care', 'Dishwash & Kitchen', 'Floor & Cleaners', 'Pooja Needs', 'Home Utilities'],
  },
  {
    id: 'fruits-vegetables',
    name: 'Fresh Fruits & Veggies',
    icon: '🥦',
    image: '/categories/fruits-vegetables.jpg',
    description: 'Fresh onions, potatoes, tomatoes, coconuts & daily staples',
    itemCount: 7,
    subcategories: ['Daily Vegetables', 'Fresh Produce & Fruits'],
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
