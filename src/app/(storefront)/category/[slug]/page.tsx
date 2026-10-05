import { notFound } from 'next/navigation';
import { productService } from '@/services/productService';
import CategoryDashboardClient from './CategoryDashboardClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    productService.getCategories(),
    productService.getProductsByCategory(slug),
  ]);

  const category = categories.find((c) => c.id === slug);

  if (!category) {
    notFound();
  }

  return (
    <CategoryDashboardClient
      category={category}
      allCategories={categories}
      products={products}
    />
  );
}
