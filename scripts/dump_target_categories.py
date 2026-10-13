import json

cat = json.load(open('src/data/products-catalog.json', encoding='utf-8'))
categories = [
    'biscuits-bakery',
    'chips-namkeen',
    'sweets-chocolates',
    'drinks-juices',
    'tea-coffee-milk-drinks',
    'dairy-bread-eggs',
    'instant-food'
]

with open('audit_current_target_categories.txt', 'w', encoding='utf-8') as out:
    for c in categories:
        prods = [p for p in cat if p.get('category_id') == c]
        out.write(f"\n=======================================================\n")
        out.write(f"CATEGORY: {c} (Total: {len(prods)} products)\n")
        out.write(f"=======================================================\n")
        
        # Group by subcategory
        by_sub = {}
        for p in prods:
            sub = p.get('sub_category') or p.get('subCategory') or 'Unassigned'
            by_sub.setdefault(sub, []).append(p)
            
        for sub, plist in by_sub.items():
            out.write(f"\n--- Subcategory: {sub} ({len(plist)} products) ---\n")
            for p in plist:
                mrp = p.get('mrp', 0)
                price = p.get('price', 0)
                brand = p.get('brand', 'Unknown')
                img = p.get('image_url', '')
                status = p.get('image_status', 'unverified')
                out.write(f"[{p['id']}] {p['name']} | Brand: {brand} | MRP: Rs.{mrp} | Price: Rs.{price} | Img: {img} ({status})\n")

print("Generated audit_current_target_categories.txt")
