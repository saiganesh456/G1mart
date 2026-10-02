import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CookieItem {
  name: string;
  value: string;
  options?: Record<string, any>;
}

/**
 * Supabase server client — for use in Server Components, Route Handlers,
 * and Server Actions ONLY. Uses the service-role key for privileged operations
 * (e.g. order creation, payment verification).
 *
 * NEVER import this file from a 'use client' component.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY in browser bundles.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  ) as any;
}

/**
 * Privileged server client using the service-role key.
 * Use only in Route Handlers where RLS must be bypassed server-side
 * (e.g. verifying payment webhooks, creating order records).
 *
 * TODO (Phase 2): Wire this into /api/checkout and /api/payment/verify.
 */
export async function createAdminSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  ) as any;
}
