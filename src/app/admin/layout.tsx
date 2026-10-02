import Link from 'next/link';
import { ShieldCheck, Lock } from 'lucide-react';

/**
 * Admin layout — guards all /admin/* routes.
 *
 * TODO (Phase 3 — Admin Auth):
 * 1. Call createServerSupabaseClient() from @/lib/supabase/server
 * 2. Get the session: const { data: { session } } = await supabase.auth.getSession()
 * 3. Verify session.user has admin role in the `user_roles` table
 * 4. If not admin → redirect('/login') or show 403
 *
 * For now, this layout shows a "login required" placeholder to prevent any
 * accidental public access.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO (Phase 3): Replace this block with a real server-side auth check.
  const isAuthenticated = false; // STUB — always requires auth

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-stone-700" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#212121]">Admin Access Required</h1>
            <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
              This area is restricted to authorised store staff only.
              Admin login with secure authentication will be enabled in Phase 3.
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>TODO Phase 3: Wire Supabase role-based auth here</span>
          </div>
          <Link
            href="/"
            className="block w-full py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  // When auth is wired: render admin shell here
  return <div className="min-h-screen bg-stone-50">{children}</div>;
}
