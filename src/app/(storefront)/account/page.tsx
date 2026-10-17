'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserRound,
  MapPin,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Navigation,
  ChevronRight,
  Download,
} from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';
import { useAuth } from '@/context/AuthContext';
import { isAppInstalled, executeInstallFlow } from '@/lib/installState';
import InnerPageHeader from '@/components/layout/InnerPageHeader';

type RowItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const ACCOUNT_ROWS: RowItem[] = [
  { href: '/orders', icon: ShoppingBag, label: 'My Orders' },
  { href: '/account/addresses', icon: MapPin, label: 'Saved Addresses' },
  { href: '/account/wishlist', icon: Heart, label: 'Saved Wishlist' },
  { href: '/help', icon: HelpCircle, label: 'Help & Support / FAQs' },
];

function AccountRow({ href, icon: Icon, label }: RowItem) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 transition-colors"
      style={{ height: 56, color: 'var(--g1-text)' }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-[22px] h-[22px]" strokeWidth={1.75} style={{ color: 'var(--g1-primary)' }} />
        <span className="font-medium" style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
      </div>
      <ChevronRight className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} style={{ color: 'var(--g1-text-secondary)' }} />
    </Link>
  );
}

export default function AccountPage() {
  const { user, isLoggedIn, signOut } = useAuth();
  const [appInstalled, setAppInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setAppInstalled(isAppInstalled(user?.id));
  }, [user]);

  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      await executeInstallFlow(user?.id, '/downloads/g1mart.apk');
      setAppInstalled(true);
    } catch (err) {
      console.error('Failed to install app:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  return (
    <>
      {/* Inner page header for mobile */}
      <InnerPageHeader title="Account" />

      {/*
        Constrain to 100% width max. The key fix for F2:
        - No fixed widths larger than viewport
        - Padding-based layout, not margin-based
        - max-w-2xl + mx-auto for centering on wide screens
      */}
      <div
        className="w-full max-w-2xl mx-auto pb-28"
        style={{ paddingLeft: 0, paddingRight: 0, backgroundColor: 'var(--g1-bg)' }}
      >
        {/* ── Profile Card ── */}
        <div className="mx-4 mt-4 rounded-[var(--g1-r-card)] border p-4 bg-[var(--g1-bg)]"
          style={{ borderColor: 'var(--g1-border)', boxShadow: 'var(--g1-e1)' }}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-12 h-12 rounded-2xl object-cover shrink-0"
                style={{ border: '1px solid var(--g1-border)' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-base font-bold"
                style={{ backgroundColor: 'var(--g1-primary-tint)', color: 'var(--g1-primary)' }}
              >
                {avatarInitial || <UserRound className="w-6 h-6" strokeWidth={1.75} />}
              </div>
            )}

            {/* Name/email */}
            <div className="min-w-0 flex-1">
              <h1 className="font-bold truncate" style={{ fontSize: 16, color: 'var(--g1-text)' }}>
                {isLoggedIn ? (user?.name || 'Your Account') : 'Sign in or sign up'}
              </h1>
              <p className="truncate mt-0.5" style={{ fontSize: 13, color: 'var(--g1-text-secondary)' }}>
                {isLoggedIn
                  ? (user?.email || user?.phone || 'Logged in')
                  : 'Access orders, wishlist & saved addresses'}
              </p>
            </div>
          </div>

          {/* Sign in / Sign out — full-width below text, stacked */}
          <div className="mt-4">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-colors g1-press"
                style={{ backgroundColor: 'var(--g1-surface)', color: 'var(--g1-text)', border: '1px solid var(--g1-border)' }}
              >
                <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm text-white transition-colors g1-press"
                style={{ backgroundColor: 'var(--g1-primary)' }}
              >
                <LogIn className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Account menu rows ── */}
        <div
          className="mx-4 mt-4 rounded-[var(--g1-r-card)] bg-[var(--g1-bg)] overflow-hidden"
          style={{ border: '1px solid var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
        >
          {ACCOUNT_ROWS.map((row, idx) => (
            <div key={row.href} style={{ borderTop: idx > 0 ? `1px solid var(--g1-border)` : 'none' }}>
              <AccountRow {...row} />
            </div>
          ))}
        </div>

        {/* ── Admin shortcut ── */}
        {isLoggedIn && user?.role === 'admin' && (
          <div
            className="mx-4 mt-4 rounded-[var(--g1-r-card)] p-4 flex items-center justify-between"
            style={{ background: '#0f172a', border: '1px solid rgba(96,165,250,.3)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(96,165,250,.15)' }}>
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-300">Administrator Access</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email || 'Store Admin'}</div>
              </div>
            </div>
            <Link href="/admin"
              className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <span>Open Admin</span>
            </Link>
          </div>
        )}

        {/* ── Rider shortcut ── */}
        {isLoggedIn && (user?.role === 'delivery_partner' || user?.role === 'rider') && (
          <div
            className="mx-4 mt-4 rounded-[var(--g1-r-card)] p-4 flex items-center justify-between"
            style={{ background: '#1a2e1c', border: '1px solid rgba(74,222,128,.3)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(74,222,128,.15)' }}>
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-300">Rider Partner Access</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email || 'Delivery Partner'}</div>
              </div>
            </div>
            <Link href="/rider"
              className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
              style={{ background: '#16a34a', color: '#fff' }}>
              <Navigation className="w-3.5 h-3.5" />
              <span>Console</span>
            </Link>
          </div>
        )}

        {/* ── App install — only show if not already downloaded/installed ── */}
        {!appInstalled && (
          <div
            className="mx-4 mt-4 rounded-[var(--g1-r-card)] bg-[var(--g1-bg)] overflow-hidden"
            style={{ border: '1px solid var(--g1-border)', boxShadow: 'var(--g1-e1)' }}
          >
            <div className="flex items-center justify-between px-4" style={{ height: 56 }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden border shrink-0 bg-white"
                  style={{ borderColor: 'var(--g1-border)' }}>
                  <Image src="/icons/icon-192x192.png" alt="Jeevan Mart App" width={36} height={36} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="font-medium truncate block" style={{ fontSize: 14, color: 'var(--g1-text)' }}>
                    Install Jeevan Mart App
                  </span>
                  <span className="text-[11px] block" style={{ color: 'var(--g1-text-secondary)' }}>
                    Official Android App · 12 MB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallApp}
                disabled={isInstalling}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 g1-press"
                style={{ backgroundColor: 'var(--g1-primary-tint)', color: 'var(--g1-primary)', border: '1px solid var(--g1-primary)' }}
              >
                {isInstalling ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-[18px] h-[18px]" strokeWidth={1.75} />
                )}
                <span>{isInstalling ? 'Downloading…' : 'Download'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-6 text-center" style={{ fontSize: 12, color: 'var(--g1-text-secondary)' }}>
          G1 Mart · Delivering in {STORE_CONFIG.address.city || 'Nellore'}
        </div>
      </div>
    </>
  );
}
