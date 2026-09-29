import React from 'react';
import logoSquareTransparent from '../../assets/images/g1_mart_logo_square_transparent.png';
import logoBannerTransparent from '../../assets/images/g1_mart_banner_transparent.png';
import logoBannerDarkTransparent from '../../assets/images/g1_mart_banner_transparent_dark.png';

export const G1_OFFICIAL_LOGO_IMG = logoBannerDarkTransparent;
export const G1_OFFICIAL_LOGO_SQUARE = logoSquareTransparent;
export const G1_OFFICIAL_LOGO_LIGHT = logoBannerTransparent;

export interface G1LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'banner' | 'square' | 'mark' | 'full';
  showTagline?: boolean;
  taglineText?: string;
  theme?: 'dark' | 'light' | 'green';
  onDarkBackground?: boolean;
}

export const G1Logo: React.FC<G1LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showTagline = false,
  taglineText = 'Fresh groceries delivered to your doorstep',
  theme = 'light',
  onDarkBackground = false,
}) => {
  // Sizing preserving exact aspect ratio without distortion
  const sizeMap = {
    xs: { h: 'h-6 sm:h-7', w: 'max-w-[85px]' },
    sm: { h: 'h-8 sm:h-9', w: 'max-w-[125px]' },
    md: { h: 'h-10 sm:h-12', w: 'max-w-[165px]' },
    lg: { h: 'h-16 sm:h-20', w: 'max-w-[240px]' },
    xl: { h: 'h-24 sm:h-28', w: 'max-w-[320px]' },
  };

  const currentSize = sizeMap[size];
  const isSquare = variant === 'square' || variant === 'mark';

  // Choose the transparent PNG variant based on target background
  const isDarkSurface = onDarkBackground || theme === 'dark' || theme === 'green';
  const logoSrc = isSquare
    ? logoSquareTransparent
    : isDarkSurface
    ? logoBannerTransparent
    : logoBannerDarkTransparent;

  const imageElement = (
    <img
      src={logoSrc}
      alt="G1 Mart Official Logo"
      loading="eager"
      referrerPolicy="no-referrer"
      style={{ objectFit: 'contain' }}
      className="w-full h-full object-contain block select-none bg-transparent"
    />
  );

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background is 100% transparent PNG with no rectangular block */}
      <div className={`relative ${currentSize.h} ${currentSize.w} flex items-center justify-center bg-transparent`}>
        {imageElement}
      </div>

      {showTagline && (
        <p
          className={`text-center font-bold tracking-tight mt-2.5 text-xs sm:text-sm ${
            theme === 'dark'
              ? 'text-emerald-100'
              : theme === 'green'
              ? 'text-white'
              : 'text-[#2E7D32]'
          }`}
        >
          {taglineText}
        </p>
      )}
    </div>
  );
};

