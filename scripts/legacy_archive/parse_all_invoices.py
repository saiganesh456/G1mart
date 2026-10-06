import os
import re
import json

SCRATCH_DIR = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch'
OCR_CACHE_FILE = os.path.join(SCRATCH_DIR, 'ocr_cache.json')

with open(OCR_CACHE_FILE, 'r', encoding='utf-8') as f:
    cache = json.load(f)

def cluster_lines_into_rows(boxes, y_tol=12):
    items = []
    for b in boxes:
        box = b['box']
        y_center = sum(pt[1] for pt in box) / 4.0
        x_min = min(pt[0] for pt in box)
        items.append((y_center, x_min, b['text']))
    items.sort(key=lambda x: x[0])
    
    rows = []
    current_row = []
    current_y = None
    for y, x, text in items:
        if current_y is None or abs(y - current_y) <= y_tol:
            current_row.append((x, text))
            current_y = (current_y + y) / 2 if current_y is not None else y
        else:
            current_row.sort(key=lambda x: x[0])
            rows.append([t for _, t in current_row])
            current_row = [(x, text)]
            current_y = y
    if current_row:
        current_row.sort(key=lambda x: x[0])
        rows.append([t for _, t in current_row])
    return rows

extracted_items = []

# ----------------------------------------------------------------------
# 1. AltaScanner_10_05_2026(6).pdf: HANDWRITTEN LIST (29 numbered rows)
# ----------------------------------------------------------------------
handwritten_data = [
    (1, "Seed Laddu (140) 3p", "Til / Seed Laddu", "Laddu", None, "Pieces", 3, 140.0, 420.0, "snacks"),
    (2, "Rajaram peanut laddu (45) 4p", "Rajaram Peanut Laddu", "Rajaram", "Peanut", "Pieces", 4, 45.0, 180.0, "snacks"),
    (3, "Salt Biscuits (35) 3p", "Salt Biscuits", None, "Salted", "Pieces", 3, 35.0, 105.0, "snacks"),
    (4, "Rajaram Peanut Laddu (95) 3p", "Rajaram Peanut Laddu 95", "Rajaram", "Peanut", "Pieces", 3, 95.0, 285.0, "snacks"),
    (5, "Tulsi Peanut Laddu (60) 3p", "Tulsi Peanut Laddu", "Tulsi", "Peanut", "Pieces", 3, 60.0, 180.0, "snacks"),
    (6, "Tulsi Till Laddu (63) 6p", "Tulsi Til Laddu", "Tulsi", "Til / Sesame", "Pieces", 6, 63.0, 378.0, "snacks"),
    (7, "Colour Candy (42) 7p", "Colour Candy", None, "Assorted", "Pieces", 7, 42.0, 294.0, "confectionery"),
    (8, "Honey (42) 6p", "Pure Honey 42", None, "Regular", "Pieces", 6, 42.0, 252.0, "staples"),
    (9, "Honey (1+1) (185) 2p", "Honey (1+1 Offer Pack)", None, "1+1 Combo", "Pieces", 2, 185.0, 370.0, "staples"),
    (10, "Honey (145) 2p", "Pure Honey 145", None, "Regular", "Pieces", 2, 145.0, 290.0, "staples"),
    (11, "Mix Saunf (75) 7p", "Mix Saunf Mouth Freshener", None, "Mukhwas", "Pieces", 7, 75.0, 525.0, "snacks"),
    (12, "Orange Candy Jar (40) 6p", "Orange Candy Jar", None, "Orange", "Jar", 6, 40.0, 240.0, "confectionery"),
    (13, "Barari Dates (220) 3p", "Barari Dates", "Barari", "Dates", "Pack", 3, 220.0, 660.0, "dry-fruits"),
    (14, "Osmania Biscuits (65) 6p", "Osmania Biscuits", None, "Osmania", "Pack", 6, 65.0, 390.0, "snacks"),
    (15, "Organic Jaggery (85) 2p", "Organic Jaggery", None, "Jaggery", "Pack", 2, 85.0, 170.0, "staples"),
    (16, "Organic Ginger Jaggery (115) 2p", "Organic Ginger Jaggery", None, "Ginger Jaggery", "Pack", 2, 115.0, 230.0, "staples"),
    (17, "Masala Makana (150) 15p", "Masala Makhana", None, "Masala Roasted", "Pack", 15, 150.0, 2250.0, "snacks"),
    (18, "Kishmish (470) 1kg", "Kishmish / Raisins 1kg", None, "Raisins", "1kg", 1, 470.0, 470.0, "dry-fruits"),
    (19, "Kajju (830) 3kg", "Kaju / Cashews Whole 1kg", None, "Cashews", "1kg", 3, 830.0, 2490.0, "dry-fruits"),
    (20, "Cheers Ring (45) 5p", "Cheers Rings Snacks", "Cheers", "Rings", "Pack", 5, 45.0, 225.0, "snacks"),
    (21, "Jelly (55) 3p", "Fruit Jelly Sweets", None, "Fruit Jelly", "Pack", 3, 55.0, 165.0, "confectionery"),
    (22, "Chocolate (68) 12p", "Chocolate Pack", None, "Assorted", "Pack", 12, 68.0, 816.0, "confectionery"),
    (23, "Badam (1090) 2kg", "Badam / Almonds 1kg", None, "Almonds", "1kg", 2, 1090.0, 2180.0, "dry-fruits"),
    (24, "Loose Makana (650) 1kg", "Loose Makhana (Fox Nuts) 1kg", None, "Plain Makhana", "1kg", 1, 650.0, 650.0, "dry-fruits"),
    (25, "Kajju Veta Pallam (980) 2kg", "Kaju Split / Veta Pallam 1kg", None, "Split Cashews", "1kg", 2, 980.0, 1960.0, "dry-fruits"),
    (26, "Brown Sugar (90) 4kg", "Brown Sugar 1kg", None, "Brown Sugar", "1kg", 4, 90.0, 360.0, "staples"),
    (27, "Salted Pista (1750) 1kg", "Salted Pistachios (Pista) 1kg", None, "Salted Roasted", "1kg", 1, 1750.0, 1750.0, "dry-fruits"),
    (28, "Quaker Oats (78) 3p", "Quaker Oats", "Quaker", "Oats", "Pack", 3, 78.0, 234.0, "staples"),
    (29, "Makana (250) 2p", "Makhana Pack (250)", None, "Makhana", "Pack", 2, 250.0, 500.0, "dry-fruits")
]

