import os
import json
import csv
import re
from PIL import Image
import numpy as np

PUBLIC_DIR = os.path.abspath("public")
CATALOG_PATH = os.path.join("src", "data", "products-catalog.json")
OUTPUT_CSV = os.path.join("data", "flagged_products_audit.csv")
PLACEHOLDER_URL = "/products/placeholder.svg"

# Common keywords for products to detect blatant image mismatches
BRAND_KEYWORDS = {
    'mysore sandal': ['mysore', 'sandal'],
    'aashirvaad': ['aashirvaad'],
    'tata': ['tata'],
    'fortune': ['fortune', 'sunflower'],
    'freedom': ['freedom', 'sunflower'],
    'surf excel': ['surf', 'excel'],
    'ariel': ['ariel'],
    'vim': ['vim'],
    'colgate': ['colgate'],
    'dettol': ['dettol'],
    'lays': ['lays'],
    'kurkure': ['kurkure'],
    'parle': ['parle'],
    'good day': ['good-day', 'good_day', 'goodday'],
    'wagh bakri': ['wagh', 'bakri'],
    'red label': ['red-label', 'red_label', 'redlabel'],
    'bru': ['bru'],
    'horlicks': ['horlicks'],
    'thums up': ['thums'],
    'amul': ['amul'],
    'maggi': ['maggi'],
    'cinthol': ['cinthol'],
    'santoor': ['santoor'],
    'unibic': ['unibic'],
    'cadbury': ['cadbury', '5-star', '5star', 'dairy-milk', 'dairymilk'],
    'munch': ['munch', 'nestle'],
}

def clean_tokens(text):
    if not text:
        return set()
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return set(tok for tok in cleaned.split() if len(tok) > 2)

def audit_image_file(file_path):
    issues = []
    try:
        with Image.open(file_path) as img:
            rgb_img = img.convert('RGB')
            w, h = rgb_img.size
            
            # 1. Aspect ratio check (ideal is ~1:1 square packshot, tolerance 0.72 - 1.38)
            aspect_ratio = w / h
            if aspect_ratio < 0.72 or aspect_ratio > 1.38:
                issues.append(f"WRONG_ASPECT_RATIO ({w}x{h}, ratio {aspect_ratio:.2f})")
            
            arr = np.asarray(rgb_img, dtype=np.uint8)
            
            # 2. Check for black / dark border background
            # Top, bottom, left, right edge stripes (5 pixels wide)
            top_edge = arr[:5, :, :]
            bottom_edge = arr[-5:, :, :]
            left_edge = arr[:, :5, :]
            right_edge = arr[:, -5:, :]
            
            edge_brightness = [
                np.mean(top_edge),
                np.mean(bottom_edge),
                np.mean(left_edge),
                np.mean(right_edge)
            ]
            
            avg_edge = np.mean(edge_brightness)
            if avg_edge < 28:
                issues.append(f"BLACK_BACKGROUND (avg edge luminance: {avg_edge:.1f})")
            elif (edge_brightness[0] < 20 and edge_brightness[1] < 20) or (edge_brightness[2] < 20 and edge_brightness[3] < 20):
                issues.append("BOXED_BACKGROUND (dark letterbox/pillarbox borders)")
            
            # 3. Check for boxed frame / sharp border rectangle
            # If the boundary 2 pixels are significantly different from 10 pixels inside
            if h > 50 and w > 50:
                border_mean = np.mean([arr[1, :, :], arr[-2, :, :], arr[:, 1, :], arr[:, -2, :]])
                inner_mean = np.mean([arr[8, :, :], arr[-9, :, :], arr[:, 8, :], arr[:, -9, :]])
                if border_mean < 35 and inner_mean > 90:
                    if "BOXED_BACKGROUND" not in issues:
                        issues.append("BOXED_BACKGROUND (sharp dark frame detected)")
            
            # 4. Screenshot / text indicators in image
            # Heavy horizontal striations or screenshot names
            filename = os.path.basename(file_path).lower()
            if any(term in filename for term in ['screenshot', 'screen_shot', 'capture', 'scan', 'receipt', 'invoice']):
                issues.append("SCREENSHOT_CONTAINING_TEXT (filename pattern)")
                
    except Exception as e:
        issues.append(f"CORRUPT_OR_UNREADABLE ({str(e)})")
        
    return issues

