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
  products?: string[];
  badge?: string;
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

  const handleTouchStart = (e: React.TouchEvent) => { touchStartXRef.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndXRef.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) nextSlide();
    else if (diff < -45) prevSlide();
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
    <section aria-label="Promotional announcements" className="relative w-full overflow-hidden select-none" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="relative w-full aspect-[2.2/1] sm:aspect-[3.5/1] rounded-[16px] overflow-hidden bg-stone-100 shadow-2xs">
        {banners.map((b, idx) => {
          const isActive = idx === current;
          return (
            <div key={b.id} className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
              <Link href={b.link} onClick={(e) => handleBannerClick(e, b)} className="block w-full h-full cursor-pointer relative" aria-label={b.title}>
                <img src={b.bg_image || b.image_url} alt="" loading={idx === 0 ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1b5e20]/90 via-[#2e7d32]/80 to-transparent sm:via-[#2e7d32]/70 sm:to-transparent" />
                <div className="absolute inset-0 flex flex-row items-center p-4 sm:p-8">
                  <div className="flex-1 text-white pr-4 sm:pr-8 space-y-1.5 sm:space-y-3 z-10">
                    <h3 className="text-[13px] sm:text-2xl lg:text-3xl font-black leading-tight tracking-tight drop-shadow-sm">{b.title}</h3>
                    <p className="text-[9px] sm:text-sm lg:text-base font-medium opacity-95 line-clamp-2 drop-shadow-sm max-w-sm sm:max-w-xl">{b.subtitle}</p>
                    <div className="mt-2 sm:mt-4 inline-flex items-center justify-center bg-white text-[#2e7d32] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-transform">{b.cta}</div>
                  </div>
                  {b.products && b.products.length > 0 && (
                    <div className="w-1/3 sm:w-1/4 h-full relative flex items-center justify-end pr-2 sm:pr-4 z-10">
                      {b.products.map((prodUrl, pIdx) => (
                        <img key={pIdx} src={prodUrl} alt="" className="absolute h-4/5 sm:h-5/6 object-contain drop-shadow-xl" style={{ right: `${pIdx * 25}%`, zIndex: 10 - pIdx }} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
        {total > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
            {banners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrent(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all rounded-full pointer-events-auto ${dotIdx === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