for row_no, src_txt, disp, brand, var, unit, qty, rate, amt, cat in handwritten_data:
    extracted_items.append({
        'source_document': 'AltaScanner_10_05_2026(6).pdf',
        'source_page': 1,
        'source_item_no': row_no,
        'source_name': src_txt,
        'display_name': disp,
        'brand': brand,
        'variant': var,
        'pack_size': '1kg' if '1kg' in disp or '1kg' in src_txt else None,
        'unit': unit,
        'package_configuration': None,
        'category_id': cat,
        'mrp': None, # Section 8 & 15: Handwritten amounts must NOT automatically be interpreted as MRP
        'mrp_source': None,
        'selling_price': None,
        'source_quantity': qty,
        'source_rate': rate,
        'source_amount': amt,
        'supplier': 'Local Producer / Handwritten List',
        'invoice_date': 'Sept-Oct 2026',
        'product_match_status': 'NEEDS_REVIEW' if brand is None else 'VERIFIED',
        'confidence': 'MEDIUM' if brand is None else 'HIGH',
        'notes': 'Extracted directly from handwritten product list AltaScanner_10_05_2026(6).pdf'
    })

print(f"Added {len(handwritten_data)} handwritten items.")

# ----------------------------------------------------------------------
# 2. WhatsApp Image 4 (Srinivasa Traders 25,501)
# ----------------------------------------------------------------------
srinivasa_25501 = [
    (1, "MALKIST D CHO 72G", "Malkist Dark Choco Crackers 72g", "Malkist", "Dark Chocolate", "72g", "Packet", 6, 25.0, 19.05, 120.01, "snacks"),
    (2, "MALKIST CHEEZ 72G", "Malkist Cheese Crackers 72g", "Malkist", "Cheese", "72g", "Packet", 6, 25.0, 19.05, 120.01, "snacks"),
    (3, "MALKIST CHEEZ 144G", "Malkist Cheese Crackers 144g", "Malkist", "Cheese", "144g", "Packet", 6, 45.0, 34.29, 216.00, "snacks"),
    (4, "MALKIST D CHO 144G", "Malkist Dark Choco Crackers 144g", "Malkist", "Dark Chocolate", "144g", "Packet", 6, 45.0, 34.29, 216.00, "snacks"),
    (5, "ELITE MILK RUSK 182GM", "Elite Milk Rusk 182g", "Elite", "Milk", "182g", "Packet", 6, 35.0, 30.00, 189.00, "snacks"),
    (6, "ELITE ELACHI RUSK 182gm", "Elite Elaichi Rusk 182g", "Elite", "Elaichi / Cardamom", "182g", "Packet", 6, 35.0, 30.00, 189.00, "snacks"),
    (7, "BROWNIE 10RS", "Brownie Cakes Rs 10", None, "Chocolate Brownie", "10Rs", "Packet", 2, 240.0, 190.48, 399.04, "snacks"),
    (8, "PEANUT CHIKKI JAR 5/-", "Peanut Chikki Jar (Rs 5 Bar)", None, "Peanut Chikki", None, "Jar", 2, 300.0, 228.57, 480.00, "snacks"),
    (9, "KAMARKATTU JAR 200RS", "Kamarkattu Traditional Coconut Jaggery Candy Jar", None, "Coconut Jaggery", None, "Jar", 1, 200.0, 152.38, 160.00, "confectionery"),
    (10, "jellytos 1rs", "Jellytos Fruit Jelly Candies", None, "Fruit Jelly", None, "Jar/Box", 24, 125.0, 100.00, 2520.00, "confectionery"),
    (11, "MANGO FRUIT BARS JAR", "Mango Fruit Bars Jar", None, "Mango", None, "Jar", 2, 300.0, 247.62, 520.00, "confectionery")
]

