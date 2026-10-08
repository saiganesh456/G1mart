-- =============================================================================
-- G1 MART MIGRATION: 20261008000001_supermarket_schema_and_variants.sql
-- 1. Sections, Categories, Brands Table Structure
-- 2. Products and Product Variants Relational Split
-- 3. Seed Category Tree (24 supermarket categories across 4 sections)
-- =============================================================================

-- Step 1: Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Ensure Categories Table columns
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tile_image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_categories_section_id ON public.categories(section_id);

-- Step 4: Ensure Products Table columns
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Step 5: Product Variants Table (id, product_id, size_label, price, mrp, stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  mrp NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (mrp >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- Step 6: Security Policies (RLS) for storefront access
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Public can view sections') THEN
    CREATE POLICY "Public can view sections" ON public.sections FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Public can view brands') THEN
    CREATE POLICY "Public can view brands" ON public.brands FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public can view categories') THEN
    CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public can view products') THEN
    CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Public can view product variants') THEN
    CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON public.sections TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;

-- Step 7: Seed Supermarket Category Tree
-- 1. Insert Sections
INSERT INTO public.sections (id, name, sort_order) VALUES ('grocery-kitchen', 'Grocery & Kitchen', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
INSERT INTO public.sections (id, name, sort_order) VALUES ('snacks-drinks', 'Snacks & Drinks', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
INSERT INTO public.sections (id, name, sort_order) VALUES ('household', 'Household', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
INSERT INTO public.sections (id, name, sort_order) VALUES ('personal-care', 'Personal Care', 4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 2. Insert Categories
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('vegetables-fruits', 'Vegetables & Fruits', 'grocery-kitchen', '/categories/fruits-vegetables.jpg', 1, 'Apple', 'Fresh vegetables, farm fruits, greens and seasonal produce', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('atta-rice-dal', 'Atta Rice & Dal', 'grocery-kitchen', '/categories/atta-rice-dal.jpg', 2, 'Wheat', 'Chakki fresh atta, raw & boiled rice, premium pulses and dals', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('oil-ghee-masala', 'Oil Ghee & Masala', 'grocery-kitchen', '/categories/masala-oil.jpg', 3, 'Sparkles', 'Refined edible oils, pure ghee, turmeric, chilli and whole spices', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('dairy-bread-eggs', 'Dairy Bread & Eggs', 'grocery-kitchen', '/categories/dairy-bread-eggs.jpg', 4, 'Milk', 'Fresh milk, curd, paneer, butter, fresh bread and farm eggs', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('dry-fruits-cereals', 'Dry Fruits & Cereals', 'grocery-kitchen', '/categories/breakfast-instant.jpg', 5, 'Cookie', 'Almonds, cashews, raisins, oats, muesli and breakfast cereals', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('sugar-salt-staples', 'Sugar Salt & Staples', 'grocery-kitchen', '/categories/atta-rice-dal.jpg', 6, 'Wheat', 'Iodized salt, crystal sugar, jaggery and daily kitchen essentials', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('chips-namkeen', 'Chips & Namkeen', 'snacks-drinks', '/categories/snacks-munchies.jpg', 1, 'Cookie', 'Potato chips, crispy namkeen, mixture, sev and crunchy bites', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('biscuits-bakery', 'Biscuits & Bakery', 'snacks-drinks', '/categories/bakery-biscuits.jpg', 2, 'Cookie', 'Cookies, cream biscuits, glucose biscuits, rusks and bakery cakes', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('sweets-chocolates', 'Sweets & Chocolates', 'snacks-drinks', '/categories/sweets-chocolates.jpg', 3, 'Heart', 'Dairy milk chocolates, bars, traditional sweets and gift packs', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('drinks-juices', 'Drinks & Juices', 'snacks-drinks', '/categories/cold-drinks-juices.jpg', 4, 'Coffee', 'Cold drinks, sodas, fruit juices, energy drinks and coconut water', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('tea-coffee-milk-drinks', 'Tea Coffee & Milk Drinks', 'snacks-drinks', '/categories/tea-coffee.jpg', 5, 'Coffee', 'Premium leaf tea, instant filter coffee and malt health drinks', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('instant-food', 'Instant Food', 'snacks-drinks', '/categories/breakfast-instant.jpg', 6, 'Sparkles', 'Instant noodles, vermicelli, ready-to-eat meals and breakfast mixes', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('sauces-spreads', 'Sauces & Spreads', 'snacks-drinks', '/categories/breakfast-instant.jpg', 7, 'Sparkles', 'Tomato ketchup, cooking sauces, jams, peanut butter and mayonnaise', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('laundry-detergents', 'Laundry & Detergents', 'household', '/categories/cleaning-essentials.jpg', 1, 'ShieldCheck', 'Washing powders, liquid detergents, fabric conditioners and soap bars', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('dishwash', 'Dishwash', 'household', '/categories/cleaning-essentials.jpg', 2, 'ShieldCheck', 'Dishwash bars, concentrated gels, scrub pads and sponges', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('floor-surface-cleaners', 'Floor & Surface Cleaners', 'household', '/categories/cleaning-essentials.jpg', 3, 'Home', 'Disinfectant floor cleaners, toilet cleaners, glass sprays and mops', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('pooja-needs', 'Pooja Needs', 'household', '/categories/cleaning-essentials.jpg', 4, 'Flame', 'Fragrant agarbatti, pure dhoop, camphor, pooja oil and brass items', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('kitchenware', 'Kitchenware', 'household', '/categories/cleaning-essentials.jpg', 5, 'Home', 'Containers, peelers, kitchen tools, foils and storage essentials', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('soaps-bath', 'Soaps & Bath', 'personal-care', '/categories/personal-care.jpg', 1, 'Sparkles', 'Bathing soaps, body wash, hand wash and shower gels', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('oral-care', 'Oral Care', 'personal-care', '/categories/personal-care.jpg', 2, 'Sparkles', 'Toothpastes, toothbrushes, mouthwash and tongue cleaners', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('hair-care', 'Hair Care', 'personal-care', '/categories/personal-care.jpg', 3, 'Sparkles', 'Shampoos, conditioners, hair oils, gels and hair color', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('skin-care', 'Skin Care', 'personal-care', '/categories/personal-care.jpg', 4, 'Heart', 'Face wash, cold creams, moisturizers, talcum powders and lotions', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('baby-care', 'Baby Care', 'personal-care', '/categories/personal-care.jpg', 5, 'Baby', 'Gentle baby soaps, baby shampoos, diapers, wipes and baby oils', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) VALUES ('hygiene', 'Hygiene', 'personal-care', '/categories/personal-care.jpg', 6, 'ShieldCheck', 'Sanitary napkins, intimate hygiene, cotton pads and antiseptics', true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();
