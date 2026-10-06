import os
import re
import json
import csv
import pymupdf

SCRATCH_DIR = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch'
OCR_CACHE_FILE = os.path.join(SCRATCH_DIR, 'ocr_cache.json')
G1_FOLDER = r'C:\Users\gumma\OneDrive\Documents\G1 Products'

with open(OCR_CACHE_FILE, 'r', encoding='utf-8') as f:
    ocr_cache = json.load(f)

extracted_sources = []

# -------------------------------------------------------------
# 1. PRODUCTS.PDF (Item Sales Detail - 472 rows)
# -------------------------------------------------------------
products_pdf = os.path.join(G1_FOLDER, 'PRODUCTS.PDF')
if os.path.exists(products_pdf):
    doc = pymupdf.open(products_pdf)
    item_counter = 0
    for page_idx in range(len(doc)):
        text = doc[page_idx].get_text('text')
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Parse items from digital text
        # Format usually: Name, [pack_size], Qty, Unit, Rate, Amount
        i = 0
        while i < len(lines):
            line = lines[i]
            # Check for header/footer
            if any(h in line for h in ['Item Sales Detail', 'G1 MART', 'From:', 'Page', 'Item Name', 'Cash A/c', 'Grand Total']):
                i += 1
                continue
            
            # Match item pattern: line is name, followed by optional size, qty, unit, rate, amount
            # Look ahead for quantity (number with decimal e.g. 1.00, 2.00, 6.00)
            if i + 3 < len(lines):
                # Check if lines[i+1] or lines[i+2] is a quantity
                qty_match = re.match(r'^\d+\.\d{2}$', lines[i+1])
                qty_match2 = re.match(r'^\d+\.\d{2}$', lines[i+2])
                
                if qty_match:
                    name = line
                    qty = float(lines[i+1])
                    unit = lines[i+2] if i+2 < len(lines) else 'Pieces'
                    rate = float(lines[i+3]) if i+3 < len(lines) and re.match(r'^\d+(\.\d+)?$', lines[i+3]) else None
                    amount = float(lines[i+4]) if i+4 < len(lines) and re.match(r'^\d+(\.\d+)?$', lines[i+4]) else None
                    advance = 5
                elif qty_match2:
                    name = f"{line} {lines[i+1]}"
                    qty = float(lines[i+2])
                    unit = lines[i+3] if i+3 < len(lines) else 'Pieces'
                    rate = float(lines[i+4]) if i+4 < len(lines) and re.match(r'^\d+(\.\d+)?$', lines[i+4]) else None
                    amount = float(lines[i+5]) if i+5 < len(lines) and re.match(r'^\d+(\.\d+)?$', lines[i+5]) else None
                    advance = 6
                else:
                    i += 1
                    continue
                
                item_counter += 1
                extracted_sources.append({
                    'source_document': 'PRODUCTS.PDF',
                    'source_page': page_idx + 1,
                    'source_item_no': item_counter,
                    'source_name': name,
                    'supplier': 'G1 Mart Historical Sales',
                    'invoice_date': '23-09-2026 to 29-09-2026',
                    'source_quantity': qty,
                    'source_unit': unit,
                    'source_rate': rate,
                    'source_amount': amount,
                    'source_mrp': None # Sales report rates are NOT MRP
                })
                i += advance
            else:
                i += 1

print(f"1. PRODUCTS.PDF: extracted {item_counter} product rows.")
