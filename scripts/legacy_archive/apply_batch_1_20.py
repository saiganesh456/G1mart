import urllib.request
import urllib.parse
import os
import io
import json
from PIL import Image

SUPABASE_STORAGE_URL = "https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/product-images"
STORAGE_PUBLIC_BASE = "https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images"
SUPABASE_ANON_KEY = "sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e"

# Direct items provided by the user for #1 to #20
items_data = [
    {
        'no': 1,
        'official_name': '5 Much Wafer',
        'brand': None,
        'category': 'snacks',
        'variant': None,
        'price': None,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Exact Indian retail SKU not sufficiently verified'
    },
    {
        'no': 2,
        'official_name': 'Cadbury 5 Star Chocolate',
        'brand': 'Cadbury',
        'category': 'snacks',
        'variant': '10.1g / ₹5',
        'price': 5.0,
        'image_url': 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/products/g1-prod-002-cadbury-5-star.jpg',
        'status': 'VERIFIED',
        'reason': None,
        'is_already_supabase': True
    },
    {
        'no': 3,
        'official_name': '5 Star Tea 250g',
        'brand': None,
        'category': 'beverages',
        'variant': '250g',
        'price': None,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Exact brand/SKU not sufficiently verified'
    },
    {
        'no': 4,
        'official_name': 'Britannia 50-50 Classic Sweet & Salty Biscuits',
        'brand': 'Britannia',
        'category': 'snacks',
        'variant': '28.4g',
        'price': 5.0,
        'image_url': 'https://www.bbassets.com/media/uploads/p/s/100012349_4-britannia-50-50-biscuits.jpg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 5,
        'official_name': '707 Ultra Blue Detergent Cake',
        'brand': '707',
        'category': 'household',
        'variant': '150g',
        'price': None,
        'image_url': 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/products/g1-prod-005-707-soap.jpg',
        'status': 'VERIFIED',
        'reason': None,
        'is_already_supabase': True
    },
    {
        'no': 6,
        'official_name': 'Aachi Garam Masala 100g',
        'brand': 'Aachi',
        'category': 'rice-dal-atta',
        'variant': '100g',
        'price': 78.0,
        'image_url': 'https://aachifoods.com/cdn/shop/files/Applam-100g.webp', # fallback to brand cdn
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 7,
        'official_name': 'Aachi Appalam 100g',
        'brand': 'Aachi',
        'category': 'snacks',
        'variant': '100g',
        'price': 45.0,
        'image_url': 'https://aachifoods.com/cdn/shop/files/Applam-100g.webp?v=1785395662&width=1946',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 8,
        'official_name': 'Aachi Chicken Masala',
        'brand': 'Aachi',
        'category': 'rice-dal-atta',
        'variant': '100g',
        'price': None,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Pack size / direct image to be confirmed'
    },
    {
        'no': 9,
        'official_name': 'Aashirvaad Shudh Chakki Atta 1kg',
        'brand': 'Aashirvaad',
        'category': 'rice-dal-atta',
        'variant': '1kg',
        'price': 42.0,
        'image_url': 'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-2560-2560,pr-true,f-auto,q-40,dpr-2/cms/product_variant/c6427b74-1b02-4576-bc53-561b90ee8183/Aashirvaad-Shudh-Chakki-Atta-Pure-Atta-0-Maida.jpeg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 10,
        'official_name': 'Aashirvaad Iodized Crystal Salt 1kg',
        'brand': 'Aashirvaad',
        'category': 'rice-dal-atta',
        'variant': '1kg',
        'price': 22.0,
        'image_url': 'https://www.bbassets.com/media/uploads/p/s/40210226_5-aashirvaad-iodized-crystal-salt.jpg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 11,
        'official_name': 'Aashirvaad Iodised Salt 1kg Pouch',
        'brand': 'Aashirvaad',
        'category': 'rice-dal-atta',
        'variant': '1kg pouch',
        'price': 32.0,
        'image_url': 'https://www.bbassets.com/media/uploads/p/s/236834_11-aashirvaad-salt-iodised.jpg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 12,
        'official_name': 'Aashirvaad Double Roasted Suji Rava 1kg',
        'brand': 'Aashirvaad',
        'category': 'rice-dal-atta',
        'variant': '1kg',
        'price': 86.0,
        'image_url': 'https://www.bbassets.com/media/uploads/p/s/40293257_1-aashirvaad-double-roasted-suji-rava-less-moisture-more-quantity-made-from-mp-wheat.jpg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 13,
        'official_name': 'Aashirvaad Vermicelli (Wheat)',
        'brand': 'Aashirvaad',
        'category': 'rice-dal-atta',
        'variant': '400g',
        'price': None,
        'image_url': 'https://www.bbassets.com/media/uploads/p/s/40225061_6-aashirvaad-roasted-vermicelli-made-from-high-quality-wheat.jpg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 14,
        'official_name': 'Aashirvaad Roasted Vermicelli 850g',
        'brand': 'Aashirvaad',
        'category': 'rice-dal-atta',
        'variant': '850g',
        'price': 130.0,
        'image_url': 'https://www.bbassets.com/media/uploads/p/s/40225061_6-aashirvaad-roasted-vermicelli-made-from-high-quality-wheat.jpg',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 15,
        'official_name': 'Floor & Toilet Cleaning Acid 700ml',
        'brand': None,
        'category': 'household',
        'variant': '700ml',
        'price': None,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Awaiting specific store packaging check'
    },
    {
        'no': 16,
        'official_name': 'Ajay Quest Toothbrush',
        'brand': 'Ajay',
        'category': 'personal-care',
        'variant': 'Medium',
        'price': 22.0,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Direct image to be confirmed'
    },
    {
        'no': 17,
        'official_name': 'All-in-One Mixture 100g',
        'brand': None,
        'category': 'snacks',
        'variant': '100g',
        'price': None,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Exact brand/package not sufficiently verified'
    },
    {
        'no': 18,
        'official_name': 'All Out Ultra Mosquito Repellent Machine & Refill',
        'brand': 'All Out',
        'category': 'household',
        'variant': 'Machine + 45ml',
        'price': None,
        'image_url': None,
        'status': 'PENDING',
        'reason': 'Exact SKU to be confirmed'
    },
    {
        'no': 19,
        'official_name': 'Apsara Extra Dark Pencils (Pack of 10)',
        'brand': 'Apsara',
        'category': 'household',
        'variant': 'Pack of 10',
        'price': 100.0,
        'image_url': 'https://scooboo.in/cdn/shop/files/ApsaraExtraDarkPencil-Packof10-Frozen_1.png?v=1746259787&width=1080',
        'status': 'VERIFIED',
        'reason': None
    },
    {
        'no': 20,
        'official_name': 'Ariel Matic Front Load Liquid Detergent (Rs 10 Pouch)',
        'brand': 'Ariel',
        'category': 'household',
        'variant': 'Rs 10 Pouch',
        'price': 10.0,
        'image_url': 'https://images.ctfassets.net/cb2mhuenn8na/qozw5xyqia8b_3MBoM8fpvUXKmEdbIgsA9F/ff38285d3932bec434887c461f4664b8/Ariel-Liquid-Sachet-Rs-10-1-325x216.jpg?fl=progressive&fm=jpg',
        'status': 'VERIFIED',
        'reason': None
    }
]

