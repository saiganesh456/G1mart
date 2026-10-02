import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env?.VITE_SUPABASE_URL ||
  "https://pzrigfczxwscpzxkykvf.supabase.co";

const supabaseKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
