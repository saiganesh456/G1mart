import pymupdf

doc = pymupdf.open(r'C:\Users\gumma\OneDrive\Documents\Supermarket_Online_Ordering_Project_Documentation.pdf')
print("Document pages:", len(doc))

full_text = []
for i, page in enumerate(doc):
    full_text.append(f"--- PAGE {i+1} ---")
    full_text.append(page.get_text())

with open(r'C:\Users\gumma\.gemini\antigravity-ide\brain\2954e95a-4e50-4762-bdcc-feb953725071\scratch\project_doc_text.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(full_text))

print("Saved project documentation text, total length:", sum(len(t) for t in full_text))
