import json
import re

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

def classify_product(p):
    name = (p.get("name") or "").strip()
    brand = (p.get("brand") or "").strip()
    text = f"{name} {brand}".lower()
    
    # Check pooja items first
    if any(w in text for w in ["agarbathi", "agarbatti", "agarbathies", "dhoop", "camphor", "karpooram", "sambrani", "pooja"]):
        return "pooja-needs", "Pooja Needs"

    # Clinic Plus / Shampoo / Hair Care
    if any(w in text for w in ["clinic plus", "shampoo", "conditioner", "vatika", "head & shoulders", "pantene", "hair oil", "parachute advansed"]):
        return "hair-care", "Hair Care"

    # Oral care
    if any(w in text for w in ["toothpaste", "toothbrush", "colgate", "close up", "pepsodent", "sensodyne", "mouthwash"]):
        return "oral-care", "Oral Care"

    # Baby care
    if any(w in text for w in ["baby soap", "baby cream", "baby powder", "baby oil", "baby shampoo", "huggies", "mamy poko", "pampers", "diaper", "baby 75"]):
        return "baby-care", "Baby Care"

    # Mysore Sandal / Soaps
    if any(w in text for w in ["mysore sandal", "soap", "soaps", "body wash", "shower gel", "handwash", "hand wash", "cinthol", "medimix", "lux", "pears", "dettol", "lifebuoy", "vivel"]):
        if not any(k in text for k in ["dishwash", "detergent", "laundry", "bar dishwash", "vim", "exo", "agarbathi", "agarbatti", "talc", "powder"]):
            return "soaps-bath", "Bathing Soaps"

    # Skin Care & Talcum Powder
    if any(w in text for w in ["talc", "talcum", "body powder", "face wash", "cream", "cold cream", "lotion", "moisturizer", "ponds", "yardley", "fair & lovely", "glow & lovely", "vaseline"]):
        if not any(k in text for k in ["ice cream", "icecream", "biscuit", "vermicelli"]):
            return "skin-care", "Skin Care & Talc"

    # Laundry
    if any(w in text for w in ["detergent", "surf excel", "ariel", "tide", "rin", "wheel", "ujala", "fabric conditioner", "comfort", "liquid detergent"]):
        return "laundry-detergents", "Laundry & Detergents"

    # Dishwash
    if any(w in text for w in ["dishwash", "vim", "exo", "pril", "scrubber", "scrub pad"]):
        return "dishwash", "Dishwash"

    # Floor Cleaners
    if any(w in text for w in ["lizol", "colin", "harpic", "floor cleaner", "toilet cleaner", "glass cleaner", "domex", "mosquito", "goodknight", "all out", "hit", "freshnol", "kleenoi"]):
        return "floor-surface-cleaners", "Cleaners"

    # Salt & Sugar & Staples
    if any(w in text for w in ["crystal salt", "salt", "sugar", "jaggery", "bellam", "cooking soda", "baking soda", "tata salt", "aashirvaad salt", "rock salt"]):
        if not any(k in text for k in ["peanut", "peanuts", "chips", "namkeen"]):
            return "sugar-salt-staples", "Sugar, Salt & Staples"

    # Dry fruits & Nuts
    if any(w in text for w in ["jedipappu", "jeedi pappu", "cashew", "kaju", "badam", "almond", "pista", "raisin", "kishmish", "walnut", "makhana", "dry fruits"]):
        return "dry-fruits-cereals", "Dry Fruits & Nuts"

    # Chips & Namkeen
    if any(w in text for w in ["khatta meetha", "namkeen", "chips", "kurkure", "lays", "bingo", "mad angles", "mixture", "sev", "murukku", "salted peanuts", "verusenaga", "tulasi peanut"]):
        if not any(k in text for k in ["chikki"]):
            return "chips-namkeen", "Chips & Namkeen"

    # Sweets & Chocolates
    if any(w in text for w in ["chikki", "peanut balls", "chocolate", "dairy milk", "5 star", "munch", "kitkat", "perk", "mysore pak", "mysore pack", "soan papdi", "gulab jamun", "candy"]):
        return "sweets-chocolates", "Sweets & Chocolates"

    # Biscuits
    if any(w in text for w in ["biscuit", "biscuits", "cookies", "wafer", "waffer", "rusk", "bourbon", "good day", "parle-g", "monaco", "krackjack", "marie", "unibic"]):
        return "biscuits-bakery", "Biscuits & Bakery"

    # Soft Drinks
    if any(w in text for w in ["frooti", "maaza", "slice", "thums up", "coca cola", "coke", "sprite", "fanta", "mirinda", "pepsi", "7up", "juice", "energy drink", "sting", "red bull", "appy fizz", "limca"]):
        return "drinks-juices", "Drinks & Juices"

    # Tea / Coffee
    if any(w in text for w in ["tea", "chai", "coffee", "bru", "nescafe", "red label", "taj mahal", "wagh bakri", "horlicks", "boost", "bournvita", "3 roses"]):
        return "tea-coffee-milk-drinks", "Tea, Coffee & Drinks"

    # Instant Food & Vermicelli
    if any(w in text for w in ["vermicilli", "vermicelli", "semiya", "noodles", "maggi", "yippee", "pasta", "macaroni", "instant mix", "soup", "knorr"]):
        return "instant-food", "Instant Food & Vermicelli"

    # Sauces
    if any(w in text for w in ["ketchup", "sauce", "jam", "mayonnaise", "peanut butter"]):
        return "sauces-spreads", "Sauces & Spreads"

    # Dairy
    if any(w in text for w in ["milk", "curd", "dahi", "paneer", "butter", "cheese", "bread", "pav", "egg", "eggs", "arun icecreams", "ice cream", "icecream", "amul"]):
        return "dairy-bread-eggs", "Dairy, Bread & Eggs"

    # Spices / Oils
    if any(w in text for w in ["pepper powder", "dalchini", "cinnamon", "clove", "lavang", "elaichi", "cardamom", "jeera", "cumin", "mustard", "aavaalu", "menthulu", "fenugreek", "turmeric", "haldi", "chilli powder", "mirchi powder", "coriander powder", "dhania", "garam masala", "chicken masala", "mutton masala", "biryani masala", "fried rice masala", "sambar powder", "rasam powder", "ginger garlic paste", "pappula podi", "sunflower oil", "groundnut oil", "cooking oil", "edible oil", "oil", "ghee", "freedom"]):
        return "oil-ghee-masala", "Spices, Masalas & Oils"

    # Atta, Rice, Dal & Grains (PURE STAPLES)
    if any(w in text for w in ["atta", "wheat", "godhumalu", "rice", "basmati", "raw rice", "boiled rice", "sona masoori", "kandi pappu", "toor dal", "moong dal", "moong dall", "urad dal", "minapappu", "chana dal", "senagapappu", "pachisenagapappu", "pachisenga pappu", "rajma", "chole", "senagalu", "kabuli senagalu", "nalla senagalu", "rava", "ravva", "sooji", "suji", "bansi", "bansi ravva", "idli rava", "idly ravva", "idil rava", "dansi rava", "maida", "besan", "rice flour", "corn flour", "poha", "atukulu", "flattened rice", "millet", "korralu", "ragi", "jowar", "alasandalu", "sai pappu", "telagapindi"]):
        return "atta-rice-dal", "Atta, Rice & Dals"

    curr_cat = p.get("category_id") or p.get("category") or "hygiene"
    return curr_cat, p.get("sub_category") or "General"

changed = 0
for p in products:
    new_cat, new_sub = classify_product(p)
    old_cat = p.get("category_id")
    if new_cat != old_cat:
        changed += 1
        p["category_id"] = new_cat
        p["category"] = new_cat
        p["sub_category"] = new_sub
        p["subCategory"] = new_sub

print(f"Correctly reclassified {changed} products.")

atta_products = [p for p in products if p.get("category_id") == "atta-rice-dal"]
print(f"\nAtta, Rice & Dal now has {len(atta_products)} strictly staple products:")
for p in atta_products:
    print(f"  {p['id']} | {p['name']} | brand: {p.get('brand')}")

with open("data/migrated_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

print("\nSaved data/migrated_products.json successfully!")
