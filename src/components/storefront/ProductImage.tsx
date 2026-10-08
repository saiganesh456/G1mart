'use client';

import React, { useState } from 'react';

interface ProductImageProps {
  imageUrl?: string | null;
  image_url?: string | null;
  src?: string | null;
  imageStatus?: string | null;
  image_status?: string | null;
  alt: string;
  brand?: string | null;
  name?: string | null;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
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
  const displayBrand = brand && brand !== 'Other' ? brand : 'G1 Mart';
  const initialChar = (displayName.trim()[0] || 'G').toUpperCase();

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
        // Clean neutral typographic placeholder showing product and brand name
        <div className="w-full h-full flex flex-col items-center justify-between p-2 sm:p-2.5 text-center bg-stone-50/80 border border-stone-200/70 rounded-xl select-none group-hover:border-stone-300 transition-colors">
          <div className="w-full flex items-center justify-between gap-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 truncate text-left">
              {displayBrand}
            </span>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-stone-200/70 text-stone-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
              {initialChar}
            </span>
          </div>

          <div className="my-auto py-1 px-0.5">
            <p className="text-[11px] font-extrabold text-stone-800 line-clamp-2 leading-tight">
              {displayName}
            </p>
          </div>

          <div className="w-full pt-1 border-t border-stone-200/60 flex items-center justify-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-stone-500 tracking-tight">
              Genuine Store Item
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
