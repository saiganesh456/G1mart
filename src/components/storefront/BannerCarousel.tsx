'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BANNERS = [
  {
    id: 'hero',
    image: '/assets/images/g1_grocery_delivery_hero_1790614094753.jpg',
    alt: 'G1 Mart — Local Supermarket',
    title: 'G1 Mart Supermarket',
    subtitle: 'Daily essentials, groceries & household supplies from your neighbourhood store.',
    cta: { label: 'Explore Products', href: '/search' },
    bg: 'from-[#2E7D32]/85 to-transparent',
  },
  {
    id: 'household',
    image: '/assets/images/g1_special_offers_banner_1790614114336.jpg',
    alt: 'Household & Cleaning Care',
    title: 'Household & Cleaning',
    subtitle: 'Laundry care, dishwash bars, floor disinfectants & utilities.',
    cta: { label: 'Shop Household', href: '/category/household-cleaning' },
    bg: 'from-[#1b5e20]/85 to-transparent',
  },
  {
    id: 'pooja',
    image: '/assets/images/g1_dairy_bakery_showcase_1790614143664.jpg',
    alt: 'Daily Departments',
    title: 'Pooja Needs & Personal Care',
    subtitle: 'Authentic agarbatti, pure sandalwood soaps & daily grooming.',
    cta: { label: 'All Departments', href: '/categories' },
    bg: 'from-[#FF9800]/80 to-transparent',
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % BANNERS.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);
  const next = () => setCurrent((c) => (c + 1) % BANNERS.length);

  const banner = BANNERS[current];

  return (
    <section className="relative w-full h-24 sm:h-28 md:h-32 rounded-2xl overflow-hidden bg-stone-200 mx-0 sm:mx-0 shadow-2xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={banner.id}
        src={banner.image}
        alt={banner.alt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        draggable={false}
      />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg}`} />

      {/* Text content (Compact <= 110px layout) */}
      <div className="absolute inset-0 flex items-center justify-between p-3 sm:p-5">
        <div className="max-w-[70%]">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded backdrop-blur-xs mb-1">
            G1 Mart Fresh
          </span>
          <h2 className="text-white font-black text-sm sm:text-base leading-tight drop-shadow-md truncate">
            {banner.title}
          </h2>
          <p className="text-white/90 text-[11px] sm:text-xs truncate drop-shadow-sm mt-0.5">
            {banner.subtitle}
          </p>
        </div>
        <Link
          href={banner.cta.href}
          className="shrink-0 px-3 py-1.5 bg-white text-[#2E7D32] rounded-xl font-bold text-xs shadow-md hover:bg-stone-50 active:scale-95 transition-all"
        >
          {banner.cta.label}
        </Link>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous banner"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-stone-700" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-stone-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 right-3 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Go to banner ${i + 1}`}
            className={`rounded-full transition-all ${
              i === current
                ? 'w-4 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
