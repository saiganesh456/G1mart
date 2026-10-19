-- =============================================================================
-- G1 MART — Final Direct Permissions & Slip Tables Fix
-- Paste and Run in: Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

-- 1. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Explicit grants on orders & order items (Fixes Error 42501 for customer checkout)
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.order_items TO anon, authenticated, service_role;

-- 3. Open Row Level Security for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_orders" ON public.orders;
CREATE POLICY "allow_all_orders" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_order_items" ON public.order_items;
CREATE POLICY "allow_all_order_items" ON public.order_items FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Create Slip Orders table
CREATE TABLE IF NOT EXISTS public.slip_orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_note TEXT,
  address TEXT NOT NULL,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  pincode TEXT,
  distance_km NUMERIC(6, 2) DEFAULT 0.00,
  eta_min INTEGER DEFAULT 15,
  zone_id TEXT,
  zone_min_order NUMERIC(10, 2) DEFAULT 500.00,
  order_type TEXT NOT NULL DEFAULT 'delivery',
  status TEXT NOT NULL DEFAULT 'SLIP_RECEIVED',
  estimated_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  final_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cod_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  billed_by TEXT,
  packed_by TEXT,
  assigned_rider_id TEXT,
  assigned_rider_name TEXT,
  assigned_rider_phone TEXT,
  admin_notes TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create Slip Images table
CREATE TABLE IF NOT EXISTS public.slip_images (
  id TEXT PRIMARY KEY,
  slip_order_id TEXT NOT NULL REFERENCES public.slip_orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create Slip Items table
CREATE TABLE IF NOT EXISTS public.slip_items (
  id TEXT PRIMARY KEY,
  slip_order_id TEXT NOT NULL REFERENCES public.slip_orders(id) ON DELETE CASCADE,
  product_id TEXT,
  name TEXT NOT NULL,
  requested_qty NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
  packed_qty NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT 'unit',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  available BOOLEAN NOT NULL DEFAULT true,
  substitute_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Grant all permissions on Slip tables
GRANT ALL ON TABLE public.slip_orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.slip_images TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.slip_items TO anon, authenticated, service_role;

-- 8. Open Row Level Security on Slip tables
ALTER TABLE public.slip_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_slip_orders" ON public.slip_orders;
CREATE POLICY "allow_all_slip_orders" ON public.slip_orders FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.slip_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_slip_images" ON public.slip_images;
CREATE POLICY "allow_all_slip_images" ON public.slip_images FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.slip_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_slip_items" ON public.slip_items;
CREATE POLICY "allow_all_slip_items" ON public.slip_items FOR ALL TO public USING (true) WITH CHECK (true);

-- 9. Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
