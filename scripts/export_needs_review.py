import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

needs_review = [p for p in catalog if (p.get('imageStatus') or p.get('image_status')) == 'NEEDS_REVIEW']
print(f"Total NEEDS_REVIEW items: {len(needs_review)}")

with open('data/needs_review_analysis.json', 'w', encoding='utf-8') as f:
    json.dump([{
        'item_no': p.get('sourceItemNo'),
        'id': p.get('id'),
        'source_name': p.get('sourceName', p.get('name')),
        'display_name': p.get('name'),
        'brand': p.get('brand'),
        'variant': p.get('variant'),
        'category': p.get('category')
    } for p in needs_review], f, indent=2)

print("Saved data/needs_review_analysis.json")