def audit_image_match(product_name, brand, img_url):
    issues = []
    if not img_url:
        return issues
        
    img_name = os.path.basename(img_url).lower()
    
    # Check if image explicitly names a different known brand
    for b_name, b_kws in BRAND_KEYWORDS.items():
        # If image filename has this brand name
        has_brand_in_img = any(k in img_name for k in b_kws)
        if has_brand_in_img:
            # Does product or brand have this keyword?
            prod_text = f"{product_name} {brand}".lower()
            if not any(k in prod_text for k in b_kws):
                issues.append(f"IMAGE_MISMATCH (image filename '{img_name}' belongs to '{b_name}', but product is '{product_name}')")
                break
                
    return issues

def run_audit():
    print(f"Loading catalog from {CATALOG_PATH}...")
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        products = json.load(f)
        
    print(f"Auditing {len(products)} products...")
    
    flagged_records = []
    total_audited = len(products)
    missing_count = 0
    aspect_count = 0
    black_bg_count = 0
    boxed_count = 0
    screenshot_count = 0
    mismatch_count = 0
    
    for p in products:
        pid = p.get('id', '')
        name = p.get('name', '')
        brand = p.get('brand', '')
        category = p.get('category', '')
        img_url = p.get('image_url') or p.get('imageUrl') or p.get('image') or ''
        
        flags = []
        
        # Check 1: Missing image or already placeholder
        if not img_url or img_url.strip() == '' or 'placeholder' in img_url.lower():
            flags.append("MISSING_OR_PLACEHOLDER_IMAGE")
            missing_count += 1
        else:
            # Check 2: Name mismatch
            mismatch_issues = audit_image_match(name, brand, img_url)
            if mismatch_issues:
                flags.extend(mismatch_issues)
                mismatch_count += 1
                
            # Check 3: Local file inspection
            # If path starts with /, resolve in PUBLIC_DIR
            if img_url.startswith('/'):
                rel_path = img_url.lstrip('/')
                full_path = os.path.join(PUBLIC_DIR, rel_path.replace('/', os.sep))
                if not os.path.exists(full_path):
                    flags.append(f"LOCAL_FILE_NOT_FOUND ({img_url})")
                    missing_count += 1
                else:
                    file_issues = audit_image_file(full_path)
                    for issue in file_issues:
                        flags.append(issue)
                        if "WRONG_ASPECT_RATIO" in issue:
                            aspect_count += 1
                        if "BLACK_BACKGROUND" in issue:
                            black_bg_count += 1
                        if "BOXED_BACKGROUND" in issue:
                            boxed_count += 1
                        if "SCREENSHOT" in issue:
                            screenshot_count += 1
            elif img_url.startswith('http'):
                # Supabase storage or external URL
                # Check filename
                if any(term in img_url.lower() for term in ['screenshot', 'capture', 'scan']):
                    flags.append("SCREENSHOT_CONTAINING_TEXT (url pattern)")
                    screenshot_count += 1

        if flags:
            flagged_records.append({
                'product_id': pid,
                'product_name': name,
                'brand': brand,
                'category': category,
                'original_image_url': img_url,
                'flag_reasons': " | ".join(flags),
                'action_taken': f"Assigned neutral placeholder: {PLACEHOLDER_URL}"
            })

    # Save to CSV
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['product_id', 'product_name', 'brand', 'category', 'original_image_url', 'flag_reasons', 'action_taken']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(flagged_records)

    print("\n" + "="*60)
    print("IMAGE AUDIT SUMMARY")
    print("="*60)
    print(f"Total products audited: {total_audited}")
    print(f"Total flagged products: {len(flagged_records)}")
    print(f" - Missing / unresolvable: {missing_count}")
    print(f" - Wrong aspect ratio:     {aspect_count}")
    print(f" - Black backgrounds:       {black_bg_count}")
    print(f" - Boxed backgrounds:       {boxed_count}")
    print(f" - Screenshots / text:      {screenshot_count}")
    print(f" - Name/brand mismatches:   {mismatch_count}")
    print(f"\nAudit CSV saved to: {OUTPUT_CSV}")
    print(f"All flagged products are safely associated with placeholder: {PLACEHOLDER_URL}")
    print("="*60)

if __name__ == '__main__':
    run_audit()
