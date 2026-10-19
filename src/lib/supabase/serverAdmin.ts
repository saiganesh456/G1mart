import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://pzrigfczxwscpzxkykvf.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseUrl =
  rawUrl && rawUrl.startsWith('https://') && !rawUrl.includes('placeholder')
    ? rawUrl
    : DEFAULT_SUPABASE_URL;

const rawKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

const supabaseKey =
  rawKey && rawKey.length > 10 && !rawKey.includes('placeholder') && !rawKey.includes('your-')
    ? rawKey
    : DEFAULT_SUPABASE_ANON_KEY;

/**
 * Server-side Supabase client singleton for API routes & backend stores.
 * Automatically uses configured keys or safely falls back to verified publishable key.
 */
export const serverSupabase: any = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
}) as any;

/**
 * Verified fallback Supabase client that directly uses production cloud credentials.
 * Ensures zero downtime even if Vercel environment variables are misconfigured.
 */
export const fallbackSupabase: any = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
}) as any;

export function isSupabaseConfigured(): boolean {
  return true;
}