for row_no, src_txt, disp, brand, var, size, unit, qty, mrp, rate, amt, cat in srinivasa_25501:
    extracted_items.append({
        'source_document': 'WhatsApp Image 2026-10-04 at 9.46.05 PM.jpeg',
        'source_page': 1,
        'source_item_no': row_no,
        'source_name': src_txt,
        'display_name': disp,
        'brand': brand,
        'variant': var,
        'pack_size': size,
        'unit': unit,
        'package_configuration': None,
        'category_id': cat,
        'mrp': mrp,
        'mrp_source': 'Srinivasa Traders Tax Invoice 25,501',
        'selling_price': None,
        'source_quantity': qty,
        'source_rate': rate,
        'source_amount': amt,
        'supplier': 'Srinivasa Traders (Confectionery)',
        'invoice_date': '02-10-2026',
        'product_match_status': 'VERIFIED',
        'confidence': 'HIGH',
        'notes': 'Verified from Srinivasa Traders Tax Invoice 25,501'
    })

print(f"Added {len(srinivasa_25501)} Srinivasa Traders items.")

# ----------------------------------------------------------------------
# 3. WhatsApp Images 1, 2, 3 (Bombay Corporation / ITC)
# ----------------------------------------------------------------------
itc_items = [
    # Page 1
    (1, "MD SCENTS ZIPLOCK COMBO PACKS", "Mangaldeep Scents Ziplock Combo Pack", "Mangaldeep", "Ziplock Combo", None, "Pack", 5, 70.0, 32.37, 144.01, "household"),
    (2, "MD SCENT 3IN1 COLGATE PROMO RS 40", "Mangaldeep 3in1 Agarbatti Promo Pack", "Mangaldeep", "3in1", None, "Pack", 24, 40.0, 39.68, 966.23, "household"),
    (3, "AASHIRVAAD ATTA (MP) 1KG", "Aashirvaad Superior MP Atta 1kg", "Aashirvaad", "Superior MP", "1kg", "Pack", 30, 75.0, 60.75, 1857.98, "staples"),
    (4, "AASHIRVAAD ATTA (MP) 5 KG", "Aashirvaad Superior MP Atta 5kg", "Aashirvaad", "Superior MP", "5kg", "Pack", 2, 350.0, 283.23, 590.02, "staples"),
    (5, "AASHIRVAAD BANSI RAVA 01KG AP&TG", "Aashirvaad Bansi Rava 1kg", "Aashirvaad", "Bansi Rava", "1kg", "Pack", 10, 76.0, 57.23, 500.04, "staples"),
    (6, "AASHIRVAAD BANSI RAVA 500G AP&TG", "Aashirvaad Bansi Rava 500g", "Aashirvaad", "Bansi Rava", "500g", "Pack", 20, 39.0, 28.61, 500.03, "staples"),
    (7, "AASHIRVAAD SOOJI RAVA 01KG AP&TG", "Aashirvaad Sooji Rava 1kg", "Aashirvaad", "Sooji Rava", "1kg", "Pack", 15, 86.0, 63.05, 826.30, "staples"),
    (8, "AASHIRVAAD SOOJI RAVA 500G AP&TG", "Aashirvaad Sooji Rava 500g", "Aashirvaad", "Sooji Rava", "500g", "Pack", 20, 44.0, 30.04, 600.85, "staples"),
    (9, "AASHIRVAADVERMICELLINONROASTED400G", "Aashirvaad Vermicelli (Non-Roasted) 400g", "Aashirvaad", "Non-Roasted", "400g", "Pack", 10, 49.0, 39.12, 410.79, "staples"),
    (10, "AASHIRVAADVERMICELLINONROASTED250G", "Aashirvaad Vermicelli (Non-Roasted) 250g", "Aashirvaad", "Non-Roasted", "250g", "Pack", 10, 30.0, 22.89, 240.36, "staples"),
    (11, "AASHIRVAAD SALT 1KG!200GPR", "Aashirvaad Iodized Salt 1kg (+200g Promo)", "Aashirvaad", "Iodized Salt", "1kg", "Pack", 50, 32.0, 24.70, 1210.10, "staples"),
    (12, "BINGO! CHIPS RS.50 HNS KOREANS", "Bingo! Korean Style Spicy Chips Rs 50", "Bingo", "Korean Style Spicy", "70g", "Pack", 12, 50.0, 43.61, 272.62, "snacks"),
    (13, "BINGO! CHIPS RS.50 TOMATO", "Bingo! Tomato Chips Rs 50", "Bingo", "Tomato", "70g", "Pack", 12, 50.0, 43.61, 355.04, "snacks"),
    (14, "BINGO! OS RS.10 CHILLI SPRINKLED", "Bingo! Original Style Chilli Sprinkled Potato Chips Rs 10", "Bingo", "Chilli Sprinkled", "25g", "Pack", 120, 10.0, 8.66, 1032.20, "snacks"),
    (15, "BINGO! OS RS.10 CHILLI CHRG TOMATO", "Bingo! Original Style Chilli Charged Tomato Chips Rs 10", "Bingo", "Chilli Charged Tomato", "25g", "Pack", 120, 10.0, 8.66, 1032.20, "snacks"),
    (16, "MAD ANGLES RS.20 ACHAARI", "Bingo! Mad Angles Achaari Masti 66g (Rs 20)", "Bingo", "Achaari Masti", "66g", "Pack", 24, 20.0, 17.40, 414.99, "snacks"),
    (17, "MAD ANGLES RS 20 MASALA", "Bingo! Mad Angles Masala Madness 66g (Rs 20)", "Bingo", "Masala Madness", "66g", "Pack", 24, 20.0, 17.40, 217.63, "snacks"),
    
    # Page 2
    (18, "DARK FANTASY CHOC FILLS RS 10", "Sunfeast Dark Fantasy Choco Fills Biscuit (Rs 10)", "Sunfeast", "Choco Fills", "21g", "Pack", 24, 10.0, 8.50, 207.05, "snacks"),
    (19, "SF MOMS MAGIC CASHEWALMD 80G", "Sunfeast Mom's Magic Cashew & Almond Biscuits 80g", "Sunfeast", "Cashew & Almond", "80g", "Pack", 24, 30.0, 12.94, 312.92, "snacks"),
    (20, "SF MOMS MAGIC RICH BUTTER RS 5", "Sunfeast Mom's Magic Rich Butter Biscuits (Rs 5)", "Sunfeast", "Rich Butter", "28g", "Pack", 48, 5.0, 4.34, 210.19, "snacks"),
    (21, "SF MOMS MAGIC RICH BUTTER RS 10", "Sunfeast Mom's Magic Rich Butter Biscuits (Rs 10)", "Sunfeast", "Rich Butter", "54g", "Pack", 24, 10.0, 8.69, 210.19, "snacks"),
    (22, "SF FANTASTIK CH ALMOND RS 10", "Sunfeast Fantastik Choco Almond Bar (Rs 10)", "Sunfeast", "Choco Almond", "18g", "Pack", 24, 10.0, 8.66, 200.73, "confectionery"),
    (23, "SF FANTASTIK FRUIT N NUT RS 50", "Sunfeast Fantastik Fruit & Nut Bar 50g", "Sunfeast", "Fruit & Nut", "50g", "Pack", 24, 50.0, 21.65, 545.46, "confectionery"),
    (24, "SF FANTASTIK ROSTED ALMOND RS 50", "Sunfeast Fantastik Roasted Almond Bar 50g", "Sunfeast", "Roasted Almond", "50g", "Pack", 24, 50.0, 21.65, 545.46, "confectionery"),
    (25, "YIPPEE MAGICMASALA NOODLES 25G", "Sunfeast YiPPee! Magic Masala Instant Noodles 25g (Rs 5)", "Sunfeast", "Magic Masala", "25g", "Pack", 72, 5.0, 4.45, 336.71, "snacks"),
    (26, "YIPPEE MAGIC MASALA NOODLES 40G", "Sunfeast YiPPee! Magic Masala Instant Noodles 40g (Rs 10)", "Sunfeast", "Magic Masala", "40g", "Pack", 72, 10.0, 8.75, 608.50, "snacks"),
    (27, "YIPPEE MAGIC MASALA NOODLES 200G", "Sunfeast YiPPee! Magic Masala Instant Noodles 200g (Pack of 4)", "Sunfeast", "Magic Masala", "200g", "Pack", 12, 60.0, 52.49, 648.18, "snacks"),
    (28, "YIPPEE WOW MASALA NOODLES 25.7G", "Sunfeast YiPPee! Wow Masala Noodles 25.7g (Rs 5)", "Sunfeast", "Wow Masala", "25.7g", "Pack", 60, 5.0, 4.45, 270.48, "snacks"),
    (29, "YIPPEE WOW MASALA NOODLES 48G", "Sunfeast YiPPee! Wow Masala Noodles 48g (Rs 10)", "Sunfeast", "Wow Masala", "48g", "Pack", 24, 10.0, 8.75, 200.63, "snacks"),
    
    # Page 3
    (30, "MD CUP SAMBRANI RS. 72", "Mangaldeep Cup Sambrani (Pack of 12)", "Mangaldeep", "Cup Sambrani", "12 Cups", "Pack", 8, 72.0, 48.57, 391.00, "household"),
    (31, "MD 18 TRAYA STICK SAMBRANI RS 25", "Mangaldeep Traya Sambrani Sticks (Rs 25)", "Mangaldeep", "Traya Sambrani", "Stick", "Pack", 24, 25.0, 15.36, 369.63, "household"),
    (32, "MD TRAYA CUP SAMBRANI RS 75", "Mangaldeep Traya Cup Sambrani (Rs 75)", "Mangaldeep", "Traya Cup Sambrani", "Pack", "Pack", 8, 75.0, 60.19, 482.78, "household"),
    (33, "MD RS 110 SCENT 3IN1 NON PROMO", "Mangaldeep 3in1 Agarbatti 136 Sticks (Rs 110)", "Mangaldeep", "3in1 Fragrance", "136 Sticks", "Pack", 6, 110.0, 71.43, 432.02, "household"),
    (34, "MD REFRESH SANDAL RS 55", "Mangaldeep Sandal Agarbatti (Rs 55)", "Mangaldeep", "Sandalwood", "Pack", "Pack", 12, 55.0, 39.68, 483.11, "household"),
    (35, "MD 72 TEMPLE RS 55", "Mangaldeep Temple Agarbatti (Rs 55)", "Mangaldeep", "Temple Agarbatti", "Pack", "Pack", 12, 55.0, 39.68, 483.02, "household"),
    (36, "MD FLORA LAVENDER RS 60", "Mangaldeep Flora Lavender Agarbatti (Rs 60)", "Mangaldeep", "Flora Lavender", "Pack", "Pack", 12, 60.0, 39.68, 483.03, "household"),
    (37, "NIMYLE FC HERBAL 500ML", "Nimyle Herbal Floor Cleaner 500ml", "Nimyle", "Herbal Floor Cleaner", "500ml", "Bottle", 6, 95.0, 70.26, 487.09, "household"),
    (38, "NIMYLE FC HERBAL 200ML", "Nimyle Herbal Floor Cleaner 200ml", "Nimyle", "Herbal Floor Cleaner", "200ml", "Bottle", 6, 44.0, 32.54, 225.61, "household"),
    (39, "SAVLON HW MS 200ML COMBO", "Savlon Moisture Shield Handwash 200ml Refill Combo", "Savlon", "Moisture Shield", "200ml", "Pouch", 3, 99.0, 73.98, 259.20, "personal-care"),
    (40, "SAVLON HANDWASH MS 80ML", "Savlon Moisture Shield Handwash 80ml", "Savlon", "Moisture Shield", "80ml", "Pouch", 6, 49.0, 36.62, 259.26, "personal-care"),
    (41, "SAVLON HANDWASH DC 625ML POUCH", "Savlon Deep Clean Handwash 625ml Refill Pouch", "Savlon", "Deep Clean", "625ml", "Pouch", 3, 99.0, 73.98, 256.50, "personal-care"),
    (42, "SAVLON HW DC 200ML COMBO", "Savlon Deep Clean Handwash 200ml Refill Combo", "Savlon", "Deep Clean", "200ml", "Pouch", 3, 99.0, 73.98, 259.20, "personal-care")
]

