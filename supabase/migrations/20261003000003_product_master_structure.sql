-- =============================================================================
-- G1 MART — Product Master Structure & Nullable Fields Migration
-- Supports source_item_no, source_name, variant, active,
-- and allows unverified price, stock, brand, and category to remain NULL.
-- =============================================================================

-- 1. Add new reference and variant tracking columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS source_item_no INTEGER,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS variant TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Drop NOT NULL constraints on price, original_price, stock_count, brand, category_id, description
ALTER TABLE public.products ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN price SET DEFAULT NULL;

ALTER TABLE public.products ALTER COLUMN original_price DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN original_price SET DEFAULT NULL;

ALTER TABLE public.products ALTER COLUMN stock_count DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN stock_count SET DEFAULT NULL;

ALTER TABLE public.products ALTER COLUMN brand DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN brand SET DEFAULT NULL;

ALTER TABLE public.products ALTER COLUMN category_id DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN category_id SET DEFAULT NULL;

ALTER TABLE public.products ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN description SET DEFAULT NULL;

-- 3. Update check constraints to safely permit NULL values
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE public.products ADD CONSTRAINT products_price_check CHECK (price IS NULL OR price >= 0);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_original_price_check;
ALTER TABLE public.products ADD CONSTRAINT products_original_price_check CHECK (original_price IS NULL OR original_price >= 0);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_count_check;
ALTER TABLE public.products ADD CONSTRAINT products_stock_count_check CHECK (stock_count IS NULL OR stock_count >= 0);

-- 4. Create index on source_item_no for efficient lookups by PDF item number
CREATE INDEX IF NOT EXISTS idx_products_source_item_no ON public.products(source_item_no);
