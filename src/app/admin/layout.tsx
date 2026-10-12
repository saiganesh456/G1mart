import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, ExternalLink } from 'lucide-react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export const metadata = {
  title: 'Admin Console | G1 Mart',
  description: 'G1 Mart Store Manager & Inventory Dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-stone-900 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-200/80 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/g1_mart_banner_transparent.png"
                alt="G1 Mart"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-black text-stone-900 text-sm sm:text-base tracking-tight hidden sm:inline">
                Admin Console
              </span>
            </Link>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store Manager</span>
            </span>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Store</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area Protected by AdminAuthGuard */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        <AdminAuthGuard>
          {children}
        </AdminAuthGuard>
      </div>
    </div>
  );
}
