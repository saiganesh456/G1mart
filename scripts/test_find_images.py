import requests
import json

def search_bigbasket(query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    url = f"https://www.bigbasket.com/listing-svc/v2/products?type=pc&slug=all&page=1&tab_type=[%22all%22]&sorted_on=relevance&q={requests.utils.quote(query)}"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json()
            tabs = data.get('tabs', [])
            for t in tabs:
                prods = t.get('product_info', {}).get('products', [])
                if prods:
                    p = prods[0]
                    img = p.get('images', [{}])[0].get('l') or p.get('images', [{}])[0].get('s')
                    return p.get('desc'), p.get('brand', {}).get('name'), img
    except Exception as e:
        pass
    return None

def search_off(query):
    url = f"https://in.openfoodfacts.org/cgi/search.pl?search_terms={requests.utils.quote(query)}&search_simple=1&action=process&json=1&page_size=5"
    try:
        r = requests.get(url, headers={'User-Agent': 'G1Mart-Bot/1.0'}, timeout=5)
        if r.status_code == 200:
            data = r.json()
            prods = data.get('products', [])
            for p in prods:
                img = p.get('image_front_url') or p.get('image_url')
                if img:
                    return p.get('product_name'), p.get('brands'), img
    except Exception as e:
        pass
    return None

def search_jiomart(query):
    url = f"https://www.jiomart.com/catalogsearch/result?q={requests.utils.quote(query)}"
    # Jiomart might require scraping HTML
    return None

test_items = [
    "Cadbury Dairy Milk Chocolate Bar",
    "Cadbury 5 Star Chocolate",
    "Aashirvaad Shuddh Chakki Atta",
    "Everest Turmeric Powder",
    "Tata Sampann Turmeric Powder",
    "Tata Sampann Unpolished Toor Dal",
    "Tata Sampann Moong Dal",
    "Tata Sampann Chana Dal",
    "Tata Sampann Cumin Seeds Jeera",
    "Catch Coriander Powder Dhania",
    "Catch Black Pepper Whole Miriyalu",
    "Everest Garam Masala",
    "Aachi Biryani Masala",
    "Aachi Chicken Masala",
    "Cashew Nuts Kaju",
    "Raw Peanuts Groundnuts",
    "India Gate Basmati Rice Feast Rozzana",
    "Bambino Roasted Vermicelli",
    "Clinic Plus Strong & Long Shampoo",
    "Ponds Dreamflower Fragrant Talc"
]

for item in test_items:
    res = search_bigbasket(item)
    if res and res[2]:
        print(f"BB: {item} -> [{res[1]}] {res[0]} : {res[2]}")
    else:
        res2 = search_off(item)
        if res2 and res2[2]:
            print(f"OFF: {item} -> [{res2[1]}] {res2[0]} : {res2[2]}")
        else:
            print(f"FAIL: {item}")
