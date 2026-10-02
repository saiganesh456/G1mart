import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pzrigfczxwscpzxkykvf.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