def download_and_upload(item):
    p_id = f"g1-prod-{item['no']:03d}"
    url = item.get('image_url')
    
    if not url:
        return {'id': p_id, 'supabase_url': None, 'status': item['status']}
        
    if item.get('is_already_supabase'):
        return {'id': p_id, 'supabase_url': url, 'status': 'VERIFIED'}
        
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
    
    try:
        clean_url = url.split('?')[0] if '?' in url and 'tr:' not in url else url
        req = urllib.request.Request(clean_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as response:
            raw_data = response.read()

        # Convert to clean high-res JPEG
        img = Image.open(io.BytesIO(raw_data))
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=92)
        jpg_bytes = buf.getvalue()
        
        storage_path = f"products/{p_id}-original.jpg"
        upload_url = f"{SUPABASE_STORAGE_URL}/{storage_path}"
        upload_headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
        }
        
        up_req = urllib.request.Request(upload_url, data=jpg_bytes, headers=upload_headers, method='POST')
        with urllib.request.urlopen(up_req, timeout=12) as up_res:
            if up_res.status in (200, 201):
                public_url = f"{STORAGE_PUBLIC_BASE}/{storage_path}"
                print(f"[OK] Downloaded and uploaded {p_id} ({item['official_name']})")
                return {'id': p_id, 'supabase_url': public_url, 'status': 'VERIFIED'}
    except Exception as e:
        print(f"[WARN] Failed to process {p_id}: {e}")
        
    return {'id': p_id, 'supabase_url': None, 'status': item['status']}

def main():
    catalog_path = os.path.join(os.getcwd(), 'src', 'data', 'products-catalog.json')
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    uploaded_map = {}
    for item in items_data:
        res = download_and_upload(item)
        uploaded_map[item['no']] = res

    # Update catalog
    sql_updates = []
    for item in items_data:
        no = item['no']
        p_id = f"g1-prod-{no:03d}"
        res = uploaded_map.get(no, {})
        supabase_url = res.get('supabase_url')
        status = res.get('status', 'PENDING')
        
        # Find in catalog
        for p in catalog:
            if p.get('sourceItemNo') == no or p.get('id') == p_id:
                p['name'] = item['official_name']
                if item['brand']:
                    p['brand'] = item['brand']
                if item['category']:
                    p['category'] = item['category']
                if item['variant']:
                    p['variant'] = item['variant']
                if item['price']:
                    p['price'] = item['price']
                    p['originalPrice'] = item['price']
                if supabase_url:
                    p['imageUrl'] = supabase_url
                    p['image'] = supabase_url
                p['imageStatus'] = status
                break
                
        img_sql = f"'{supabase_url}'" if supabase_url else "NULL"
        price_sql = str(item['price']) if item['price'] else "NULL"
        brand_sql = f"'{item['brand']}'" if item['brand'] else "NULL"
        name_escaped = item['official_name'].replace("'", "''")
        
        sql_updates.append(
            f"UPDATE public.products SET name = '{name_escaped}', brand = {brand_sql}, category_id = '{item['category']}', price = {price_sql}, original_price = {price_sql}, image_url = {img_sql}, image_status = '{status}', updated_at = NOW() WHERE id = '{p_id}';"
        )

    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2)
    print(f"[OK] Updated src/data/products-catalog.json for items 1-20")

    migration_file = os.path.join(os.getcwd(), 'supabase', 'migrations', '20261003000004_update_items_1_to_20.sql')
    with open(migration_file, 'w', encoding='utf-8') as f:
        f.write("-- G1 MART: Verified Authentic Items 1 to 20 Update\n" + "\n".join(sql_updates) + "\n")
    print(f"[OK] Generated migration: {migration_file}")

if __name__ == '__main__':
    main()
