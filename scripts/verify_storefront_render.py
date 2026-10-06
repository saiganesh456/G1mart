import urllib.request
import re

url = 'http://localhost:3000'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as res:
    html = res.read().decode('utf-8')
    print("Homepage status:", res.status)
    print("Contains 'All Products (96)':", "All Products (96)" in html)
    print("Contains 'Mysore Sandal':", "Mysore Sandal" in html)
    print("Contains 'Swastiks':", "Swastiks" in html)
    print("Contains 'Washing Soda':", "Washing Soda" in html)
    print("Contains 'Ganji Pindi':", "Ganji Pindi" in html)

search_url = 'http://localhost:3000/search?q=mysore'
s_req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(s_req, timeout=10) as s_res:
    s_html = s_res.read().decode('utf-8')
    print("Search status:", s_res.status)
    print("Search HTML length:", len(s_html))
