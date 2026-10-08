-- =============================================================================
-- G1 MART — Row Level Security (RLS) Policies
-- Protect customer privacy, restrict admin operations, isolate rider orders
-- =============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security helper: check if requesting user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'role', '') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security helper: check if requesting user is rider
CREATE OR REPLACE FUNCTION public.is_rider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'delivery_partner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 1. PROFILES RLS
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. DELIVERY ZONES RLS (Public read, admin write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view active delivery zones"
  ON public.delivery_zones FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can modify delivery zones"
  ON public.delivery_zones FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. CATEGORIES & SUBCATEGORIES RLS (Public read, admin write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can modify categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can view subcategories"
  ON public.subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify subcategories"
  ON public.subcategories FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. PRODUCTS & IMAGES RLS (Public read, admin write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. ADDRESSES RLS (Customer private)
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can manage their own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. CART ITEMS RLS (Customer private)
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can manage their own cart items"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. RIDERS RLS (Admin manage, rider view self)
-- -----------------------------------------------------------------------------
CREATE POLICY "Riders can view their own record"
  ON public.riders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage riders"
  ON public.riders FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. COUPONS RLS (Public read active, admin write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 9. ORDERS RLS (Customer own, Rider assigned, Admin all)
-- -----------------------------------------------------------------------------
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR assigned_rider_id IN (SELECT id FROM public.riders WHERE user_id = auth.uid())
  );

CREATE POLICY "Customers and admins can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IS NULL
    OR public.is_admin()
  );

CREATE POLICY "Customers can update their own pending orders"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR assigned_rider_id IN (SELECT id FROM public.riders WHERE user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 10. ORDER ITEMS RLS
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view items of permitted orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR public.is_admin()
        OR o.assigned_rider_id IN (SELECT id FROM public.riders WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users and admins can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

-- -----------------------------------------------------------------------------
-- 11. ORDER STATUS HISTORY RLS
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view order status history of permitted orders"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
      AND (
        o.user_id = auth.uid()
        OR public.is_admin()
        OR o.assigned_rider_id IN (SELECT id FROM public.riders WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Authorized personnel can update order status history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
      AND o.assigned_rider_id IN (SELECT id FROM public.riders WHERE user_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 12. BANNERS RLS (Public read, admin write)
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view active banners"
  ON public.banners FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage banners"
  ON public.banners FOR ALL
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 13. NOTIFICATIONS RLS (User private)
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view and manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());
