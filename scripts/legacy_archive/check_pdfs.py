import os

pdf_files = [
    r'C:\Users\gumma\OneDrive\Documents\AltaScanner_10_04_2026.pdf',
    r'C:\Users\gumma\OneDrive\Documents\AltaScanner_10_05_2026.pdf',
    r'C:\Users\gumma\OneDrive\Documents\passphotos\ITC .pdf',
    r'C:\Users\gumma\OneDrive\Documents\PRODUCTS.PDF'
]

for p in pdf_files:
    if os.path.exists(p):
        print(f"File: {p}, Size: {os.path.getsize(p)} bytes")
    else:
        print(f"Not found: {p}")

try:
    import pypdf
    print("pypdf available")
except ImportError:
    try:
        import PyPDF2
        print("PyPDF2 available")
    except ImportError:
        print("No standard pdf library in current python env")