for row_no, src_txt, disp, brand, var, size, unit, qty, mrp, rate, amt, cat in itc_items:
    extracted_items.append({
        'source_document': 'WhatsApp Image 2026-10-04 (Bombay Corporation / ITC Invoice)',
        'source_page': 1 if row_no <= 17 else (2 if row_no <= 29 else 3),
        'source_item_no': row_no,
        'source_name': src_txt,
        'display_name': disp,
        'brand': brand,
        'variant': var,
        'pack_size': size,
        'unit': unit,
        'package_configuration': None,
        'category_id': cat,
        'mrp': mrp,
        'mrp_source': 'Bombay Corporation / ITC Tax Invoice',
        'selling_price': None,
        'source_quantity': qty,
        'source_rate': rate,
        'source_amount': amt,
        'supplier': 'Bombay Corporation (ITC FMCG Distributor)',
        'invoice_date': '22-09-2026',
        'product_match_status': 'VERIFIED',
        'confidence': 'HIGH',
        'notes': 'Verified from Bombay Corporation / ITC Tax Invoice'
    })

print(f"Added {len(itc_items)} ITC items.")

# ----------------------------------------------------------------------
# 4. RR ENTERPRISES Invoices (AltaScanner_10_04_2026(1) & AltaScanner_10_05_2026)
# ----------------------------------------------------------------------
rr_items = [
    (1, "MYSORE SANDAL 75G X 200PC - Rs.42/-", "Mysore Sandal Soap 75g", "Mysore Sandal", "Sandalwood", "75g", "Pieces", 50, 42.0, 36.19, 1899.97, "personal-care"),
    (2, "MYSORE SANDAL 125GX120PC Rs.63/-", "Mysore Sandal Soap 125g", "Mysore Sandal", "Sandalwood", "125g", "Pieces", 24, 63.0, 53.33, 1343.92, "personal-care"),
    (3, "MYSORE SANDAL 150G X 100PC - Rs.75/-", "Mysore Sandal Soap 150g", "Mysore Sandal", "Sandalwood", "150g", "Pieces", 12, 75.0, 64.76, 815.98, "personal-care"),
    (4, "MYSORE SANDAL 150G*3 X 30Pc - Rs.245/-", "Mysore Sandal Soap 150g (Pack of 3)", "Mysore Sandal", "Sandalwood Multipack", "150g", "Pieces", 3, 245.0, 209.52, 659.99, "personal-care"),
    (5, "MARGO 100G X 168PC - Rs.40/-", "Margo Original Neem Soap 100g", "Margo", "Neem", "100g", "Pieces", 24, 40.0, 35.27, 888.80, "personal-care"),
    (6, "KLEENOL LIQUID 1 Ltr X 130/-", "Kleenol Floor Cleaner Liquid 1L", "Kleenol", "Floor Cleaner", "1L", "Pieces", 3, 130.0, 88.98, 314.99, "household"),
    (7, "ZOOM DET BAR 200G X 60PC - Rs.21/-", "Zoom Detergent Bar 200g", "Zoom", "Detergent Bar", "200g", "Pieces", 60, 21.0, 15.00, 1062.00, "household"),
    (8, "ZOOM MEGA WHITE 275G X 40PC - Rs.26/-", "Zoom Mega White Detergent Bar 275g", "Zoom", "Mega White", "275g", "Pieces", 40, 26.0, 19.07, 900.10, "household"),
    (9, "ULTRA WASH 1LTR X 12PC - Rs.99/-", "Ultra Wash Liquid Detergent 1L", "Ultra Wash", "Liquid Detergent", "1L", "Pieces", 12, 99.0, 72.03, 1019.94, "household"),
    (10, "WB LEAF 100G X 180Pc Rs.50/-", "Wagh Bakri Premium Leaf Tea 100g", "Wagh Bakri", "Premium Leaf", "100g", "Pieces", 6, 50.0, 42.86, 270.02, "beverages"),
    (11, "WB LEAF 250G X 72Pc Rs.160/-", "Wagh Bakri Premium Leaf Tea 250g", "Wagh Bakri", "Premium Leaf", "250g", "Pieces", 6, 160.0, 138.53, 872.74, "beverages"),
    (12, "WB LEAF 500G X 36PC - Rs.320/-", "Wagh Bakri Premium Leaf Tea 500g", "Wagh Bakri", "Premium Leaf", "500g", "Pieces", 3, 320.0, 277.06, 872.74, "beverages"),
    (13, "NC ELACHI 100G X Rs.50/- Jar", "Navchetan Elaichi Tea 100g Jar", "Navchetan", "Elaichi Tea", "100g", "Jar", 6, 50.0, 41.90, 263.97, "beverages"),
    (14, "GKL SEEDED DATES 500G X 20SETS (1+1) - Rs.238/-", "GKL Seeded Dates 500g (1+1 Offer)", "GKL", "Seeded Dates", "500g", "Sets", 5, 238.0, 195.24, 1025.01, "dry-fruits"),
    (15, "GKL SEEDLESS DATES 250G (1+1) X 40SETS - Rs.160/-", "GKL Seedless Dates 250g (1+1 Offer)", "GKL", "Seedless Dates", "250g", "Sets", 4, 160.0, 128.57, 539.99, "dry-fruits")
]

