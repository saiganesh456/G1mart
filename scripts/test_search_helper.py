import os, json

with open('data/migrated_products.json', encoding='utf-8') as f:
    products = json.load(f)

# Helper to find products by keywords
def search_prods(keywords, brand=None, cat_filter=None):
    results = []
    for p in products:
        p_name = p['name'].lower()
        p_brand = (p.get('brand') or '').lower()
        p_cat = (p.get('category_id') or '').lower()
        
        if brand and brand.lower() not in p_brand and brand.lower() not in p_name:
            continue
        if cat_filter and cat_filter.lower() not in p_cat:
            continue
            
        # check all keywords match
        if all(kw.lower() in p_name or kw.lower() in p_brand for kw in keywords):
            results.append(p)
    return results

print('Ready to test searches')
