import json
import os
import re

PUBLIC_DIR = os.path.abspath("public")
CATALOG_PATH = os.path.join("src", "data", "products-catalog.json")
FLAGGED_CSV = os.path.join("data", "flagged_products_audit.csv")

PLACEHOLDER_IMAGE = "/products/placeholder.svg"

# 1. Category Tree Definition (4 sections, 24 categories)
SECTIONS = [
    {"id": "grocery-kitchen", "name": "Grocery & Kitchen", "sort_order": 1},
    {"id": "snacks-drinks", "name": "Snacks & Drinks", "sort_order": 2},
    {"id": "household", "name": "Household", "sort_order": 3},
    {"id": "personal-care", "name": "Personal Care", "sort_order": 4},
]

CATEGORIES = [
    # Grocery & Kitchen
    {"id": "vegetables-fruits", "name": "Vegetables & Fruits", "section_id": "grocery-kitchen", "tile_image_url": "/categories/fruits-vegetables.jpg", "sort_order": 1, "icon": "Apple", "description": "Fresh vegetables, farm fruits, greens and seasonal produce"},
    {"id": "atta-rice-dal", "name": "Atta Rice & Dal", "section_id": "grocery-kitchen", "tile_image_url": "/categories/atta-rice-dal.jpg", "sort_order": 2, "icon": "Wheat", "description": "Chakki fresh atta, raw & boiled rice, premium pulses and dals"},
    {"id": "oil-ghee-masala", "name": "Oil Ghee & Masala", "section_id": "grocery-kitchen", "tile_image_url": "/categories/masala-oil.jpg", "sort_order": 3, "icon": "Sparkles", "description": "Refined edible oils, pure ghee, turmeric, chilli and whole spices"},
    {"id": "dairy-bread-eggs", "name": "Dairy Bread & Eggs", "section_id": "grocery-kitchen", "tile_image_url": "/categories/dairy-bread-eggs.jpg", "sort_order": 4, "icon": "Milk", "description": "Fresh milk, curd, paneer, butter, fresh bread and farm eggs"},
    {"id": "dry-fruits-cereals", "name": "Dry Fruits & Cereals", "section_id": "grocery-kitchen", "tile_image_url": "/categories/breakfast-instant.jpg", "sort_order": 5, "icon": "Cookie", "description": "Almonds, cashews, raisins, oats, muesli and breakfast cereals"},
    {"id": "sugar-salt-staples", "name": "Sugar Salt & Staples", "section_id": "grocery-kitchen", "tile_image_url": "/categories/atta-rice-dal.jpg", "sort_order": 6, "icon": "Wheat", "description": "Iodized salt, crystal sugar, jaggery and daily kitchen essentials"},

    # Snacks & Drinks
    {"id": "chips-namkeen", "name": "Chips & Namkeen", "section_id": "snacks-drinks", "tile_image_url": "/categories/snacks-munchies.jpg", "sort_order": 1, "icon": "Cookie", "description": "Potato chips, crispy namkeen, mixture, sev and crunchy bites"},
    {"id": "biscuits-bakery", "name": "Biscuits & Bakery", "section_id": "snacks-drinks", "tile_image_url": "/categories/bakery-biscuits.jpg", "sort_order": 2, "icon": "Cookie", "description": "Cookies, cream biscuits, glucose biscuits, rusks and bakery cakes"},
    {"id": "sweets-chocolates", "name": "Sweets & Chocolates", "section_id": "snacks-drinks", "tile_image_url": "/categories/sweets-chocolates.jpg", "sort_order": 3, "icon": "Heart", "description": "Dairy milk chocolates, bars, traditional sweets and gift packs"},
    {"id": "drinks-juices", "name": "Drinks & Juices", "section_id": "snacks-drinks", "tile_image_url": "/categories/cold-drinks-juices.jpg", "sort_order": 4, "icon": "Coffee", "description": "Cold drinks, sodas, fruit juices, energy drinks and coconut water"},
    {"id": "tea-coffee-milk-drinks", "name": "Tea Coffee & Milk Drinks", "section_id": "snacks-drinks", "tile_image_url": "/categories/tea-coffee.jpg", "sort_order": 5, "icon": "Coffee", "description": "Premium leaf tea, instant filter coffee and malt health drinks"},
    {"id": "instant-food", "name": "Instant Food", "section_id": "snacks-drinks", "tile_image_url": "/categories/breakfast-instant.jpg", "sort_order": 6, "icon": "Sparkles", "description": "Instant noodles, vermicelli, ready-to-eat meals and breakfast mixes"},
    {"id": "sauces-spreads", "name": "Sauces & Spreads", "section_id": "snacks-drinks", "tile_image_url": "/categories/breakfast-instant.jpg", "sort_order": 7, "icon": "Sparkles", "description": "Tomato ketchup, cooking sauces, jams, peanut butter and mayonnaise"},

    # Household
    {"id": "laundry-detergents", "name": "Laundry & Detergents", "section_id": "household", "tile_image_url": "/categories/cleaning-essentials.jpg", "sort_order": 1, "icon": "ShieldCheck", "description": "Washing powders, liquid detergents, fabric conditioners and soap bars"},
    {"id": "dishwash", "name": "Dishwash", "section_id": "household", "tile_image_url": "/categories/cleaning-essentials.jpg", "sort_order": 2, "icon": "ShieldCheck", "description": "Dishwash bars, concentrated gels, scrub pads and sponges"},
    {"id": "floor-surface-cleaners", "name": "Floor & Surface Cleaners", "section_id": "household", "tile_image_url": "/categories/cleaning-essentials.jpg", "sort_order": 3, "icon": "Home", "description": "Disinfectant floor cleaners, toilet cleaners, glass sprays and mops"},
    {"id": "pooja-needs", "name": "Pooja Needs", "section_id": "household", "tile_image_url": "/categories/cleaning-essentials.jpg", "sort_order": 4, "icon": "Flame", "description": "Fragrant agarbatti, pure dhoop, camphor, pooja oil and brass items"},
    {"id": "kitchenware", "name": "Kitchenware", "section_id": "household", "tile_image_url": "/categories/cleaning-essentials.jpg", "sort_order": 5, "icon": "Home", "description": "Containers, peelers, kitchen tools, foils and storage essentials"},

    # Personal Care
    {"id": "soaps-bath", "name": "Soaps & Bath", "section_id": "personal-care", "tile_image_url": "/categories/personal-care.jpg", "sort_order": 1, "icon": "Sparkles", "description": "Bathing soaps, body wash, hand wash and shower gels"},
    {"id": "oral-care", "name": "Oral Care", "section_id": "personal-care", "tile_image_url": "/categories/personal-care.jpg", "sort_order": 2, "icon": "Sparkles", "description": "Toothpastes, toothbrushes, mouthwash and tongue cleaners"},
    {"id": "hair-care", "name": "Hair Care", "section_id": "personal-care", "tile_image_url": "/categories/personal-care.jpg", "sort_order": 3, "icon": "Sparkles", "description": "Shampoos, conditioners, hair oils, gels and hair color"},
    {"id": "skin-care", "name": "Skin Care", "section_id": "personal-care", "tile_image_url": "/categories/personal-care.jpg", "sort_order": 4, "icon": "Heart", "description": "Face wash, cold creams, moisturizers, talcum powders and lotions"},
    {"id": "baby-care", "name": "Baby Care", "section_id": "personal-care", "tile_image_url": "/categories/personal-care.jpg", "sort_order": 5, "icon": "Baby", "description": "Gentle baby soaps, baby shampoos, diapers, wipes and baby oils"},
    {"id": "hygiene", "name": "Hygiene", "section_id": "personal-care", "tile_image_url": "/categories/personal-care.jpg", "sort_order": 6, "icon": "ShieldCheck", "description": "Sanitary napkins, intimate hygiene, cotton pads and antiseptics"},
]

