const fs = require('fs');

const PROD_PATH = './data/migrated_products.json';
const VAR_PATH = './data/migrated_product_variants.json';
const CAT_PATH = './src/data/products-catalog.json';

const products = JSON.parse(fs.readFileSync(PROD_PATH, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VAR_PATH, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(CAT_PATH, 'utf8'));

// Canonical configurations
const canonicalConfigs = {
  'g1-p0677': {
    name: 'G1 Mart Crispy Corn Flakes (కార్న్ ఫ్లేక్స్)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    category_id: 'dry-fruits-cereals',
    category: 'dry-fruits-cereals',
    sub_category: 'Cereals & Flakes',
    subCategory: 'Cereals & Flakes',
    image: '/products/generated_pouches/g1_corn_flakes_pouch.webp',
    image_url: '/products/generated_pouches/g1_corn_flakes_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_corn_flakes_pouch.webp',
    is_active: true,
    isActive: true,
    inStock: true,
    status: 'active',
    price: 50,
    mrp: 50,
    variants: [
      { id: 'g1-p0677-v250', title: '250 g', size_label: '250 g', price: 50, mrp: 55, stock: 50, image: '/products/generated_pouches/g1_corn_flakes_pouch.webp' },
      { id: 'g1-p0677-v500', title: '500 g', size_label: '500 g', price: 95, mrp: 105, stock: 50, image: '/products/generated_pouches/g1_corn_flakes_pouch.webp' },
      { id: 'g1-p0677-v1k', title: '1 kg', size_label: '1 kg', price: 180, mrp: 200, stock: 40, image: '/products/generated_pouches/g1_corn_flakes_pouch.webp' }
    ]
  },
  'g1-p1000': {
    name: 'G1 Mart Rolled Oats (100% Wholegrain Cereals / రోల్డ్ ఓట్స్)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    category_id: 'dry-fruits-cereals',
    category: 'dry-fruits-cereals',
    sub_category: 'Oats & Cereals',
    subCategory: 'Oats & Cereals',
    image: '/products/generated_pouches/g1_oats_pouch.webp',
    image_url: '/products/generated_pouches/g1_oats_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_oats_pouch.webp',
    is_active: true,
    isActive: true,
    inStock: true,
    status: 'active',
    price: 99,
    mrp: 110,
    variants: [
      { id: 'g1-p1000-v500', title: '500 g', size_label: '500 g', price: 99, mrp: 110, stock: 50, image: '/products/generated_pouches/g1_oats_pouch.webp' },
      { id: 'g1-p1000-v1k', title: '1 kg', size_label: '1 kg', price: 190, mrp: 215, stock: 40, image: '/products/generated_pouches/g1_oats_pouch.webp' }
    ]
  },
  'g1-lion-dates': {
    name: 'Lion Desert King Seedless Dates (లయన్ డిసర్ట్ కింగ్ ఖర్జూరం)',
    brand: 'Lion',
    brand_id: 'brand-lion',
    category_id: 'dry-fruits-cereals',
    category: 'dry-fruits-cereals',
    sub_category: 'Dates (Kharjuram)',
    subCategory: 'Dates (Kharjuram)',
    image: '/products/generated_pouches/g1_desert_king_dates_pouch.webp',
    image_url: '/products/generated_pouches/g1_desert_king_dates_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_desert_king_dates_pouch.webp',
    is_active: true,
    isActive: true,
    inStock: true,
    status: 'active',
    price: 160,
    mrp: 175,
    variants: [
      { id: 'g1-lion-dates-v500', title: '500 g', size_label: '500 g', price: 160, mrp: 175, stock: 50, image: '/products/generated_pouches/g1_desert_king_dates_pouch.webp' }
    ]
  },
  'g1-p0893': {
    name: 'G1 Mart Pumpkin Seeds (గుమ్మడి గింజలు)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_pumpkin_seeds_pouch.webp',
    image_url: '/products/generated_pouches/g1_pumpkin_seeds_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_pumpkin_seeds_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0894': {
    name: 'G1 Mart Sunflower Seeds (పొద్దుతిరుగుడు గింజలు)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_sunflower_seeds_pouch.webp',
    image_url: '/products/generated_pouches/g1_sunflower_seeds_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_sunflower_seeds_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0895': {
    name: 'G1 Mart Muskmelon Seeds (ఖర్బూజ గింజలు)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_muskmelon_seeds_pouch.webp',
    image_url: '/products/generated_pouches/g1_muskmelon_seeds_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_muskmelon_seeds_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0898': {
    name: 'G1 Mart Watermelon Seeds (పుచ్చకాయ గింజలు)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_watermelon_seeds_pouch.webp',
    image_url: '/products/generated_pouches/g1_watermelon_seeds_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_watermelon_seeds_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0077': {
    name: 'G1 Mart Endu Kharjuram (Dry Hard Dates / ఎండు ఖర్జూరం)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_dates_pouch.webp',
    image_url: '/products/generated_pouches/g1_dates_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_dates_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0295': {
    name: 'G1 Mart California Badam / Almonds (బాదం పప్పు)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_almonds_pouch.webp',
    image_url: '/products/generated_pouches/g1_almonds_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_almonds_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0422': {
    name: 'G1 Mart Jeedipappu (Premium Cashews / జీడిపప్పు)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_cashews_pouch.webp',
    image_url: '/products/generated_pouches/g1_cashews_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_cashews_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-nut020': {
    name: 'G1 Mart Kismis (Golden Sweet Raisins / కిస్మిస్)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_kismis_pouch.webp',
    image_url: '/products/generated_pouches/g1_kismis_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_kismis_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-nut021': {
    name: 'G1 Mart Pista (Salted Pistachios / పిస్తా)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_pista_pouch.webp',
    image_url: '/products/generated_pouches/g1_pista_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_pista_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  },
  'g1-p0979': {
    name: 'G1 Mart Phool Makhana (Lotus Seeds / పూల్ మఖానా)',
    brand: 'G1 Mart',
    brand_id: 'brand-g1mart',
    image: '/products/generated_pouches/g1_makhana_pouch.webp',
    image_url: '/products/generated_pouches/g1_makhana_pouch.webp',
    imageUrl: '/products/generated_pouches/g1_makhana_pouch.webp',
    is_active: true,
    isActive: true,
    status: 'active'
  }
};

// 1. Update migrated_products
for (const [id, cfg] of Object.entries(canonicalConfigs)) {
  let p = products.find(prod => prod.id === id);
  if (p) {
    Object.assign(p, cfg);
    delete p.variants;
    console.log(`Updated product: ${id}`);
  } else {
    // If not found in migrated_products, add it
    const newProd = { id, ...cfg };
    delete newProd.variants;
    products.push(newProd);
    console.log(`Added new product to migrated_products: ${id}`);
  }
}

// 2. Update catalog
for (const [id, cfg] of Object.entries(canonicalConfigs)) {
  let c = catalog.find(item => item.id === id);
  if (c) {
    Object.assign(c, cfg);
    console.log(`Updated catalog item: ${id}`);
  } else {
    catalog.push({ id, ...cfg });
    console.log(`Added new catalog item: ${id}`);
  }
}

// 3. Update variants for corn flakes and oats
const newVariants = [
  { id: 'g1-p0677-v250', product_id: 'g1-p0677', size_label: '250 g', price: 50, mrp: 55, stock: 50, image_url: '/products/generated_pouches/g1_corn_flakes_pouch.webp' },
  { id: 'g1-p0677-v500', product_id: 'g1-p0677', size_label: '500 g', price: 95, mrp: 105, stock: 50, image_url: '/products/generated_pouches/g1_corn_flakes_pouch.webp' },
  { id: 'g1-p0677-v1k', product_id: 'g1-p0677', size_label: '1 kg', price: 180, mrp: 200, stock: 40, image_url: '/products/generated_pouches/g1_corn_flakes_pouch.webp' },
  { id: 'g1-p1000-v500', product_id: 'g1-p1000', size_label: '500 g', price: 99, mrp: 110, stock: 50, image_url: '/products/generated_pouches/g1_oats_pouch.webp' },
  { id: 'g1-p1000-v1k', product_id: 'g1-p1000', size_label: '1 kg', price: 190, mrp: 215, stock: 40, image_url: '/products/generated_pouches/g1_oats_pouch.webp' },
  { id: 'g1-lion-dates-v500', product_id: 'g1-lion-dates', size_label: '500 g', price: 160, mrp: 175, stock: 50, image_url: '/products/generated_pouches/g1_desert_king_dates_pouch.webp' }
];

for (const nv of newVariants) {
  const existingIdx = variants.findIndex(v => v.id === nv.id);
  if (existingIdx >= 0) {
    variants[existingIdx] = nv;
  } else {
    variants.push(nv);
  }
}

fs.writeFileSync(PROD_PATH, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(VAR_PATH, JSON.stringify(variants, null, 2), 'utf8');
fs.writeFileSync(CAT_PATH, JSON.stringify(catalog, null, 2), 'utf8');

console.log('All dry fruit products and variants synced perfectly!');
