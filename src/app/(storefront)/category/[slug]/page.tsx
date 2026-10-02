import { notFound } from 'next/navigation';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/data/demo-seed';
import CategoryDashboardClient from './CategoryDashboardClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = DEMO_CATEGORIES.find((c) => c.id === slug);

  if (!category) {
    notFound();
  }

  const products = DEMO_PRODUCTS.filter((p) => p.category === slug);

  return (
    <CategoryDashboardClient
      category={category}
      allCategories={DEMO_CATEGORIES}
      products={products}
    />
  );
}