SUBCAT_MAP = {
    'Atta, Flours & Sooji': 'atta-rice-dal',
    'Rice, Poha & Vermicelli': 'atta-rice-dal',
    'Dals & Pulses': 'atta-rice-dal',
    'Edible Cooking Oils & Ghee': 'oil-ghee-masala',
    'Spices, Masalas & Seeds': 'oil-ghee-masala',
    'Dairy & Ice Creams': 'dairy-bread-eggs',
    'Salt, Sugar & Jaggery': 'sugar-salt-staples',
    'Kitchen Staples': 'sugar-salt-staples',
    'Biscuits, Rusks & Cookies': 'biscuits-bakery',
    'Chocolates & Sweets': 'sweets-chocolates',
    'Chips & Namkeen': 'chips-namkeen',
    'Cold Drinks & Health Juices': 'drinks-juices',
    'Tea, Chai & Coffee': 'tea-coffee-milk-drinks',
    'Packaged Foods': 'instant-food',
    'Laundry & Detergents': 'laundry-detergents',
    'Dishwashing & Utensil Care': 'dishwash',
    'Cleaners & Pest Control': 'floor-surface-cleaners',
    'Cleaning Essentials': 'floor-surface-cleaners',
    'Electricals & Batteries': 'kitchenware',
    'Pooja Agarbatti & Dhoop': 'pooja-needs',
    'Bath Soaps': 'soaps-bath',
    'Oral Care': 'oral-care',
    'Hair Oils & Care': 'hair-care',
    'Personal Care Essentials': 'hygiene',
}

