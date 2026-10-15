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
  bg_image?: string;
  image_url?: string;
  products?: string[];
  badge?: string;
  badge_bg?: string;
  badge_color?: string;
  cta_bg?: string;
  cta_color?: string;
  scrim_gradient?: string;
  sort_order?: number;
  active?: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<BannerItem[]>(defaultBanners as BannerItem[]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/banners')
      .then((res) => { if (!res.ok) return null; return res.json().catch(() => null); })
      .then((data) => {
        if (data?.banners?.length > 0) setBanners(data.banners);
      })
      .catch(() => {});
  }, []);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total > 0) setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total > 0) setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndXRef.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) nextSlide();
    else if (diff < -45) prevSlide();
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPaused(false);
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
      className="relative w-full select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner container: responsive height for mobile & desktop with zero cut-off */}
      <div
        className="relative w-full overflow-hidden bg-[var(--g1-surface)] rounded-[20px] sm:rounded-[24px] shadow-sm h-[180px] sm:h-[210px] md:h-[235px] lg:h-[250px]"
      >
        {banners.map((b, idx) => {
          const isActive = idx === current;
          const hasImage = !!(b.bg_image || b.image_url);

          return (
            <div
              key={b.id}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none', zIndex: isActive ? 10 : 0 }}
            >
              <Link
                href={b.link}
                onClick={(e) => handleBannerClick(e, b)}
                className="block w-full h-full relative group"
                aria-label={b.title}
              >
                {/* Background image — anchored to the right so products stay 100% in-frame */}
                {hasImage && (
                  <img
                    src={b.bg_image || b.image_url}
                    alt=""
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-right"
                  />
                )}

                {/* Text panel — adaptive scrim behind text for guaranteed contrast >= 4.5:1 */}
                <div
                  className="absolute left-0 top-0 bottom-0 flex flex-col justify-center px-4 py-3 sm:px-7 sm:py-6"
                  style={{
                    width: '52%',
                    background: hasImage
                      ? (b.scrim_gradient || 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 50%, rgba(255,255,255,0) 100%)')
                      : 'transparent',
                  }}
                >
                  {b.badge && (
                    <span
                      className="inline-block text-[9px] sm:text-[11px] font-black tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full mb-1 sm:mb-1.5 w-fit uppercase"
                      style={{
                        backgroundColor: b.badge_bg || 'var(--g1-yellow-bg)',
                        color: b.badge_color || '#7A4F00',
                      }}
                    >
                      {b.badge}
                    </span>
                  )}
                  <h3
                    className="font-black tracking-tight leading-[1.15] text-[17px] sm:text-[22px] md:text-[24px]"
                    style={{ color: 'var(--g1-text)', maxWidth: 220 }}
                  >
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p
                      className="text-[11px] sm:text-xs md:text-sm mt-1 sm:mt-1.5 line-clamp-2 leading-[1.3]"
                      style={{ color: 'var(--g1-text-secondary)', maxWidth: 210 }}
                    >
                      {b.subtitle}
                    </p>
                  )}
                  <div
                    className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold w-fit shadow-sm transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: b.cta_bg || 'var(--g1-primary)',
                      color: b.cta_color || '#fff',
                    }}
                  >
                    <span>{b.cta}</span>
                    <span aria-hidden="true" className="text-sm font-normal">→</span>
                  </div>
                </div>

                {/* Product images on right — no frame */}
                {b.products && b.products.length > 0 && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-3 sm:pr-6" style={{ width: '45%' }}>
                    {b.products.slice(0, 2).map((prodUrl, pIdx) => (
                      <img
                        key={pIdx}
                        src={prodUrl}
                        alt=""
                        className="absolute object-contain drop-shadow-lg"
                        style={{ height: '80%', right: `${pIdx * 30}%`, zIndex: 2 - pIdx }}
                      />
                    ))}
                  </div>
                )}
              </Link>
            </div>
          );
        })}

        {/* Dots — 6px inactive, 16px active pill */}
        {total > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
            {banners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => { setCurrent(dotIdx); setIsPaused(true); }}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className="transition-all rounded-full"
                style={{
                  width: dotIdx === current ? 16 : 6,
                  height: 6,
                  backgroundColor: dotIdx === current ? 'var(--g1-primary)' : 'var(--g1-border)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
