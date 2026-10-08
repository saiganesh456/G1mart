-- =============================================================================
-- G1 MART — Product Image System Migration
-- Supports image_url, image_status ('MISSING', 'PENDING', 'VERIFIED'),
-- Supabase Storage bucket 'product-images', and zero hardcoded image URLs.
-- =============================================================================

-- 1. Ensure image_url and image_status exist on public.products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_status TEXT NOT NULL DEFAULT 'MISSING'
  CHECK (image_status IN ('MISSING', 'PENDING', 'VERIFIED'));

-- Make legacy 'image' column nullable so products can be created without local placeholders
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'image'
  ) THEN
    ALTER TABLE public.products ALTER COLUMN image DROP NOT NULL;
    ALTER TABLE public.products ALTER COLUMN image SET DEFAULT NULL;
  END IF;
END $$;

-- 2. Performance Index for filtering products by image status (Missing vs Verified)
CREATE INDEX IF NOT EXISTS idx_products_image_status
  ON public.products(image_status);

-- 3. Supabase Storage Bucket: product-images (Public read, 5MB limit, web-ready images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- 4. Storage RLS Policies for product-images
DO $$
BEGIN
  -- Public Read Access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for product images'
  ) THEN
    CREATE POLICY "Public read access for product images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;

  -- Admin Insert (Upload)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload product images'
  ) THEN
    CREATE POLICY "Admins can upload product images"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
  END IF;

  -- Admin Update (Overwrite / Upsert)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update product images'
  ) THEN
    CREATE POLICY "Admins can update product images"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'product-images' AND public.is_admin());
  END IF;

  -- Admin Delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete product images'
  ) THEN
    CREATE POLICY "Admins can delete product images"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'product-images' AND public.is_admin());
  END IF;
END $$;
