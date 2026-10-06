-- =============================================================================
-- G1 MART — Reset Products & Cluttered Data
-- Run this in your Supabase Dashboard -> SQL Editor to clean out all previous
-- clumsy products, cart items, and test orders.
-- =============================================================================

-- 1. Remove dependent child records first
TRUNCATE TABLE public.cart_items CASCADE;
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.product_images CASCADE;

-- 2. Clean out the products table
TRUNCATE TABLE public.products CASCADE;

-- Optional verification query (should return 0)
SELECT COUNT(*) AS remaining_products FROM public.products;
