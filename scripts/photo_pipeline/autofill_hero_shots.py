import os
import sys
import json
import csv
import requests
import difflib

try:
    from photo_pipeline.image_processor import process_product_image
except ImportError:
    from image_processor import process_product_image

CATALOG_PATH = "data/migrated_products.json"
HERO_LIST_CSV = "audit/hero-shot-list.csv"
HERO_LIST_ROOT_CSV = "../audit/hero-shot-list.csv"
OUTPUT_DIR = "public/products/verified"

HEADERS = {
    "User-Agent": "G1MartStorefront/1.0 (contact@g1mart.local)"
}

# Free-licence verified images for LOOSE produce / eggs only (Wikimedia Commons / Unsplash CC0 / Public Domain)
LOOSE_PRODUCE_MAP = {
    "g1-p0236": {  # Onions
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/800px-Onion_on_White.JPG",
        "source": "Wikimedia Commons",
        "license": "CC-BY-SA 3.0",
        "attribution": "Colin / Wikimedia Commons"
    },
    "g1-p0703": {  # Mango Fruit / Fresh Fruit
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Haden_mango_al.jpg/800px-Haden_mango_al.jpg",
        "source": "Wikimedia Commons",
        "license": "Public Domain",
        "attribution": "USDA / Wikimedia Commons"
    }
}

def search_open_food_facts(brand, name, barcode=None):
    if barcode:
        try:
            r = requests.get(f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json", headers=HEADERS, timeout=6)
            if r.status_code == 200:
                d = r.json()
                if d.get('status') == 1 and 'product' in d:
                    p = d['product']
                    img = p.get('image_front_url') or p.get('image_url')
                    if img:
                        return {
                            "image_url": img,
                            "name": p.get("product_name", name),
                            "source": "Open Food Facts",
                            "license": "ODbL / CC-BY-SA 3.0",
                            "confidence": 1.0,
                            "attribution": f"Open Food Facts contributor ({p.get('creator', 'community')})"
                        }
        except Exception:
            pass

    # Search by brand + name
    query = f"{brand} {name}".replace("1 unit", "").replace("Bag", "").strip()
    try:
        r = requests.get("https://world.openfoodfacts.org/cgi/search.pl", params={
            "search_terms": query,
            "search_simple": "1",
            "action": "process",
            "json": "1",
            "page_size": "5"
        }, headers=HEADERS, timeout=8)
        if r.status_code == 200:
            products = r.json().get('products', [])
            for p in products:
                img = p.get('image_front_url') or p.get('image_url')
                if not img:
                    continue
                cand_name = p.get('product_name', '')
                cand_brand = p.get('brands', '')
                cand_full = f"{cand_brand} {cand_name}".lower()
                target_full = f"{brand} {name}".lower()

                # Clean comparison
                sim = difflib.SequenceMatcher(None, target_full, cand_full).ratio()
                # Also check token overlap
                target_tokens = set([w for w in target_full.split() if len(w) > 2])
                cand_tokens = set([w for w in cand_full.split() if len(w) > 2])
                token_sim = len(target_tokens.intersection(cand_tokens)) / max(1, len(target_tokens))

                if sim >= 0.75 or token_sim >= 0.70:
                    return {
                        "image_url": img,
                        "name": cand_name,
                        "source": "Open Food Facts",
                        "license": "ODbL / CC-BY-SA 3.0",
                        "confidence": round(max(sim, token_sim), 3),
                        "attribution": f"Open Food Facts ({cand_brand})"
                    }
    except Exception as e:
        print(f"OFF search error for {query}: {e}")

    return None

def run_autofill():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    catalog_map = {p["id"]: p for p in catalog}

    with open(HERO_LIST_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    updated_count = 0

    for row in reader:
        pid = row["product_id"]
        prod = catalog_map.get(pid)
        if not prod:
            continue

        # If already verified on disk, make sure row is marked done
        existing_path = os.path.join(OUTPUT_DIR, f"{pid}.webp")
        if os.path.exists(existing_path) and os.path.getsize(existing_path) > 1000:
            row["done"] = "true"
            prod["image_url"] = f"/products/verified/{pid}.webp"
            prod["image_status"] = "verified"
            continue

        # 1. Check loose produce map
        if pid in LOOSE_PRODUCE_MAP:
            info = LOOSE_PRODUCE_MAP[pid]
            try:
                print(f"Fetching loose produce photo for {pid} ({row['name']})...")
                res = requests.get(info["url"], headers=HEADERS, timeout=12)
                if res.status_code == 200:
                    out_path = os.path.join(OUTPUT_DIR, f"{pid}.webp")
                    process_product_image(res.content, out_path)
                    prod["image_url"] = f"/products/verified/{pid}.webp"
                    prod["image_status"] = "verified"
                    prod["image_source"] = info["source"]
                    prod["image_license"] = info["license"]
                    prod["image_attribution"] = info["attribution"]
                    row["done"] = "true"
                    updated_count += 1
                    print(f"   Successfully verified {pid}")
            except Exception as e:
                print(f"Failed to fetch loose produce {pid}: {e}")
            continue

        # 2. Check Open Food Facts for hero shots
        # Only query for top items if not yet done
        if row["done"] != "true":
            brand = row["brand"]
            name = row["name"]
            barcode = prod.get("barcode")
            match = search_open_food_facts(brand, name, barcode)
            if match and match["confidence"] >= 0.70:
                print(f"Matched {pid} ({brand} {name}) on OFF -> {match['name']} (conf {match['confidence']})")
                try:
                    res = requests.get(match["image_url"], headers=HEADERS, timeout=12)
                    if res.status_code == 200:
                        out_path = os.path.join(OUTPUT_DIR, f"{pid}.webp")
                        process_product_image(res.content, out_path)
                        prod["image_url"] = f"/products/verified/{pid}.webp"
                        prod["image_status"] = "verified"
                        prod["image_source"] = match["source"]
                        prod["image_license"] = match["license"]
                        prod["image_attribution"] = match["attribution"]
                        row["done"] = "true"
                        updated_count += 1
                        print(f"   Saved WebP 800x800 for {pid}")
                except Exception as e:
                    print(f"Failed to download/process {pid}: {e}")

    # Save catalog
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Save hero list
    with open(HERO_LIST_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["category", "sub-category", "brand", "product_id", "name", "size", "done"])
        writer.writeheader()
        writer.writerows(reader)

    if os.path.exists("../audit"):
        with open(HERO_LIST_ROOT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["category", "sub-category", "brand", "product_id", "name", "size", "done"])
            writer.writeheader()
            writer.writerows(reader)

    print(f"Autofill finished! Newly verified: {updated_count}")

if __name__ == "__main__":
    run_autofill()
