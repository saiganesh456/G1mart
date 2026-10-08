import requests

items_to_search = [
    'Aashirvaad Shuddh Chakki Atta',
    'Aashirvaad Atta',
    'Everest Turmeric Powder',
    'Tata Sampann Haldi',
    'Catch Turmeric Powder',
    'Jeera Cumin Seeds',
    'Tata Sampann Cumin Seeds',
    'Catch Jeera',
    'Fennel Seeds Saunf',
    'Fenugreek Seeds Methi',
    'Mustard Seeds Rai',
    'Moong Dal',
    'Tata Sampann Moong Dal',
    'Chana Dal',
    'Tata Sampann Chana Dal',
    'Toor Dal',
    'India Gate Basmati Rice',
    'Bambino Vermicelli',
    'Cashew Nuts Kaju',
    'Raw Peanuts',
    'Cloves Laung',
    'Cardamom Elaichi',
    'Cinnamon Dalchini',
    'Lijjat Papad',
    'Aachi Appalam',
    'Clinic Plus Shampoo',
    'Head and Shoulders Shampoo',
    'Ponds Talcum Powder',
    'Close Up Toothpaste',
    'Sensodyne Toothpaste'
]

results = {}

for term in items_to_search:
    url = f"https://in.openfoodfacts.org/cgi/search.pl?search_terms={requests.utils.quote(term)}&search_simple=1&action=process&json=1&page_size=6"
    try:
        r = requests.get(url, headers={'User-Agent': 'G1Mart-Packshots/2.0'}, timeout=8)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            found = []
            for p in prods:
                img = p.get('image_front_url') or p.get('image_url')
                name = p.get('product_name')
                brand = p.get('brands')
                if img:
                    found.append({'name': name, 'brand': brand, 'img': img})
            if found:
                results[term] = found
                print(f"[{term}] Found {len(found)}:")
                for f in found[:2]:
                    print(f"   - {f['brand']} | {f['name']}: {f['img']}")
            else:
                print(f"[{term}] No images found")
    except Exception as e:
        print(f"[{term}] Error: {e}")