def map_category(p):
    sub = p.get('subCategory') or ''
    name = (p.get('name') or '').lower()
    if 'baby' in name or 'diaper' in name:
        return 'baby-care'
    if any(k in name for k in ['sauce', 'jam', 'ketchup', 'spread', 'mayonnaise']):
        return 'sauces-spreads'
    if any(k in name for k in ['vegetable', 'fruit', 'onion', 'potato', 'tomato']):
        return 'vegetables-fruits'
    if any(k in name for k in ['almond', 'cashew', 'badam', 'kaju', 'cereal', 'oats', 'corn flakes', 'pista']):
        return 'dry-fruits-cereals'
    if any(k in name for k in ['face wash', 'skin', 'cold cream', 'lotion', 'body lotion', 'vaseline']):
        return 'skin-care'
    if sub in SUBCAT_MAP:
        return SUBCAT_MAP[sub]
    old_cat = p.get('category') or ''
    if old_cat == 'pooja-essentials':
        return 'pooja-needs'
    if old_cat == 'snacks-beverages':
        return 'chips-namkeen'
    if old_cat == 'household-cleaning':
        return 'floor-surface-cleaners'
    if old_cat == 'personal-care':
        return 'soaps-bath'
    return 'sugar-salt-staples'

size_patterns = [
    r'\b(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|ml|l|ltr|litre|litres|pcs|pieces|pc|tablets|capsules|units))\b',
    r'\b(?:pack\s+of\s+\d+)\b',
    r'\b(?:set\s+of\s+\d+)\b',
    r'\b\d+\s*x\s*\d+\s*(?:g|gm|ml|kg)\b',
    r'\b1\s*\+\s*1\b',
]
combined_size_re = re.compile('|'.join(size_patterns), re.IGNORECASE)

def extract_base_and_size(name, unit, pack_size):
    matches = combined_size_re.findall(name)
    clean = combined_size_re.sub('', name).strip()
    clean = re.sub(r'[\(\)\-\,\s]+$', '', clean).strip()
    clean = re.sub(r'^\s*[\(\)\-\,]+', '', clean).strip()
    clean = re.sub(r'\s{2,}', ' ', clean)
    
    size_label = None
    if matches:
        for m in matches:
            if isinstance(m, tuple):
                for sub in m:
                    if sub: size_label = sub; break
            elif m:
                size_label = m; break
    if not size_label:
        if pack_size and pack_size.lower() not in ('pieces', 'pack', 'set', 'standard', '1 unit'):
            size_label = pack_size
        elif unit and unit.lower() not in ('pieces', 'pack', 'set', 'standard', '1 unit'):
            size_label = unit
        else:
            size_label = pack_size or unit or 'Standard'
    return clean, size_label

def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'item'

