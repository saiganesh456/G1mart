import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests

def get_best_image(query, is_beauty=False):
    base = "https://in.openbeautyfacts.org" if is_beauty else "https://in.openfoodfacts.org"
    url = f"{base}/cgi/search.pl"
    params = {
        'search_terms': query,
        'search_simple': 1,
        'action': 'process',
        'json': 1,
        'page_size': 5
    }
    try:
        r = requests.get(url, params=params, headers={'User-Agent': 'G1Mart-StoreStudio/2.0'}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            products = data.get('products', [])
            for p in products:
                # prefer front_en or front url
                img = p.get('image_front_url') or p.get('image_url')
                name = p.get('product_name')
                if img:
                    return name, img
    except Exception as e:
        print(f"Error {query}: {e}")
    return None, None

queries = [
    ("Aashirvaad Atta", False),
    ("Aashirvaad Rava", False),
    ("Tata Salt", False),
    ("Britannia Good Day", False),
    ("Britannia Bourbon", False),
    ("Parle-G", False),
    ("Cadbury Dairy Milk", False),
    ("Cadbury 5 Star", False),
    ("Lays Classic Salted", False),
    ("Lays Magic Masala", False),
    ("Kurkure Masala Munch", False),
    ("Red Label Tea", False),
    ("Bru Instant Coffee", False),
    ("Santoor Sandal Soap", True),
    ("Mysore Sandal Soap", True),
    ("Cinthol Soap", True),
    ("Lux Soap", True),
    ("Pears Soap", True),
    ("Dettol Soap", True),
    ("Surf Excel Bar", False),
    ("Surf Excel Easy Wash", False),
    ("Vim Bar Dishwash", False),
    ("Vim Liquid Gel", False),
    ("Colgate Strong Teeth", True),
    ("Parachute Coconut Oil", True),
    ("Freedom Sunflower Oil", False),
    ("Fortune Sunflower Oil", False),
    ("Aachi Turmeric Powder", False),
    ("Aachi Chilli Powder", False),
    ("Haldiram Khatta Meetha", False),
    ("Unibic Cookies", False),
    ("Thums Up", False),
    ("Frooti", False),
    ("Maaza", False),
    ("Toor Dal", False),
    ("Moong Dal", False),
    ("Urad Dal", False),
    ("Idli Rava", False),
]

print("Testing queries across Open Food Facts & Open Beauty Facts...")
for q, is_b in queries:
    name, img = get_best_image(q, is_b)
    print(f"[{'BEAUTY' if is_b else 'FOOD'}] Query: '{q}' -> Found: '{name}' | URL: {img}")
