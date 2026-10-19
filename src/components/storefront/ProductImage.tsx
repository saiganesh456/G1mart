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
    text.includes('ketchup') ||
    // Oils and ghee
    text.includes('sunflower oil') ||
    text.includes('groundnut oil') ||
    text.includes('refined oil') ||
    text.includes('cooking oil') ||
    text.includes('mustard oil') ||
    text.includes('sesame oil') ||
    text.includes('gingelly oil') ||
    text.includes('coconut oil') ||
    text.includes('soya oil') ||
    text.includes('palm oil') ||
    text.includes('rice bran oil') ||
    text.includes('deepam oil') ||
    text.includes('palmolein') ||
    (text.includes(' oil') && (text.includes('refin') || text.includes('filter') || text.includes('edible') || text.includes('pooja') || text.includes('deepam'))) ||
    text.includes('ghee') ||
    text.includes('dalda') ||
    text.includes('vanaspati')
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
    (candidateUrl?.startsWith('/') ||
      candidateUrl?.startsWith('http') ||
      candidateUrl?.startsWith('data:') ||
      candidateUrl?.startsWith('blob:'));

  const shouldRenderImage =
    hasValidUrl &&
    status !== 'MISSING' &&
    status !== 'PLACEHOLDER' &&
    !hasError;

  const displayName = name || alt || 'Product';
  const displayBrand = brand && brand !== 'Other' && !/local\s*\/?unbranded/i.test(brand || '') && !/^unbranded$/i.test(brand || '') ? brand : null;
  const packType = getPackType(displayName, subCategory, category);

  // Background tint by category/pack type for a more product-like appearance
  const bgStyle: React.CSSProperties = (() => {
    if (packType === 'bottle') return { backgroundColor: '#f0f9f0' }; // light green for oils/drinks
    if (packType === 'jar') return { backgroundColor: '#fefce8' }; // warm yellow for ghee/jams
    if (packType === 'box') return { backgroundColor: '#f0f4ff' }; // blue tint for boxed items
    if (packType === 'bar') return { backgroundColor: '#fff5f0' }; // warm for soaps
    if (packType === 'pouch') return { backgroundColor: '#faf5ff' }; // light purple for pouches
    return { backgroundColor: '#f8f8f8' }; // neutral fallback
  })();

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${containerClassName}`}
    >
      {shouldRenderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidateUrl!}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setHasError(true)}
          className={`w-full h-full object-contain p-0.5 sm:p-1 transition-transform duration-200 select-none ${className}`}
        />
      ) : (
        // Tasteful placeholder: colored tint + pack-type icon + brand name (if any)
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-1 select-none transition-all group-hover:brightness-95 p-2"
          style={bgStyle}
        >
          {/* Pack-type icon centered */}
          <div className="flex items-center justify-center text-stone-400 group-hover:text-stone-500 transition-colors">
            <PackIcon type={packType} className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.6]" />
          </div>

          {/* Brand name only if branded — small, understated */}
          {displayBrand && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight line-clamp-1 px-1"
              style={{ color: '#6b7280' }}
            >
              {displayBrand}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
