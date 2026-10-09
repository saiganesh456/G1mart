import json

with open("data/migrated_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products: {len(products)}")

def detect_category(p):
    name = (p.get("name") or "").lower()
    brand = (p.get("brand") or "").lower()
    curr_cat = p.get("category_id") or p.get("category") or ""
    
    # 1. Hair Care
    if any(k in name for k in ["shampoo", "hair oil", "conditioner", "clinic plus", "head & shoulders", "pantene", "vatika", "parachute advansed"]):
        return "hair-care", "Hair Care"
        
    # 2. Oral Care
    if any(k in name for k in ["toothpaste", "toothbrush", "colgate", "close up", "pepsodent", "sensodyne", "dabur red", "tongue cleaner"]):
        return "oral-care", "Oral Care"

    # 3. Soaps & Bath
    if any(k in name for k in ["bathing soap", "soap bar", "body wash", "handwash", "hand wash", "dettol soap", "dove soap", "lux soap", "mysore sandal soap", "santoor soap", "cinthol soap", "pears soap", "lifebuoy soap", "medimix soap", "fiama"]):
        return "soaps-bath", "Bathing Soaps"

    # 4. Laundry & Detergents
    if any(k in name for k in ["detergent", "washing powder", "surf excel", "ariel", "tide", "rin", "wheel", "ujala", "fabric conditioner", "comfort"]):
        return "laundry-detergents", "Detergents & Fabric Care"

    # 5. Dishwash
    if any(k in name for k in ["dishwash", "vim", "exo", "pril", "scrub pad", "scrubber", "sponge"]):
        return "dishwash", "Dishwash"

    # 6. Floor & Surface Cleaners
    if any(k in name for k in ["lizol", "colin", "harpic", "floor cleaner", "toilet cleaner", "glass cleaner", "domex", "odonil", "goodknight", "all out", "mosquito repellent", "hit spray"]):
        return "floor-surface-cleaners", "Surface & Toilet Cleaners"

    # 7. Pooja Needs
    if any(k in name for k in ["agarbatti", "dhoop", "camphor", "karpooram", "pooja oil", "deepam", "haldi kumkum", "mangaldeep", "zed black"]):
        return "pooja-needs", "Pooja Items"

    # 8. Salt, Sugar & Staples
    if any(k in name for k in ["salt", "crystal salt", "table salt", "sugar", "jaggery", "bellam", "baking soda", "cooking soda", "rock salt", "black salt"]):
        return "sugar-salt-staples", "Salt & Sugar"

    # 9. Chips & Namkeen
    if any(k in name for k in ["khatta meetha", "namkeen", "chips", "kurkure", "lays", "bingo", "mad angles", "mixture", "sev", "salted peanuts", "peanut ", "peanuts", "potato chips", "murukku", "banana chips"]):
        if not any(k in name for k in ["chikki", "balls", "butter"]): # chikki is sweet
            return "chips-namkeen", "Chips & Namkeen"

    # 10. Sweets & Chocolates
    if any(k in name for k in ["chikki", "peanut balls", "chocolate", "dairy milk", "5 star", "munch", "kitkat", "perk", "mysore pak", "mysore pack", "soan papdi", "gulab jamun", "halwa", "candy", "toffees", "eclairs"]):
        return "sweets-chocolates", "Chocolates & Sweets"

    # 11. Biscuits & Bakery
    if any(k in name for k in ["biscuit", "cookies", "wafer", "waffer", "rusk", "bourbon", "good day", "parle-g", "monaco", "krackjack", "marie", "cream biscuit", "toast"]):
        return "biscuits-bakery", "Biscuits & Cookies"

    # 12. Drinks & Juices
    if any(k in name for k in ["frooti", "maaza", "slice", "thums up", "coca cola", "coke", "sprite", "fanta", "mirinda", "pepsi", "7up", "juice", "energy drink", "sting", "red bull", "appy fizz", "limca", "soda bottle"]):
        return "drinks-juices", "Soft Drinks & Juices"

    # 13. Tea, Coffee & Milk Drinks
    if any(k in name for k in ["tea", "chai", "coffee", "bru", "nescafe", "red label", "taj mahal", "wagh bakri", "horlicks", "boost", "bournvita", "complan"]):
        return "tea-coffee-milk-drinks", "Tea & Coffee"

    # 14. Instant Food
    if any(k in name for k in ["noodles", "maggi", "yippee", "vermicelli", "bambino vermicelli", "semiya", "pasta", "macaroni", "instant mix", "dosa mix", "idli mix", "gulab jamun mix", "soup", "knorr"]):
        return "instant-food", "Noodles & Vermicelli"

    # 15. Sauces & Spreads
    if any(k in name for k in ["ketchup", "sauce", "jam", "mayonnaise", "peanut butter", "kissan jam"]):
        return "sauces-spreads", "Sauces & Spreads"

    # 16. Dairy, Bread & Eggs
    if any(k in name for k in ["milk", "curd", "dahi", "paneer", "butter", "cheese", "bread", "pav", "egg", "arun icecreams", "ice cream", "icecream"]):
        return "dairy-bread-eggs", "Dairy & Eggs"

    # 17. Spices & Masalas
    if any(k in name for k in ["pepper powder", "dalchini", "cinnamon", "clove", "lavang", "elaichi", "cardamom", "jeera", "cumin", "mustard", "aavaalu", "menthulu", "fenugreek", "turmeric", "haldi", "chilli powder", "mirchi powder", "coriander powder", "dhania", "garam masala", "chicken masala", "mutton masala", "biryani masala", "sambar powder", "rasam powder", "ginger garlic paste", "oil", "sunflower oil", "groundnut oil", "ghee"]):
        return "oil-ghee-masala", "Spices & Oils"

    # 18. Atta, Rice, Dal & Grains
    if any(k in name for k in ["atta", "wheat", "godhumalu", "rice", "biryani rice", "basmati", "raw rice", "boiled rice", "sona masoori", "pappu", "dal", "toor dal", "kandi pappu", "moong dal", "urad dal", "minapappu", "chana dal", "senagapappu", "pachisenagapappu", "rajma", "chole", "senagalu", "rava", "ravva", "sooji", "suji", "bansi", "idli rava", "idly ravva", "maida", "besan", "rice flour", "corn flour", "poha", "atukulu", "flattened rice", "millet", "korralu", "ragi", "jowar", "alasandalu"]):
        return "atta-rice-dal", "Atta, Rice & Dals"

    # Default keep existing
    return curr_cat, p.get("sub_category") or "General"

reclassified = 0
for p in products:
    curr_cat = p.get("category_id") or p.get("category") or ""
    new_cat, new_sub = detect_category(p)
    if new_cat and new_cat != curr_cat:
        reclassified += 1
        p["category_id"] = new_cat
        p["category"] = new_cat
        p["sub_category"] = new_sub
        p["subCategory"] = new_sub

print(f"Total reclassified: {reclassified}")

# Let's inspect atta-rice-dal after reclassification
atta_products = [p for p in products if p.get("category_id") == "atta-rice-dal"]
print(f"\nNew total in atta-rice-dal: {len(atta_products)}")
for p in atta_products:
    print(f"  {p['id']} | {p['name']} | brand: {p.get('brand')} | cat: {p.get('category_id')}")

# Save updated migrated_products.json
with open("data/migrated_products.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2)

print("\nSaved updated data/migrated_products.json!")
