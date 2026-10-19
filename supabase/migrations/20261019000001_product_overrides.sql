-- =============================================================================
-- G1 MART — Dedicated Product Overrides Table & RLS Policies
-- Paste and Run in: Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

-- 1. Create table for dynamic product overrides (price, MRP, stock, photos, etc.)
CREATE TABLE IF NOT EXISTS public.product_overrides (
  id TEXT PRIMARY KEY,
  name TEXT,
  brand TEXT,
  unit TEXT,
  category TEXT,
  sub_category TEXT,
  price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  stock_count INTEGER,
  in_stock BOOLEAN,
  image_url TEXT,
  image_status TEXT,
  variants JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Grant permissions to anon, authenticated, and service_role
GRANT ALL ON TABLE public.product_overrides TO anon, authenticated, service_role;

-- 3. Open Row Level Security so storefront and admin can read & save immediately
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_product_overrides" ON public.product_overrides;
CREATE POLICY "allow_all_product_overrides" ON public.product_overrides FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
