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
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://pzrigfczxwscpzxkykvf.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: {
        name: 'sb-pzrigfczxwscpzxkykvf-auth-token',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
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
    process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
    {
      cookieOptions: {
        name: 'sb-pzrigfczxwscpzxkykvf-auth-token',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            );
          } catch {
            // ignore
          }
        },
      },
    }
  ) as any;
}
