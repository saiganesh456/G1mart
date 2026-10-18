-- =============================================================================
-- G1 MART — Full Schema, Slips, and Permissions Repair
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

-- 1. Grant base schema privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. ORDERS & ORDER ITEMS TABLE PERMISSIONS & RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Customers and admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all access for orders" ON public.orders;
CREATE POLICY "Enable all access for orders"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view items of permitted orders" ON public.order_items;
CREATE POLICY "Enable all access for order_items"
  ON public.order_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. CREATE SLIP ORDERS SYSTEM TABLES (IF NOT ALREADY EXISTING)
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

CREATE TABLE IF NOT EXISTS public.slip_images (
  id TEXT PRIMARY KEY,
  slip_order_id TEXT NOT NULL REFERENCES public.slip_orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant privileges on slip tables
GRANT ALL ON TABLE public.slip_orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.slip_images TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.slip_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.order_status_history TO anon, authenticated, service_role;

-- RLS policies for slip tables
ALTER TABLE public.slip_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for slip_orders" ON public.slip_orders;
CREATE POLICY "Enable all access for slip_orders"
  ON public.slip_orders FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.slip_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for slip_images" ON public.slip_images;
CREATE POLICY "Enable all access for slip_images"
  ON public.slip_images FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.slip_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for slip_items" ON public.slip_items;
CREATE POLICY "Enable all access for slip_items"
  ON public.slip_items FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for order_status_history" ON public.order_status_history;
CREATE POLICY "Enable all access for order_status_history"
  ON public.order_status_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_slip_orders_status ON public.slip_orders(status);
CREATE INDEX IF NOT EXISTS idx_slip_orders_phone ON public.slip_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_slip_items_order ON public.slip_items(slip_order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON public.order_status_history(order_id);

-- 4. PUSH NOTIFICATION SUBSCRIPTIONS TABLE (Persists across all serverless lambdas)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  keys JSONB NOT NULL,
  user_id TEXT,
  user_email TEXT,
  user_phone TEXT,
  role TEXT DEFAULT 'customer',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON TABLE public.push_subscriptions TO anon, authenticated, service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Enable all access for push_subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. CREATE 'slips' STORAGE BUCKET (Public access for photo orders)
INSERT INTO storage.buckets (id, name, public)
VALUES ('slips', 'slips', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public access to slips storage" ON storage.objects;
CREATE POLICY "Public access to slips storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'slips')
  WITH CHECK (bucket_id = 'slips');
