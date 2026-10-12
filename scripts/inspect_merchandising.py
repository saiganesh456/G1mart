import json

with open('data/migrated_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

with open('data/migrated_brands.json', 'r', encoding='utf-8') as f:
    brands = json.load(f)

brand_id_to_name = {b['id']: b['name'] for b in brands}

# Add brand name to products
for p in products:
    p['brand_name'] = brand_id_to_name.get(p.get('brand_id'), '')

keywords = [
    "lays", "kurkure", "maggi", "kitkat", "5 star", "5star", "parle-g", "parle g", "oreo", "yippee", "top ramen",
    "daawat", "annapurna", "tata sampann", "24 mantra", "everest", "mdh", "mother", "madhur",
    "happilo", "nutraj", "dodla", "hit", "cycle", "shubh", "axe", "listerine", "tata tea", "red label", "bru", "horlicks",
    "bournvita", "boost", "good knight"
]

print("--- Keyword search in product names ---")
for kw in keywords:
    matches = [p for p in products if kw in p['name'].lower() or kw in p['brand_name'].lower()]
    print(f"Keyword '{kw}': {len(matches)} matches")
    for m in matches[:3]:
        print(f"   [{m['id']}] cat: {m.get('category_id')} | brand: {m['brand_name']} | name: {m['name']} | img: {m.get('image_url')}")
