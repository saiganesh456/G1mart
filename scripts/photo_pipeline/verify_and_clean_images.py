import json
import os
import csv

CATALOG_PATH = "data/migrated_products.json"
HERO_LIST_CSV = "audit/hero-shot-list.csv"
HERO_LIST_ROOT_CSV = "../audit/hero-shot-list.csv"

# Products to revert because match was ambiguous / foreign variant
TO_REVERT = ["g1-p0192", "g1-p0603", "g1-p0058"]

def clean():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    for p in catalog:
        if p["id"] in TO_REVERT:
            p["image_status"] = "missing"
            p["image_url"] = None
            p["image_source"] = None
            p["image_license"] = None
            img_path = f"public/products/verified/{p['id']}.webp"
            if os.path.exists(img_path):
                os.remove(img_path)
                print(f"Removed dubious photo: {img_path}")

    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Sync hero list CSV
    with open(HERO_LIST_CSV, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for r in rows:
        if r["product_id"] in TO_REVERT:
            r["done"] = "false"

    with open(HERO_LIST_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["category", "sub-category", "brand", "product_id", "name", "size", "done"])
        writer.writeheader()
        writer.writerows(rows)

    if os.path.exists("../audit"):
        with open(HERO_LIST_ROOT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["category", "sub-category", "brand", "product_id", "name", "size", "done"])
            writer.writeheader()
            writer.writerows(rows)

    print("Cleaned up hero list and catalog successfully.")

if __name__ == "__main__":
    clean()
