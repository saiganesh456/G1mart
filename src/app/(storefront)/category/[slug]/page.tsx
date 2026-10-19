import { notFound } from 'next/navigation';
import { productService, normalizeCategory } from '@/services/productService';
import CategoryDashboardClient from './CategoryDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

// Category ID aliases for backward-compat navigation links
const CATEGORY_ALIASES: Record<string, string> = {
  'grocery-staples': 'atta-rice-dal',
  'snacks-beverages': 'chips-namkeen',
  'household-cleaning': 'floor-surface-cleaners',
  'pooja-essentials': 'pooja-needs',
  'personal-care': 'soaps-bath',
  // Numeric / human-readable aliases
  'soaps': 'soaps-bath',
  'soap': 'soaps-bath',
  'bath': 'soaps-bath',
  'breakfast-cereals': 'instant-food',
  'hair-shampoos': 'hair-care',
  'shaving-grooming': 'skin-care',
  'ice-cream': 'ice-creams',
  'icecreams': 'ice-creams',
  'icecream': 'ice-creams',
  'chocolates': 'sweets-chocolates',
  'chocolate': 'sweets-chocolates',
  'sweets': 'sweets-chocolates',
  'cold-drinks': 'drinks-juices',
  'drinks': 'drinks-juices',
  'cool-drinks': 'drinks-juices',
  'juices': 'drinks-juices',
  'biscuits': 'biscuits-bakery',
  'bakery': 'biscuits-bakery',
  'tea': 'tea-coffee-milk-drinks',
  'coffee': 'tea-coffee-milk-drinks',
  'chips': 'chips-namkeen',
  'namkeen': 'chips-namkeen',
  'snacks': 'chips-namkeen',
  'dairy': 'dairy-bread-eggs',
  'milk': 'dairy-bread-eggs',
  'noodles': 'instant-food',
  'pickle': 'pickles',
  'pickles-chutneys': 'pickles',
  'spices': 'spices-masalas',
  'masalas': 'spices-masalas',
  'masala': 'spices-masalas',
};

export default async function CategoryPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const targetId = CATEGORY_ALIASES[rawSlug] || rawSlug;

  const [categories, allProducts] = await Promise.all([
    productService.getCategories(),
    productService.getProducts(),
  ]);

  // Resolve category — try targetId first, then rawSlug, then first available
  let category = categories.find((c) => c.id === targetId || c.id === rawSlug);
  if (!category) {
    // Fuzzy: partial name match (e.g. "soap" → "Soaps & Bath")
    category = categories.find((c) =>
      c.id.includes(rawSlug) || rawSlug.includes(c.id) ||
      c.name.toLowerCase().includes(rawSlug.toLowerCase())
    );
  }
  if (!category) {
    category = categories[0];
  }
  if (!category) {
    notFound();
  }

  // Strict Category Filter: A category page must show ONLY products whose category_id matches.
  const catId = category!.id.toLowerCase();
  const target = targetId.toLowerCase();
  const finalProducts = allProducts.filter((p) => {
    const rawCat = (p.category_id || p.category || '').toLowerCase();
    const normCat = normalizeCategory(rawCat);
    return (
      normCat === catId ||
      normCat === target ||
      rawCat === catId ||
      rawCat === target ||
      (CATEGORY_ALIASES[rawCat] && (CATEGORY_ALIASES[rawCat] === catId || CATEGORY_ALIASES[rawCat] === target))
    );
  });

  return (
    <CategoryDashboardClient
      category={category!}
      allCategories={categories}
      products={finalProducts}
    />
  );
}
