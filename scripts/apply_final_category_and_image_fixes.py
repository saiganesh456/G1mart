import json

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# Category reclassifications
CAT_FIXES = {
    # Dishwash items that were accidentally put in biscuits
    'g1-p0306': 'dishwash',             # VIM Neem Clean
    'g1-p0307': 'dishwash',             # VIM Power OF 100lemons
    'g1-p0308': 'tea-coffee-milk-drinks', # Horlicks Womens Plus Caramel
    'g1-p0449': 'instant-food',         # Eno
    
    # Cookies mistakenly categorized under dry-fruits-cereals
    'g1-p0210': 'biscuits-bakery',      # Unibic Cashew
    'g1-p0323': 'biscuits-bakery',      # Unibic Pista Badam
    'g1-p0410': 'biscuits-bakery',      # Unibic Cashew Badam
    'g1-p0507': 'biscuits-bakery',      # Unibic Free Cashew
    'g1-p0969': 'biscuits-bakery',      # Unibic Casew Badam
    'g1-p0805': 'biscuits-bakery',      # Moms Magic Cashew&almond
    'g1-p0820': 'biscuits-bakery',      # Sunfeast Fantastik Choco Almond
    'g1-p0822': 'biscuits-bakery',      # Sunfeast Fantastik Roast & Almond
    'g1-p0938': 'biscuits-bakery',      # Moms Magic Cashew& Almond
    
    # Hair oils / Pooja oils mistakenly in cooking oils (oil-ghee-masala)
    'g1-p0008': 'hair-care',            # Kesh King Oil 100ml
    'g1-p0268': 'hair-care',            # Meera Oile250g
    'g1-p0373': 'hair-care',            # Amla OIL
    'g1-p0430': 'hair-care',            # Dabour Amla Oil
    'g1-p0655': 'hair-care',            # Castor OIL
    'g1-p0766': 'hair-care',            # Navaratna OIL
    'g1-p0670': 'pooja-needs',          # JS Oile Deepam
}

# Specific image corrections
IMAGE_FIXES = {
    'g1-p0001': '/products/verified/g1-p0001.webp', # Unibic Wafer (new)
    'g1-p0026': '/products/verified/g1-p0026.webp', # Parle-G Gluco (restored original Parle-G)
    'g1-p0213': '/products/verified/g1-p0213.webp', # Unbic Wafer
    'g1-p0672': '/products/verified/g1-p0673.webp', # Fried Rice Masala (use Masala packshot instead of rice grain)
    'g1-p0997': '/products/verified/g1-p0874.webp', # Vijaya Groundnut OIL (use oil packshot instead of whole groundnuts)
    'g1-p0041': '/products/generated_pouches/g1_dry_nuts_bowl.webp',
    'g1-p0003': '/products/generated_pouches/g1_pepper_powder_pouch.webp',
    'g1-p0042': '/products/generated_pouches/g1_elaichi_pouch.webp',
    'g1-p0418': '/products/verified/g1-p0418.webp', # Freedom Oil Bottle
}

for p in products:
    pid = p['id']
    if pid in CAT_FIXES:
        p['category_id'] = CAT_FIXES[pid]
        p['category'] = CAT_FIXES[pid]
    if pid in IMAGE_FIXES:
        p['image_url'] = IMAGE_FIXES[pid]
        p['imageUrl'] = IMAGE_FIXES[pid]
        p['image'] = IMAGE_FIXES[pid]

with open("data/migrated_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

with open("src/data/products-catalog.json", "r", encoding="utf-8") as f:
    catalog = json.load(f)

for p in products:
    cat_item = next((x for x in catalog if x['id'] == p['id']), None)
    if cat_item:
        cat_item['image_url'] = p['image_url']
        cat_item['imageUrl'] = p['image_url']
        cat_item['image'] = p['image_url']
        cat_item['category_id'] = p['category_id']
        cat_item['category'] = p['category_id']

with open("src/data/products-catalog.json", "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2)

print("Applied precise category and image fixes across all catalogs!")
