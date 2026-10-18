import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://pzrigfczxwscpzxkykvf.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

/**
 * Server-side Supabase client singleton for API routes & backend stores.
 * Automatically uses SUPABASE_SERVICE_ROLE_KEY when provided in Vercel/environment,
 * or safely falls back to the publishable anon key.
 */
export const serverSupabase: any = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
}) as any;

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey.length > 10 &&
    !supabaseUrl.includes('placeholder')
  );
}
