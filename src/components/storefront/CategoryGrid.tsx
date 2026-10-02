import Link from 'next/link';
import type { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

/**
 * Category grid — server component, uses Link for navigation.
 * No client JS needed.
 */
export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="px-3 sm:px-0">
      <h2 className="text-sm font-extrabold text-[#212121] mb-3 uppercase tracking-wider">
        Shop by Category
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#2E7D32]/30 active:scale-95 transition-all group"
          >
            <span className="text-2xl leading-none">{cat.icon}</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-stone-700 group-hover:text-[#2E7D32] text-center leading-tight line-clamp-2 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
