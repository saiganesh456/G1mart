-- =============================================================================
-- Migration: Slip Orders System & Order Status History (Phase 6)
-- =============================================================================

-- 1. Slip Orders Table (orders.type = 'slip')
CREATE TABLE IF NOT EXISTS public.slip_orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_note TEXT,
  
  -- Customer location snapshots copied at slip upload time
  address TEXT NOT NULL,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  pincode TEXT,
  distance_km NUMERIC(6, 2) DEFAULT 0.00,
  eta_min INTEGER DEFAULT 15,
  zone_id TEXT,
  zone_min_order NUMERIC(10, 2) DEFAULT 500.00,
  order_type TEXT NOT NULL DEFAULT 'delivery', -- 'delivery' | 'pickup'

  -- Phase 6 Status Lifecycle
  -- SLIP_RECEIVED -> BILLING -> AWAITING_CUSTOMER_CONFIRMATION -> CONFIRMED ->
  -- PACKING -> PACKED -> AWAITING_PAYMENT -> PAID / COD_PENDING ->
  -- RIDER_ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED (or CANCELLED)
  status TEXT NOT NULL DEFAULT 'SLIP_RECEIVED',
  
  estimated_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  final_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cod_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  
  -- Staff & Rider Assignments
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

-- 2. Slip Images Table (Private storage references, 1–5 compressed photos)
CREATE TABLE IF NOT EXISTS public.slip_images (
  id TEXT PRIMARY KEY,
  slip_order_id TEXT NOT NULL REFERENCES public.slip_orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Slip Items Table (Catalog & manual billed items)
CREATE TABLE IF NOT EXISTS public.slip_items (
  id TEXT PRIMARY KEY,
  slip_order_id TEXT NOT NULL REFERENCES public.slip_orders(id) ON DELETE CASCADE,
  product_id TEXT, -- Nullable for custom/manual items
  name TEXT NOT NULL,
  requested_qty NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
  packed_qty NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  unit TEXT NOT NULL DEFAULT 'unit',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  available BOOLEAN NOT NULL DEFAULT true,
  substitute_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Order Status History Table (Tracks all timestamped status changes & users)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_slip_orders_status ON public.slip_orders(status);
CREATE INDEX IF NOT EXISTS idx_slip_orders_phone ON public.slip_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_slip_items_order ON public.slip_items(slip_order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON public.order_status_history(order_id);
