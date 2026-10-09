'use client';

import React, { useState } from 'react';

export type PackType = 'pouch' | 'bottle' | 'bar' | 'box' | 'packet' | 'jar';

interface ProductImageProps {
  imageUrl?: string | null;
  image_url?: string | null;
  src?: string | null;
  imageStatus?: string | null;
  image_status?: string | null;
  alt: string;
  brand?: string | null;
  name?: string | null;
  subCategory?: string | null;
  category?: string | null;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

function getPackType(name: string, subCategory?: string | null, category?: string | null): PackType {
  const text = `${name} ${subCategory || ''} ${category || ''}`.toLowerCase();
  if (
    text.includes('soap') ||
    text.includes('bath bar') ||
    text.includes('detergent bar') ||
    text.includes('dishwash bar') ||
    text.includes('cinthol') ||
    text.includes('lux') ||
    text.includes('santoor') ||
    text.includes('medimix') ||
    text.includes('pears') ||
    text.includes('dove') ||
    text.includes('lifebuoy')
  ) {
    return 'bar';
  }
  if (
    text.includes('bottle') ||
    text.includes('shampoo') ||
    text.includes('syrup') ||
    text.includes('cleaner') ||
    text.includes('drink') ||
    text.includes('juice') ||
    text.includes('sprite') ||
    text.includes('thums up') ||
    text.includes('frooti') ||
    text.includes('maaza') ||
    text.includes('harpic') ||
    text.includes('lizol') ||
    text.includes('colin') ||
    text.includes('phenyl') ||
    text.includes('honey') ||
    text.includes('sauce') ||
    text.includes('ketchup')
  ) {
    return 'bottle';
  }
  if (
    text.includes('jam') ||
    text.includes('pickle') ||
    text.includes('peanut butter') ||
    text.includes('jar') ||
    text.includes('ghee') ||
    text.includes('coffee') ||
    text.includes('nescafe') ||
    text.includes('bru')
  ) {
    return 'jar';
  }
  if (
    text.includes('atta') ||
    text.includes('rice') ||
    text.includes('dal') ||
    text.includes('flour') ||
    text.includes('pappu') ||
    text.includes('salt') ||
    text.includes('sugar') ||
    text.includes('pouch') ||
    text.includes('refill') ||
    text.includes('surf excel') ||
    text.includes('ariel') ||
    text.includes('tide')
  ) {
    return 'pouch';
  }
  if (
    text.includes('biscuit') ||
    text.includes('cookie') ||
    text.includes('rusk') ||
    text.includes('box') ||
    text.includes('agarbatti') ||
    text.includes('camphor') ||
    text.includes('dhoop') ||
    text.includes('tea') ||
    text.includes('flakes') ||
    text.includes('cereal') ||
    text.includes('toothpaste') ||
    text.includes('colgate') ||
    text.includes('bourbon') ||
    text.includes('good day') ||
    text.includes('unibic')
  ) {
    return 'box';
  }
  return 'packet';
}

function PackIcon({ type, className = 'w-9 h-9' }: { type: PackType; className?: string }) {
  switch (type) {
    case 'bar':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="8" y="14" width="32" height="20" rx="5" />
          <path d="M14 24h20" strokeDasharray="3 3" opacity="0.6" />
        </svg>
      );
    case 'bottle':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="20" y="6" width="8" height="6" rx="1.5" />
          <path d="M19 12h10l3 6v22a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V18l3-6Z" />
          <line x1="16" y1="26" x2="32" y2="26" opacity="0.5" />
        </svg>
      );
    case 'jar':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="14" y="6" width="20" height="6" rx="2" />
          <path d="M12 14h24l2 6v20a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V20l2-6Z" />
          <ellipse cx="24" cy="28" rx="8" ry="4" opacity="0.5" />
        </svg>
      );
    case 'pouch':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 6h20l4 34a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2L14 6Z" />
          <line x1="12" y1="12" x2="36" y2="12" />
          <circle cx="24" cy="26" r="4" opacity="0.6" />
        </svg>
      );
    case 'box':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="10" y="8" width="28" height="32" rx="3" />
          <line x1="10" y1="16" x2="38" y2="16" />
          <rect x="18" y="24" width="12" height="8" rx="1.5" opacity="0.6" />
        </svg>
      );
    case 'packet':
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M10 6h28l-3 36H13L10 6Z" />
          <path d="M10 6l4-2 4 2 4-2 4 2 4-2 4 2 4-2" />
          <path d="M10 42l4 2 4-2 4 2 4-2 4 2 4-2" />
          <circle cx="24" cy="24" r="5" opacity="0.5" />
        </svg>
      );
  }
}

export default function ProductImage({
  imageUrl,
  image_url,
  src,
  imageStatus,
  image_status,
  alt,
  brand,
  name,
  subCategory,
  category,
  className = '',
  containerClassName = '',
  priority = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Canonical image URL determination
  const candidateUrl = image_url || imageUrl || src || null;
  const status = (image_status || imageStatus || '').trim().toUpperCase();

  // Display image whenever a valid non-placeholder image URL is present
  const hasValidUrl =
    Boolean(candidateUrl) &&
    !candidateUrl?.includes('placeholder.svg') &&
    (candidateUrl?.startsWith('/') || candidateUrl?.startsWith('http') || candidateUrl?.startsWith('data:'));

  const shouldRenderImage =
    hasValidUrl &&
    status !== 'MISSING' &&
    status !== 'PLACEHOLDER' &&
    !hasError;

  const displayName = name || alt || 'Product';
  const displayBrand = brand && brand !== 'Other' ? brand : 'Local';
  const initialChar = (displayBrand.trim()[0] || 'G').toUpperCase();
  const packType = getPackType(displayName, subCategory, category);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-white overflow-hidden ${containerClassName}`}
    >
      {shouldRenderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidateUrl!}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setHasError(true)}
          className={`w-full h-full object-contain p-1.5 transition-transform duration-200 select-none ${className}`}
        />
      ) : (
        // Blinkit style: tinted square with pack-type icon and brand initial monogram, NO filler text
        <div className="w-full h-full flex flex-col items-center justify-between p-2.5 rounded-2xl bg-stone-50/90 border border-stone-200/60 select-none transition-all group-hover:bg-stone-100/70">
          {/* Top row: brand monogram */}
          <div className="w-full flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 truncate max-w-[70%]">
              {displayBrand}
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-100/80 text-[#2E7D32] text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs">
              {initialChar}
            </div>
          </div>

          {/* Center: clean pack-type icon */}
          <div className="my-auto py-1 text-stone-400 group-hover:text-stone-600 transition-colors flex items-center justify-center">
            <PackIcon type={packType} className="w-10 h-10 sm:w-11 sm:h-11 stroke-[1.8]" />
          </div>

          {/* Bottom row: pack type indicator */}
          <div className="w-full text-center">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
              {packType}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
