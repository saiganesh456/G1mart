import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Admin Dashboard Page
 * Protected by src/app/admin/layout.tsx
 * Only rendered once admin user is authenticated via Supabase session in Phase 3.
 */
export default function AdminPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-stone-900 text-white p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-base font-bold">G1 Mart Admin Console</h1>
            <p className="text-xs text-stone-400">Inventory &amp; Order Management</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-stone-500 text-xs">
        Admin management console UI will be connected to Supabase in Phase 3.
      </div>
    </div>
  );
}
