const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.resolve('data/migrated_products.json');
const VARIANTS_FILE = path.resolve('data/migrated_product_variants.json');
const CATALOG_FILE = path.resolve('src/data/products-catalog.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VARIANTS_FILE, 'utf8'));
const catalog = fs.existsSync(CATALOG_FILE) ? JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) : [];

console.log(`Loaded ${products.length} products, ${variants.length} variants, ${catalog.length} catalog items.`);

const CANONICAL_DRY_FRUITS = [
  {
    id: 'g1-p0295',
    name: 'G1 Mart California Badam / Almonds (బాదం పప్పు)',
    sub_category: 'Almonds & Nuts',
    image_url: '/products/generated_pouches/g1_almonds_pouch.webp',
    description: 'Premium California whole almonds (Badam Pappu) selected for uniform size, crunchy bite, and rich natural oils. Packed in a transparent standing zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 85, mrp: 95, stock: 50 },
      { size_label: '250 g', price: 210, mrp: 240, stock: 40 },
      { size_label: '500 g', price: 410, mrp: 460, stock: 40 },
      { size_label: '1 kg', price: 800, mrp: 900, stock: 30 }
    ],
    duplicates: ['g1-nut018', 'g1-p0583', 'g1-p0776', 'g1-p0984']
  },
  {
    id: 'g1-p0422',
    name: 'G1 Mart Jeedipappu (Premium Cashews / జీడిపప్పు)',
    sub_category: 'Cashews & Nuts',
    image_url: '/products/generated_pouches/g1_cashews_pouch.webp',
    description: 'Whole crisp, creamy white cashew kernels (Jeedipappu) sourced from authentic farms. Perfect for daily snacking, Andhra sweets, and rich gravies. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 90, mrp: 105, stock: 50 },
      { size_label: '250 g', price: 220, mrp: 260, stock: 50 },
      { size_label: '500 g', price: 420, mrp: 490, stock: 40 },
      { size_label: '1 kg', price: 820, mrp: 950, stock: 25 }
    ],
    duplicates: []
  },
  {
    id: 'g1-nut021',
    name: 'G1 Mart Pista (Salted Pistachios / పిస్తా)',
    sub_category: 'Pistachios & Walnuts',
    image_url: '/products/generated_pouches/g1_pista_pouch.webp',
    description: 'Premium lightly roasted and salted California pistachios in naturally open shells. Rich in flavor and nutrition. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 135, mrp: 155, stock: 40 },
      { size_label: '250 g', price: 325, mrp: 375, stock: 50 },
      { size_label: '500 g', price: 630, mrp: 720, stock: 30 }
    ],
    duplicates: ['g1-p0985']
  },
  {
    id: 'g1-p0979',
    name: 'G1 Mart Phool Makhana (Lotus Seeds / పూల్ మఖానా)',
    sub_category: 'Makhana & Healthy Seeds',
    image_url: '/products/generated_pouches/g1_makhana_pouch.webp',
    description: 'Jumbo-grade, naturally popped fox nuts (Phool Makhana). Crisp, clean, calcium-rich, and perfect for roasting or snacking. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 50, mrp: 60, stock: 50 },
      { size_label: '250 g', price: 180, mrp: 210, stock: 40 },
      { size_label: '500 g', price: 350, mrp: 400, stock: 25 }
    ],
    duplicates: []
  },
  {
    id: 'g1-p0894',
    name: 'G1 Mart Sunflower Seeds (పొద్దుతిరుగుడు గింజలు)',
    sub_category: 'Makhana & Healthy Seeds',
    image_url: '/products/generated_pouches/g1_sunflower_seeds_pouch.webp',
    description: 'Cleaned natural black and grey striped sunflower seeds rich in Vitamin E and dietary fiber. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 28, mrp: 35, stock: 50 },
      { size_label: '250 g', price: 120, mrp: 140, stock: 40 },
      { size_label: '500 g', price: 230, mrp: 270, stock: 30 }
    ],
    duplicates: []
  },
  {
    id: 'g1-p0077',
    name: 'G1 Mart Endu Kharjuram (Dry Hard Dates / ఎండు ఖర్జూరం)',
    sub_category: 'Dates & Dry Fruits',
    image_url: '/products/generated_pouches/g1_dates_pouch.webp',
    description: 'Handpicked traditional hard dry dates (Endu Kharjuram / Chuara). Rich in iron, natural energy, and ideal for pooja or daily health nutrition. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 35, mrp: 40, stock: 50 },
      { size_label: '250 g', price: 85, mrp: 95, stock: 50 },
      { size_label: '500 g', price: 160, mrp: 180, stock: 50 },
      { size_label: '1 kg', price: 310, mrp: 350, stock: 35 }
    ],
    duplicates: ['g1-nut022', 'g1-p0394', 'g1-p0492', 'g1-p0909']
  },
  {
    id: 'g1-nut020',
    name: 'G1 Mart Kismis (Golden Sweet Raisins / కిస్మిస్)',
    sub_category: 'Kismis & Raisins',
    image_url: '/products/generated_pouches/g1_kismis_pouch.webp',
    description: 'Naturally sun-dried plump and juicy golden raisins (Sweet Kismis). Sweet, seedless, and loaded with natural antioxidants. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 45, mrp: 55, stock: 50 },
      { size_label: '250 g', price: 105, mrp: 125, stock: 60 },
      { size_label: '500 g', price: 195, mrp: 230, stock: 40 }
    ],
    duplicates: []
  },
  {
    id: 'g1-p0893',
    name: 'G1 Mart Pumpkin Seeds (గుమ్మడి గింజలు)',
    sub_category: 'Makhana & Healthy Seeds',
    image_url: '/products/generated_pouches/g1_pumpkin_seeds_pouch.webp',
    description: 'Cleaned natural white pumpkin seeds rich in zinc, magnesium, and healthy plant proteins. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 75, mrp: 90, stock: 40 },
      { size_label: '250 g', price: 175, mrp: 210, stock: 40 }
    ],
    duplicates: []
  },
  {
    id: 'g1-p0895',
    name: 'G1 Mart Muskmelon Seeds (ఖర్బూజ గింజలు)',
    sub_category: 'Makhana & Healthy Seeds',
    image_url: '/products/generated_pouches/g1_muskmelon_seeds_pouch.webp',
    description: 'Pure washed and cleaned melon seeds (Magaz / Kharbuja Ginjalu). Essential for North and South Indian gravies, sweets, and healthy snacking. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 65, mrp: 80, stock: 40 },
      { size_label: '250 g', price: 155, mrp: 185, stock: 40 }
    ],
    duplicates: []
  },
  {
    id: 'g1-p0898',
    name: 'G1 Mart Watermelon Seeds (పుచ్చకాయ గింజలు)',
    sub_category: 'Makhana & Healthy Seeds',
    image_url: '/products/generated_pouches/g1_watermelon_seeds_pouch.webp',
    description: 'Crispy roasted watermelon seeds packed with amino acids and minerals. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 65, mrp: 80, stock: 40 },
      { size_label: '250 g', price: 155, mrp: 185, stock: 40 }
    ],
    duplicates: []
  }
];

