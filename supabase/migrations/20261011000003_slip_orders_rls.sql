-- =============================================================================
-- Migration: Row Level Security for Slip Orders & Status History (Phase 7)
-- Rule: Customers see only their own orders and slips; staff roles see the rest.
-- =============================================================================

ALTER TABLE public.slip_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slip_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 1. SLIP ORDERS POLICIES
-- Customer view own slips; Rider view assigned slips; Admin/Staff view all
DROP POLICY IF EXISTS "Customers view own slip orders" ON public.slip_orders;
CREATE POLICY "Customers view own slip orders"
  ON public.slip_orders FOR SELECT
  USING (
    auth.uid()::text = customer_id
    OR customer_phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
    OR (public.is_rider() AND (assigned_rider_id = auth.uid()::text OR assigned_rider_id IN (SELECT id::text FROM public.riders WHERE user_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Customers and staff can insert slip orders" ON public.slip_orders;
CREATE POLICY "Customers and staff can insert slip orders"
  ON public.slip_orders FOR INSERT
  WITH CHECK (
    auth.uid()::text = customer_id
    OR customer_id IS NULL
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Staff and assigned rider can update slip orders" ON public.slip_orders;
CREATE POLICY "Staff and assigned rider can update slip orders"
  ON public.slip_orders FOR UPDATE
  USING (
    public.is_admin()
    OR (public.is_rider() AND (assigned_rider_id = auth.uid()::text OR assigned_rider_id IN (SELECT id::text FROM public.riders WHERE user_id = auth.uid())))
    OR (auth.uid()::text = customer_id AND status IN ('AWAITING_PAYMENT', 'PACKED', 'SLIP_RECEIVED'))
  );

-- 2. SLIP IMAGES POLICIES
DROP POLICY IF EXISTS "Users can view images of accessible slip orders" ON public.slip_images;
CREATE POLICY "Users can view images of accessible slip orders"
  ON public.slip_images FOR SELECT
  USING (
    slip_order_id IN (
      SELECT id FROM public.slip_orders
      WHERE auth.uid()::text = customer_id
         OR customer_phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid())
         OR public.is_admin()
         OR public.is_rider()
    )
  );

DROP POLICY IF EXISTS "Users can insert images for their slip orders" ON public.slip_images;
CREATE POLICY "Users can insert images for their slip orders"
  ON public.slip_images FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR slip_order_id IN (
      SELECT id FROM public.slip_orders
      WHERE auth.uid()::text = customer_id OR customer_id IS NULL
    )
  );

-- 3. SLIP ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view items of accessible slip orders" ON public.slip_items;
CREATE POLICY "Users can view items of accessible slip orders"
  ON public.slip_items FOR SELECT
  USING (
    slip_order_id IN (
      SELECT id FROM public.slip_orders
      WHERE auth.uid()::text = customer_id
         OR customer_phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid())
         OR public.is_admin()
         OR public.is_rider()
    )
  );

DROP POLICY IF EXISTS "Staff can manage billed slip items" ON public.slip_items;
CREATE POLICY "Staff can manage billed slip items"
  ON public.slip_items FOR ALL
  USING (public.is_admin());

-- 4. ORDER STATUS HISTORY POLICIES
DROP POLICY IF EXISTS "Users can view history of their accessible orders and slips" ON public.order_status_history;
CREATE POLICY "Users can view history of their accessible orders and slips"
  ON public.order_status_history FOR SELECT
  USING (
    public.is_admin()
    OR public.is_rider()
    OR order_id IN (SELECT id FROM public.orders WHERE auth.uid() = user_id)
    OR order_id IN (SELECT id FROM public.slip_orders WHERE auth.uid()::text = customer_id OR customer_phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Staff and system can insert status history" ON public.order_status_history;
CREATE POLICY "Staff and system can insert status history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR public.is_rider()
    OR true
  );
