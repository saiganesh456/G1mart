import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase browser client — uses NEXT_PUBLIC_ vars only.
 * Safe to call from 'use client' components.
 * Never put SUPABASE_SERVICE_ROLE_KEY here.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  ) as any;
}

/** Singleton for convenience in client components */
export const supabase = createClient();

/** Returns true only when real credentials are configured */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return (
    Boolean(url) &&
    Boolean(key) &&
    url.startsWith('https://') &&
    key.length > 20 &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-publishable-key')
  );
}
