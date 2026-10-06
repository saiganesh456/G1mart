import os
import json

MASTER_CATALOG_JSON = os.path.abspath('data/g1_mart_master_product_catalog.json')
MIGRATION_PATH = os.path.abspath('supabase/migrations/20261005000001_sync_master_catalog_and_images.sql')

with open(MASTER_CATALOG_JSON, 'r', encoding='utf-8') as f:
    master_catalog = json.load(f)

sql_lines = [
    "-- =============================================================================",
    "-- G1 MART — Master Catalog & Verified Images Synchronization Migration",
    "-- Contains all 571 products (472 baseline + 99 new unique supplier SKUs)",
    "-- Exact 58 verified real FMCG product packaging images in Supabase Storage",
    "-- Strictly NULL selling_price and unverified images set to NULL / NEEDS_REVIEW",
    "-- =============================================================================",
    ""
]

# 1. Update existing 472 products
sql_lines.append("-- 1. Reset and synchronize baseline 472 products")
for p in master_catalog:
    item_no = p['source_item_no']
    if item_no <= 472:
        pid = p['product_id']
        name_esc = p['display_name'].replace("'", "''")
        brand_esc = f"'{p['brand'].replace(chr(39), chr(39)+chr(39))}'" if p.get('brand') else "NULL"
        cat_esc = f"'{p['category_id']}'" if p.get('category_id') else "NULL"
        var_esc = f"'{p['variant'].replace(chr(39), chr(39)+chr(39))}'" if p.get('variant') else "NULL"
        mrp_val = f"{p['mrp']}" if p.get('mrp') is not None else "NULL"
        
        if p['image_status'] == 'VERIFIED' and p.get('image_url'):
            img_val = f"'{p['image_url']}'"
            status_val = "'VERIFIED'"
        else:
            img_val = "NULL"
            status_val = "'NEEDS_REVIEW'"
            
        sql_lines.append(
            f"UPDATE public.products SET name = '{name_esc}', brand = {brand_esc}, category_id = {cat_esc}, variant = {var_esc}, original_price = {mrp_val}, price = NULL, image_url = {img_val}, image_status = {status_val}, in_stock = true, is_active = true, updated_at = NOW() WHERE id = '{pid}';"
        )

# 2. Insert new SKUs (473+)
sql_lines.append("\n-- 2. Insert new unique SKUs from supplier invoices & handwritten sources (g1-prod-473 to g1-prod-571)")
for p in master_catalog:
    item_no = p['source_item_no']
    if item_no > 472:
        pid = p['product_id']
        name_esc = p['display_name'].replace("'", "''")
        raw_esc = p['source_name'].replace("'", "''")
        brand_esc = f"'{p['brand'].replace(chr(39), chr(39)+chr(39))}'" if p.get('brand') else "NULL"
        cat_esc = f"'{p['category_id']}'" if p.get('category_id') else "NULL"
        var_esc = f"'{p['variant'].replace(chr(39), chr(39)+chr(39))}'" if p.get('variant') else "NULL"
        unit_esc = f"'{p.get('unit', 'Pieces')}'"
        mrp_val = f"{p['mrp']}" if p.get('mrp') is not None else "NULL"
        
        if p['image_status'] == 'VERIFIED' and p.get('image_url'):
            img_val = f"'{p['image_url']}'"
            status_val = "'VERIFIED'"
        else:
            img_val = "NULL"
            status_val = "'NEEDS_REVIEW'"
            
        sql_lines.append(
            f"INSERT INTO public.products (id, source_item_no, source_name, name, brand, category_id, variant, unit, price, original_price, stock_count, discount_percentage, in_stock, image_url, image_status, is_active, active, rating, reviews_count) VALUES ('{pid}', {item_no}, '{raw_esc}', '{name_esc}', {brand_esc}, {cat_esc}, {var_esc}, {unit_esc}, NULL, {mrp_val}, 25, 0, true, {img_val}, {status_val}, true, true, 4.80, 0) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, category_id = EXCLUDED.category_id, variant = EXCLUDED.variant, original_price = EXCLUDED.original_price, price = NULL, image_url = EXCLUDED.image_url, image_status = EXCLUDED.image_status, updated_at = NOW();"
        )

with open(MIGRATION_PATH, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_lines) + "\n")

print(f"Generated {MIGRATION_PATH} with {len(sql_lines)} lines.")
