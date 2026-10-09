import os, json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

packshot_dir = 'public/products/packshots'
files = sorted(os.listdir(packshot_dir))
base_names = sorted(set(os.path.splitext(f)[0] for f in files if f.endswith(('.jpg', '.png'))))

print(f'Total packshot base names: {len(base_names)}')
for b in base_names:
    pass
