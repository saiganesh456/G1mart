import json
import os

with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# 1. Generate src/data/products-catalog.json
app_catalog = []
for p in products:
    raw_desc = p.get("raw_invoice_description")
    if isinstance(raw_desc, list):
        raw_desc_str = " / ".join(str(x) for x in raw_desc)
    else:
        raw_desc_str = str(raw_desc or "")

    app_catalog.append({
        "id": p["id"],
        "sourceItemNo": p["item_no"],
        "sourceName": raw_desc_str,
        "name": p["product_name"],
        "brand": p["brand"],
        "category": None, # MUST remain UNASSIGNED
        "subCategory": None,
        "variant": p["variant"],
        "unit": p["pack_size"],
        "price": None, # MUST remain NULL
        "priceConfirmed": False,
        "originalPrice": p["mrp"],
        "discountPercentage": 0,
        "inStock": True,
        "stockCount": 25,
        "imageUrl": p["image_url"],
        "imageStatus": p["image_status"],
        "imageMatchNote": p.get("notes"),
        "description": f"{p['product_name']} ({p['pack_size']}) - Brand: {p['brand'] or 'Local/Commodity'}",
        "isActive": True
    })

with open('src/data/products-catalog.json', 'w', encoding='utf-8') as f:
    json.dump(app_catalog, f, indent=2, ensure_ascii=False)

print(f"Generated src/data/products-catalog.json with {len(app_catalog)} products.")

# 2. Generate Supabase SQL Migration
migration_file = 'supabase/migrations/20261006000001_seed_pdf1_master_products.sql'

sql_lines = [
    "-- =============================================================================",
    "-- G1 MART — PDF #1 Final Master Products Seed Migration",
    "-- Contains all 96 verified canonical products from PDF #1 (AltaScanner_10_04_2026(1)(1).pdf)",
    "-- selling_price strictly NULL, category_id strictly NULL",
    "-- Verified images point to Supabase Storage; unverified are NULL / NEEDS_REVIEW",
    "-- =============================================================================",
    "",
    "-- Ensure check constraint supports 'VERIFIED' and 'NEEDS_REVIEW'",
    "ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_image_status_check;",
    "ALTER TABLE public.products ADD CONSTRAINT products_image_status_check",
    "  CHECK (image_status IN ('VERIFIED', 'NEEDS_REVIEW', 'MISSING', 'PENDING'));",
    "",
    "-- Ensure nullable columns for clean schema adherence",
    "ALTER TABLE public.products ALTER COLUMN price DROP NOT NULL;",
    "ALTER TABLE public.products ALTER COLUMN original_price DROP NOT NULL;",
    "ALTER TABLE public.products ALTER COLUMN category_id DROP NOT NULL;",
    "ALTER TABLE public.products ALTER COLUMN brand DROP NOT NULL;",
    "ALTER TABLE public.products ALTER COLUMN description DROP NOT NULL;",
    "ALTER TABLE public.products ALTER COLUMN image DROP NOT NULL;",
    "",
    "-- Upsert all 96 products",
]

for p in products:
    pid = p['id']
    name = p['product_name'].replace("'", "''")
    brand = f"'{p['brand'].replace(chr(39), chr(39)+chr(39))}'" if p.get('brand') else "NULL"
    unit = p['pack_size'].replace("'", "''")
    mrp = str(p['mrp']) if p.get('mrp') is not None else "NULL"
    source_item_no = str(p['item_no'])
    
    raw_desc = p.get("raw_invoice_description")
    if isinstance(raw_desc, list):
        raw_desc_str = " / ".join(str(x) for x in raw_desc)
    else:
        raw_desc_str = str(raw_desc or "")
    source_name = raw_desc_str.replace("'", "''")
    
    variant = f"'{p['variant'].replace(chr(39), chr(39)+chr(39))}'" if p.get('variant') else "NULL"
    
    if p.get('image_url'):
        img_url = f"'{p['image_url']}'"
        img_status = "'VERIFIED'"
        img_col = f"'{p['image_url']}'"
    else:
        img_url = "NULL"
        img_status = "'NEEDS_REVIEW'"
        img_col = "'/products/placeholder.svg'"
        
    sql = f"""INSERT INTO public.products (
  id, name, brand, category_id, unit, price, original_price,
  image_url, image_status, source_item_no, source_name, variant,
  in_stock, is_active, image
) VALUES (
  '{pid}', '{name}', {brand}, NULL, '{unit}', NULL, {mrp},
  {img_url}, {img_status}, {source_item_no}, '{source_name}', {variant},
  true, true, {img_col}
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
  updated_at = NOW();"""
    sql_lines.append(sql)

with open(migration_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines) + '\n')

print(f"Generated {migration_file} successfully.")
