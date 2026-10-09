-- Banners table for G1 Mart auto-rotating banner carousel
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta TEXT NOT NULL,
  link TEXT NOT NULL,
  image_url TEXT NOT NULL,
  badge TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 4 professional banners
INSERT INTO public.banners (id, title, subtitle, cta, link, image_url, badge, sort_order, active)
VALUES
  ('banner-monthly-list', 'Send your monthly grocery list - we pack it', 'Upload handwritten slip or WhatsApp photo, we pack & deliver', 'Upload List', '#scan-slip', '/banners/monthly-list.svg', 'SLIP SCAN', 1, true),
  ('banner-fresh-produce', 'Fresh vegetables & fruits', 'Handpicked daily from local mandi with instant delivery', 'Shop Fresh', '/category/vegetables-fruits', '/banners/vegetables-fruits.svg', 'FARM FRESH', 2, true),
  ('banner-household', 'Household & cleaning', 'Detergents, floor cleaners, dishwash bars & home essentials', 'Shop Essentials', '/category/floor-surface-cleaners', '/banners/household.svg', 'TOP BRANDS', 3, true),
  ('banner-snacks-drinks', 'Snacks & drinks', 'Crispy namkeen, biscuits, chips, sodas & cold juices', 'Explore Snacks', '/category/chips-namkeen', '/banners/snacks-drinks.svg', 'QUICK BITES', 4, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  cta = EXCLUDED.cta,
  link = EXCLUDED.link,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;
