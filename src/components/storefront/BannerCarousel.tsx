'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BANNERS = [
  {
    id: 'hero',
    image: '/assets/images/g1_grocery_delivery_hero_1790614094753.jpg',
    alt: 'G1 Mart — Fresh groceries delivered',
    title: 'Fresh Groceries Delivered',
    subtitle: 'Order today. Delivered to your door.',
    cta: { label: 'Shop Now', href: '/' },
    bg: 'from-[#2E7D32]/80 to-transparent',
  },
  {
    id: 'offers',
    image: '/assets/images/g1_special_offers_banner_1790614114336.jpg',
    alt: 'G1 Mart — Special offers',
    title: 'Great Value Everyday',
    subtitle: 'Competitive prices on your daily essentials.',
    cta: { label: 'See Products', href: '/category/rice-dal-atta' },
    bg: 'from-[#1b5e20]/80 to-transparent',
  },
  {
    id: 'dairy',
    image: '/assets/images/g1_dairy_bakery_showcase_1790614143664.jpg',
    alt: 'G1 Mart — Dairy and bakery',
    title: 'Dairy & Bakery',
    subtitle: 'Fresh milk, curd, paneer, bread & eggs every day.',
    cta: { label: 'Shop Dairy', href: '/category/dairy-bakery' },
    bg: 'from-[#FF9800]/70 to-transparent',
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
    <section className="relative w-full aspect-[16/7] sm:aspect-[16/6] rounded-2xl overflow-hidden bg-stone-200 mx-0 sm:mx-0">
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

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
        <h2 className="text-white font-black text-base sm:text-xl leading-tight drop-shadow-md">
          {banner.title}
        </h2>
        <p className="text-white/90 text-xs sm:text-sm mt-1 drop-shadow-sm">
          {banner.subtitle}
        </p>
        <Link
          href={banner.cta.href}
          className="mt-3 self-start px-4 py-2 bg-white text-[#2E7D32] rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-stone-50 active:scale-95 transition-all"
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
