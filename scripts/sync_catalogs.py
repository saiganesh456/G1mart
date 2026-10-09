import json

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    migrated_prods = json.load(f)

migrated_map = {p["id"]: p for p in migrated_prods}

with open("src/data/legacyIdMap.json", "r", encoding="utf-8") as f:
    legacy_map = json.load(f)

with open("src/data/products-catalog.json", "r", encoding="utf-8") as f:
    catalog = json.load(f)

updated_count = 0
for item in catalog:
    cid = item.get("id")
    # Resolve to migrated id
    mig_id = legacy_map.get(cid, cid)
    mig = migrated_map.get(mig_id)
    if mig:
        item["imageUrl"] = mig["image_url"]
        item["image"] = mig["image_url"]
        item["image_url"] = mig["image_url"]
        item["image_path"] = mig["image_url"]
        item["imageStatus"] = "VERIFIED"
        item["image_status"] = "VERIFIED"
        item["category"] = mig.get("category_id") or item.get("category")
        item["subCategory"] = mig.get("sub_category") or item.get("subCategory")
        updated_count += 1

with open("src/data/products-catalog.json", "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2)

print(f"Synchronized {updated_count} / {len(catalog)} products in src/data/products-catalog.json!")
