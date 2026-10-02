import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3;
}

/**
 * Responsive product grid — server component wrapper, ProductCard is client.
 */
export default function ProductGrid({ products, columns = 2 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-stone-400">
        <p className="text-sm font-medium">No products found.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-2.5 sm:gap-3 ${
        columns === 3
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
