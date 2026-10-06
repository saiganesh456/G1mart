'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CategoryTileProps {
  href: string;
  name: string;
  count: number;
  image: string;
  fallbackIcon: string;
  bgColor: string;
}

export default function CategoryTile({
  href,
  name,
  count,
  image,
  fallbackIcon,
  bgColor,
}: CategoryTileProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={href}
      className="p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-[#2E7D32] hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        {/* Pastel Image Container */}
        <div
          className={`w-14 h-14 shrink-0 rounded-xl ${bgColor} border border-stone-200/60 p-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform`}
        >
          {!imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain rounded-lg"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-2xl leading-none select-none">{fallbackIcon}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#2E7D32] leading-snug line-clamp-2 transition-colors">
            {name}
          </h3>
          <p className="text-[11px] text-stone-500 font-semibold mt-1">
            {count} {count === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#2E7D32] font-bold">
        <span>Explore</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
