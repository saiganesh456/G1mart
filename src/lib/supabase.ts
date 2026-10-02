import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Read public credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Checks if Supabase has been configured with actual project URL and Anon key
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

if (!isSupabaseConfigured()) {
  console.info(
    'ℹ️ [G1 Mart] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are pending configuration. ' +
    'The app will operate using local high-fidelity state & mock data until connected.'
  );
}

/**
 * Supabase client instance
 * Note: Only the public URL and anon key are exposed to the client.
 * Service-role keys must NEVER be placed here.
 */
export const supabase: any = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
