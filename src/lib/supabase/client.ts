import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase browser client — uses NEXT_PUBLIC_ vars only.
 * Safe to call from 'use client' components.
 * Never put SUPABASE_SERVICE_ROLE_KEY here.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://pzrigfczxwscpzxkykvf.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey) as any;
}

/** Singleton for convenience in client components */
export const supabase = createClient();

/** Returns true only when real credentials are configured */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 10 &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-publishable-key')
  );
}
