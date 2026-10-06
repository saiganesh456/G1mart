import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('data/pdf1_final_master_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total Canonical Products: {len(products)}\n")

categories_map = {
    "Personal Care & Soaps": [1, 2, 3, 8, 23, 24, 25, 26, 27, 28, 51, 52, 73, 74, 75],
    "Dishwash & Kitchen": [9, 10, 11, 12, 13, 61],
    "Laundry & Fabric Care": [14, 15, 16, 17, 18, 19, 20, 21, 59, 60, 62, 63, 64, 65, 70, 92, 96],
    "Tea & Beverages": [4, 5, 6, 22, 66],
    "Food Staples & Vermicelli": [7, 67, 68, 69, 93, 95],
    "Surface Cleaners & Disinfectants": [49, 50, 71, 72, 82],
    "Puja & Agarbattis": [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 76, 77, 78, 79, 80, 81, 90, 91],
    "Regional Pickles": [83, 84, 85, 86, 87, 88, 89],
    "Pest Control / Chemicals": [53, 54, 55, 56, 57, 58, 94] # Bleaching powders & Cheemala Mandu
}

item_lookup = {p['item_no']: p for p in products}

for cat, nums in categories_map.items():
    print(f"=== {cat} ({len(nums)} items) ===")
    for n in nums:
        if n in item_lookup:
            p = item_lookup[n]
            brand = p.get('brand') or 'G1 Mart / Unbranded'
            img = p.get('image_url') or 'Photo Pending'
            print(f"  #{n:02d} | {p['product_name']} ({p['pack_size']}) | Brand: {brand} | MRP: ₹{p['mrp']} | {p['image_status']}")
    print()
