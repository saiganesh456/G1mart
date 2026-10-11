import sys
sys.path.append('.')
from scripts.batch_generate_clean_pouches import create_g1_clean_packshot

SPICES = [
    ("Turmeric Powder", "పసుపు పొడి", "turmeric powder yellow spice bowl pure isolated", "100g", "public/products/generated_pouches/g1_turmeric_powder_pouch.webp"),
    ("Black Pepper Powder", "మిరియాల పొడి", "black pepper powder spice dark fine isolated", "100g", "public/products/generated_pouches/g1_pepper_powder_pouch.webp"),
    ("Black Pepper", "మిరియాలు", "black peppercorns whole isolated", "100g", "public/products/generated_pouches/g1_black_pepper_pouch.webp"),
    ("Green Cardamom", "ఏలకులు", "green cardamom pods elaichi whole isolated", "50g", "public/products/generated_pouches/g1_elaichi_pouch.webp"),
    ("Cumin Seeds", "జీలకర్ర", "cumin seeds jeera whole raw isolated", "100g", "public/products/generated_pouches/g1_jeera_pouch.webp"),
    ("Coriander Powder", "ధనియాల పొడి", "coriander powder dhaniya spice isolated", "100g", "public/products/generated_pouches/g1_coriander_powder_pouch.webp"),
    ("Red Chilli Powder", "కారం పొడి", "red chilli powder mirchi powder spice isolated", "100g", "public/products/generated_pouches/g1_chilli_powder_pouch.webp"),
]

for title, telugu, query, wt, path in SPICES:
    try:
        create_g1_clean_packshot(title, telugu, query, wt, path)
    except Exception as e:
        print(f"Error on {title}: {e}")

print("Spices generation completed!")
