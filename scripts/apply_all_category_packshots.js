const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('data/migrated_product_variants.json', 'utf8'));

const GLOBAL_PACKSHOT_MAP = {
  // Drinks & Beverages
  'g1-p1711': '/products/packshots/coca-cola.jpg',
  'g1-p1719': '/products/packshots/thums-up.jpg',
  'g1-p1726': '/products/packshots/sprite.jpg',
  'g1-p1733': '/products/packshots/limca.jpg',
  'g1-p1738': '/products/packshots/fanta.jpg',
  'g1-p1764': '/products/packshots/maaza.jpg',
  'g1-p1769': '/products/packshots/frooti.jpg',
  'g1-p1526': '/products/packshots/bisleri.jpg',
  'g1-p1529': '/products/packshots/bisleri.jpg',
  'g1-p1791': '/products/packshots/kinley.jpg',
  'g1-p1804': '/products/packshots/kinley.jpg',
  'g1-p1796': '/products/packshots/aquafina.jpg',
  'g1-p1541': '/products/packshots/red-bull.jpg',
  'g1-p1542': '/products/packshots/sting.jpg',
  'g1-p1823': '/products/packshots/glucon-d.jpg',
  'g1-p1830': '/products/packshots/rooh-afza.jpg',

  // Household & Cleaning
  'g1-p1356': '/products/packshots/harpic.jpg',
  'g1-p1359': '/products/packshots/lizol.jpg',
  'g1-p1363': '/products/packshots/colin.jpg',
  'g1-p1370': '/products/packshots/vim-bar.jpg',
  'g1-p1373': '/products/packshots/vim-liquid.jpg',
  'g1-p1381': '/products/packshots/all-out.jpg',
  'g1-p1384': '/products/packshots/all-out.jpg',
  'g1-p1388': '/products/packshots/odonil.jpg',

  // Laundry
  'g1-p1401': '/products/packshots/comfort.jpg',
  'g1-p1407': '/products/packshots/ujala.jpg',

  // Hair & Personal Care
  'g1-p1294': '/products/packshots/dove-shampoo.jpg',
  'g1-p1296': '/products/packshots/dove-shampoo.jpg',
  'g1-p1298': '/products/packshots/dove-shampoo.jpg',
  'g1-p1300': '/products/packshots/clinic-plus-shampoo.jpg',
  'g1-p1303': '/products/packshots/head-shoulders-shampoo.jpg',
  'g1-p1306': '/products/packshots/sunsilk-shampoo.jpg',
  'g1-p1240': '/products/packshots/ponds-face-wash.jpg',
  'g1-p1263': '/products/packshots/vaseline-lotion.jpg',
  'g1-p1257': '/products/packshots/vaseline-lotion.jpg',
  'g1-p1287': '/products/packshots/vaseline-lotion.jpg',
  'g1-p1488': '/products/packshots/dettol-antiseptic.jpg',
  'g1-p1678': '/products/packshots/parachute-oil.jpg',

  // Instant Food & Breakfast
  'g1-p1115': '/products/packshots/kelloggs-chocos.jpg',
  'g1-p1121': '/products/packshots/saffola-oats.jpg',
  'g1-p1130': '/products/packshots/kelloggs-chocos.jpg',
  'g1-p1132': '/products/packshots/mtr-rava-idli-mix.jpg',
  'g1-p1133': '/products/packshots/mtr-rava-idli-mix.jpg',
  'g1-p1134': '/products/packshots/mtr-rava-idli-mix.jpg',
  'g1-p1135': '/products/packshots/mtr-dosa-mix.jpg',
  'g1-p1137': '/products/packshots/weikfield-corn-flour.jpg',
  'g1-p1157': '/products/packshots/bambino-vermicelli.jpg',
  'g1-p1159': '/products/packshots/bambino-vermicelli.jpg',
  'g1-p1201': '/products/packshots/mtr-dosa-mix.jpg',
  'g1-p1234': '/products/packshots/saffola-oats.jpg',
  'g1-p1502': '/products/packshots/mtr-dosa-mix.jpg',
  'g1-p1504': '/products/packshots/mtr-dosa-mix.jpg',
  'g1-p1515': '/products/packshots/bambino-vermicelli.jpg',
  'g1-p1523': '/products/packshots/mtr-vada-mix.jpg',

  // Bakery & Others
  'g1-p1109': '/products/packshots/britannia-bread.jpg',
  'g1-p1834': '/products/packshots/bru-coffee.jpg'
};

// Category corrections
const CATEGORY_CORRECTIONS = {
  'g1-p1401': 'laundry-detergents', // Comfort Fabric Conditioner was in hair-care
  'g1-p1138': 'spices-masalas',     // Weikfield Baking Soda was in drinks-juices
  'g1-p1678': 'hair-care'           // Parachute Coconut Hair Oil was in pooja-needs
};

let updatedCount = 0;
products.forEach(p => {
  if (GLOBAL_PACKSHOT_MAP[p.id]) {
    p.image_url = GLOBAL_PACKSHOT_MAP[p.id];
    updatedCount++;
  }
  if (CATEGORY_CORRECTIONS[p.id]) {
    p.category_id = CATEGORY_CORRECTIONS[p.id];
  }
});

variants.forEach(v => {
  if (GLOBAL_PACKSHOT_MAP[v.product_id]) {
    v.image_url = GLOBAL_PACKSHOT_MAP[v.product_id];
  }
});

fs.writeFileSync('data/migrated_products.json', JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync('data/migrated_product_variants.json', JSON.stringify(variants, null, 2), 'utf8');

console.log(`Successfully updated ${updatedCount} products with clean local packshots and corrected categories!`);
