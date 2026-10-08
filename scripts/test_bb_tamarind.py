import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

candidates = [
    'https://www.bbassets.com/media/uploads/p/l/10000448_12-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_13-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_14-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_15-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_16-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_17-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_18-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_19-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000448_20-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000449_12-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000449_14-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000449_15-bb-popular-tamarindimli.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000452_12-bb-popular-tamarind.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000452_15-bb-popular-tamarind.jpg',
    'https://www.bbassets.com/media/uploads/p/l/10000452_18-bb-popular-tamarind.jpg',
    'https://www.bbassets.com/media/uploads/p/l/40000244_12-bb-popular-tamarindimli-with-seed.jpg',
    'https://www.bbassets.com/media/uploads/p/l/40000244_14-bb-popular-tamarindimli-with-seed.jpg',
    'https://www.bbassets.com/media/uploads/p/l/40000244_16-bb-popular-tamarindimli-with-seed.jpg'
]

for c in candidates:
    r = requests.head(c, headers=headers)
    if r.status_code == 200:
        print("Found:", c)
