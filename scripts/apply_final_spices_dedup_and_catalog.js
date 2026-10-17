const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.resolve('data/migrated_products.json');
const VARIANTS_PATH = path.resolve('data/migrated_product_variants.json');
const CATEGORIES_PATH = path.resolve('data/migrated_categories.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VARIANTS_PATH, 'utf8'));
const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));

console.log(`Starting with ${products.length} products, ${variants.length} variants.`);

// Backup
fs.writeFileSync(`${PRODUCTS_PATH}.pre_dedup_${Date.now()}`, JSON.stringify(products, null, 2));
fs.writeFileSync(`${VARIANTS_PATH}.pre_dedup_${Date.now()}`, JSON.stringify(variants, null, 2));

// 1. IDs to completely remove (broken cards, corrupt OCR junk, black box placards)
const REMOVE_IDS = new Set([
  'g1-p0367', // Something Something 60
  'g1-p0593', // Avalu50g (broken unit " g", ₹11)
  'g1-p0594', // Gilakara (broken unit " g", ₹40)
  'g1-p0661', // Miriyalu (broken unit " g", ₹56)
  'g1-p0872', // Pepper Bols
  'g1-p0673', // Biriyani Masala (raw corrupt)
  'g1-p0691', // Kasuri Methi (raw corrupt)
  'g1-p0693', // Ginger Garlic Paste (black box placard)
  'g1-p0695', // Mango Pickel (black box placard)
  'g1-p0696', // Tomato Pickle (black box placard)
  'g1-p0697', // Lemon Pickel (black box placard)
  'g1-p0336', // Jilakara 10rupees (raw duplicate)
  'g1-p0396', // Jeera (cumin Seeds (raw duplicate)
  'g1-p0466', // Gelakara (raw duplicate)
  'g1-p0539', // Jeera100g (raw duplicate)
  'g1-p0431', // G1 Mart Avalu duplicate
  'g1-p0592', // G1 Mart Avalu duplicate
  'g1-p0413', // Coriander Seeds duplicate
  'g1-p0414', // Coriander duplicate
  'g1-p0444', // Pepper duplicate
  'g1-p0088', // Endu Mirchi duplicate
  'g1-p0290', // Endu Marchi duplicate
  'g1-p1006', // Endu Merchi duplicate
  'g1-p0280', // Lavangalu10g duplicate
  'g1-p0341', // Lavangalu 10rupees duplicate
  'g1-p0480', // Sompu100g duplicate
  'g1-p0503', // Gopuram duplicate
  'g1-p0778', // Gopuram Pasupu duplicate
  'g1-p0649', // Sri Durga Lemon duplicate
  'g1-p0951', // Chilly Powder unbranded duplicate
]);

// Filter out products and their variants
let filteredProducts = products.filter(p => !REMOVE_IDS.has(p.id));
let filteredVariants = variants.filter(v => !REMOVE_IDS.has(v.product_id));

// 2. Add NEW product: Aachi Chicken Kabab/65 Masala (50g)
const newChickenKababId = 'g1-aachi-chicken-65-masala';
const existingKabab = filteredProducts.find(p => p.id === newChickenKababId);
if (!existingKabab) {
  const newProduct = {
    id: newChickenKababId,
    name: 'Aachi Chicken Kabab/65 Masala (చికెన్ కబాబ్ మసాలా)',
    brand_id: 'brand-aachi',
    brand: 'Aachi',
    category_id: 'spices-masalas',
    category: 'spices-masalas',
    sub_category: 'Masala Powders, Whole Spices & Pickles',
    subCategory: 'Masala Powders, Whole Spices & Pickles',
    subcategory: 'Masala Powders, Whole Spices & Pickles',
    image_url: '/products/verified/aachi-chicken-kabab-65-masala.webp',
    imageUrl: '/products/verified/aachi-chicken-kabab-65-masala.webp',
    image: '/products/verified/aachi-chicken-kabab-65-masala.webp',
    image_status: 'verified',
    imageStatus: 'verified',
    category_name: 'Spices & Masalas',
    unit: '50 g',
    price: 14,
    originalPrice: 15,
    mrp: 15,
    inStock: true,
    is_active: true,
    isActive: true
  };
  filteredProducts.push(newProduct);

  const newVariant = {
    id: `${newChickenKababId}-v50`,
    product_id: newChickenKababId,
    size_label: '50 g',
    price: 14,
    mrp: 15,
    stock: 50,
    in_stock: true,
    image_url: '/products/verified/aachi-chicken-kabab-65-masala.webp'
  };
  filteredVariants.push(newVariant);
  console.log('Added new product: Aachi Chicken Kabab/65 Masala 50g');
}

// 3. Ensure authentic domestic packshots for Aachi items (keep previous correct photo)
const aachiPackshots = {
  'g1-p0074': '/products/verified/g1-p0074.webp', // Aachi Chicken Masala (previous correct photo preserved)
  'g1-spc031': '/products/verified/g1-p0074.webp',
  'g1-p0073': '/products/verified/g1-p0073.webp', // Aachi Mutton Masala
  'g1-spc032': '/products/verified/g1-p0073.webp',
  'g1-p0072': '/products/verified/g1-p0072.webp', // Aachi Fish Masala
  'g1-spc033': '/products/verified/g1-p0072.webp',
  'g1-p0070': '/products/verified/g1-p0070.webp', // Aachi Mutton 5 RS
  'g1-p0071': '/products/verified/g1-p0071.webp', // Aachi Biryani
  'g1-p0075': '/products/verified/g1-p0075.webp', // Aachi Biryani Masala
  'g1-p0076': '/products/verified/g1-p0076.webp', // Aachi Garam Masala
  'g1-p0066': '/products/verified/g1-p0066.webp', // Aachi Rasam Powder
  'g1-p0782': '/products/verified/g1-p0782.webp', // Aachi Sambar Powder
  'g1-p0019': '/products/verified/g1-p0019.webp', // Aachi Ginger Garlic Paste
  'g1-p1001': '/products/packshots/aashirvaad-chilli-powder.webp', // Aashirvaad Chilli
  'g1-p0502': '/products/verified/hh-151-gopuram-pasupu-turmeric.webp', // Gopuram Turmeric
};

