import os
import sys
import glob
from pathlib import Path
from PIL import Image
import rembg

RAW_DIR = Path("product-photos-raw")
OUTPUT_DIR = Path("public/products/cutouts")
TARGET_SIZE = (800, 800)
PADDING_RATIO = 0.08  # 8% padding so packshot sits cleanly in center

def process_photos():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp")
    files = []
    for ext in extensions:
        files.extend(list(RAW_DIR.glob(ext)))
        files.extend(list(RAW_DIR.glob(ext.upper())))
    
    files = sorted(list(set(files)))
    if not files:
        print("No raw photos found in product-photos-raw/")
        generate_contact_sheet([])
        return

    print(f"Found {len(files)} raw photos. Processing cutouts...")
    processed = []

    session = rembg.new_session()

    for idx, file_path in enumerate(files, 1):
        filename = file_path.stem
        out_filename = f"{filename}.webp"
        out_path = OUTPUT_DIR / out_filename
        print(f"[{idx}/{len(files)}] Processing {file_path.name} -> {out_filename}...")
        
        try:
            with Image.open(file_path) as img:
                # 1. Remove background
                cutout = rembg.remove(img, session=session)
                
                # 2. Crop bounding box of non-transparent pixels
                bbox = cutout.getbbox()
                if bbox:
                    cutout = cutout.crop(bbox)
                
                # 3. Fit into 800x800 square with padding
                max_w = int(TARGET_SIZE[0] * (1.0 - 2 * PADDING_RATIO))
                max_h = int(TARGET_SIZE[1] * (1.0 - 2 * PADDING_RATIO))
                
                cutout.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
                
                # Create empty RGBA canvas
                canvas = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
                paste_x = (TARGET_SIZE[0] - cutout.width) // 2
                paste_y = (TARGET_SIZE[1] - cutout.height) // 2
                canvas.paste(cutout, (paste_x, paste_y), cutout)
                
                # Save as transparent WebP
                canvas.save(out_path, "WEBP", quality=90)
                processed.append({
                    "raw": str(file_path),
                    "out": f"/products/cutouts/{out_filename}",
                    "name": filename
                })
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")

    generate_contact_sheet(processed)
    print("Done processing photos and generated docs/image-review.html.")

def generate_contact_sheet(items):
    docs_dir = Path("docs")
    docs_dir.mkdir(parents=True, exist_ok=True)
    html_path = docs_dir / "image-review.html"
    
    rows_html = ""
    if not items:
        rows_html = "<tr><td colspan='4' style='text-align:center; padding: 2rem;'>No raw photos in product-photos-raw/ to review yet. Place photos there and rerun python scripts/process_photos.py</td></tr>"
    else:
        for it in items:
            rows_html += f"""
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500;">{it['name']}</td>
                <td style="padding: 12px; text-align: center;">
                    <img src="../{it['raw']}" style="max-height: 140px; max-width: 140px; object-fit: contain; border-radius: 4px;" alt="Raw photo" />
                </td>
                <td style="padding: 12px; text-align: center; background: #ffffff;">
                    <!-- Checkerboard/white container to test transparency and white bg -->
                    <div style="width: 140px; height: 140px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px dashed #cbd5e1;">
                        <img src="..{it['out']}" style="max-height: 130px; max-width: 130px; object-fit: contain;" alt="Cutout WebP" />
                    </div>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <button style="padding: 6px 12px; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px;">Approve</button>
                    <button style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">Reject</button>
                </td>
            </tr>
            """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>G1 Mart - Product Image Contact Sheet & Review</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 24px;
            background: #f8fafc;
            color: #0f172a;
        }}
        .header {{
            margin-bottom: 24px;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
        h1 {{ margin: 0 0 8px 0; font-size: 22px; color: #166534; }}
        p {{ margin: 0; color: #64748b; font-size: 14px; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
        th {{
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #475569;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>G1 Mart - Product Cutout Verification Contact Sheet</h1>
        <p>Target: 800x800 transparent WebP. Must be verified and approved by owner before appearing on storefront.</p>
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 30%;">Product / File Name</th>
                <th style="width: 25%; text-align: center;">Raw Photo</th>
                <th style="width: 25%; text-align: center;">Transparent Cutout (800x800)</th>
                <th style="width: 20%; text-align: center;">Status / Action</th>
            </tr>
        </thead>
        <tbody>
            {rows_html}
        </tbody>
    </table>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    process_photos()
