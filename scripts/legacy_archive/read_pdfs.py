import fitz # PyMuPDF
import os

pdf_files = [
    r'C:\Users\gumma\OneDrive\Documents\PRODUCTS.PDF',
    r'C:\Users\gumma\OneDrive\Documents\AltaScanner_10_04_2026.pdf',
    r'C:\Users\gumma\OneDrive\Documents\AltaScanner_10_05_2026.pdf',
    r'C:\Users\gumma\OneDrive\Documents\passphotos\ITC .pdf',
    r'C:\Users\gumma\OneDrive\Documents\Supermarket_Online_Ordering_Project_Documentation.pdf'
]

for p in pdf_files:
    if not os.path.exists(p):
        continue
    print("=" * 60)
    print("FILE:", p)
    doc = fitz.open(p)
    print("Page count:", len(doc))
    for i in range(min(len(doc), 3)):
        page = doc[i]
        text = page.get_text()
        print(f"--- PAGE {i+1} (first 300 chars text) ---")
        print(text[:300].strip())
        images = page.get_images()
        print(f"Images on page {i+1}: {len(images)}")