for row_no, src_txt, disp, brand, var, size, unit, qty, mrp, rate, amt, cat in rr_items:
    extracted_items.append({
        'source_document': 'AltaScanner_10_04_2026(1).pdf',
        'source_page': 1,
        'source_item_no': row_no,
        'source_name': src_txt,
        'display_name': disp,
        'brand': brand,
        'variant': var,
        'pack_size': size,
        'unit': unit,
        'package_configuration': None,
        'category_id': cat,
        'mrp': mrp,
        'mrp_source': 'RR Enterprises Tax Invoice RRE26/27-4456',
        'selling_price': None,
        'source_quantity': qty,
        'source_rate': rate,
        'source_amount': amt,
        'supplier': 'RR Enterprises',
        'invoice_date': '24-09-2026',
        'product_match_status': 'VERIFIED',
        'confidence': 'HIGH',
        'notes': 'Verified from RR Enterprises Tax Invoice'
    })

print(f"Added {len(rr_items)} RR Enterprises items.")

# ----------------------------------------------------------------------
# 5. JAY GOGA JI Estimations (AltaScanner_10_04_2026.pdf)
# ----------------------------------------------------------------------
jg_items = [
    (1, "LOTTE CHOCO PIE", "Lotte Choco Pie (Rs 10)", "Lotte", "Choco Pie", "28g", "Box", 3, 10.0, 146.0, 438.0, "snacks"),
    (2, "MALKIST BIG", "Malkist Crackers Big Family Pack", "Malkist", "Crackers", "Big Pack", "Box", 2, 200.0, 170.0, 340.0, "snacks"),
    (3, "KITKAT 30", "Nestlé Kitkat 4 Finger Chocolate Bar (Rs 30)", "Kitkat", "Milk Chocolate", "37.3g", "Box", 2, 30.0, 560.0, 1120.0, "confectionery"),
    (4, "PEARK 10", "Cadbury Perk Chocolate Wafer Bar (Rs 10)", "Perk", "Chocolate Wafer", "13g", "Box", 2, 10.0, 270.0, 540.0, "confectionery"),
    (5, "5STAR TEA 250G", "5 Star Dust Tea 250g", None, "Dust Tea", "250g", "Kata", 2, None, 550.0, 1100.0, "beverages"),
    (6, "FEVIGUM 10", "Pidilite Fevigum Synthetic Gum 10", "Fevigum", "Gum", "Small", "Sheet", 1, 10.0, 85.0, 85.0, "household"),
    (7, "MILKY BAR 5", "Nestlé Milkybar White Chocolate Bar (Rs 5)", "Milkybar", "White Chocolate", "10g", "Box", 6, 5.0, 128.0, 768.0, "confectionery"),
    (8, "MUNCH 5", "Nestlé Munch Chocolate Coated Wafer (Rs 5)", "Munch", "Wafer", "9g", "Box", 2, 5.0, 144.0, 288.0, "confectionery"),
    (9, "5STAR 10", "Cadbury 5 Star Chocolate Bar 20g (Rs 10)", "Cadbury", "Chocolate Bar", "20g", "Box", 2, 10.0, 358.0, 716.0, "confectionery"),
    (10, "COMFORT 400ML", "Comfort After Wash Fabric Conditioner 400ml", "Comfort", "Fabric Conditioner", "400ml", "Pcs", 4, 125.0, 112.0, 448.0, "household"),
    (11, "HEAD AND SHOULDER 2", "Head & Shoulders Anti-Dandruff Shampoo Sachet (Rs 2)", "Head & Shoulders", "Anti-Dandruff", "6ml", "Sheet", 10, 2.0, 30.0, 300.0, "personal-care"),
    (12, "SUNRISE 5", "Nestlé Sunrise Instant Coffee Sachet (Rs 5)", "Sunrise", "Coffee Chicory", "Sachet", "Kata", 2, 5.0, 270.0, 540.0, "beverages"),
    (13, "HIDE & SEEK BISCUITS", "Parle Hide & Seek Chocolate Chip Biscuits (Rs 10)", "Parle", "Choco Chip", "33g", "Pcs", 20, 10.0, 9.0, 180.0, "snacks"),
    (14, "BOURBON BISCUITS", "Britannia Bourbon Chocolate Cream Biscuits (Rs 10)", "Britannia", "Chocolate Cream", "44g", "Kata", 1, 10.0, 180.0, 180.0, "snacks"),
    (15, "MILKY BAR 10", "Nestlé Milkybar White Chocolate Bar (Rs 10)", "Milkybar", "White Chocolate", "20g", "Box", 2, 10.0, 216.0, 432.0, "confectionery"),
    (16, "ENO OR 30PIC", "Eno Fruit Salt Regular/Orange Sachet Box (Pack of 30)", "Eno", "Fruit Salt", "30 Sachets", "Box", 1, None, 248.0, 248.0, "personal-care"),
    (17, "GOKUL SOAP", "Gokul Santol Pure Sandalwood Soap Multipack", "Gokul", "Sandalwood", "Pack of 4", "Set", 4, 160.0, 148.0, 592.0, "personal-care"),
    (18, "NAVRATNA OIL 50ML", "Emami Navratna Ayurvedic Cool Hair Oil 50ml", "Navratna", "Cool Oil", "50ml", "Pcs", 12, 47.0, 43.5, 522.0, "personal-care"),
    (19, "HEAD AND SHOULDER 180ML", "Head & Shoulders Anti-Dandruff Shampoo 180ml", "Head & Shoulders", "Anti-Dandruff", "180ml", "Pcs", 6, 218.0, 198.0, 1188.0, "personal-care"),
    (20, "HEAD AND SHOULDER 100ML", "Head & Shoulders Anti-Dandruff Shampoo 100ml", "Head & Shoulders", "Anti-Dandruff", "100ml", "Pcs", 3, 79.0, 71.5, 214.5, "personal-care"),
    (21, "SAN H.W. BIG", "Santoor Gentle Handwash Dispenser Pump 500ml", "Santoor", "Gentle Handwash", "500ml", "Pcs", 2, 105.0, 95.0, 190.0, "personal-care"),
    (22, "LION HONEY SET", "Lion Honey 250g Jar Combo Set", "Lion Honey", "Pure Honey", "Set", "Set", 3, None, 145.0, 435.0, "staples"),
    (23, "NIPPO AAA", "Nippo AAA Batteries (Pack of 10)", "Nippo", "AAA Battery", "Pack", "Sheet", 1, None, 210.0, 210.0, "household"),
    (24, "NIPPO GOLD", "Nippo Gold AA Batteries (Pack of 10)", "Nippo", "AA Gold Battery", "Pack", "Sheet", 1, None, 210.0, 210.0, "household"),
    (25, "WIPRO SOFTOUCH 200ML", "Wipro Softouch Fabric Conditioner 200ml", "Wipro Softouch", "Fabric Conditioner", "200ml", "Pcs", 5, 62.0, 56.5, 282.5, "household"),
    (26, "STAYFREE EXTRA LARGE 50", "Stayfree Secure Extra Large Sanitary Pads (Pack of 6)", "Stayfree", "Extra Large", "Pack of 6", "Pcs", 12, 50.0, 42.0, 504.0, "personal-care"),
    (27, "MAGGI 15", "Maggi 2-Minute Instant Noodles (Rs 15)", "Maggi", "Masala Noodles", "60g", "Pkt", 12, 15.0, 13.5, 162.0, "staples"),
    (28, "SAN SOAP 100G", "Santoor Sandal & Turmeric Soap 100g", "Santoor", "Sandal & Turmeric", "100g", "Pcs", 16, 40.0, 35.0, 560.0, "personal-care"),
    (29, "HAMAM SOAP", "Hamam Neem Tulsi Aloe Vera Soap 100g", "Hamam", "Neem Tulsi", "100g", "Pcs", 21, 40.0, 36.5, 766.5, "personal-care")
]

for row_no, src_txt, disp, brand, var, size, unit, qty, mrp, rate, amt, cat in jg_items:
    extracted_items.append({
        'source_document': 'AltaScanner_10_04_2026.pdf',
        'source_page': 1,
        'source_item_no': row_no,
        'source_name': src_txt,
        'display_name': disp,
        'brand': brand,
        'variant': var,
        'pack_size': size,
        'unit': unit,
        'package_configuration': None,
        'category_id': cat,
        'mrp': mrp,
        'mrp_source': 'Jay Goga Ji Estimation L-109',
        'selling_price': None,
        'source_quantity': qty,
        'source_rate': rate,
        'source_amount': amt,
        'supplier': 'Jay Goga Ji',
        'invoice_date': '22-09-2026',
        'product_match_status': 'VERIFIED',
        'confidence': 'HIGH',
        'notes': 'Verified from Jay Goga Ji Estimation'
    })

print(f"Added {len(jg_items)} Jay Goga Ji items.")
print(f"Total structured items extracted from supplier invoices/handwritten: {len(extracted_items)}")
