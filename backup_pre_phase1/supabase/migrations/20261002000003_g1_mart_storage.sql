-- =============================================================================
-- G1 MART — Supabase Storage Architecture Migration
-- Buckets: product-images, category-images, banners, avatars
-- =============================================================================

-- Create storage buckets if not existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('category-images', 'category-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- STORAGE RLS POLICIES
-- -----------------------------------------------------------------------------

-- 1. Public can read files from public buckets
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Public read access for category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

CREATE POLICY "Public read access for promotional banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Public read access for user avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. Admin write access for catalog assets
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can upload category images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "Admins can update category images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "Admins can delete category images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "Admins can upload banners"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "Admins can update banners"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "Admins can delete banners"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banners' AND public.is_admin());

-- 3. Authenticated users can upload their own avatars
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
