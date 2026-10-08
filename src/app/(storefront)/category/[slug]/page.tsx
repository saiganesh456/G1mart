import { notFound } from 'next/navigation';
import { productService } from '@/services/productService';
import CategoryDashboardClient from './CategoryDashboardClient';

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

  // Filter products for this category
  const matchingProducts = allProducts.filter(
    (p) =>
      p.category === category!.id ||
      p.category === targetId ||
      p.category === rawSlug ||
      p.category_id === category!.id ||
      p.category_id === targetId
  );

  // If no match (shouldn't happen with migrated data), show first 40
  const finalProducts = matchingProducts.length > 0 ? matchingProducts : allProducts.slice(0, 40);

  return (
    <CategoryDashboardClient
      category={category!}
      allCategories={categories}
      products={finalProducts}
    />
  );
}
