import json

for fname in ["data/pdf1_final_master_products.json", "data/pdf1_complete_import.json", "data/pdf1_branded_image_research.json"]:
    with open(fname, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n{fname}: type {type(data)}")
    if isinstance(data, list):
        print(f"  Count: {len(data)}")
        if len(data) > 0:
            print("  First item keys:", list(data[0].keys()))
            print("  Sample item:", {k: data[0][k] for k in list(data[0].keys())[:8]})
    elif isinstance(data, dict):
        print("  Keys:", list(data.keys())[:10])
