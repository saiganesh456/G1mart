-- =============================================================================
-- G1 MART — PostgreSQL Database Schema Migration
-- Project: G1-Mart (South Asia / Mumbai)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery_partner')),
  wallet_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Delivery Zones Table (Nellore City & Extended 30 km zone)
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('city', 'rural_extended', 'out_of_coverage')),
  geographic_coverage TEXT NOT NULL,
  max_radius_km NUMERIC(5,2) NOT NULL,
  estimated_min_delivery_time INTEGER NOT NULL,
  estimated_max_delivery_time INTEGER NOT NULL,
  estimated_delivery_time_text TEXT NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 499.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  pincodes TEXT[] NOT NULL DEFAULT '{}',
  supported_areas TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, name)
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  sub_category TEXT,
  unit TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) NOT NULL CHECK (original_price >= 0),
  discount_percentage INTEGER NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_best_deal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Product Multiple Images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  house_flat TEXT NOT NULL,
  street_area TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL DEFAULT 'Nellore',
  state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  pincode TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Home' CHECK (type IN ('Home', 'Work', 'Other')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  is_saved_for_later BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, is_saved_for_later)
);

-- 9. Riders Table
CREATE TABLE IF NOT EXISTS public.riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.90 CHECK (rating >= 0 AND rating <= 5),
  current_location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  discount_amount NUMERIC(10,2),
  discount_percent INTEGER CHECK (discount_percent > 0 AND discount_percent <= 100),
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  max_discount NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Order Placed' CHECK (status IN ('Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled')),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  taxes NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  grand_total NUMERIC(10,2) NOT NULL,
  coupon_applied TEXT REFERENCES public.coupons(code) ON DELETE SET NULL,
  address JSONB NOT NULL,
  delivery_zone_id TEXT REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  assigned_rider_id UUID REFERENCES public.riders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Order Status History Table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Order Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled')),
  note TEXT,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Promotional Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tag TEXT NOT NULL,
  image TEXT NOT NULL,
  cta TEXT NOT NULL DEFAULT 'Order Now',
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time_text TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL CHECK (type IN ('order', 'offer', 'info')),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES FOR PRODUCTION QUERY OPTIMIZATION
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_popular ON public.products(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_products_best_deal ON public.products(is_best_deal) WHERE is_best_deal = true;
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON public.orders(assigned_rider_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- =============================================================================
-- USER PROFILE AUTO-CREATION TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
