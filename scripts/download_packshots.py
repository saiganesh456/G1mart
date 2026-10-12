import urllib.request
import os

images_to_download = {
    'public/products/packshots/gemini-sunflower-oil.jpg': 'https://www.bbassets.com/media/uploads/p/l/40042027_6-gemini-refined-sunflower-oil-with-nutri-v.jpg',
    'public/products/packshots/dhara-sunflower-oil.jpg': 'https://www.bbassets.com/media/uploads/p/l/40374274_2-dhara-vitae-refined-sunflower-oil.jpg',
    'public/products/packshots/sunpure-sunflower-oil.png': 'https://www.bigbasket.com/media/uploads/groot/images/11102023-d3216ab7-sunflower-oil-2.png',
    'public/products/packshots/vijaya-groundnut-oil.jpg': 'https://www.bigbasket.com/media/uploads/p/l/279294_1-vijaya-oil-groundnut.jpg',
    'public/products/packshots/fortune-soya-oil.jpg': 'https://www.bbassets.com/media/uploads/p/l/272765_16-fortune-soya-bean-oil.jpg',
    'public/products/packshots/fortune-groundnut-oil.jpg': 'https://www.bbassets.com/media/uploads/p/l/40195401_4-fortune-filtered-groundnut-oil.jpg',
    'public/products/packshots/patanjali-cow-ghee.jpg': 'https://www.bigbasket.com/media/uploads/p/l/31717_5-patanjali-cow-ghee.jpg',
    'public/products/packshots/grb-ghee.jpg': 'https://www.bbassets.com/media/uploads/p/l/252429_9-grb-ghee.jpg',
    'public/products/packshots/ruchi-gold-oil.jpg': 'https://www.bbassets.com/media/uploads/p/l/40018402_11-ruchi-gold-palmolein-oil.jpg',
    'public/products/packshots/priya-gold-oil.jpg': 'https://www.bbassets.com/media/uploads/p/l/40161823_3-priya-gold-sunflower-oil.jpg',
    'public/products/packshots/aashirvaad-atta-1kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/30006887_9-aashirvaad-atta-whole-wheat.jpg',
    'public/products/packshots/aashirvaad-atta-5kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/126903_12-aashirvaad-atta-whole-wheat.jpg',
    'public/products/packshots/aashirvaad-atta-10kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/126906_8-aashirvaad-atta-whole-wheat.jpg',
    'public/products/packshots/pillsbury-atta-5kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/279434_4-pillsbury-chakki-fresh-atta.jpg',
    'public/products/packshots/pillsbury-atta-10kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/124657_10-pillsbury-atta-chakki-fresh.jpg',
    'public/products/packshots/nature-fresh-atta-5kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/40000094_10-nature-fresh-sampoorna-chakki-atta.jpg',
    'public/products/packshots/nature-fresh-atta-10kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/40000095_13-nature-fresh-sampoorna-chakki-atta.jpg',
    'public/products/packshots/fortune-atta-5kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/40120175_9-fortune-chakki-fresh-atta-100-atta-0-maida.jpg',
    'public/products/packshots/patanjali-atta-5kg.jpg': 'https://www.bigbasket.com/media/uploads/p/l/40099238_3-patanjali-whole-wheat-chakki-atta.jpg'
}

for dest, url in images_to_download.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(dest, 'wb') as f:
                f.write(data)
            print(f"Downloaded {dest}: {len(data)} bytes")
    except Exception as e:
        print(f"Failed {dest} from {url}: {e}")
