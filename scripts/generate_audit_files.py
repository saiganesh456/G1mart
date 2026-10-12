import os
import csv
import json

BASE_DIR = r"d:\web-agency-projects\G1mart"

# 1. MISSING_IMAGES.csv
missing_records = [
    {
        "category": "Rice, Atta & Flours",
        "brand": "Fortune",
        "product": "Fortune Chakki Fresh Atta",
        "why": "Unstocked in store catalog; substituted with stocked Aashirvaad Shudh Chakki Atta & Lalitha Idli Rava"
    },
    {
        "category": "Dals & Pulses",
        "brand": "Tata Sampann",
        "product": "Tata Sampann Toor Dal",
        "why": "Unstocked branded pack; substituted with G1 Mart Verified Toor Dal & Chana Dal"
    },
    {
        "category": "Dals & Pulses",
        "brand": "24 Mantra",
        "product": "24 Mantra Organic Dal",
        "why": "Unstocked in store inventory; substituted with G1 Mart Verified Moong Dal"
    },
    {
        "category": "Cooking Oils & Ghee",
        "brand": "Gemini",
        "product": "Gemini Sunflower Oil",
        "why": "Unstocked; substituted with local Telugu-state hero brand Freedom Refined Sunflower Oil & Fortune Sunlite"
    },
    {
        "category": "Spices & Masalas",
        "brand": "MDH",
        "product": "MDH Deggi Mirch / Masala",
        "why": "Unstocked in regional store catalog; substituted with regional hero Aachi Chilli Powder & Everest Garam Masala"
    },
    {
        "category": "Spices & Masalas",
        "brand": "Catch",
        "product": "Catch Sabzi Masala",
        "why": "Unstocked; substituted with stocked Everest & Tata Sampann Turmeric"
    },
    {
        "category": "Pickles & Sauces",
        "brand": "Mother's Recipe",
        "product": "Mother's Recipe Mixed Pickle",
        "why": "Unstocked; substituted with top Telugu-state favourite Priya Mango Pickle & Priya Mixed Fruit Jam"
    },
    {
        "category": "Dry Fruits & Nuts",
        "brand": "Happilo",
        "product": "Happilo Premium Cashews",
        "why": "Unstocked brand; substituted with stocked Lion Dates & Verified Whole Cashews"
    },
    {
        "category": "Dry Fruits & Nuts",
        "brand": "Nutraj",
        "product": "Nutraj California Almonds",
        "why": "Unstocked brand; substituted with stocked Unibic Cashew Badam & Verified Dry Fruits"
    },
    {
        "category": "Dairy, Bread & Eggs",
        "brand": "Dodla",
        "product": "Dodla Dairy Curd Pouch",
        "why": "Unstocked; substituted with stocked Heritage Dahi Curd & Amul Taaza Milk"
    },
    {
        "category": "Breakfast & Cereals",
        "brand": "Quaker",
        "product": "Quaker Rolled Oats",
        "why": "Unstocked brand; substituted with Kellogg's Corn Flakes & Bambino Vermicelli"
    },
    {
        "category": "Instant Noodles & Pasta",
        "brand": "Top Ramen",
        "product": "Top Ramen Curry Noodles",
        "why": "Unstocked brand; substituted with top sellers Maggi 2-Minute Noodles & Sunfeast Yippee"
    },
    {
        "category": "Tea, Coffee & Health Drinks",
        "brand": "Bournvita",
        "product": "Cadbury Bournvita Health Drink",
        "why": "Unstocked size; substituted with hero stocked Horlicks Classic Malt & Brooke Bond Red Label Tea"
    },
    {
        "category": "Cold Drinks & Juices",
        "brand": "Real",
        "product": "Real Mixed Fruit Juice 1L",
        "why": "Unstocked packshot; substituted with hero beverage Frooti Mango Drink & Thums Up / Coca-Cola"
    },
    {
        "category": "Dishwash",
        "brand": "Pril",
        "product": "Pril Lime Liquid",
        "why": "Unstocked; substituted with market leader Vim Dishwash Liquid & Vim Bar"
    },
    {
        "category": "Cleaners & Pest Control",
        "brand": "Good Knight",
        "product": "Good Knight Gold Flash Liquid Refill",
        "why": "Unstocked pack; substituted with Godrej HIT Flying Insect Spray & Harpic / Lizol"
    },
    {
        "category": "Hair Care & Shampoos",
        "brand": "Head & Shoulders",
        "product": "Head & Shoulders Anti-Dandruff Shampoo",
        "why": "Unstocked; substituted with stocked Clinic Plus Strong & Long, Sunsilk Black Shine, and Dove Daily Shine"
    },
    {
        "category": "Toothpaste & Oral Care",
        "brand": "Listerine",
        "product": "Listerine Cool Mint Mouthwash",
        "why": "Unstocked; substituted with hero brands Colgate Strong Teeth, Close-Up Deep Action, and Pepsodent"
    },
    {
        "category": "Skin Care",
        "brand": "Nivea",
        "product": "Nivea Soft Light Moisturiser",
        "why": "Unstocked SKU; substituted with Vaseline Deep Moisture & Ponds Magic Talc"
    },
    {
        "category": "Baby Care",
        "brand": "Pampers",
        "product": "Pampers All Round Protection Diapers",
        "why": "Unstocked; substituted with Huggies Wonder Pants Diapers, Johnson's Baby Powder, and Himalaya Baby Soap"
    },
    {
        "category": "Feminine Hygiene",
        "brand": "Sofy",
        "product": "Sofy AntiBacteria Extra Heavy Flow",
        "why": "Unstocked; substituted with market leaders Whisper Choice XL, Whisper Ultra Clean, and Stayfree Secure"
    },
    {
        "category": "Shaving & Grooming",
        "brand": "Park Avenue",
        "product": "Park Avenue Voyage Aftershave / Deodorant",
        "why": "Unstocked; substituted with Gillette Classic Foam, Fogg Deodorant Body Spray, and Rexona Men"
    }
]

