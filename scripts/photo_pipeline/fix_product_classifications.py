import json

CATALOG_PATH = "data/migrated_products.json"

CORRECTIONS = {
    "g1-p0133": ("soaps-bath", "Bath & Body", "Yardley", "Yardley Sandalwood Talc"),
    "g1-p0315": ("sauces-spreads", "Jams & Spreads", "Kissan", "Kissan Peanut Butter Crunchy"),
    "g1-p0719": ("pooja-needs", "Agarbatti & Dhoop", "Mangaldeep", "Mangaldeep Sandal Agarbatti"),
    "g1-p0438": ("feminine-hygiene", "Sanitary Pads", "Whisper", "Whisper Choice XL"),
    "g1-p0881": ("hair-care", "Shampoo & Conditioner", "Clinic Plus", "Clinic Plus Egg Protein Shampoo"),
    "g1-p0599": ("instant-food", "Noodles & Pasta", "Sunfeast Yippee", "Yippee Noodles Magic Masala"),
    "g1-p1015": ("tea-coffee-milk-drinks", "Tea", "Gemini", "Gemini Tea"),
    "g1-p0851": ("chips-namkeen", "Chips & Crisps", "Bingo", "Bingo Masala"),
    "g1-p0598": ("sweets-chocolates", "Chocolates", "Nestle", "Milkybar"),
    "g1-p0798": ("biscuits-bakery", "Biscuits & Cookies", "Sunfeast", "Sunfeast Nice Biscuits"),
    "g1-p0176": ("biscuits-bakery", "Biscuits & Cookies", "Britannia", "Britannia Milk Bikis"),
    "g1-p0821": ("sweets-chocolates", "Chocolates", "Sunfeast", "Sunfeast Fantastik Fruit & Nut"),
    "g1-p0270": ("sweets-chocolates", "Chocolates", "Cadbury Dairy Milk", "Dairy Milk Fruit & Nut"),
    "g1-p0244": ("sweets-chocolates", "Candies & Gums", "Dazzy", "Dazzy Fruit Bonbon"),
    "g1-p0966": ("sweets-chocolates", "Candies & Gums", "Local / Unbranded", "Mix Fruit Jelly"),
    "g1-p0253": ("biscuits-bakery", "Biscuits & Cookies", "Unibic", "Unibic Fruit & Nut Cookies"),
    "g1-p0862": ("chips-namkeen", "Chips & Crisps", "Bingo", "Bingo Mad Angles Tomato"),
    "g1-p0995": ("chips-namkeen", "Namkeen & Snacks", "Local / Unbranded", "Makhana Cream & Onion"),
    "g1-p0628": ("hair-care", "Shampoo & Conditioner", "Meera", "Meera Onion Shampoo"),
    "g1-p0629": ("hair-care", "Shampoo & Conditioner", "Meera", "Meera Onion Shampoo"),
    "g1-p0420": ("instant-food", "Instant Soups", "Knorr", "Knorr Tomato Soup"),
    "g1-p0729": ("instant-food", "Instant Soups", "Knorr", "Tomato Soup"),
    "g1-p0651": ("sauces-spreads", "Pickles & Chutneys", "Sri Durga", "Sri Durga Tomato Pickle"),
    "g1-p0696": ("sauces-spreads", "Pickles & Chutneys", "Local / Unbranded", "Tomato Pickle"),
    "g1-p0293": ("sauces-spreads", "Jams & Spreads", "Kissan", "Kissan Mixed Fruit Jam"),
    "g1-p0263": ("sweets-chocolates", "Chocolates", "Dazzy", "Dazzy Choco Orange"),
    "g1-p0820": ("sweets-chocolates", "Chocolates", "Sunfeast", "Sunfeast Fantastik Choco Almond"),
    "g1-p0822": ("sweets-chocolates", "Chocolates", "Sunfeast", "Sunfeast Fantastik Roast & Almond"),
    "g1-p0161": ("hair-care", "Hair Oil", "Dabur", "Dabur Almond Hair Oil"),
    "g1-p0374": ("hair-care", "Shampoo & Conditioner", "Meera", "Meera Badam Shampoo"),
    "g1-p0032": ("dairy-bread-eggs", "Ice Creams & Desserts", "Arun Icecreams", "Arun Icecream"),
    "g1-p0081": ("atta-rice-dal", "Pulses & Dal", "Local / Unbranded", "Pottu Minapappu (Urad Dal with Husk)"),
    "g1-p0094": ("dry-fruits-cereals", "Dry Fruits & Nuts", "Local / Unbranded", "Jeedi Pappu (Cashew Nuts)"),
    "g1-p0329": ("atta-rice-dal", "Pulses & Dal", "Local / Unbranded", "Verusenaga Pappu (Peanuts / Groundnut)"),
    "g1-p0700": ("sweets-chocolates", "Candies & Gums", "Local / Unbranded", "Assorted Fruit Jelly"),
}

def fix_classifications():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    updated_count = 0
    for p in products:
        pid = p["id"]
        if pid in CORRECTIONS:
            cat, sub, brand, name = CORRECTIONS[pid]
            p["category"] = cat
            p["category_id"] = cat
            p["subCategory"] = sub
            if brand:
                p["brand"] = brand
            if name and not p.get("rawName"):
                p["rawName"] = p["name"]
                p["name"] = name
            updated_count += 1

    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Corrected {updated_count} products in {CATALOG_PATH}")

if __name__ == "__main__":
    fix_classifications()
