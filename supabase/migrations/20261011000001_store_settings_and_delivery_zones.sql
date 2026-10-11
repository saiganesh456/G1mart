-- =============================================================================
-- Migration: Store Settings & Distance-Based Delivery Zones (Phase 1)
-- =============================================================================

-- 1. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_lat NUMERIC(10, 6) NOT NULL DEFAULT 14.4329,
  store_lng NUMERIC(10, 6) NOT NULL DEFAULT 79.9680,
  store_address TEXT NOT NULL DEFAULT 'Govt Hospital, Beside Padarupalli, Nellore, Andhra Pradesh - 524004',
  max_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
  prep_time_min INTEGER NOT NULL DEFAULT 10,
  cod_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default store settings row
INSERT INTO public.store_settings (
  id,
  store_lat,
  store_lng,
  store_address,
  max_radius_km,
  prep_time_min,
  cod_fee
)
VALUES (
  'default',
  14.4329,
  79.9680,
  'Govt Hospital, Beside Padarupalli, Nellore, Andhra Pradesh - 524004',
  30.00,
  10,
  50.00
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- 2. Update Delivery Zones Table with Phase 1 Distance Columns
ALTER TABLE public.delivery_zones
  ADD COLUMN IF NOT EXISTS min_km NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS max_km NUMERIC(5, 2) DEFAULT 30.00,
  ADD COLUMN IF NOT EXISTS min_order NUMERIC(10, 2) DEFAULT 500.00,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Update delivery_fee default to 0.00 (Delivery is free in all zones)
ALTER TABLE public.delivery_zones
  ALTER COLUMN delivery_fee SET DEFAULT 0.00;

-- Seed Phase 1 initial business zones
INSERT INTO public.delivery_zones (
  id,
  name,
  code,
  type,
  geographic_coverage,
  max_radius_km,
  min_km,
  max_km,
  min_order,
  active,
  delivery_fee,
  min_order_value,
  estimated_min_delivery_time,
  estimated_max_delivery_time,
  estimated_delivery_time_text,
  is_active
)
VALUES
  ('zone-0-5', '0–5 km (Local)', 'ZONE_0_5', 'city', 'Within 5 km radius of store', 5.00, 0.00, 5.00, 500.00, true, 0.00, 500.00, 15, 30, '15–30 mins', true),
  ('zone-5-10', '5–10 km (City)', 'ZONE_5_10', 'city', '5 to 10 km from store', 10.00, 5.00, 10.00, 1000.00, true, 0.00, 1000.00, 30, 45, '30–45 mins', true),
  ('zone-10-15', '10–15 km (Suburban)', 'ZONE_10_15', 'city', '10 to 15 km from store', 15.00, 10.00, 15.00, 1000.00, true, 0.00, 1000.00, 45, 60, '45–60 mins', true),
  ('zone-15-30', '15–30 km (Extended)', 'ZONE_15_30', 'rural_extended', '15 to 30 km from store', 30.00, 15.00, 30.00, 2000.00, true, 0.00, 2000.00, 60, 90, 'Approx. 1–1.5 hours', true)
ON CONFLICT (id) DO UPDATE SET
  min_km = EXCLUDED.min_km,
  max_km = EXCLUDED.max_km,
  min_order = EXCLUDED.min_order,
  active = EXCLUDED.active,
  delivery_fee = 0.00,
  updated_at = now();

-- 3. Update Addresses Table to Store Customer Location & Distance Attributes
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 6),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(10, 6),
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS eta_min INTEGER,
  ADD COLUMN IF NOT EXISTS zone_id TEXT,
  ADD COLUMN IF NOT EXISTS approximate BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMPTZ;

-- 4. Update Orders Table with Phase 1 Snapshots
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS zone_min_order NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS cod_fee NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS final_total NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'standard';

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone (customers and guests) can read store settings and delivery zones
DROP POLICY IF EXISTS "Public store settings read" ON public.store_settings;
CREATE POLICY "Public store settings read" ON public.store_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public delivery zones read" ON public.delivery_zones;
CREATE POLICY "Public delivery zones read" ON public.delivery_zones
  FOR SELECT TO anon, authenticated USING (true);

-- Admins can update store settings and delivery zones
DROP POLICY IF EXISTS "Admin manage store settings" ON public.store_settings;
CREATE POLICY "Admin manage store settings" ON public.store_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin manage delivery zones" ON public.delivery_zones;
CREATE POLICY "Admin manage delivery zones" ON public.delivery_zones
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
