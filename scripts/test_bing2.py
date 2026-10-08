import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def search_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            html = res.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            return list(dict.fromkeys(murls))
    except Exception as e:
        print(f"Error {query}: {e}")
        return []

queries = [
    "Fortune Unpolished Arhar Toor Dal packet bigbasket",
    "BB Royal Toor Dal Arhar Dal packet bigbasket",
    "BB Royal Cashew Nut Kaju Broken packet bigbasket",
    "BB Royal Raw Peanuts Groundnut packet bigbasket",
    "BB Royal Mustard Seeds Small Rai Avalu bigbasket",
    "BB Royal Fenugreek Methi Seeds Menthulu bigbasket",
    "BB Royal Fennel Seeds Saunf Sompu bigbasket",
    "BB Royal Cloves Laung Lavangalu bigbasket",
    "BB Royal Green Cardamom Elaichi Yalukalu bigbasket",
    "BB Royal Cinnamon Dalchini bigbasket",
    "Everest Garam Masala packet 100g bigbasket",
    "Aachi Chicken Masala packet 50g bigbasket",
    "Aachi Biryani Masala packet 50g bigbasket",
    "Aachi Madras Appalam Papad packet bigbasket",
    "Bambino Roasted Vermicelli packet bigbasket",
    "BB Royal Dry Coconut Copra bigbasket",
    "Clinic Plus Strong Long Health Shampoo bigbasket",
    "Ponds Dreamflower Fragrant Talc powder bigbasket",
    "Close Up Everfresh Red Hot Toothpaste bigbasket"
]

for q in queries:
    results = search_bing(q)
    print(f"\nQuery: {q} -> Found {len(results)}")
    for r in results[:2]:
        print("  ", r)
