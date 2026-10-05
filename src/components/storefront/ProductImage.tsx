'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface ProductImageProps {
  imageUrl?: string | null;
  image_url?: string | null;
  src?: string | null;
  imageStatus?: string | null;
  image_status?: string | null;
  alt: string;
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
  className = '',
  containerClassName = '',
  priority = false,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Canonical image URL determination
  const candidateUrl = image_url || imageUrl || src || null;
  const status = (image_status || imageStatus || '').trim();

  // Strict check: Display image only when status is explicitly VERIFIED (or approved)
  // and a valid non-placeholder image URL is present
  const isVerified =
    (status === 'VERIFIED' || status === 'approved') &&
    Boolean(candidateUrl) &&
    !candidateUrl?.includes('placeholder.svg');

  const shouldRenderImage = isVerified && candidateUrl && !hasError;

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
        // Standardized, high-end "PHOTO COMING SOON" badge (No dark overlays, pure clean packaging frame)
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#FAFAFA] border border-dashed border-stone-200 rounded-xl select-none">
          <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-1.5 shadow-2xs">
            <Camera className="w-4 h-4 stroke-[1.8]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-600 leading-tight">
            Photo Coming Soon
          </span>
          <span className="text-[8px] font-medium text-stone-400 mt-0.5 tracking-tight">
            Indian Pack Verification
          </span>
        </div>
      )}
    </div>
  );
}
