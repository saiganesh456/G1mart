import os
import sys
import json
import requests
import difflib
try:
    from photo_pipeline.image_processor import process_product_image
except ImportError:
    from image_processor import process_product_image

sys.stdout.reconfigure(encoding='utf-8')

API_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl"
API_BARCODE = "https://world.openfoodfacts.org/api/v0/product/{barcode}.json"

def search_open_food_facts(brand, name, barcode=None):
    """
    Search Open Food Facts API for confident match.
    Only returns match if barcode matches or fuzzy brand+name similarity >= 0.82.
    """
    headers = {
        "User-Agent": "G1MartCatalog/1.0 (catalog@g1mart.local)"
    }

    # 1. Try barcode lookup first
    if barcode:
        try:
            resp = requests.get(API_BARCODE.format(barcode=barcode), headers=headers, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('status') == 1 and 'product' in data:
                    p = data['product']
                    img_url = p.get('image_front_url') or p.get('image_url')
                    if img_url:
                        return {
                            'image_url': img_url,
                            'matched_name': p.get('product_name', name),
                            'source': 'Open Food Facts',
                            'license': 'Open Database License (ODbL) / CC-BY-SA 3.0',
                            'confidence': 1.0,
                            'barcode': barcode
                        }
        except Exception as e:
            print(f"Barcode search error: {e}")

    # 2. Try text search
    query = f"{brand} {name}".strip()
    params = {
        "search_terms": query,
        "search_simple": "1",
        "action": "process",
        "json": "1",
        "page_size": "5"
    }

    try:
        resp = requests.get(API_SEARCH, params=params, headers=headers, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            for p in products:
                off_name = p.get('product_name', '')
                off_brand = p.get('brands', '')
                img_url = p.get('image_front_url') or p.get('image_url')

                if not img_url or not off_name:
                    continue

                # Fuzzy match validation
                target_str = f"{brand.lower()} {name.lower()}"
                cand_str = f"{off_brand.lower()} {off_name.lower()}"
                sim = difflib.SequenceMatcher(None, target_str, cand_str).ratio()

                if sim >= 0.80:
                    return {
                        'image_url': img_url,
                        'matched_name': off_name,
                        'source': 'Open Food Facts',
                        'license': 'Open Database License (ODbL) / CC-BY-SA 3.0',
                        'confidence': round(sim, 3),
                        'barcode': p.get('code')
                    }
    except Exception as e:
        print(f"Search error: {e}")

    return None

def fetch_and_process_product(product_id, brand, name, barcode=None, output_dir="public/products/verified"):
    match = search_open_food_facts(brand, name, barcode)
    if not match:
        return None

    img_url = match['image_url']
    print(f"Matched {product_id} with Open Food Facts: {match['matched_name']} (Confidence: {match['confidence']})")

    # Download image bytes
    resp = requests.get(img_url, timeout=10)
    if resp.status_code != 200:
        return None

    out_file = os.path.join(output_dir, f"{product_id}.webp")
    process_product_image(resp.content, out_file)
    
    match['local_webp_path'] = f"/products/verified/{product_id}.webp"
    return match

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python fetch_open_food_facts.py <brand> <name> [barcode] [product_id]")
        sys.exit(1)
    brand = sys.argv[1]
    name = sys.argv[2]
    barcode = sys.argv[3] if len(sys.argv) > 3 else None
    pid = sys.argv[4] if len(sys.argv) > 4 else "test_product"
    
    res = fetch_and_process_product(pid, brand, name, barcode)
    if res:
        print("Successfully processed:", json.dumps(res, indent=2))
    else:
        print("No confident match found on Open Food Facts.")