def main():
    # Load flagged images set
    flagged_ids = set()
    if os.path.exists(FLAGGED_CSV):
        import csv
        with open(FLAGGED_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                flagged_ids.add(row['product_id'])
    print(f"Loaded {len(flagged_ids)} flagged product image IDs.")

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # 1. Build Brands
    brands_map = {}
    for p in catalog:
        b_name = (p.get('brand') or '').strip()
        if not b_name:
            b_name = "G1 Mart Fresh"
        b_id = f"brand-{slugify(b_name)}"
        if b_id not in brands_map:
            brands_map[b_id] = {
                "id": b_id,
                "name": b_name,
                "logo_url": None,
                "created_at": "2026-10-08T12:00:00Z"
            }

    brands_list = sorted(list(brands_map.values()), key=lambda x: x['name'])
    print(f"Extracted {len(brands_list)} unique brands.")

    # 2. Group Products by (brand_id, base_name_lower, category_id)
    grouped = {}
    for p in catalog:
        b_name = (p.get('brand') or '').strip() or "G1 Mart Fresh"
        brand_id = f"brand-{slugify(b_name)}"
        cat_id = map_category(p)
        orig_name = p.get('name') or 'Unnamed Product'
        base_name, size_label = extract_base_and_size(orig_name, p.get('unit'), p.get('pack_size'))
        
        # Deduplication key
        norm_key = (brand_id, base_name.lower().strip(), cat_id)
        if norm_key not in grouped:
            grouped[norm_key] = {
                "base_name": base_name,
                "brand_id": brand_id,
                "category_id": cat_id,
                "items": []
            }
        grouped[norm_key]["items"].append((p, size_label))

    print(f"Grouped {len(catalog)} raw items into {len(grouped)} merged products.")

    products_list = []
    variants_list = []
    
    prod_counter = 1
    for norm_key, grp in grouped.items():
        base_name = grp["base_name"]
        brand_id = grp["brand_id"]
        category_id = grp["category_id"]
        items = grp["items"]
        
        prod_id = f"g1-p{prod_counter:04d}"
        prod_counter += 1
        
        # Find best image from items (prefer non-flagged)
        chosen_image = None
        for orig_p, _ in items:
            p_id = orig_p.get('id', '')
            img = orig_p.get('image_url') or orig_p.get('imageUrl') or orig_p.get('image')
            if p_id not in flagged_ids and img and not img.endswith('placeholder.svg'):
                chosen_image = img
                break
        if not chosen_image:
            chosen_image = PLACEHOLDER_IMAGE

        products_list.append({
            "id": prod_id,
            "name": base_name,
            "brand_id": brand_id,
            "category_id": category_id,
            "image_url": chosen_image,
        })

        # Create variants for this product
        seen_sizes = {}
        var_idx = 1
        for orig_p, size_label in items:
            price = float(orig_p.get('price') or 0.0)
            mrp = float(orig_p.get('originalPrice') or orig_p.get('mrp') or price)
            stock = int(orig_p.get('stockCount') or 15)
            
            # If same size already exists with same price, keep higher stock
            if size_label in seen_sizes:
                existing_var = seen_sizes[size_label]
                existing_var['stock'] += stock
                if existing_var['price'] == 0 and price > 0:
                    existing_var['price'] = price
                    existing_var['mrp'] = mrp
                continue

            var_id = f"{prod_id}-v{var_idx}"
            var_idx += 1
            variant_obj = {
                "id": var_id,
                "product_id": prod_id,
                "size_label": size_label,
                "price": round(price, 2),
                "mrp": round(mrp, 2),
                "stock": stock,
            }
            seen_sizes[size_label] = variant_obj
            variants_list.append(variant_obj)

    print(f"Total merged products created: {len(products_list)}")
    print(f"Total product variants created: {len(variants_list)}")

    # 3. Save JSON files
    os.makedirs("data", exist_ok=True)
    with open("data/migrated_sections.json", "w", encoding="utf-8") as f:
        json.dump(SECTIONS, f, indent=2)
    with open("data/migrated_categories.json", "w", encoding="utf-8") as f:
        json.dump(CATEGORIES, f, indent=2)
    with open("data/migrated_brands.json", "w", encoding="utf-8") as f:
        json.dump(brands_list, f, indent=2)
    with open("data/migrated_products.json", "w", encoding="utf-8") as f:
        json.dump(products_list, f, indent=2)
    with open("data/migrated_product_variants.json", "w", encoding="utf-8") as f:
        json.dump(variants_list, f, indent=2)

    # 4. Generate SQL Seed file for category tree
    os.makedirs("supabase/migrations", exist_ok=True)
    seed_sql = []
    seed_sql.append("-- =============================================================================")
    seed_sql.append("-- G1 MART: Supermarket Category Tree Seed")
    seed_sql.append("-- 4 Sections, 24 Categories (Supermarket Only, No Electronics)")
    seed_sql.append("-- =============================================================================\n")

    seed_sql.append("-- 1. Insert Sections")
    for s in SECTIONS:
        name_esc = s['name'].replace("'", "''")
        seed_sql.append(f"INSERT INTO public.sections (id, name, sort_order) VALUES ('{s['id']}', '{name_esc}', {s['sort_order']}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;")

    seed_sql.append("\n-- 2. Insert Categories")
    for c in CATEGORIES:
        name_esc = c['name'].replace("'", "''")
        desc_esc = c['description'].replace("'", "''")
        seed_sql.append(
            f"INSERT INTO public.categories (id, name, section_id, tile_image_url, sort_order, icon, description, is_active) "
            f"VALUES ('{c['id']}', '{name_esc}', '{c['section_id']}', '{c['tile_image_url']}', {c['sort_order']}, '{c['icon']}', '{desc_esc}', true) "
            f"ON CONFLICT (id) DO UPDATE SET "
            f"name = EXCLUDED.name, section_id = EXCLUDED.section_id, tile_image_url = EXCLUDED.tile_image_url, "
            f"sort_order = EXCLUDED.sort_order, icon = EXCLUDED.icon, description = EXCLUDED.description, is_active = true, updated_at = now();"
        )

    with open("supabase/seed_category_tree.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(seed_sql) + "\n")
    print("Generated supabase/seed_category_tree.sql")

    # 5. Generate complete Migration SQL file
    migration_sql = []
    migration_sql.append("-- =============================================================================")
    migration_sql.append("-- G1 MART MIGRATION: 20261008000001_supermarket_schema_and_variants.sql")
    migration_sql.append("-- 1. Sections, Categories, Brands Table Structure")
    migration_sql.append("-- 2. Products and Product Variants Relational Split")
    migration_sql.append("-- 3. Seed Category Tree (24 supermarket categories across 4 sections)")
    migration_sql.append("-- =============================================================================\n")

    migration_sql.append("-- Step 1: Sections Table")
    migration_sql.append("CREATE TABLE IF NOT EXISTS public.sections (")
    migration_sql.append("  id TEXT PRIMARY KEY,")
    migration_sql.append("  name TEXT NOT NULL,")
    migration_sql.append("  sort_order INTEGER NOT NULL DEFAULT 0,")
    migration_sql.append("  created_at TIMESTAMPTZ DEFAULT now()")
    migration_sql.append(");\n")

    migration_sql.append("-- Step 2: Brands Table")
    migration_sql.append("CREATE TABLE IF NOT EXISTS public.brands (")
    migration_sql.append("  id TEXT PRIMARY KEY,")
    migration_sql.append("  name TEXT NOT NULL UNIQUE,")
    migration_sql.append("  logo_url TEXT,")
    migration_sql.append("  created_at TIMESTAMPTZ DEFAULT now()")
    migration_sql.append(");\n")

    migration_sql.append("-- Step 3: Ensure Categories Table columns")
    migration_sql.append("CREATE TABLE IF NOT EXISTS public.categories (")
    migration_sql.append("  id TEXT PRIMARY KEY,")
    migration_sql.append("  name TEXT NOT NULL,")
    migration_sql.append("  icon TEXT,")
    migration_sql.append("  description TEXT,")
    migration_sql.append("  display_order INTEGER DEFAULT 0,")
    migration_sql.append("  is_active BOOLEAN DEFAULT true,")
    migration_sql.append("  created_at TIMESTAMPTZ DEFAULT now(),")
    migration_sql.append("  updated_at TIMESTAMPTZ DEFAULT now()")
    migration_sql.append(");")
    migration_sql.append("ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE;")
    migration_sql.append("ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tile_image_url TEXT;")
    migration_sql.append("ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;")
    migration_sql.append("CREATE INDEX IF NOT EXISTS idx_categories_section_id ON public.categories(section_id);\n")

    migration_sql.append("-- Step 4: Ensure Products Table columns")
    migration_sql.append("CREATE TABLE IF NOT EXISTS public.products (")
    migration_sql.append("  id TEXT PRIMARY KEY,")
    migration_sql.append("  name TEXT NOT NULL,")
    migration_sql.append("  brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,")
    migration_sql.append("  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,")
    migration_sql.append("  image_url TEXT,")
    migration_sql.append("  description TEXT DEFAULT '',")
    migration_sql.append("  is_active BOOLEAN DEFAULT true,")
    migration_sql.append("  created_at TIMESTAMPTZ DEFAULT now(),")
    migration_sql.append("  updated_at TIMESTAMPTZ DEFAULT now()")
    migration_sql.append(");")
    migration_sql.append("ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL;")
    migration_sql.append("ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;")
    migration_sql.append("CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);")
    migration_sql.append("CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);\n")

    migration_sql.append("-- Step 5: Product Variants Table (id, product_id, size_label, price, mrp, stock)")
    migration_sql.append("CREATE TABLE IF NOT EXISTS public.product_variants (")
    migration_sql.append("  id TEXT PRIMARY KEY,")
    migration_sql.append("  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,")
    migration_sql.append("  size_label TEXT NOT NULL,")
    migration_sql.append("  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),")
    migration_sql.append("  mrp NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (mrp >= 0),")
    migration_sql.append("  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),")
    migration_sql.append("  created_at TIMESTAMPTZ DEFAULT now(),")
    migration_sql.append("  updated_at TIMESTAMPTZ DEFAULT now()")
    migration_sql.append(");")
    migration_sql.append("CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);\n")

    migration_sql.append("-- Step 6: Security Policies (RLS) for storefront access")
    migration_sql.append("ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;")
    migration_sql.append("ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;")
    migration_sql.append("ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;")
    migration_sql.append("ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;")
    migration_sql.append("ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;\n")
    migration_sql.append("DO $$ BEGIN")
    migration_sql.append("  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Public can view sections') THEN")
    migration_sql.append("    CREATE POLICY \"Public can view sections\" ON public.sections FOR SELECT USING (true);")
    migration_sql.append("  END IF;")
    migration_sql.append("  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Public can view brands') THEN")
    migration_sql.append("    CREATE POLICY \"Public can view brands\" ON public.brands FOR SELECT USING (true);")
    migration_sql.append("  END IF;")
    migration_sql.append("  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public can view categories') THEN")
    migration_sql.append("    CREATE POLICY \"Public can view categories\" ON public.categories FOR SELECT USING (true);")
    migration_sql.append("  END IF;")
    migration_sql.append("  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public can view products') THEN")
    migration_sql.append("    CREATE POLICY \"Public can view products\" ON public.products FOR SELECT USING (true);")
    migration_sql.append("  END IF;")
    migration_sql.append("  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Public can view product variants') THEN")
    migration_sql.append("    CREATE POLICY \"Public can view product variants\" ON public.product_variants FOR SELECT USING (true);")
    migration_sql.append("  END IF;")
    migration_sql.append("END $$;\n")
    migration_sql.append("GRANT SELECT ON public.sections TO anon, authenticated;")
    migration_sql.append("GRANT SELECT ON public.brands TO anon, authenticated;")
    migration_sql.append("GRANT SELECT ON public.categories TO anon, authenticated;")
    migration_sql.append("GRANT SELECT ON public.products TO anon, authenticated;")
    migration_sql.append("GRANT SELECT ON public.product_variants TO anon, authenticated;\n")

    migration_sql.append("-- Step 7: Seed Supermarket Category Tree")
    migration_sql.extend(seed_sql[4:])

    with open("supabase/migrations/20261008000001_supermarket_category_tree_and_variants.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(migration_sql) + "\n")
    print("Generated supabase/migrations/20261008000001_supermarket_category_tree_and_variants.sql")

if __name__ == '__main__':
    main()
