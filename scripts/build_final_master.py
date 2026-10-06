import json

with open('data/pdf1_complete_import.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from pdf1_complete_import.json")

# Verified image URLs in Supabase Storage
VERIFIED_STORAGE_IMAGES = {
    "pdf1-007": "https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-007/primary.jpg", # Swastiks Roasted Vermicelli 400g
    "pdf1-095": "https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-095/primary.jpg", # G1 MART Ganji Pindi 100g
    "pdf1-096": "https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images/pdf1-096/primary.jpg", # G1 MART Washing Soda 100g
}

final_master = []
for p in products:
    pid = p['id']
    
    # Check if exact image verified & stored
    if pid in VERIFIED_STORAGE_IMAGES:
        img_url = VERIFIED_STORAGE_IMAGES[pid]
        img_status = "VERIFIED"
    else:
        img_url = None
        img_status = "NEEDS_REVIEW"
        
    master_item = {
        "id": pid,
        "item_no": p.get("item_no"),
        "product_name": p.get("product_name"),
        "name": p.get("product_name"), # App compatibility
        "brand": p.get("brand"),
        "variant": p.get("variant"),
        "pack_size": p.get("pack_size"),
        "unit": p.get("pack_size"), # App compatibility
        "mrp": p.get("mrp"),
        "source_rate": p.get("source_rate"),
        "selling_price": None, # MUST remain NULL
        "image_url": img_url,
        "image_status": img_status,
        "verification_status": p.get("verification_status", "CONFIRMED"),
        "identity_status": p.get("identity_status", "CANONICAL_MATCH"),
        "mrp_status": p.get("mrp_status", "CONFIRMED"),
        "source_pdf": p.get("source_pdf", "AltaScanner_10_04_2026(1)(1).pdf"),
        "invoice_number": p.get("invoice_number"),
        "invoice_page": p.get("invoice_page"),
        "invoice_rows": p.get("invoice_rows", []),
        "raw_invoice_description": p.get("raw_invoice_description"),
        "notes": p.get("notes", "")
    }
    final_master.append(master_item)

print(f"Generated {len(final_master)} final master products.")

with open('data/pdf1_final_master_products.json', 'w', encoding='utf-8') as f:
    json.dump(final_master, f, indent=2, ensure_ascii=False)

print("Saved to data/pdf1_final_master_products.json successfully.")
