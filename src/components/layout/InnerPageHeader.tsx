'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface InnerPageHeaderProps {
  title: string;
  subtitle?: string;
  onSearchClick?: () => void;
  showSearch?: boolean;
}

/**
 * Inner-page header — 56px, back arrow + title + optional subtitle + optional search icon + Cart button.
 * Used on /categories, /category/[slug], /account, /orders.
 */
export default function InnerPageHeader({ title, subtitle, onSearchClick, showSearch }: InnerPageHeaderProps) {
  const router = useRouter();
  const { cartItemCount } = useCart();

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-3 bg-[var(--g1-bg)]"
      style={{ height: 56, borderBottom: '1px solid var(--g1-border)' }}
      aria-label={`${title} page header`}
    >
      {/* Back button — 40px circle */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="w-10 h-10 flex items-center justify-center rounded-full shrink-0 g1-press transition-colors cursor-pointer"
        style={{ backgroundColor: 'var(--g1-surface)' }}
      >
        <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={1.75} style={{ color: 'var(--g1-text)' }} />
      </button>

      {/* Title & Subtitle */}
      <div className="flex-1 text-center px-2 min-w-0">
        <h1
          className="font-bold truncate leading-tight"
          style={{ fontSize: subtitle ? 15 : 17, color: 'var(--g1-text)', fontWeight: 700 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-[var(--g1-text-secondary)] truncate leading-tight mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side: Search + Cart icon */}
      <div className="flex items-center gap-1 shrink-0">
        {showSearch && (
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search"
            className="w-10 h-10 flex items-center justify-center rounded-full shrink-0 g1-press transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--g1-surface)' }}
          >
            <Search className="w-[20px] h-[20px]" strokeWidth={1.75} style={{ color: 'var(--g1-text)' }} />
          </button>
        )}

        <Link
          href="/cart"
          aria-label={`View cart with ${cartItemCount} items`}
          className="relative w-10 h-10 flex items-center justify-center rounded-full shrink-0 g1-press transition-colors cursor-pointer"
          style={{
            backgroundColor: cartItemCount > 0 ? 'var(--g1-primary)' : 'var(--g1-surface)',
            color: cartItemCount > 0 ? '#FFFFFF' : 'var(--g1-text)',
          }}
        >
          <ShoppingCart className="w-[19px] h-[19px]" strokeWidth={1.8} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center justify-center shadow-xs">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
