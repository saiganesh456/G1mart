import json
import os
import re

with open("data/migrated_brands.json", "r", encoding="utf-8") as f:
    brands = json.load(f)

brand_files = os.listdir("public/brands")

def slugify(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

updated = 0
for b in brands:
    name = b["name"]
    slug = slugify(name)
    fname = f"{slug}.png"
    if fname in brand_files:
        b["logo_url"] = f"/brands/{fname}"
        updated += 1
    else:
        # Try matching prefixes or known aliases
        match = None
        for bf in brand_files:
            b_base = bf.replace(".png", "")
            if b_base in slug or slug in b_base:
                match = bf
                break
        if match:
            b["logo_url"] = f"/brands/{match}"
            updated += 1

print(f"Updated {updated} / {len(brands)} brands with logo_url in migrated_brands.json")

with open("data/migrated_brands.json", "w", encoding="utf-8") as f:
    json.dump(brands, f, indent=2)