for (const p of filteredProducts) {
  if (aachiPackshots[p.id]) {
    p.image_url = aachiPackshots[p.id];
    p.imageUrl = aachiPackshots[p.id];
    p.image = aachiPackshots[p.id];
    p.image_status = 'verified';
    p.imageStatus = 'verified';
  }
}

// 4. Update variants for G1 Mart loose pouches (small logo versions)
const pouchMap = {
  'g1-spc051': '/products/generated_pouches/g1_miriyalu_pouch.webp',
  'g1-spc052': '/products/generated_pouches/g1_lavangalu_pouch.webp',
  'g1-spc053': '/products/generated_pouches/g1_dalchina_pouch.webp',
  'g1-spc050': '/products/generated_pouches/g1_sompu_pouch.webp',
  'g1-spc059': '/products/generated_pouches/g1_gasagasalu_pouch.webp',
  'g1-spc056': '/products/generated_pouches/g1_chintapandu_pouch.webp',
  'g1-spc057': '/products/generated_pouches/g1_kobbari_pouch.webp',
  'g1-spc058': '/products/generated_pouches/g1_nuvvulu_pouch.webp',
  'g1-p0184': '/products/generated_pouches/g1_nuvvulu_pouch.webp',
  'g1-spc048': '/products/generated_pouches/g1_avalu_pouch.webp',
  'g1-spc043': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-spc044': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-canon-mirchi-01': '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
  'g1-spc045': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-spc047': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0333': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-spc046': '/products/generated_pouches/g1_coriander_seeds_pouch.webp',
  'g1-spc049': '/products/generated_pouches/g1_menthulu_pouch.webp',
  'g1-spc054': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0042': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0587': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0342': '/products/generated_pouches/g1_miriyalu_pouch.webp',
  'g1-p0286': '/products/generated_pouches/g1_vamu_pouch.webp',
  'g1-p0337': '/products/generated_pouches/g1_anasa_puvvu_pouch.webp',
  'g1-p0338': '/products/generated_pouches/g1_japathri_pouch.webp',
  'g1-spc055': '/products/generated_pouches/g1_biryani_aaku_pouch.webp',
  'g1-p0706': '/products/generated_pouches/g1_pappula_podi_pouch.webp',
  'g1-p0709': '/products/generated_pouches/g1_kobbari_karam_podi_pouch.webp',
  'g1-p0990': '/products/generated_pouches/g1_coriander_powder_pouch.webp',
  'g1-p0014': '/products/generated_pouches/g1_turmeric_powder_pouch.webp',
  'g1-p0003': '/products/generated_pouches/g1_pepper_powder_pouch.webp',
};

const prodMap = new Map(filteredProducts.map(p => [p.id, p]));

for (const v of filteredVariants) {
  const p = prodMap.get(v.product_id);
  if (!p) continue;

  if (pouchMap[p.id]) {
    v.image_url = pouchMap[p.id];
  } else if (aachiPackshots[p.id]) {
    v.image_url = aachiPackshots[p.id];
  } else if (!v.image_url || v.image_url === 'undefined') {
    v.image_url = p.image_url || p.imageUrl || p.image;
  }

  // Fix broken size_label " g"
  if (v.size_label === ' g' || !v.size_label || v.size_label.trim() === 'g') {
    if (v.price <= 20) v.size_label = '50 g';
    else if (v.price <= 50) v.size_label = '100 g';
    else if (v.price <= 100) v.size_label = '250 g';
    else v.size_label = '500 g';
  }
}

// 5. Update categories subcategories in categories.json
const spicesCat = categories.find(c => c.id === 'spices-masalas' || c.slug === 'spices-masalas');
if (spicesCat) {
  spicesCat.subcategories = [
    'Masala Powders, Whole Spices & Pickles',
    'Chilli & Turmeric Powder',
    'Whole Spices & Jeera',
    'Whole Spices & Seeds',
    'Sambar & Rasam Powders',
    'Andhra Avakaya & Pickles',
    'Ginger Garlic Paste'
  ];
}

// 6. Save cleanly
fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(filteredProducts, null, 2), 'utf8');
fs.writeFileSync(VARIANTS_PATH, JSON.stringify(filteredVariants, null, 2), 'utf8');
fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2), 'utf8');

console.log(`Deduplication & Catalog Alignment Complete!`);
console.log(`Final Products: ${filteredProducts.length}`);
console.log(`Final Variants: ${filteredVariants.length}`);
const finalSpices = filteredProducts.filter(p => p.category === 'spices-masalas' || p.category_id === 'spices-masalas');
console.log(`Active Spices & Masalas Products: ${finalSpices.filter(p => p.is_active !== false && p.isActive !== false).length}`);
