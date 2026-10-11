'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

interface InnerPageHeaderProps {
  title: string;
  onSearchClick?: () => void;
  showSearch?: boolean;
}

/**
 * Inner-page header — 56px, back arrow + title + optional search icon.
 * No logo, no delivery bar, no profile icon.
 * Used on /categories, /category/[slug], /account, /orders.
 */
export default function InnerPageHeader({ title, onSearchClick, showSearch }: InnerPageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 bg-[var(--g1-bg)]"
      style={{ height: 56, borderBottom: '1px solid var(--g1-border)' }}
      aria-label={`${title} page header`}
    >
      {/* Back button — 40px circle */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="w-10 h-10 flex items-center justify-center rounded-full shrink-0 g1-press transition-colors"
        style={{ backgroundColor: 'var(--g1-surface)' }}
      >
        <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={1.75} style={{ color: 'var(--g1-text)' }} />
      </button>

      {/* Title */}
      <h1
        className="flex-1 text-center font-bold"
        style={{ fontSize: 18, color: 'var(--g1-text)', fontWeight: 700 }}
      >
        {title}
      </h1>

      {/* Search icon (optional) */}
      {showSearch ? (
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search"
          className="w-10 h-10 flex items-center justify-center rounded-full shrink-0 g1-press transition-colors"
          style={{ backgroundColor: 'var(--g1-surface)' }}
        >
          <Search className="w-[22px] h-[22px]" strokeWidth={1.75} style={{ color: 'var(--g1-text)' }} />
        </button>
      ) : (
        <div className="w-10" /> /* spacer to keep title centred */
      )}
    </header>
  );
}
