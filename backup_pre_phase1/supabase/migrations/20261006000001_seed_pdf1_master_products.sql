-- =============================================================================
-- G1 MART — PDF #1 Final Master Products Seed Migration
-- Contains all 96 verified canonical products from PDF #1 (AltaScanner_10_04_2026(1)(1).pdf)
-- selling_price strictly NULL, category_id strictly NULL
-- Verified images point to Supabase Storage; unverified are NULL / NEEDS_REVIEW
-- =============================================================================

-- Ensure check constraint supports 'VERIFIED' and 'NEEDS_REVIEW'
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_image_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_image_status_check
  CHECK (image_status IN ('VERIFIED', 'NEEDS_REVIEW', 'MISSING', 'PENDING'));

-- Ensure nullable columns for clean schema adherence
ALTER TABLE public.products ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN original_price DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN category_id DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN brand DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN image DROP NOT NULL;

-- Upsert all 96 products
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-001', 'Mysore Sandal Pure Sandalwood Soap', 'Mysore Sandal', NULL, '75g', NULL, 42.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-001/primary.jpg', 'VERIFIED', 1, 'MYSORE SANDAL 75G X 200PC - Rs.42/-', 'Original Sandal',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-001/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-002', 'Mysore Sandal Pure Sandalwood Soap', 'Mysore Sandal', NULL, '125g', NULL, 63.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-002/primary.jpg', 'VERIFIED', 2, 'MYSORE SANDAL 125GX120PC Rs.63/- / MYSORE SANDAL 125GX120PC Rs.63/-', 'Original Sandal',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-002/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-003', 'Mysore Sandal Pure Sandalwood Soap', 'Mysore Sandal', NULL, '150g', NULL, 75.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-003/primary.jpg', 'VERIFIED', 3, 'MYSORE SANDAL 150G X 100PC - Rs.75/-', 'Original Sandal',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-003/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-004', 'Wagh Bakri Premium Leaf Tea', 'Wagh Bakri', NULL, '100g', NULL, 50.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-004/primary.jpg', 'VERIFIED', 4, 'WB LEAF 100G X 180Pc Rs.50/- / WB LEAF 100G X 180Pc Rs.50/-', 'Premium Leaf Tea',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-004/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-005', 'Wagh Bakri Premium Leaf Tea', 'Wagh Bakri', NULL, '250g', NULL, 160.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-005/primary.jpg', 'VERIFIED', 5, 'WB LEAF 250G X 72Pc Rs.160/-', 'Premium Leaf Tea',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-005/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-006', 'Wagh Bakri Premium Leaf Tea', 'Wagh Bakri', NULL, '500g', NULL, 320.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-006/primary.jpg', 'VERIFIED', 6, 'WB LEAF 500G X 36PC - Rs.320/-', 'Premium Leaf Tea',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-006/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-007', 'Swastiks Roasted Vermicelli / Semiya', 'Swastiks', NULL, '400g', NULL, 44.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-007/primary.jpg', 'VERIFIED', 7, 'SWASTIKS VERMICELLI 400G X 45 PC - Rs.44/-', 'Roasted Vermicelli',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-007/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-008', 'Mysore Sandal Baby Soap', 'Mysore Sandal', NULL, '75g', NULL, 45.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-008/primary.jpg', 'VERIFIED', 8, 'MYSORE SANDAL BABY SOAP 75G X 72 PC - Rs.45/-', 'Baby Care',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-008/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-009', 'Exo Touch & Shine Anti-Bacterial Dishwash Bar (₹5 Pack)', 'Exo', NULL, '60g', NULL, 5.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-009/primary.jpg', 'VERIFIED', 9, 'Exo Bar Rs.5/- 216Pc', 'Dishwash Bar',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-009/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-010', 'Exo Touch & Shine Anti-Bacterial Dishwash Bar', 'Exo', NULL, '125g', NULL, 10.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-010/primary.jpg', 'VERIFIED', 10, 'EXO BAR 125G x 144Pc Rs.10/-', 'Dishwash Bar',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-010/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-011', 'Exo Touch & Shine Anti-Bacterial Dishwash Bar', 'Exo', NULL, '300g', NULL, 30.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-011/primary.jpg', 'VERIFIED', 11, 'EXO BAR 300G X 70 PC - Rs.30/-', 'Dishwash Bar with Scrubber',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-011/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-012', 'Exo Touch & Shine Anti-Bacterial Dishwash Round Tub', 'Exo', NULL, '250g', NULL, 30.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-012/primary.jpg', 'VERIFIED', 12, 'EXO ROUND 250G X 72PC - 30/-', 'Dishwash Round Tub',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-012/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-013', 'Exo Touch & Shine Anti-Bacterial Dishwash Round Tub', 'Exo', NULL, '500g', NULL, 60.0,
  NULL, 'NEEDS_REVIEW', 13, 'EXO ROUND 500G X 36 Rs.60/-', 'Dishwash Round Tub',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-014', 'Ujala Supreme Fabric Whitener Liquid (₹10 Pack)', 'Ujala', NULL, '30ml', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 14, 'UJALA SUPREME 30ML X 300PC Rs.10/-', 'Fabric Whitener',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-015', 'Ujala Supreme Fabric Whitener Liquid', 'Ujala', NULL, '75ml', NULL, 40.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-015/primary.jpg', 'VERIFIED', 15, 'UJALA SUPREME 75ML X 250 PC - Rs.40/-', 'Fabric Whitener',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-015/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-016', 'Ujala Supreme Fabric Whitener Liquid', 'Ujala', NULL, '250ml', NULL, 90.0,
  NULL, 'NEEDS_REVIEW', 16, 'UJALA SUPREME 250ML X 72PC - Rs.90/-', 'Fabric Whitener',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-017', 'Crisp & Shine Fabric Stiffener & Conditioner Pouch', 'Crisp & Shine', NULL, '100g', NULL, 35.0,
  NULL, 'NEEDS_REVIEW', 17, 'CRISP & SHINE 100G X 144PC - Rs.35/-', 'Fabric Conditioner Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-018', 'Crisp & Shine Fabric Stiffener & Conditioner Pouch', 'Crisp & Shine', NULL, '200g', NULL, 72.0,
  NULL, 'NEEDS_REVIEW', 18, 'CRISP & SHINE 200G X 90 PC - Rs.72/-', 'Fabric Conditioner Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-019', 'Crisp & Shine Fabric Stiffener & Conditioner Bottle', 'Crisp & Shine', NULL, '500g', NULL, 160.0,
  NULL, 'NEEDS_REVIEW', 19, 'CRISP & SHINE (B) 500G X 36 PC - Rs.160/-', 'Fabric Conditioner Bottle',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-020', 'Crisp & Shine Fabric Stiffener & Conditioner Refill Pouch', 'Crisp & Shine', NULL, '500g', NULL, 160.0,
  NULL, 'NEEDS_REVIEW', 20, 'CRISP & SHINE (P) 500G X 36 PC - Rs.160/-', 'Fabric Conditioner Refill Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-021', 'Crisp & Shine Fabric Stiffener Sachet (₹5 Pack)', 'Crisp & Shine', NULL, '15g', NULL, 5.0,
  NULL, 'NEEDS_REVIEW', 21, 'CRISP & SHINE 15G 60 PIECES Rs.5/-', 'Fabric Conditioner Sachet',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-022', 'Wagh Bakri Premium Leaf Tea (₹10 Pack)', 'Wagh Bakri', NULL, '32g', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 22, 'WB LEAF 32G X 720Pc Rs.10/-', 'Leaf Tea Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-023', 'Medimix Ayurvedic 18 Herbs Classic Bath Soap', 'Medimix', NULL, '75g', NULL, 35.0,
  NULL, 'NEEDS_REVIEW', 23, 'MEDIMIX 75G X 240PC - Rs.35/- / MEDIMIX 75G X 240PC - Rs.35/- (Free Scheme)', '18 Herbs Classic',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-024', 'Medimix Ayurvedic Sandal & Eladi Oil Bath Soap', 'Medimix', NULL, '125g', NULL, 60.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-024/primary.jpg', 'VERIFIED', 24, 'MEDIMIX SANDAL 125G X 144PC - Rs.60/-', 'Sandal with Eladi Oil',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-024/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-025', 'Medimix Ayurvedic Natural Glycerine & Lakshadi Oil Soap', 'Medimix', NULL, '125g', NULL, 55.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-025/primary.jpg', 'VERIFIED', 25, 'MEDIMIX TRANS 125G X 180PC - Rs.55/-', 'Transparent Natural Glycerine',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-025/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-026', 'Medimix Ayurvedic 18 Herbs Soap (Buy 3 Get 1 Free / Pack of 3)', 'Medimix', NULL, '125g x 3 (₹156 MRP)', NULL, 156.0,
  NULL, 'NEEDS_REVIEW', 26, 'MEDIMIX 125G X 48PC - Rs.156/-', '18 Herbs Classic Multipack (125g x 3 / 4)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-027', 'Medimix Ayurvedic 18 Herbs Classic Bath Soap', 'Medimix', NULL, '125g', NULL, 52.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-027/primary.jpg', 'VERIFIED', 27, 'MEDIMIX 125G X 144PC - Rs.52/- / MEDIMIX 125G X 144PC - Rs.52/- (Free Scheme)', '18 Herbs Classic Single Bar',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-027/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-028', 'Mysore Sandal Gold Classic Soap', 'Mysore Sandal', NULL, '125g', NULL, 90.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-028/primary.jpg', 'VERIFIED', 28, 'MYSORE SANDAL GOLD 125G X 100PC - Rs.90/-', 'Gold',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-028/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-029', 'Mysore Sandal Pure Sandalwood Soap (Pack of 3)', 'Mysore Sandal', NULL, '150g x 3', NULL, 245.0,
  NULL, 'NEEDS_REVIEW', 29, 'MYSORE SANDAL 150G*3 X 30Pc - Rs.245/- / MYSORE SANDAL 150G*3 X 30Pc - Rs.245/-', 'Original Sandal (3 x 150g Multipack)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-030', 'Margo Original Neem Soap', 'Margo', NULL, '100g', NULL, 40.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-030/primary.jpg', 'VERIFIED', 30, 'MARGO 100G X 168PC - Rs.40/- / MARGO 100G X 168PC - Rs.40/-', 'Original Neem',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-030/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-031', 'Kleenol Disinfectant Floor Cleaner Liquid', 'Kleenol', NULL, '1 L', NULL, 130.0,
  NULL, 'NEEDS_REVIEW', 31, 'KLEENOL LIQUID 1 Ltr X 130/-', 'Liquid Cleaner',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-032', 'Zoom Detergent Bar', 'Zoom', NULL, '200g', NULL, 21.0,
  NULL, 'NEEDS_REVIEW', 32, 'ZOOM DET BAR 200G X 60PC - Rs.21/-', 'Detergent Bar',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-033', 'Zoom Mega White Detergent Bar', 'Zoom', NULL, '275g', NULL, 26.0,
  NULL, 'NEEDS_REVIEW', 33, 'ZOOM MEGA WHITE 275G X 40PC - Rs.26/-', 'Mega White',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-034', 'Ultra Wash Liquid Detergent', 'Ultra Wash', NULL, '1 L', NULL, 99.0,
  NULL, 'NEEDS_REVIEW', 34, 'ULTRA WASH 1LTR X 12PC - Rs.99/- / ULTRA WASH 1LTR X 12PC - Rs.99/- (Free Scheme)', 'Liquid Detergent',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-035', 'Wagh Bakri Navchetan Elaichi Tea Jar', 'Wagh Bakri', NULL, '100g', NULL, 50.0,
  NULL, 'NEEDS_REVIEW', 35, 'NC ELACHI 100G X Rs.50/- Jar', 'Navchetan Elaichi Chai Jar',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-036', 'GKL Seeded Dates (Buy 1 Get 1 Free Pack)', 'GKL', NULL, '500g x 2', NULL, 238.0,
  NULL, 'NEEDS_REVIEW', 36, 'GKL SEEDED DATES 500G X 20SETS (1+1) - Rs.238/- / GKL SEEDED DATES 500G X 20SETS (1+1) - Rs.238/-', 'Seeded Dates (1+1 Set)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-037', 'GKL Seedless Dates (Buy 1 Get 1 Free Pack)', 'GKL', NULL, '250g x 2', NULL, 160.0,
  NULL, 'NEEDS_REVIEW', 37, 'GKL SEEDLESS DATES 250G (1+1) X 40SETS - Rs.160/-', 'Seedless Dates (1+1 Set)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-038', 'GKL Premium Black Dates', 'GKL', NULL, '400g', NULL, 272.0,
  NULL, 'NEEDS_REVIEW', 38, 'GKL PRIM BLK DATES 400G X 12PC - Rs.272/- / GKL PRIM BLK DATES 400G X 12PC - Rs.272/-', 'Premium Black Dates',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-039', 'Swastiks Roasted Vermicelli / Semiya', 'Swastiks', NULL, '800g', NULL, 85.0,
  NULL, 'NEEDS_REVIEW', 39, 'Swastiks Vermicelli 800g Rs.85/- 23Pc', 'Roasted Vermicelli',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-040', 'Swastiks Vermicelli / Semiya (₹10 Pack)', 'Swastiks', NULL, '90g', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 40, 'Swastiks Vermicelli 90G x 180Pc- Rs.10/-', 'Vermicelli',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-041', 'Mysore Sandal Dhoop Cup Sambrani', 'Mysore Sandal', NULL, '12 Cups', NULL, 75.0,
  NULL, 'NEEDS_REVIEW', 41, 'MYSORE SANDAL CUP SAMB 12 X 48 PC - Rs.75/-', 'Cup Sambrani',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-042', 'Bleaching Powder Disinfectant', 'RR Enterprises / Generic', NULL, '100g', NULL, 20.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-042/primary.jpg', 'VERIFIED', 42, 'BLEACHING POWDER 100G X 250 PC - Rs.20/-', 'Bleaching Powder',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-042/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-043', 'Bleaching Powder Disinfectant', 'RR Enterprises / Generic', NULL, '250g', NULL, 50.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-043/primary.jpg', 'VERIFIED', 43, 'BLEACHING POWDER 250G X 100 PC - Rs.50/-', 'Bleaching Powder',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-043/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-044', 'Exo Safai Anti-Bacterial Stainless Steel Scrubber', 'Exo', NULL, '1 piece (Sheet pack)', NULL, 20.0,
  NULL, 'NEEDS_REVIEW', 44, 'EXO STEEL 12PC X 30 SHEETS (360PC) - Rs.20/-', 'Steel Scrubber',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-045', 'Exo Safai Anti-Bacterial Scrub Pad (1+1 Free)', 'Exo', NULL, '2 units', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 45, 'EXO SAFAI 1+1 100PC X Rs.10/-', 'Sponge / Scrubber Pad (1+1)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-046', 'Margo Original Neem Soap (4 + 1 Offer Pack)', 'Margo', NULL, '100g x 5', NULL, 190.0,
  NULL, 'NEEDS_REVIEW', 46, 'MARGO 100G 4+1 36PC x Rs.190/-', 'Original Neem (4+1 Multipack)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-047', 'Young & Fresh After Wash Fabric Conditioner (Bliss)', 'Young & Fresh', NULL, '210ml', NULL, 58.0,
  NULL, 'NEEDS_REVIEW', 47, 'YOUNG & FRESH 210ML (Bliss) X 40Pc - Rs.58/-', 'Bliss Fragrance',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-048', 'Young & Fresh After Wash Fabric Conditioner (Aura)', 'Young & Fresh', NULL, '210ml', NULL, 58.0,
  NULL, 'NEEDS_REVIEW', 48, 'YOUNG & FRESH 210ML (AURA) X 40Pc - Rs.58/-', 'Aura Fragrance',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-049', 'Young & Fresh Fabric Conditioner Sachet (₹4 Pack)', 'Young & Fresh', NULL, '19ml', NULL, 4.0,
  NULL, 'NEEDS_REVIEW', 49, 'YOUNG & FRESH 19ML (P) X 720PC - Rs.4/-', 'Conditioner Sachet',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-050', 'Exo Touch & Shine Concentrated Dishwash Liquid', 'Exo', NULL, '115ml', NULL, 15.0,
  NULL, 'NEEDS_REVIEW', 50, 'EXO YELLOW LIQ 115ML X 36PC - Rs.15/-', 'Ginger Power / Lemon Dishwash Liquid',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-051', 'Exo Touch & Shine Concentrated Dishwash Liquid Bottle', 'Exo', NULL, '250ml', NULL, 60.0,
  NULL, 'NEEDS_REVIEW', 51, 'EXO YELLOW 250ML X 48PC - Rs.60/-', 'Dishwash Liquid Bottle',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-052', 'Maya Fragrance Incense Sticks (₹5 Pack)', 'Maya', NULL, '1 pack', NULL, 5.0,
  NULL, 'NEEDS_REVIEW', 52, 'Maya Rs. 5/-', 'Flora Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-053', 'Maya Rose Incense Sticks (₹10 Pack)', 'Maya', NULL, '1 pack', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 53, 'Maya Agarbatti Rose Rs.10 X 240PC', 'Rose Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-054', 'Maya Jasmine Incense Sticks (₹10 Pack)', 'Maya', NULL, '1 pack', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 54, 'MAYA JASMINE AGARBATI Rs.10X240', 'Jasmine Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-055', 'Maya Rose Incense Sticks Zipper Pouch', 'Maya', NULL, '1 pouch', NULL, 50.0,
  NULL, 'NEEDS_REVIEW', 55, 'MAYA ROSE POUCH 180PC - Rs.50/-', 'Rose Zipper Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-056', 'Maya Rose Incense Sticks Box', 'Maya', NULL, '1 box', NULL, 50.0,
  NULL, 'NEEDS_REVIEW', 56, 'Maya Agarbatti Rose Rs.50 X 60P', 'Rose Agarbatti Box',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-057', 'Maya Pineapple Fragrance Incense Sticks', 'Maya', NULL, '1 pack', NULL, 55.0,
  NULL, 'NEEDS_REVIEW', 57, 'MAYA PINEAPPLE Rs.55/- X 72PC', 'Pineapple Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-058', 'Maya Agni Dhoop Cup Sambrani', 'Maya', NULL, '1 box', NULL, 72.0,
  NULL, 'NEEDS_REVIEW', 58, 'MAYA AGNI SAMBRANI 80PC - Rs.72/-', 'Agni Sambrani',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-059', 'Morelight Liquid Detergent (3L + 2L Free Scheme Pack)', 'Morelight', NULL, '5 L (3L + 2L)', NULL, 489.0,
  NULL, 'NEEDS_REVIEW', 59, 'MORE LIGHT 3+2 LTR X 3 PC - Rs.489/-', 'Liquid Detergent (3L + 2L Free)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-060', 'Morelight Washing Powder / Detergent', 'Morelight', NULL, '4 kg', NULL, 540.0,
  NULL, 'NEEDS_REVIEW', 60, 'MORE LIGHT 4KG X 6 PC - Rs.540/- / MORE LIGHT 4KG X 6 PC - Rs.540/- (Free Scheme)', 'Washing Powder',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-061', 'Exo Safai Antibacterial Dishwash & Utensil Scouring Powder', 'Exo', NULL, '500g', NULL, 15.0,
  NULL, 'NEEDS_REVIEW', 61, 'EXO SCOURING POW 500G X 50Pc Rs.15/-', 'Scouring Powder',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-062', 'Henko Matic Top Load Liquid Detergent Pouch (₹10 Pack)', 'Henko', NULL, '50ml', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 62, 'Henko LIQUID TL 50ML x 120Pc Rs.10 (P)', 'Top Load Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-063', 'Henko Matic Front Load Liquid Detergent Bottle (₹10 Pack)', 'Henko', NULL, '50ml', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 63, 'Henko LIQUID FL 50ML x 120Pc Rs.10 (B)', 'Front Load Bottle',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-064', 'Henko Matic Liquid Detergent Front Load Bottle', 'Henko', NULL, '1 L', NULL, 175.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-064/primary.jpg', 'VERIFIED', 64, 'Henko LIQUID 1L X 12PC - Rs.175/-', 'Front Load Liquid Bottle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-064/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-065', 'Henko Matic Top Load Liquid Detergent Bottle', 'Henko', NULL, '1 L', NULL, 149.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-065/primary.jpg', 'VERIFIED', 65, 'Henko Liquid 1 Ltr TL Rs.149', 'Top Load Liquid Bottle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-065/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-066', 'Wagh Bakri Spiced Elaichi Tea (₹10 Pack)', 'Wagh Bakri', NULL, '1 pack', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 66, 'WB ELACHI TEA Rs.10/- 480Pc', 'Elaichi Chai Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-067', 'GKL Seeded Dates Regular Pack', 'GKL', NULL, '250g', NULL, 67.0,
  NULL, 'NEEDS_REVIEW', 67, 'GKL SEEDED 250G X 80PC - Rs.67/-', 'Seeded Dates',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-068', 'GKL Seeded Dates (Buy 1 Get 1 Free Pack)', 'GKL', NULL, '250g x 2', NULL, 130.0,
  NULL, 'NEEDS_REVIEW', 68, 'GKL SEEDED DATES 250G (1+1) 50 SETS - Rs.130/-', 'Seeded Dates (1+1 Set)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-069', 'GKL Premium Black Dates', 'GKL', NULL, '200g', NULL, 118.0,
  NULL, 'NEEDS_REVIEW', 69, 'GKL BLACK DATES 200G X 100PC - Rs.118/-', 'Black Dates',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-070', 'Ultra Wash Liquid Detergent (3L + 2L Scheme Can)', 'Ultra Wash', NULL, '5 L (3L + 2L)', NULL, 549.0,
  NULL, 'NEEDS_REVIEW', 70, 'ULTRA WASH 3+2LTR X 4 PC - Rs.549/-', 'Liquid Detergent (3L + 2L Free)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-071', 'Ultra Floor Cleaner Lime Fragrance (Buy 1 Get 1 Free)', 'Ultra', NULL, '500ml x 2', NULL, 150.0,
  NULL, 'NEEDS_REVIEW', 71, 'ULTRA F C LIME 500ML 1+1 - Rs.150/-', 'Floor Cleaner Lime (1+1 Offer Pack)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-072', 'Ultra Power Bathroom Cleaner (Buy 1 Get 1 Free)', 'Ultra', NULL, '500ml x 2', NULL, 150.0,
  NULL, 'NEEDS_REVIEW', 72, 'ULTRA POWER B C 500ML 1+1 Rs.150/-', 'Bathroom Cleaner (1+1 Offer Pack)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-073', 'Mysore Sandal Talcum Powder', 'Mysore Sandal', NULL, '50g', NULL, 26.0,
  NULL, 'NEEDS_REVIEW', 73, 'MYSORE SANDAL TALC 50G X 100PC - Rs.26/-', 'Sandalwood Talc',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-074', 'Mysore Sandal Talcum Powder', 'Mysore Sandal', NULL, '100g', NULL, 44.0,
  NULL, 'NEEDS_REVIEW', 74, 'MYSORE SANDAL TALC 100G X 36PC - Rs.44/-', 'Sandalwood Talc',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-075', 'Mysore Sandal Talcum Powder', 'Mysore Sandal', NULL, '300g', NULL, 160.0,
  NULL, 'NEEDS_REVIEW', 75, 'MYSORE SANDAL TALC 300G X 24PC - Rs.160/-', 'Sandalwood Talc',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-076', 'Mysore Sandal Pushpam Incense Sticks', 'Mysore Sandal', NULL, '90g', NULL, 54.0,
  NULL, 'NEEDS_REVIEW', 76, 'M S (PUSHPAM AGBT) 90G X 120PC - Rs.54/-', 'Pushpam Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-077', 'Mysore Sandal Tejah Incense Sticks', 'Mysore Sandal', NULL, '90g', NULL, 54.0,
  NULL, 'NEEDS_REVIEW', 77, 'MYSORE SANDAL TEJAH AGBT 90G X 120 PC - Rs.54/-', 'Tejah Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-078', 'Mysore Sandal Gulab Incense Sticks', 'Mysore Sandal', NULL, '90g', NULL, 54.0,
  NULL, 'NEEDS_REVIEW', 78, 'MYSORE SANDAL GULAB AGBT 90G X 120PC - Rs.54/-', 'Gulab / Rose Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-079', 'Mysore Sandal Lavender Incense Sticks', 'Mysore Sandal', NULL, '90g', NULL, 54.0,
  NULL, 'NEEDS_REVIEW', 79, 'MYSORE SANDAL LAVEND AGART 90G X 120PC - Rs.54/-', 'Lavender Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-080', 'Mysore Sandal Flora Incense Sticks', 'Mysore Sandal', NULL, '90g', NULL, 54.0,
  NULL, 'NEEDS_REVIEW', 80, 'MYSR SNDL MIX FLORA AGBT 90G X 120 PC - Rs.54/-', 'Mix Flora Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-081', 'Mysore Sandal Rose Incense Sticks (₹10 Pack)', 'Mysore Sandal', NULL, '1 pack', NULL, 10.0,
  NULL, 'NEEDS_REVIEW', 81, 'MYSORE SANDAL ROSE AGARBATHI 240 PC Rs.10/-', 'Rose Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-082', 'Mysore Sandal Freshnol Floor Cleaner (Buy 1 Get 1 Free)', 'Mysore Sandal', NULL, '1 L x 2', NULL, 150.0,
  NULL, 'NEEDS_REVIEW', 82, 'MYS SAND FRESHNOL 1 LTR (B1G1)X 12PC - Rs.150/- / MYS SAND FRESHNOL 1 LTR (B1G1)X 12PC - Rs.150/- (Free Scheme)', 'Freshnol Disinfectant Surface Cleaner (1+1 Offer)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-083', 'Authentic Andhra Lime / Nimbu Pickle', 'RR Enterprises / Regional Pickles', NULL, '200g', NULL, 35.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-083/primary.jpg', 'VERIFIED', 83, 'LIME PICKLE 200G x 60PC- Rs.35/-', 'Lime Pickle Pouch / Jar',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-083/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-084', 'Authentic Andhra Mango Avakaya Pickle', 'RR Enterprises / Regional Pickles', NULL, '200g', NULL, 45.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-084/primary.jpg', 'VERIFIED', 84, 'MANGO PICKLE AVAKAYA 200G - Rs.45/-', 'Avakaya Pickle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-084/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-085', 'Authentic Andhra Cut Mango Pickle', 'RR Enterprises / Regional Pickles', NULL, '200g', NULL, 35.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-085/primary.jpg', 'VERIFIED', 85, 'CUT MANGO PICKLE 200GX60 PC - Rs.35/-', 'Cut Mango Pickle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-085/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-086', 'Authentic Andhra Lime / Nimbu Pickle', 'RR Enterprises / Regional Pickles', NULL, '500g', NULL, 75.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-086/primary.jpg', 'VERIFIED', 86, 'LIME PICKLE 500Gx 24Pc - Rs.75/-', 'Lime Pickle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-086/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-087', 'Authentic Andhra Cut Mango Pickle', 'RR Enterprises / Regional Pickles', NULL, '500g', NULL, 75.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-087/primary.jpg', 'VERIFIED', 87, 'CUT MANGO PICKLE 500G X24 PC - Rs.75/-', 'Cut Mango Pickle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-087/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-088', 'Authentic Andhra Red Chilli (Pandu Mirapakaya) Pickle', 'RR Enterprises / Regional Pickles', NULL, '500g', NULL, 95.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-088/primary.jpg', 'VERIFIED', 88, 'RED CHILLI PICKLE 500G x 24PC- Rs.95/-', 'Red Chilli Pickle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-088/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-089', 'Authentic Mixed Vegetable Pickle', 'RR Enterprises / Regional Pickles', NULL, '500g', NULL, 75.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-089/primary.jpg', 'VERIFIED', 89, 'MIX VEGETABLE PICKLE 500G - Rs75/-', 'Mixed Vegetable Pickle',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-089/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-090', 'Mysore Sandal Mystic Incense Sticks', 'Mysore Sandal', NULL, '1 pack', NULL, 60.0,
  NULL, 'NEEDS_REVIEW', 90, 'MYSORE SANDAL MYSTIC X 120PC - Rs.60/-', 'Mystic Agarbatti',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-091', 'Mysore Sandal Agarbatti Pouch', 'Mysore Sandal', NULL, '125g', NULL, 55.0,
  NULL, 'NEEDS_REVIEW', 91, 'MYSORE SANDAL AGB (P) 125G X 120 PC - Rs.55/-', 'Sandal Agarbatti Zipper Pouch',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-092', 'Morelight Liquid Detergent Can', 'Morelight', NULL, '1 L', NULL, 99.0,
  NULL, 'NEEDS_REVIEW', 92, 'MORELIGHT 1LR X 12Pc Rs. 99/-', 'Liquid Detergent (Plastic Can)',
  true, true, '/products/placeholder.svg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-093', 'DRN Premium Suji Rava / Bombay Rava', 'DRN', NULL, '500g', NULL, 50.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-093/primary.jpg', 'VERIFIED', 93, 'DRN SUJI RAVVA 500G X 50PC - Rs.60/-', 'Suji / Bombay Rava',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-093/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-094', 'Cheemala Mandu (Ant & Insect Pest Powder)', NULL, NULL, '100g', NULL, 20.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-094/primary.jpg', 'VERIFIED', 94, 'CHIMALA MANDU 100G X 250PC - Rs.20/-', 'Ant & Insect Pest Powder (చీమల మందు)',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-094/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-095', 'Ganji Pindi (Natural Fabric Starch Powder)', NULL, NULL, '100g', NULL, 20.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-095/primary.jpg', 'VERIFIED', 95, 'GANJI PINDI 100G X 250PC - Rs.20/-', 'Natural Fabric Starch Powder (గంజి పిండి)',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-095/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  'pdf1-096', 'Washing Soda (Sodium Carbonate Laundry Booster)', NULL, NULL, '100g', NULL, 20.0,
  'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-096/primary.jpg', 'VERIFIED', 96, 'WASHING SHODA 100G X Rs.20/-', 'Sodium Carbonate Laundry Soda (వాషింగ్ సోడా)',
  true, true, 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-096/primary.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category_id = EXCLUDED.category_id,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  image_status = EXCLUDED.image_status,
  source_item_no = EXCLUDED.source_item_no,
  source_name = EXCLUDED.source_name,
  variant = EXCLUDED.variant,
  in_stock = EXCLUDED.in_stock,
  is_active = EXCLUDED.is_active,
  image = EXCLUDED.image,
  updated_at = NOW();
