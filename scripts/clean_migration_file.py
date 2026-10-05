import json
import os

with open('data/g1_mart_master_product_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

lines = [
    '-- =============================================================================',
    '-- G1 MART — Full Master Product Images & Status Migration',
    '-- Generated from Master Verified Catalog',
    '-- Only verified real FMCG packshots have image_url set.',
    '-- All unverified items have image_url = NULL and image_status = NEEDS_REVIEW.',
    '-- =============================================================================',
    ''
]

for p in catalog:
    if p['source_item_no'] <= 472:
        pid = p['product_id']
        if p['image_status'] == 'VERIFIED' and p.get('image_url'):
            img_val = f"'{p['image_url']}'"
            status_val = "'VERIFIED'"
        else:
            img_val = 'NULL'
            status_val = "'NEEDS_REVIEW'"
        lines.append(f"UPDATE public.products SET image_url = {img_val}, image_status = {status_val}, updated_at = NOW() WHERE id = '{pid}';")

with open('supabase/migrations/20261003000003_update_all_product_images.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print('Cleaned 20261003000003_update_all_product_images.sql successfully.')
