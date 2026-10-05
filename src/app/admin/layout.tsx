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
      <header className="sticky top-0 z-50 bg-[#1A2E1C] text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="G1 Mart"
                className="h-8 sm:h-9 w-auto object-contain brightness-0 invert"
              />
              <span className="font-extrabold text-white text-base tracking-tight hidden sm:inline">
                Admin Console
              </span>
            </Link>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Store Manager</span>
            </span>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Store className="w-3.5 h-3.5 text-emerald-300" />
              <span>View Store</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
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
