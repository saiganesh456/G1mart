import requests

urls = {
    'cadbury_dairy_milk': 'https://www.bigbasket.com/media/uploads/p/s/100020979_14-cadbury-dairy-milk-chocolate-bar.jpg',
    'cadbury_5_star': 'https://cdn.zeptonow.com/production/ik-seo/cms/product_variant/ac3f68dc-cf78-4448-801c-b5e21cc2d458/Cadbury-5-Star-Chocolatey-Bar.jpg',
    'coriander': 'https://images.openfoodfacts.org/images/products/890/290/122/2654/front_en.3.400.jpg',
    'coriander_powder': 'https://images.openfoodfacts.org/images/products/890/178/643/2011/front_en.3.400.jpg',
    'black_pepper': 'https://images.openfoodfacts.org/images/products/890/119/211/4006/front_en.3.400.jpg',
    'masala': 'https://images.openfoodfacts.org/images/products/890/178/610/0507/front_en.4.400.jpg'
}

headers = {'User-Agent': 'Mozilla/5.0'}

for k, u in urls.items():
    try:
        r = requests.get(u, headers=headers, timeout=6)
        print(f"{k}: status {r.status_code}, length {len(r.content)}")
    except Exception as e:
        print(f"{k}: error {e}")
