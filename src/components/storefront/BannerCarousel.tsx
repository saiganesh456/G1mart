'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import defaultBanners from '@/data/banners.json';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image_url: string;
  badge?: string;
  sort_order?: number;
  active?: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<BannerItem[]>(defaultBanners as BannerItem[]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Fetch active banners from API on mount
  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.json())
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total > 0) {
      setCurrent((prev) => (prev + 1) % total);
    }
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total > 0) {
      setCurrent((prev) => (prev - 1 + total) % total);
    }
  }, [total]);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      nextSlide(); // Swiped left -> next
    } else if (diff < -45) {
      prevSlide(); // Swiped right -> prev
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleBannerClick = (e: React.MouseEvent, banner: BannerItem) => {
    if (banner.link === '#scan-slip') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('g1mart:open-slip-scan'));
    }
  };

  if (total === 0) return null;

  return (
    <section
      aria-label="Promotional announcements"
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 2.2:1 Aspect Ratio rounded 16px container */}
      <div className="relative w-full aspect-[2.2/1] rounded-[16px] overflow-hidden bg-emerald-950 shadow-2xs">
        {banners.map((b, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Link
                href={b.link}
                onClick={(e) => handleBannerClick(e, b)}
                className="block w-full h-full cursor-pointer relative"
                aria-label={b.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt={b.title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          );
        })}

        {/* Carousel Dots Indicators */}
        {total > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
            {banners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrent(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all rounded-full pointer-events-auto ${
                  dotIdx === current
                    ? 'w-5 h-1.5 bg-white shadow-xs'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
