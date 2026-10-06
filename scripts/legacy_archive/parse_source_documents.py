import os
import re
import json

SCRATCH_DIR = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch'
OCR_CACHE_FILE = os.path.join(SCRATCH_DIR, 'ocr_cache.json')

with open(OCR_CACHE_FILE, 'r', encoding='utf-8') as f:
    cache = json.load(f)

def cluster_lines_into_rows(boxes, y_tol=10):
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

# Group pages by document
docs = {}
for page_name, boxes in sorted(cache.items()):
    if '_p' in page_name:
        doc_base = page_name.rsplit('_p', 1)[0]
    else:
        doc_base = page_name.replace('.jpg', '')
    docs.setdefault(doc_base, []).append((page_name, boxes))

inventory = []

for doc_name, pages in sorted(docs.items()):
    if doc_name == 'PRODUCTS':
        inventory.append({
            'filename': 'PRODUCTS.PDF',
            'file_type': 'PDF (Digital Text)',
            'pages': 13,
            'is_product_source': 'YES',
            'estimated_rows': 472,
            'supplier': 'G1 Mart Historical Sales',
            'date': '23-09-2026 to 29-09-2026',
            'notes': '472 existing master products (g1-prod-001 to g1-prod-472)'
        })
        continue

    # Count product rows across all pages of this document
    doc_rows = 0
    suppliers = set()
    dates = set()

    for p_name, boxes in pages:
        rows = cluster_lines_into_rows(boxes, y_tol=12)
        for r in rows:
            line_str = " ".join(r)
            # Detect supplier
            for s_name in ['RR ENTERPRISES', 'SRINIVASA TRADERS', 'JAY GOGA JI', 'BOMBAY CORPORATION', 'ITC']:
                if s_name.lower() in line_str.lower():
                    suppliers.add(s_name)
            # Detect dates
            date_m = re.search(r'(\d{2}[-/]\d{2}[-/]\d{4})', line_str)
            if date_m:
                dates.add(date_m.group(1))

            # Is this a product row?
            # Check for item patterns (starts with number or contains price/qty)
            if any(h in line_str.lower() for h in ['tax invoice', 'estimation', 'customer', 'gstin', 'bank', 'total', 'signature', 'cgst', 'sgst']):
                continue
            
            # Check if row looks like a product line (e.g. contains item name and numbers)
            has_letters = bool(re.search(r'[a-zA-Z]{3,}', line_str))
            has_numbers = bool(re.search(r'\d+(\.\d+)?', line_str))
            if has_letters and has_numbers and len(line_str) > 8:
                doc_rows += 1

    file_type = 'PDF (Scanned)' if 'AltaScanner' in doc_name else 'Image (JPEG)'
    fname = f"{doc_name}.pdf" if 'AltaScanner' in doc_name else f"{doc_name}.jpeg"
    
    # Special case for handwritten list
    if 'AltaScanner_10_05_2026(6)' in doc_name:
        doc_rows = 29
        suppliers.add('Local Producer / Handwritten List')

    inventory.append({
        'filename': fname,
        'file_type': file_type,
        'pages': len(pages) if 'PDF' in file_type else 1,
        'is_product_source': 'YES',
        'estimated_rows': doc_rows,
        'supplier': ", ".join(suppliers) if suppliers else 'Supplier / Distributor',
        'date': ", ".join(dates) if dates else 'Sept-Oct 2026',
        'notes': f'{len(pages)} page(s) analyzed'
    })

print(json.dumps(inventory, indent=2))
