import pymupdf
import os

scratch_dir = r'C:\Users\gumma\.gemini\antigravity-ide\brain\2954e95a-4e50-4762-bdcc-feb953725071\scratch\source_docs'
os.makedirs(scratch_dir, exist_ok=True)

for name, path in [
    ('altascanner_1', r'C:\Users\gumma\OneDrive\Documents\AltaScanner_10_04_2026.pdf'),
    ('altascanner_2', r'C:\Users\gumma\OneDrive\Documents\AltaScanner_10_05_2026.pdf'),
    ('itc_doc', r'C:\Users\gumma\OneDrive\Documents\passphotos\ITC .pdf')
]:
    doc = pymupdf.open(path)
    print(f"Extracting {name} ({len(doc)} pages)...")
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        image_list = page.get_images()
        for img_idx, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            img_filename = os.path.join(scratch_dir, f"{name}_p{page_idx+1}_{img_idx}.{image_ext}")
            with open(img_filename, "wb") as f:
                f.write(image_bytes)
            print(f"Saved: {img_filename} ({base_image['width']}x{base_image['height']})")
