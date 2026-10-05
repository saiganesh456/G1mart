import json

with open('src/data/products-catalog.json', 'r', encoding='utf-8') as f:
    cat = json.load(f)

print('Total products in catalog:', len(cat))
status_counts = {}
verified_real = []
needs_review = []
unmatched = []
missing = []

for p in cat:
    s = p.get('imageStatus')
    status_counts[s] = status_counts.get(s, 0) + 1
    if s == 'VERIFIED':
        verified_real.append(p)
    elif s == 'NEEDS_REVIEW':
        needs_review.append(p)
    elif s == 'UNMATCHED':
        unmatched.append(p)
    else:
        missing.append(p)

print('Status distribution:', status_counts)
print('Verified real images count:', len(verified_real))
print('Needs review count:', len(needs_review))
print('Unmatched count:', len(unmatched))
print('Missing count:', len(missing))

print('\nVerified products sample (all verified):')
for p in verified_real:
    ino = p.get('sourceItemNo')
    name = p.get('name')
    url = p.get('imageUrl')
    mrp = p.get('originalPrice')
    print(f"[{ino:03d}] {name} | MRP: {mrp} | URL: {url}")
