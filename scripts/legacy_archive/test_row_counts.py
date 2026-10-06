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

total_extracted_rows = 0
doc_counts = {}

# Skip words
SKIP_WORDS = ['tax invoice', 'estimation', 'customer details', 'party :', 'gstin', 'bank', 'canara', 'sbi', 'ifsc', 'total', 'signature', 'cgst', 'sgst', 'subtotal', 'gross', 'discount', 'dated:', 'bill no', 'item sales detail', 'grand total', 'hsn', 'qty uom', 'unit price', 'taxable']

for page_name, boxes in sorted(cache.items()):
    doc_base = page_name.rsplit('_p', 1)[0] if '_p' in page_name else page_name.replace('.jpg', '')
    if doc_base not in doc_counts:
        doc_counts[doc_base] = 0
        
    rows = cluster_lines_into_rows(boxes, y_tol=10)
    for r in rows:
        row_str = " ".join(r)
        row_lower = row_str.lower()
        if any(sw in row_lower for sw in SKIP_WORDS):
            continue
        
        # Check if line contains a valid product row (text + numeric quantity/rate)
        # e.g., contains words and numbers
        has_letters = bool(re.search(r'[a-zA-Z]{3,}', row_str))
        has_numbers = bool(re.search(r'\d+(\.\d+)?', row_str))
        if has_letters and has_numbers and len(row_str) >= 10:
            doc_counts[doc_base] += 1
            total_extracted_rows += 1

print("Source row counts by document:")
for d, c in doc_counts.items():
    print(f"  {d}: {c} rows")
print(f"Total extracted rows across all files: {total_extracted_rows}")
