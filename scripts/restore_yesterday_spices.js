const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const PRODUCTS_PATH = path.resolve('data/migrated_products.json');
const VARIANTS_PATH = path.resolve('data/migrated_product_variants.json');
const CATEGORIES_PATH = path.resolve('data/migrated_categories.json');

// 1. Load files
const currentProducts = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
const currentVariants = JSON.parse(fs.readFileSync(VARIANTS_PATH, 'utf8'));

// 2. Load yesterday's files from git commit 7f590b0 (yesterday Oct 16)
const oldProductsRaw = cp.execSync('git show 7f590b0:data/migrated_products.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
const oldVariantsRaw = cp.execSync('git show 7f590b0:data/migrated_product_variants.json', { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');

const oldProducts = JSON.parse(oldProductsRaw);
const oldVariants = JSON.parse(oldVariantsRaw);

console.log(`Loaded current products: ${currentProducts.length}, current variants: ${currentVariants.length}`);
console.log(`Loaded yesterday products: ${oldProducts.length}, yesterday variants: ${oldVariants.length}`);

// 3. Extract all yesterday's spices products and variants
const oldSpicesProducts = oldProducts.filter(p => p.category === 'spices-masalas' || p.category_id === 'spices-masalas');
const oldSpicesIds = new Set(oldSpicesProducts.map(p => p.id));
const oldSpicesVariants = oldVariants.filter(v => oldSpicesIds.has(v.product_id));

console.log(`Yesterday spices products to restore: ${oldSpicesProducts.length}`);
console.log(`Yesterday spices variants to restore: ${oldSpicesVariants.length}`);

// 4. Map of pouch improvements and packshot fixes
const pouchMap = {
  // Lavangalu / Cloves
  'g1-spc051': '/products/generated_pouches/g1_lavangalu_pouch.webp',
  'g1-spc052': '/products/generated_pouches/g1_lavangalu_pouch.webp',
  'g1-p0280': '/products/generated_pouches/g1_lavangalu_pouch.webp',
  'g1-p0341': '/products/generated_pouches/g1_lavangalu_pouch.webp',
  
  // Dalchina / Cinnamon
  'g1-spc053': '/products/generated_pouches/g1_dalchina_pouch.webp',
  'g1-p0163': '/products/generated_pouches/g1_dalchina_pouch.webp',
  
  // Sompu / Fennel
  'g1-spc050': '/products/generated_pouches/g1_sompu_pouch.webp',
  'g1-p0480': '/products/generated_pouches/g1_sompu_pouch.webp',
  
  // Gasagasalu / Poppy
  'g1-spc059': '/products/generated_pouches/g1_gasagasalu_pouch.webp',
  
  // Chintapandu / Tamarind
  'g1-spc056': '/products/generated_pouches/g1_chintapandu_pouch.webp',
  
  // Endu Kobbari / Dry Coconut
  'g1-spc057': '/products/generated_pouches/g1_kobbari_pouch.webp',
  
  // Tella Nuvvulu / Sesame
  'g1-spc058': '/products/generated_pouches/g1_nuvvulu_pouch.webp',
  'g1-p0184': '/products/generated_pouches/g1_nuvvulu_pouch.webp',
  
  // Avalu / Mustard
  'g1-spc048': '/products/generated_pouches/g1_avalu_pouch.webp',
  'g1-p0431': '/products/generated_pouches/g1_avalu_pouch.webp',
  'g1-p0592': '/products/generated_pouches/g1_avalu_pouch.webp',
  'g1-p0593': '/products/generated_pouches/g1_avalu_pouch.webp',
  
  // Endu Mirchi
  'g1-spc043': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-spc044': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-canon-mirchi-01': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-p0088': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-p0290': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-p1006': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  
  // Jeelakarra / Cumin
  'g1-spc045': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-spc047': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0333': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0336': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0396': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0466': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0539': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0594': '/products/generated_pouches/g1_jeera_pouch.webp',
  
  // Dhaniyalu / Coriander seeds
  'g1-spc046': '/products/generated_pouches/g1_coriander_seeds_pouch.webp',
  'g1-p0413': '/products/generated_pouches/g1_coriander_seeds_pouch.webp',
  'g1-p0414': '/products/generated_pouches/g1_coriander_seeds_pouch.webp',
  
  // Menthulu
  'g1-spc049': '/products/generated_pouches/g1_menthulu_pouch.webp',
  'g1-p0879': '/products/generated_pouches/g1_menthulu_pouch.webp',
  
  // Elakulu
  'g1-spc054': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0042': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0587': '/products/generated_pouches/g1_elaichi_pouch.webp',
  
  // Miriyalu
  'g1-p0342': '/products/generated_pouches/g1_miriyalu_pouch.webp',
  'g1-p0444': '/products/generated_pouches/g1_miriyalu_pouch.webp',
  'g1-p0661': '/products/generated_pouches/g1_miriyalu_pouch.webp',
  'g1-p0872': '/products/generated_pouches/g1_miriyalu_pouch.webp',
  
  // Vamu
  'g1-p0286': '/products/generated_pouches/g1_vamu_pouch.webp',
  
  // Anasa Puvvu & Japathri
  'g1-p0337': '/products/generated_pouches/g1_anasa_puvvu_pouch.webp',
  'g1-p0338': '/products/generated_pouches/g1_japathri_pouch.webp',
  
  // Biryani Aaku
  'g1-spc055': '/products/generated_pouches/g1_biryani_aaku_pouch.webp',
  
  // Podis & Powders
  'g1-p0706': '/products/generated_pouches/g1_pappula_podi_pouch.webp',
  'g1-p0709': '/products/generated_pouches/g1_kobbari_karam_podi_pouch.webp',
  'g1-p0990': '/products/generated_pouches/g1_coriander_powder_pouch.webp',
  'g1-p0014': '/products/generated_pouches/g1_turmeric_powder_pouch.webp',
  'g1-p0003': '/products/generated_pouches/g1_pepper_powder_pouch.webp',
};

// Packshot replacements for Aachi and Aashirvaad
const packshotMap = {
  // Aachi authentic domestic packshots
  'g1-p0070': '/products/verified/g1-p0070.webp',
  'g1-p0071': '/products/verified/g1-p0071.webp',
  'g1-p0072': '/products/verified/g1-p0072.webp',
  'g1-p0073': '/products/verified/g1-p0073.webp',
  'g1-p0074': '/products/verified/g1-p0074.webp',
  'g1-p0075': '/products/verified/g1-p0075.webp',
  'g1-p0076': '/products/verified/g1-p0076.webp',
  'g1-spc031': '/products/verified/g1-p0074.webp', // Aachi Chicken Masala domestic
  'g1-spc032': '/products/verified/g1-p0073.webp', // Aachi Mutton Masala domestic
  'g1-spc033': '/products/verified/g1-p0072.webp', // Aachi Fish Fry Masala domestic
  
  // Aashirvaad Chilli
  'g1-p1001': '/products/packshots/aashirvaad-chilli-powder.webp',
  
  // Gopuram Turmeric
  'g1-p0502': '/products/verified/hh-151-gopuram-pasupu-turmeric.webp',
};

// 5. Enhance restored products
const variantsByProd = new Map();
for (const v of oldSpicesVariants) {
  if (!variantsByProd.has(v.product_id)) {
    variantsByProd.set(v.product_id, []);
  }
  variantsByProd.get(v.product_id).push(v);
}

for (const p of oldSpicesProducts) {
  // Ensure product is active (except g1-p1138)
  if (p.id !== 'g1-p1138') {
    p.is_active = true;
    p.isActive = true;
    p.inStock = true;
  }

  // Apply pouch upgrade if applicable
  if (pouchMap[p.id]) {
    p.image_url = pouchMap[p.id];
    p.imageUrl = pouchMap[p.id];
    p.image = pouchMap[p.id];
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    if (!p.brand || p.brand === 'Local / Unbranded') {
      p.brand = 'G1 Mart Loose Staples';
      p.brand_id = 'brand-g1mart-loose';
    }
  }

  // Apply packshot fix if applicable
  if (packshotMap[p.id]) {
    p.image_url = packshotMap[p.id];
    p.imageUrl = packshotMap[p.id];
    p.image = packshotMap[p.id];
    p.image_status = 'verified';
    p.imageStatus = 'verified';
  }

  // Special brand adjustments
  if (p.id === 'g1-p1001') {
    p.brand = 'Aashirvaad';
    p.brand_id = 'brand-aashirvaad';
  } else if (p.id === 'g1-p0502') {
    p.brand = 'Gopuram';
    p.brand_id = 'brand-gopuram';
  } else if (p.id.startsWith('g1-p064') || p.id.startsWith('g1-p065')) {
    if (p.name.toLowerCase().includes('durga')) {
      p.brand = 'Sri Durga';
      p.brand_id = 'brand-sri-durga';
    }
  }

  // Update variants to match
  const pVars = variantsByProd.get(p.id) || [];
  for (const v of pVars) {
    if (pouchMap[p.id] || packshotMap[p.id]) {
      v.image_url = p.image_url || p.imageUrl || p.image;
    }
    v.in_stock = true;
  }
}

// 6. Combine with current non-spices products
const nonSpicesProducts = currentProducts.filter(p => p.category !== 'spices-masalas' && p.category_id !== 'spices-masalas');
const nonSpicesVariants = currentVariants.filter(v => !oldSpicesIds.has(v.product_id));

const combinedProducts = [...nonSpicesProducts, ...oldSpicesProducts];
const combinedVariants = [...nonSpicesVariants, ...oldSpicesVariants];

console.log(`Combined products count: ${combinedProducts.length}`);
console.log(`Combined variants count: ${combinedVariants.length}`);

// 7. Write to files
fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(combinedProducts, null, 2), 'utf8');
fs.writeFileSync(VARIANTS_PATH, JSON.stringify(combinedVariants, null, 2), 'utf8');

// 8. Categories subcategories setup
const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
const spicesCat = categories.find(c => c.id === 'spices-masalas' || c.slug === 'spices-masalas');
if (spicesCat) {
  // Compute subcategories present in oldSpicesProducts
  const subcatCounts = new Map();
  for (const p of oldSpicesProducts) {
    if (p.is_active === false || p.isActive === false) continue;
    const s = p.subcategory || p.sub_category || p.subCategory;
    if (s && s !== 'Soft Drinks, Juices & Soda') {
      subcatCounts.set(s, (subcatCounts.get(s) || 0) + 1);
    }
  }
  spicesCat.subcategories = Array.from(subcatCounts.keys());
  console.log('Restored spices-masalas subcategories in categories.json:', spicesCat.subcategories);
  fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2), 'utf8');
}

console.log('Successfully restored all 147 spices products from yesterday with updated authentic packshots and G1 Mart pouches!');
