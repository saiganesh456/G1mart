import json
import csv
import os
import re

CATALOG_PATH = "data/migrated_products.json"
CATEGORIES_PATH = "data/migrated_categories.json"
HERO_LIST_CSV = "audit/hero-shot-list.csv"
HERO_LIST_ROOT_CSV = "../audit/hero-shot-list.csv"

# Guide keywords for categories from prompt
GUIDE = {
    "vegetables-fruits": ["onion", "tomato", "potato", "banana"],
    "atta-rice-dal": ["aashirvaad", "toor dal", "rice", "urad dal"],
    "oil-ghee-masala": ["fortune", "aachi chilli", "garam masala", "ghee"],
    "dairy-bread-eggs": ["egg", "milk", "bread", "butter"],
    "dry-fruits-cereals": ["cashew", "almond", "raisin", "corn flakes"],
    "sugar-salt-staples": ["tata salt", "crystal salt", "sugar", "jaggery"],
    "chips-namkeen": ["kurkure", "bingo", "makhana", "bhujia"],
    "biscuits-bakery": ["parle-g", "good day", "unibic", "bourbon"],
    "sweets-chocolates": ["dairy milk", "5 star", "gems", "chikki"],
    "drinks-juices": ["thums up", "frooti", "maaza", "sprite"],
    "tea-coffee-milk-drinks": ["wagh bakri", "bru", "nescafe", "horlicks"],
    "instant-food": ["maggi 2-minute", "maggi masala", "knorr", "noodles"],
    "sauces-spreads": ["kissan jam", "peanut butter", "ketchup", "pickle"],
    "laundry": ["surf excel", "ariel", "tide", "fab"],
    "dishwash": ["vim bar", "vim gel", "exo", "pril"],
    "pooja-needs": ["agarbatti", "camphor", "dhoop", "pooja oil"],
    "soaps-bath": ["santoor", "lux", "dettol", "dove"],
    "hair-care": ["parachute", "dabur amla", "meera", "kesh king"],
    "oral-care": ["colgate maxfresh", "colgate vedshakti", "toothbrush", "mouthwash"],
    "baby-care": ["pampers", "johnson", "himalaya", "cerelac"],
    "feminine-hygiene": ["whisper", "stayfree", "sofy", "sanitary"],
    "floor-surface-cleaners": ["lizol", "harpic", "colin", "domex"],
    "bath-body": ["body wash", "dettol", "pears", "lotion"],
    "skin-face": ["face wash", "pond", "fair & lovely", "vaseline"],
}

def build_hero_list():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    with open(CATEGORIES_PATH, "r", encoding="utf-8") as f:
        categories = json.load(f)

    cat_map = {c["id"]: c for c in categories}
    prods_by_cat = {}
    for p in products:
        c_id = p.get("category") or p.get("category_id")
        prods_by_cat.setdefault(c_id, []).append(p)

    hero_entries = []
    seen_product_ids = set()

    for cat in categories:
        c_id = cat["id"]
        c_name = cat["name"]
        cat_prods = prods_by_cat.get(c_id, [])
        if not cat_prods:
            continue

        selected_for_cat = []

        # 1. Match guide keywords
        keywords = GUIDE.get(c_id, [])
        for kw in keywords:
            kw_clean = kw.lower()
            matched = None
            # Check products in this category
            for p in cat_prods:
                p_text = f"{p.get('brand', '')} {p.get('name', '')}".lower()
                if kw_clean in p_text and p["id"] not in seen_product_ids:
                    matched = p
                    break
            if not matched:
                # Fuzzy word match
                words = kw_clean.split()
                for p in cat_prods:
                    p_text = f"{p.get('brand', '')} {p.get('name', '')}".lower()
                    if all(w in p_text for w in words) and p["id"] not in seen_product_ids:
                        matched = p
                        break
            if matched:
                selected_for_cat.append(matched)
                seen_product_ids.add(matched["id"])

        # If fewer than 4 matched, fill with top/popular products in category
        if len(selected_for_cat) < 4:
            for p in cat_prods:
                if p["id"] not in seen_product_ids:
                    selected_for_cat.append(p)
                    seen_product_ids.add(p["id"])
                    if len(selected_for_cat) >= 4:
                        break

        # Record the 4 hero shots
        for p in selected_for_cat[:4]:
            is_done = p.get("image_status") == "verified"
            hero_entries.append({
                "category": c_name,
                "sub-category": p.get("subCategory") or p.get("category_name") or "",
                "brand": p.get("brand") or "Local / Unbranded",
                "product_id": p["id"],
                "name": p["name"],
                "size": p.get("unit") or "1 unit",
                "done": "true" if is_done else "false"
            })

        # 2. ALSO add top product of every brand shown in left brand rail (max 8 brands per category)
        brand_counts = {}
        for p in cat_prods:
            b = p.get("brand")
            if b and b not in ["G1 Mart", "G1 Mart Fresh", "Local / Unbranded"]:
                brand_counts[b] = brand_counts.get(b, 0) + 1

        top_brands = sorted(brand_counts.keys(), key=lambda b: brand_counts[b], reverse=True)[:8]
        for b in top_brands:
            # Find the top product for this brand
            brand_prods = [p for p in cat_prods if p.get("brand") == b]
            # Prefer popular or verified if any
            brand_prods.sort(key=lambda p: (1 if p.get("image_status") == "verified" else 0, 1 if p.get("isPopular") else 0), reverse=True)
            top_p = brand_prods[0]
            if top_p["id"] not in seen_product_ids:
                seen_product_ids.add(top_p["id"])
                is_done = top_p.get("image_status") == "verified"
                hero_entries.append({
                    "category": c_name,
                    "sub-category": top_p.get("subCategory") or "",
                    "brand": top_p.get("brand") or "",
                    "product_id": top_p["id"],
                    "name": top_p["name"],
                    "size": top_p.get("unit") or "1 unit",
                    "done": "true" if is_done else "false"
                })

    # Write CSV
    os.makedirs("audit", exist_ok=True)
    with open(HERO_LIST_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["category", "sub-category", "brand", "product_id", "name", "size", "done"])
        writer.writeheader()
        writer.writerows(hero_entries)

    # Also sync to root ../audit if present
    if os.path.exists("../audit"):
        with open(HERO_LIST_ROOT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["category", "sub-category", "brand", "product_id", "name", "size", "done"])
            writer.writeheader()
            writer.writerows(hero_entries)

    print(f"Generated {len(hero_entries)} entries in {HERO_LIST_CSV}")

if __name__ == "__main__":
    build_hero_list()
