const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('data/migrated_product_variants.json', 'utf8'));

const ATTA_RICE_IMAGE_MAP = {
  'g1-p1028': '/products/packshots/fortune-besan.jpg',
  'g1-p1601': '/products/packshots/fortune-besan.jpg',
  'g1-p1030': '/products/packshots/maida.jpg',
  'g1-p1600': '/products/packshots/maida.jpg',
  'g1-p1140': '/products/packshots/weikfield-corn-flour.jpg',
  'g1-p0197': '/products/packshots/weikfield-corn-flour.jpg',
  'g1-p0744': '/products/packshots/weikfield-corn-flour.jpg',
  'g1-p1599': '/products/packshots/weikfield-corn-flour.jpg',
  'g1-p0411': '/products/packshots/basmati-rice.jpg',
  'g1-p0219': '/products/packshots/sonamasuri-rice.jpg',
  'g1-p0737': '/products/packshots/sonamasuri-rice.jpg',
  'g1-p0063': '/products/packshots/rice-flour.jpg',
  'g1-p0417': '/products/packshots/poha.jpg',
  'g1-p0704': '/products/packshots/ragi-flour.jpg',
  'g1-p1597': '/products/packshots/ragi-flour.jpg',
  'g1-p0409': '/products/packshots/ragi-flour.jpg',
  'g1-p0728': '/products/packshots/sabudana.jpg',
  'g1-p0407': '/products/packshots/jowar.jpg',
  'g1-p1598': '/products/packshots/jowar.jpg',
  'g1-p0080': '/products/packshots/jowar.jpg',
  'g1-p0203': '/products/packshots/jowar.jpg',
  'g1-p0206': '/products/packshots/lalitha-idli-rava.jpg',
  'g1-p0428': '/products/packshots/lalitha-idli-rava.jpg',
  'g1-p0427': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0457': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0859': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0183': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0196': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0736': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0860': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0867': '/products/packshots/aashirvaad-suji-rava.jpg',
  'g1-p0198': '/products/packshots/aashirvaad-atta-5kg.jpg',
  'g1-p0406': '/products/packshots/aashirvaad-atta-5kg.jpg',
  'g1-p1572': '/products/packshots/aashirvaad-atta-5kg.jpg',
  'g1-p1581': '/products/packshots/pillsbury-atta-5kg.jpg',
  'g1-p1585': '/products/packshots/nature-fresh-atta-5kg.jpg',
  'g1-p1586': '/products/packshots/fortune-atta-5kg.jpg',
  'g1-p1590': '/products/packshots/patanjali-atta-5kg.jpg',
  'g1-p1613': '/products/packshots/vermicelli.jpg'
};

const OIL_IMAGE_MAP = {
  'g1-p0156': '/products/packshots/gold-drop-sunflower-clean.jpg',
  'g1-p0279': '/products/packshots/hatsun-ghee.jpg',
  'g1-p0619': '/products/packshots/fortune-sunlite-clean.jpg',
  'g1-p1627': '/products/packshots/fortune-sunlite-clean.jpg',
  'g1-p1632': '/products/packshots/saffola-gold-oil.jpg',
  'g1-p1647': '/products/packshots/sunpure-sunflower-oil.jpg'
};

// Update products
products.forEach((p) => {
  if (ATTA_RICE_IMAGE_MAP[p.id]) {
    p.image_url = ATTA_RICE_IMAGE_MAP[p.id];
  }
  if (OIL_IMAGE_MAP[p.id]) {
    p.image_url = OIL_IMAGE_MAP[p.id];
  }
  // Move More Light detergent out of oil
  if (p.id === 'g1-p0589') {
    p.category_id = 'laundry-detergents';
    p.name = 'More Light Extra Power Liquid Detergent 5L';
    p.image_url = '/products/packshots/ariel-front-liq.jpg';
  }
});

// Update variants
variants.forEach((v) => {
  if (ATTA_RICE_IMAGE_MAP[v.product_id]) {
    v.image_url = ATTA_RICE_IMAGE_MAP[v.product_id];
  }
  if (OIL_IMAGE_MAP[v.product_id]) {
    v.image_url = OIL_IMAGE_MAP[v.product_id];
  }
  // Ensure Saffola variants use saffola-gold-oil.jpg
  if (v.product_id === 'g1-p1632') {
    v.image_url = '/products/packshots/saffola-gold-oil.jpg';
  }
  // Ensure Sunpure variants use sunpure-sunflower-oil.jpg
  if (v.product_id === 'g1-p1647') {
    v.image_url = '/products/packshots/sunpure-sunflower-oil.jpg';
  }
});

fs.writeFileSync('data/migrated_products.json', JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync('data/migrated_product_variants.json', JSON.stringify(variants, null, 2), 'utf8');

console.log('Successfully updated migrated_products.json and migrated_product_variants.json');