const RAW_DUPLICATES = ['g1-p0041', 'g1-p0677', 'g1-p1000'];

const allDuplicateIds = new Set(RAW_DUPLICATES);
CANONICAL_DRY_FRUITS.forEach(cd => {
  cd.duplicates.forEach(d => allDuplicateIds.add(d));
});

console.log(`Deactivating ${allDuplicateIds.size} dry fruit duplicates and raw items.`);

// 1. Update Variants
const canonicalIds = new Set(CANONICAL_DRY_FRUITS.map(c => c.id));
let updatedVariants = variants.filter(v => !canonicalIds.has(v.product_id) && !allDuplicateIds.has(v.product_id));

CANONICAL_DRY_FRUITS.forEach(cd => {
  cd.variants.forEach((v, idx) => {
    updatedVariants.push({
      id: `${cd.id}-v${idx + 1}`,
      product_id: cd.id,
      size_label: v.size_label,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      image_url: cd.image_url,
      in_stock: true
    });
  });
});

console.log(`Variants updated: ${variants.length} -> ${updatedVariants.length}`);

// 2. Update Migrated Products
const canonicalMap = new Map(CANONICAL_DRY_FRUITS.map(c => [c.id, c]));

products.forEach(p => {
  if (canonicalMap.has(p.id)) {
    const cd = canonicalMap.get(p.id);
    p.name = cd.name;
    p.brand = 'G1 Mart';
    p.brand_id = 'brand-g1mart';
    p.sub_category = cd.sub_category;
    p.subCategory = cd.sub_category;
    p.image_url = cd.image_url;
    p.imageUrl = cd.image_url;
    p.image = cd.image_url;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.description = cd.description;
    p.inStock = true;
    p.is_active = true;
    p.isActive = true;
    p.is_verified = true;
    console.log(`  [CANONICAL CONFIGURED] ${p.id} -> ${p.name}`);
  } else if (allDuplicateIds.has(p.id)) {
    p.is_active = false;
    p.isActive = false;
    p.inStock = false;
    console.log(`  [DEACTIVATED DUPLICATE] ${p.id} (${p.name})`);
  }
});

// 3. Update products-catalog.json
catalog.forEach(p => {
  if (canonicalMap.has(p.id)) {
    const cd = canonicalMap.get(p.id);
    p.name = cd.name;
    p.brand = 'G1 Mart';
    p.brand_id = 'brand-g1mart';
    p.sub_category = cd.sub_category;
    p.subCategory = cd.sub_category;
    p.image_url = cd.image_url;
    p.imageUrl = cd.image_url;
    p.image = cd.image_url;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.is_active = true;
    p.in_stock = true;
    
    p.variants = cd.variants.map((v, idx) => ({
      id: `${cd.id}-v${idx + 1}`,
      name: v.size_label,
      unit: v.size_label,
      price: v.price,
      mrp: v.mrp,
      in_stock: true,
      image: cd.image_url
    }));
    
    const cheapest = cd.variants[0];
    p.price = cheapest.price;
    p.mrp = cheapest.mrp;
    p.originalPrice = cheapest.mrp;
    p.unit = cheapest.size_label;
    p.unitLabel = cheapest.size_label;
    p.discount = cheapest.mrp > cheapest.price ? Math.round(((cheapest.mrp - cheapest.price) / cheapest.mrp) * 100) : 0;
    p.discountPercentage = p.discount;
    console.log(`  [CATALOG SYNCED] ${p.id} -> ${p.name}`);
  } else if (allDuplicateIds.has(p.id)) {
    p.is_active = false;
    p.in_stock = false;
  }
});

fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(VARIANTS_FILE, JSON.stringify(updatedVariants, null, 2), 'utf8');
fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');

console.log('\nAll dry fruit products, variants, and catalog updated successfully!');