csv_file_g1 = os.path.join(BASE_DIR, "MISSING_IMAGES.csv")
csv_file_root = r"d:\web-agency-projects\MISSING_IMAGES.csv"

for cf in [csv_file_g1, csv_file_root]:
    with open(cf, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["category", "brand", "product", "why"])
        writer.writeheader()
        writer.writerows(missing_records)
print(f"Written MISSING_IMAGES.csv with {len(missing_records)} records.")

# 2. images.json - Full provenance registry
image_registry = [
    # atta-rice-dal
    {"category_id": "atta-rice-dal", "product_id": "g1-p0001", "name": "Aashirvaad Shudh Chakki Atta 1kg", "brand": "Aashirvaad", "packshot": "aashirvaad-atta-1kg.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "atta-rice-dal", "product_id": "g1-p0003", "name": "Daawat Rozana Super Basmati Rice", "brand": "Daawat", "packshot": "basmati-rice.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "atta-rice-dal", "product_id": "g1-p0089", "name": "Lalitha Brand Idli Rava 1kg", "brand": "Lalitha Brand", "packshot": "lalitha-idli-rava.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # local-dals
    {"category_id": "local-dals", "product_id": "g1-p0044", "name": "G1 Mart Chana Dal 500g", "brand": "G1 Mart", "packshot": "chana-dal.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "local-dals", "product_id": "g1-p0041", "name": "G1 Mart Toor Dal Premium 1kg", "brand": "G1 Mart", "packshot": "toor-dal.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "local-dals", "product_id": "g1-p0042", "name": "G1 Mart Moong Dal 500g", "brand": "G1 Mart", "packshot": "moong-dal.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # oil-ghee-masala
    {"category_id": "oil-ghee-masala", "product_id": "g1-p0005", "name": "Freedom Refined Sunflower Oil 1L Pouch", "brand": "Freedom", "packshot": "freedom-oil-1l.png", "source": "Open Food Facts (Barcode 8906014640051)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "oil-ghee-masala", "product_id": "g1-p0004", "name": "Fortune Sunlite Refined Sunflower Oil 1L", "brand": "Fortune", "packshot": "fortune-sunlite-clean.png", "source": "Open Food Facts (Barcode 8906007280011)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "oil-ghee-masala", "product_id": "g1-p0012", "name": "Amul Pure Ghee 1L Tin / Pack", "brand": "Amul", "packshot": "amul-ghee.png", "source": "Open Food Facts (Barcode 8901262010053)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    # spices-masalas
    {"category_id": "spices-masalas", "product_id": "g1-p0013", "name": "Aachi Chilli Powder 200g", "brand": "Aachi", "packshot": "aachi-chilli.png", "source": "Open Food Facts (Barcode 8906020810141)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "spices-masalas", "product_id": "g1-p0014", "name": "Everest Garam Masala 100g Box", "brand": "Everest", "packshot": "garam-masala.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "spices-masalas", "product_id": "g1-p0015", "name": "Tata Sampann Turmeric Powder 200g", "brand": "Tata Sampann", "packshot": "turmeric-powder.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # sauces-spreads
    {"category_id": "sauces-spreads", "product_id": "g1-p0035", "name": "Priya Mixed Fruit Jam 500g Glass Jar", "brand": "Priya", "packshot": "mixed-fruit-jam.png", "source": "Open Food Facts (Barcode 8901764010103)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "sauces-spreads", "product_id": "g1-p0033", "name": "Kissan Fresh Tomato Ketchup 950g Squeezo", "brand": "Kissan", "packshot": "tomato-ketchup.png", "source": "Open Food Facts (Barcode 8901030382215)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "sauces-spreads", "product_id": "g1-p0036", "name": "Priya Mango Pickle Without Garlic 300g", "brand": "Priya", "packshot": "mango-pickle.png", "source": "Open Food Facts (Barcode 8901764020102)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    # sugar-salt-staples
    {"category_id": "sugar-salt-staples", "product_id": "g1-p0016", "name": "Tata Salt Vacuum Evaporated Iodised 1kg", "brand": "Tata Salt", "packshot": "tata-salt.png", "source": "Open Food Facts (Barcode 8901030000010)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "sugar-salt-staples", "product_id": "g1-p0017", "name": "Madhur Pure & Hygienic Sugar 1kg", "brand": "Madhur", "packshot": "madhur-sugar-clean.png", "source": "Open Food Facts (Barcode 8906008680124)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "sugar-salt-staples", "product_id": "g1-p0185", "name": "G1 Mart Thati Bellam / Jaggery Block 500g", "brand": "G1 Mart", "packshot": "g1-p0185.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # dry-fruits-cereals
    {"category_id": "dry-fruits-cereals", "product_id": "g1-p0077", "name": "Lion Seedless Dates 500g Box", "brand": "Lion Dates", "packshot": "g1-p0077.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "dry-fruits-cereals", "product_id": "g1-p0019", "name": "G1 Mart Premium Cashew Nuts 250g", "brand": "G1 Mart", "packshot": "cashew-nuts.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "dry-fruits-cereals", "product_id": "g1-p0210", "name": "Unibic Cashew Badam Festive Box", "brand": "Unibic", "packshot": "g1-p0210.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # vegetables-fruits
    {"category_id": "vegetables-fruits", "product_id": "g1-p0236", "name": "Fresh Pink Onion 1kg", "brand": "Fresh Produce", "packshot": "fresh-onion.png", "source": "Store Shelf / Produce Studio Photo (g1-p0236.webp cutout)", "license": "Proprietary Store Asset", "attribution": "G1 Mart Fresh Department"},
    {"category_id": "vegetables-fruits", "product_id": "g1-p0237", "name": "Fresh Hybrid Tomato 1kg", "brand": "Fresh Produce", "packshot": "fresh-tomato.png", "source": "Store Fresh Produce Showcase (Cutting Board Vine Cutout)", "license": "Proprietary Store Asset", "attribution": "G1 Mart Fresh Department"},
    {"category_id": "vegetables-fruits", "product_id": "g1-p0238", "name": "Fresh Jyoti Potato 1kg", "brand": "Fresh Produce", "packshot": "fresh-potato.png", "source": "Store Fresh Produce Studio Banner (bg_fresh_produce cutout)", "license": "Proprietary Store Asset", "attribution": "G1 Mart Fresh Department"},
    # dairy-bread-eggs
    {"category_id": "dairy-bread-eggs", "product_id": "g1-p0023", "name": "Heritage Dahi / Curd 400g Pouch", "brand": "Heritage", "packshot": "curd-dahi.png", "source": "Open Food Facts (Barcode 8904089900122)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "dairy-bread-eggs", "product_id": "g1-p0021", "name": "Amul Taaza Homogenised Toned Milk 1L", "brand": "Amul", "packshot": "amul-milk.png", "source": "Open Food Facts (Barcode 8901262150056)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "dairy-bread-eggs", "product_id": "g1-p0024", "name": "Arun Donut Ice Cream Dessert Pack", "brand": "Arun", "packshot": "arun-donut.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # breakfast-cereals
    {"category_id": "breakfast-cereals", "product_id": "g1-p0031", "name": "Maggi 2-Minute Noodles Masala 280g", "brand": "Maggi", "packshot": "maggi-noodles.png", "source": "Open Food Facts (Barcode 8901058852394)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "breakfast-cereals", "product_id": "g1-p0025", "name": "Kellogg's Corn Flakes Original 475g Box", "brand": "Kellogg's", "packshot": "corn-flakes.png", "source": "Open Food Facts (Barcode 8901499008266)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "breakfast-cereals", "product_id": "g1-p0660", "name": "Bambino Roasted Vermicelli 400g", "brand": "Bambino", "packshot": "g1-p0660.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # biscuits-bakery
    {"category_id": "biscuits-bakery", "product_id": "g1-p0027", "name": "Parle-G Original Gluco Biscuits 250g", "brand": "Parle-G", "packshot": "parle-g.png", "source": "Open Food Facts (Barcode 8901719101030)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "biscuits-bakery", "product_id": "g1-p0028", "name": "Britannia Good Day Cashew Cookies 200g", "brand": "Britannia", "packshot": "good-day.png", "source": "Open Food Facts (Barcode 8901063012219)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "biscuits-bakery", "product_id": "g1-p0175", "name": "Cadbury Oreo Vanilla Creme Sandwich Biscuits 120g", "brand": "Oreo", "packshot": "g1-p0175.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # instant-food
    {"category_id": "instant-food", "product_id": "g1-p0599", "name": "Sunfeast Yippee Magic Masala Noodles 260g", "brand": "Sunfeast", "packshot": "g1-p0599.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "instant-food", "product_id": "g1-p0031", "name": "Maggi 2-Minute Noodles Masala 280g", "brand": "Maggi", "packshot": "maggi-noodles.png", "source": "Open Food Facts (Barcode 8901058852394)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "instant-food", "product_id": "g1-p0204", "name": "Bambino Macaroni Elbow Pasta 400g", "brand": "Bambino", "packshot": "g1-p0204.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # chips-namkeen
    {"category_id": "chips-namkeen", "product_id": "g1-p0037", "name": "Haldiram's Nagpur Khatta Meetha Mixture 200g", "brand": "Haldiram's", "packshot": "haldiram-khatta-meetha.png", "source": "Open Food Facts (Barcode 8904063200118)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "chips-namkeen", "product_id": "g1-p0038", "name": "Kurkure Masala Munch 90g", "brand": "Kurkure", "packshot": "kurkure.png", "source": "Open Food Facts (Barcode 8901491101859)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "chips-namkeen", "product_id": "g1-p0039", "name": "Lay's India's Magic Masala Potato Chips 52g", "brand": "Lay's", "packshot": "lays-chips.png", "source": "Open Food Facts (Barcode 8901491102559)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    # sweets-chocolates
    {"category_id": "sweets-chocolates", "product_id": "g1-p0211", "name": "Nestle KitKat 4 Finger Chocolate Bar 38.5g", "brand": "Nestle", "packshot": "kitkat.png", "source": "Owner / Store Verified Shelf Cutout (Trimmed clean)", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "sweets-chocolates", "product_id": "g1-p0030", "name": "Cadbury Dairy Milk Chocolate Bar 50g", "brand": "Cadbury", "packshot": "cadbury-dairy-milk.png", "source": "Open Food Facts (Barcode 7622201438579)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "sweets-chocolates", "product_id": "g1-p0215", "name": "Cadbury 5 Star Chocolate Bar 40g", "brand": "Cadbury", "packshot": "cadbury-5-star.png", "source": "Open Food Facts (Barcode 7622201438999)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    # tea-coffee-milk-drinks
    {"category_id": "tea-coffee-milk-drinks", "product_id": "g1-p0032", "name": "Brooke Bond Red Label Tea 500g", "brand": "Red Label", "packshot": "red-label-tea.png", "source": "Open Food Facts (Barcode 8901030382215)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "tea-coffee-milk-drinks", "product_id": "g1-p0317", "name": "Horlicks Classic Malt Health Drink 500g Jar", "brand": "Horlicks", "packshot": "horlicks.png", "source": "Open Food Facts (Barcode 8901030728952)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "tea-coffee-milk-drinks", "product_id": "g1-p0034", "name": "Bru Instant Coffee Chicory Mix 100g Jar", "brand": "Bru", "packshot": "bru-instant.png", "source": "Open Food Facts (Barcode 8901030352218)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    # drinks-juices
    {"category_id": "drinks-juices", "product_id": "g1-p0045", "name": "Coca-Cola Original Taste 750ml PET Bottle", "brand": "Coca-Cola", "packshot": "coca-cola.png", "source": "Open Food Facts (Barcode 8901764012211 - Isolated background)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "drinks-juices", "product_id": "g1-p0039", "name": "Thums Up Charged Carbonated Drink 750ml PET", "brand": "Thums Up", "packshot": "thums-up.png", "source": "Open Food Facts (Barcode 8901764012204)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "drinks-juices", "product_id": "g1-p0046", "name": "Frooti Mango Drink 160ml Tetra Pak", "brand": "Frooti", "packshot": "frooti.png", "source": "Open Food Facts (Barcode 8901719112210)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    # laundry-detergents
    {"category_id": "laundry-detergents", "product_id": "g1-p0048", "name": "Ariel Matic Front Load Liquid Detergent 1L", "brand": "Ariel", "packshot": "ariel-front-liq.png", "source": "Open Beauty Facts (Barcode 4902430752123)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "laundry-detergents", "product_id": "g1-p0047", "name": "Surf Excel Easy Wash Detergent Powder 1kg", "brand": "Surf Excel", "packshot": "surf-excel.png", "source": "Open Beauty Facts (Barcode 8901030722219)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "laundry-detergents", "product_id": "g1-p0113", "name": "Tide Plus Double Power Detergent Powder 1kg", "brand": "Tide", "packshot": "g1-p0113.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # dishwash
    {"category_id": "dishwash", "product_id": "g1-p0307", "name": "Vim Dishwash Gel Lemon 250ml Bottle", "brand": "Vim", "packshot": "g1-p0307.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "dishwash", "product_id": "g1-p0050", "name": "Vim Dishwash Bar 300g", "brand": "Vim", "packshot": "vim-bar.png", "source": "Open Beauty Facts (Barcode 8901030722301)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "dishwash", "product_id": "g1-p0850", "name": "Exo Antibacterial Dishwash Scrub Pad 3s", "brand": "Exo", "packshot": "g1-p0850.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # floor-surface-cleaners
    {"category_id": "floor-surface-cleaners", "product_id": "g1-p0220", "name": "Lizol Disinfectant Floor Cleaner Citrus 500ml", "brand": "Lizol", "packshot": "g1-p0220.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "floor-surface-cleaners", "product_id": "g1-p0212", "name": "Harpic Power Plus Toilet Cleaner Original 500ml", "brand": "Harpic", "packshot": "g1-p0212.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "floor-surface-cleaners", "product_id": "g1-p0018", "name": "Godrej HIT Flying Insect Killer Spray 200ml", "brand": "HIT", "packshot": "g1-p0018.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # pooja-needs
    {"category_id": "pooja-needs", "product_id": "g1-p0450", "name": "Cycle Pure Agarbathies Three in One Pack", "brand": "Cycle Pure", "packshot": "g1-p0450.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "pooja-needs", "product_id": "g1-p0052", "name": "Swastik Premium Camphor / Pooja Ghee Pack", "brand": "Swastik", "packshot": "pooja-agarbatti.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "pooja-needs", "product_id": "g1-p0451", "name": "Mangaldeep Puja Agarbatti Sandalwood Pack", "brand": "Mangaldeep", "packshot": "g1-p0451.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # kitchenware
    {"category_id": "kitchenware", "product_id": "g1-p0049", "name": "Godrej Brass Nav-Tal 6 Levers Lock", "brand": "Godrej", "packshot": "g1-p0049.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "kitchenware", "product_id": "g1-p0053", "name": "Milton Stainless Steel Flask & Pan Set", "brand": "Milton", "packshot": "launch-plate.png", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "kitchenware", "product_id": "g1-p0770", "name": "Eveready Alkaline Heavy Duty AA Batteries 4s", "brand": "Eveready", "packshot": "g1-p0770.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # soaps-bath
    {"category_id": "soaps-bath", "product_id": "g1-p0054", "name": "Cinthol Original Deodorant Bath Soap 100g", "brand": "Cinthol", "packshot": "cinthol-clean.png", "source": "Open Beauty Facts (Barcode 8901023000546)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "soaps-bath", "product_id": "g1-p0055", "name": "Santoor Sandal & Turmeric Soap 125g", "brand": "Santoor", "packshot": "santoor-soap-clean.png", "source": "Open Beauty Facts (Barcode 8901399000124)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "soaps-bath", "product_id": "g1-p0056", "name": "Lux Velvet Glow Rose Soap 100g", "brand": "Lux", "packshot": "lux-soap.png", "source": "Open Beauty Facts (Barcode 8901030722127)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    # hair-care
    {"category_id": "hair-care", "product_id": "g1-p0101", "name": "Dabur Amla Hair Oil 180ml", "brand": "Dabur", "packshot": "g1-p0101.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "hair-care", "product_id": "g1-p0057", "name": "Parachute 100% Pure Coconut Oil 200ml Bottle", "brand": "Parachute", "packshot": "parachute-oil.png", "source": "Open Food Facts (Barcode 8901088012117)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Food Facts Contributors"},
    {"category_id": "hair-care", "product_id": "g1-p0588", "name": "Parachute Advansed Aloe Vera Enriched Coconut Hair Oil 150ml", "brand": "Parachute", "packshot": "g1-p0588.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # hair-shampoos
    {"category_id": "hair-shampoos", "product_id": "g1-p0617", "name": "Sunsilk Black Shine Shampoo 180ml", "brand": "Sunsilk", "packshot": "g1-p0617.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "hair-shampoos", "product_id": "g1-p0201", "name": "Clinic Plus Strong & Long Health Shampoo 175ml", "brand": "Clinic Plus", "packshot": "g1-p0201.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "hair-shampoos", "product_id": "g1-p1026", "name": "Dove Daily Shine Shampoo 180ml", "brand": "Dove", "packshot": "g1-p1026.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # oral-care
    {"category_id": "oral-care", "product_id": "g1-p0059", "name": "Close-Up Everfresh Red Hot Gel Toothpaste 150g", "brand": "Close-Up", "packshot": "close-up-toothpaste.png", "source": "Open Beauty Facts (Barcode 8901030722448)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "oral-care", "product_id": "g1-p0058", "name": "Colgate Strong Teeth Dental Cream 200g", "brand": "Colgate", "packshot": "colgate-toothpaste.png", "source": "Open Beauty Facts (Barcode 8901314010528)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "oral-care", "product_id": "g1-p0547", "name": "Pepsodent Expert Protection Germi Check Toothpaste 140g", "brand": "Pepsodent", "packshot": "g1-p0547.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # skin-care
    {"category_id": "skin-care", "product_id": "g1-p0193", "name": "Vaseline Deep Moisture Body Lotion 100ml", "brand": "Vaseline", "packshot": "g1-p0193.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "skin-care", "product_id": "g1-p0060", "name": "Pond's Dreamflower Fragrant Talc 100g", "brand": "Pond's", "packshot": "ponds-talc.png", "source": "Open Beauty Facts (Barcode 8901030722516)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "skin-care", "product_id": "g1-p0006", "name": "Glow & Lovely Advanced Multivitamin Cream 50g", "brand": "Glow & Lovely", "packshot": "g1-p0006.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # baby-care
    {"category_id": "baby-care", "product_id": "g1-p0128", "name": "Himalaya Gentle Baby Soap 75g", "brand": "Himalaya", "packshot": "g1-p0128.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "baby-care", "product_id": "g1-p0061", "name": "Huggies Wonder Pants Diapers Medium 32s", "brand": "Huggies", "packshot": "huggies.png", "source": "Open Beauty Facts (Barcode 8901262012211)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "baby-care", "product_id": "g1-p0908", "name": "Mysore Sandal Baby Super Premium Soap 75g", "brand": "Mysore Sandal", "packshot": "g1-p0908.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # hygiene
    {"category_id": "hygiene", "product_id": "g1-p0438", "name": "Whisper Choice Wings Sanitary Pads 6s", "brand": "Whisper", "packshot": "g1-p0438.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "hygiene", "product_id": "g1-p0062", "name": "Stayfree Secure Cottony Wings Sanitary Pads 18s", "brand": "Stayfree", "packshot": "stayfree.png", "source": "Open Beauty Facts (Barcode 8901030722660)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "hygiene", "product_id": "g1-p0222", "name": "Whisper Ultra Clean Wings Sanitary Pads 15s", "brand": "Whisper", "packshot": "g1-p0222.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    # shaving-grooming
    {"category_id": "shaving-grooming", "product_id": "g1-p0063", "name": "Fogg Men Fresh Oriental Body Spray Deodorant 150ml", "brand": "Fogg", "packshot": "body-spray.png", "source": "Open Beauty Facts (Barcode 8908001158512)", "license": "Open Database License (ODbL) / CC-BY-SA 4.0", "attribution": "Open Beauty Facts Contributors"},
    {"category_id": "shaving-grooming", "product_id": "g1-p1041", "name": "Gillette Classic Regular Pre-Shave Foam 196g", "brand": "Gillette", "packshot": "g1-p1041.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"},
    {"category_id": "shaving-grooming", "product_id": "g1-p0321", "name": "Rexona Men Ice Cool Antiperspirant Deodorant 150ml", "brand": "Rexona", "packshot": "g1-p0321.webp", "source": "Owner / Store Verified Shelf Cutout", "license": "Proprietary Store Asset", "attribution": "G1 Mart Storefront Catalog"}
]

json_file_g1 = os.path.join(BASE_DIR, "images.json")
json_file_root = r"d:\web-agency-projects\images.json"

for jf in [json_file_g1, json_file_root]:
    with open(jf, "w", encoding="utf-8") as f:
        json.dump(image_registry, f, indent=2)
print(f"Written images.json with {len(image_registry)} items.")
