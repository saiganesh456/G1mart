const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('data/migrated_product_variants.json', 'utf8'));
const legacyMap = JSON.parse(fs.readFileSync('src/data/legacyIdMap.json', 'utf8'));

// The 26 canonical products for atta-rice-dal
const CANONICAL_ATTA_MAP = {
  'g1-p0063': {
    name: 'Rice Flour (బియ్యం పిండి)',
    image_url: '/products/generated_pouches/g1_rice_flour_pouch.webp',
    variants: [
      { size_label: '500 g', price: 25, mrp: 28, stock: 40 },
      { size_label: '1 kg', price: 45, mrp: 50, stock: 50 }
    ]
  },
  'g1-p0080': {
    name: 'Korralu / Foxtail Millet (కొర్రలు)',
    image_url: '/products/generated_pouches/g1_korralu_pouch.webp',
    variants: [
      { size_label: '500 g', price: 45, mrp: 50, stock: 35 },
      { size_label: '1 kg', price: 85, mrp: 95, stock: 40 }
    ]
  },
  'g1-p0203': {
    name: 'Sajjalu / Pearl Millet (సజ్జలు)',
    image_url: '/products/generated_pouches/g1_sajjalu_pouch.webp',
    variants: [
      { size_label: '500 g', price: 35, mrp: 40, stock: 30 },
      { size_label: '1 kg', price: 65, mrp: 75, stock: 40 }
    ]
  },
  'g1-p0407': {
    name: 'Sorghum / Jowar Grains (జొన్నలు)',
    image_url: '/products/generated_pouches/g1_jowar_pouch.webp',
    variants: [
      { size_label: '500 g', price: 35, mrp: 40, stock: 30 },
      { size_label: '1 kg', price: 65, mrp: 75, stock: 40 }
    ]
  },
  'g1-p0409': {
    name: 'Finger Millet / Whole Ragi (రాగులు)',
    image_url: '/products/generated_pouches/g1_ragi_pouch.webp',
    variants: [
      { size_label: '500 g', price: 30, mrp: 35, stock: 35 },
      { size_label: '1 kg', price: 55, mrp: 65, stock: 45 }
    ]
  },
  'g1-p0704': {
    name: 'Pure Ragi Flour / Powder (రాగి పిండి)',
    image_url: '/products/generated_pouches/g1_ragi_pouch.webp',
    variants: [
      { size_label: '500 g', price: 32, mrp: 38, stock: 35 },
      { size_label: '1 kg', price: 58, mrp: 68, stock: 40 }
    ]
  },
  'g1-p0728': {
    name: 'Saggubiyyam / Sabudana (సగ్గుబియ్యం)',
    image_url: '/products/generated_pouches/g1_sabudana_pouch.webp',
    variants: [
      { size_label: '500 g', price: 42, mrp: 48, stock: 30 },
      { size_label: '1 kg', price: 80, mrp: 92, stock: 35 }
    ]
  },
  'g1-p0417': {
    name: 'Flattened Rice / Thick Poha (అటుకులు)',
    image_url: '/products/generated_pouches/g1_poha_pouch.webp',
    variants: [
      { size_label: '500 g', price: 30, mrp: 35, stock: 40 },
      { size_label: '1 kg', price: 55, mrp: 65, stock: 45 }
    ]
  },
  'g1-p0219': {
    name: 'Sona Masoori Raw Rice (సోనా మసూరి బియ్యం)',
    image_url: '/products/generated_pouches/g1_rice_pouch.webp',
    variants: [
      { size_label: '1 kg', price: 55, mrp: 62, stock: 50 },
      { size_label: '5 kg', price: 265, mrp: 295, stock: 40 },
      { size_label: '10 kg', price: 520, mrp: 575, stock: 35 },
      { size_label: '25 kg', price: 1250, mrp: 1380, stock: 25 }
    ]
  },
  'g1-p0411': {
    name: 'India Gate Basmati Rice Feast Rozzana',
    image_url: '/products/packshots/basmati-rice.jpg',
    variants: [
      { size_label: '1 kg', price: 105, mrp: 125, stock: 45 },
      { size_label: '5 kg', price: 495, mrp: 575, stock: 30 }
    ]
  },
  'g1-p0406': {
    name: 'Whole Wheat Grains (గోధుమలు)',
    image_url: '/products/generated_pouches/g1_wheat_grains_pouch.webp',
    variants: [
      { size_label: '1 kg', price: 42, mrp: 48, stock: 40 },
      { size_label: '5 kg', price: 200, mrp: 230, stock: 35 }
    ]
  },
  'g1-p0198': {
    name: 'Dharani Chakki Fresh Whole Wheat Atta',
    image_url: '/products/generated_pouches/g1_atta_pouch.webp',
    variants: [
      { size_label: '1 kg', price: 45, mrp: 50, stock: 40 },
      { size_label: '5 kg', price: 215, mrp: 240, stock: 30 }
    ]
  },
  'g1-p0197': {
    name: 'Dharani Pure Corn Flour (మొక్కజొన్న పిండి)',
    image_url: '/products/generated_pouches/g1_corn_flour_pouch.webp',
    variants: [
      { size_label: '500 g', price: 28, mrp: 32, stock: 40 },
      { size_label: '1 kg', price: 52, mrp: 60, stock: 45 }
    ]
  },
  'g1-p1030': {
    name: 'Maida Pindi / Refined Wheat Flour (మైదా)',
    image_url: '/products/generated_pouches/g1_maida_pouch.webp',
    variants: [
      { size_label: '500 g', price: 25, mrp: 28, stock: 40 },
      { size_label: '1 kg', price: 45, mrp: 50, stock: 50 }
    ]
  },
  'g1-p1028': {
    name: 'Fortune Chana Besan (Pure Gram Flour)',
    image_url: '/products/packshots/fortune-besan.jpg',
    variants: [
      { size_label: '500 g', price: 55, mrp: 62, stock: 45 },
      { size_label: '1 kg', price: 105, mrp: 118, stock: 40 }
    ]
  },
  'g1-p1140': {
    name: 'Weikfield Corn Starch / Corn Flour',
    image_url: '/products/packshots/weikfield-corn-flour.jpg',
    variants: [
      { size_label: '100 g', price: 20, mrp: 22, stock: 50 },
      { size_label: '500 g', price: 55, mrp: 60, stock: 40 }
    ]
  },
  'g1-p0428': {
    name: 'Sri Lalitha Idli Rava (ఇడ్లీ రవ్వ)',
    image_url: '/products/packshots/lalitha-idli-rava.jpg',
    variants: [
      { size_label: '500 g', price: 32, mrp: 36, stock: 40 },
      { size_label: '1 kg', price: 60, mrp: 68, stock: 50 }
    ]
  },
  'g1-p0457': {
    name: 'Aashirvaad Double Roasted Suji Rava',
    image_url: '/products/packshots/aashirvaad-suji-rava.jpg',
    variants: [
      { size_label: '500 g', price: 38, mrp: 42, stock: 40 },
      { size_label: '1 kg', price: 72, mrp: 80, stock: 50 }
    ]
  },
  'g1-p0196': {
    name: 'Bansi Ravva / Wheat Rava (బాన్సీ రవ్వ)',
    image_url: '/products/generated_pouches/g1_bansi_rava_pouch.webp',
    variants: [
      { size_label: '500 g', price: 28, mrp: 32, stock: 40 },
      { size_label: '1 kg', price: 52, mrp: 60, stock: 50 }
    ]
  },
  'g1-p0427': {
    name: 'Upma Ravva / Bombay Rava (ఉప్మా రవ్వ)',
    image_url: '/products/generated_pouches/g1_upma_rava_pouch.webp',
    variants: [
      { size_label: '500 g', price: 28, mrp: 32, stock: 40 },
      { size_label: '1 kg', price: 52, mrp: 60, stock: 50 }
    ]
  },
  'g1-p1613': {
    name: 'Double Horse Roasted Vermicelli (సేమియా)',
    image_url: '/products/packshots/vermicelli.jpg',
    variants: [
      { size_label: '400 g', price: 42, mrp: 48, stock: 50 },
      { size_label: '850 g', price: 82, mrp: 92, stock: 35 }
    ]
  },
  'g1-p1572': {
    name: 'Aashirvaad Superior MP Whole Wheat Chakki Atta',
    image_url: '/products/packshots/aashirvaad-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 58, mrp: 65, stock: 50, image_url: '/products/packshots/aashirvaad-atta-1kg.jpg' },
      { size_label: '2 kg', price: 114, mrp: 125, stock: 35, image_url: '/products/packshots/aashirvaad-atta-1kg.jpg' },
      { size_label: '5 kg', price: 270, mrp: 295, stock: 45, image_url: '/products/packshots/aashirvaad-atta-5kg.jpg' },
      { size_label: '10 kg', price: 495, mrp: 540, stock: 40, image_url: '/products/packshots/aashirvaad-atta-10kg.jpg' }
    ]
  },
  'g1-p1581': {
    name: 'Pillsbury Chakki Fresh Whole Wheat Atta',
    image_url: '/products/packshots/pillsbury-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 55, mrp: 60, stock: 35, image_url: '/products/packshots/pillsbury-atta-2kg.jpg' },
      { size_label: '2 kg', price: 108, mrp: 120, stock: 25, image_url: '/products/packshots/pillsbury-atta-2kg.jpg' },
      { size_label: '5 kg', price: 265, mrp: 290, stock: 40, image_url: '/products/packshots/pillsbury-atta-5kg.jpg' },
      { size_label: '10 kg', price: 485, mrp: 530, stock: 30, image_url: '/products/packshots/pillsbury-atta-10kg.jpg' }
    ]
  },
  'g1-p1586': {
    name: 'Fortune Chakki Fresh Atta 100% Whole Wheat',
    image_url: '/products/packshots/fortune-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 50, mrp: 56, stock: 30, image_url: '/products/packshots/fortune-atta-5kg.jpg' },
      { size_label: '5 kg', price: 245, mrp: 270, stock: 35, image_url: '/products/packshots/fortune-atta-5kg.jpg' },
      { size_label: '10 kg', price: 460, mrp: 500, stock: 25, image_url: '/products/packshots/fortune-atta-5kg.jpg' }
    ]
  },
  'g1-p1585': {
    name: 'Nature Fresh Sampoorna Chakki Atta',
    image_url: '/products/packshots/nature-fresh-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 52, mrp: 58, stock: 30, image_url: '/products/packshots/nature-fresh-atta-5kg.jpg' },
      { size_label: '5 kg', price: 248, mrp: 275, stock: 35, image_url: '/products/packshots/nature-fresh-atta-5kg.jpg' },
      { size_label: '10 kg', price: 465, mrp: 510, stock: 25, image_url: '/products/packshots/nature-fresh-atta-10kg.jpg' }
    ]
  },
  'g1-p1590': {
    name: 'Patanjali Traditional Whole Wheat Chakki Atta',
    image_url: '/products/packshots/patanjali-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 45, mrp: 50, stock: 35, image_url: '/products/packshots/patanjali-atta-5kg.jpg' },
      { size_label: '5 kg', price: 215, mrp: 240, stock: 40, image_url: '/products/packshots/patanjali-atta-5kg.jpg' },
      { size_label: '10 kg', price: 410, mrp: 450, stock: 30, image_url: '/products/packshots/patanjali-atta-5kg.jpg' }
    ]
  }
};

// Merged legacy product IDs to map
const ATTA_MERGE_MAP = {
  'g1-p0737': 'g1-p0219', // Kurnool RIC BAG -> Sona Masoori Rice
  'g1-p0744': 'g1-p0197', // Corn Flour Powdar1kg -> Dharani Corn Flour
  'g1-p0206': 'g1-p0428', // Idli Rava -> Sri Lalitha Idli Rava
  'g1-p0859': 'g1-p0457', // Aashirvaad Rava -> Aashirvaad Suji Rava
  'g1-p0183': 'g1-p0196', // Javva Wheat Ravva -> Bansi Ravva
  'g1-p0736': 'g1-p0196', // Bansi Wheat Rava -> Bansi Ravva
  'g1-p0860': 'g1-p0196', // Dansi Rava -> Bansi Ravva
  'g1-p0867': 'g1-p0196', // SAI Bansi Ravva -> Bansi Ravva
  'g1-p1576': 'g1-p1572', // Aashirvaad Multigrain -> Aashirvaad Atta
  'g1-p1579': 'g1-p1572', // Aashirvaad Select -> Aashirvaad Atta
  'g1-p1591': 'g1-p1590', // Patanjali Navratna -> Patanjali Atta
  'g1-p1592': 'g1-p1590', // Patanjali Gluten Free -> Patanjali Atta
  'g1-p1593': 'g1-p1590', // Patanjali Missi -> Patanjali Atta
  'g1-p1594': 'g1-p1590', // Patanjali Extra Fibre -> Patanjali Atta
  'g1-p1595': 'g1-p1590', // Patanjali Diabetic Care -> Patanjali Atta
  'g1-p1596': 'g1-p1590', // Patanjali Sharbati -> Patanjali Atta
  'g1-p1597': 'g1-p0409', // Patanjali Ragi -> Ragi
  'g1-p1598': 'g1-p0407', // Patanjali Jowar -> Jowar
  'g1-p1599': 'g1-p0197', // Patanjali Makka -> Corn Flour
  'g1-p1600': 'g1-p1030', // Patanjali Maida -> Maida
  'g1-p1601': 'g1-p1028'  // Patanjali Besan -> Fortune Besan
};

// 1. Update legacyIdMap
for (const [oldId, targetId] of Object.entries(ATTA_MERGE_MAP)) {
  legacyMap[oldId] = targetId;
}
fs.writeFileSync('src/data/legacyIdMap.json', JSON.stringify(legacyMap, null, 2), 'utf8');

// 2. Filter products in atta-rice-dal
const updatedProducts = products.filter((p) => {
  if (p.category_id !== 'atta-rice-dal') return true;
  // If it's one of the merged IDs, drop it
  if (ATTA_MERGE_MAP[p.id]) return false;
  // If it's one of the 26 canonical products, keep it
  if (CANONICAL_ATTA_MAP[p.id]) return true;
  return false;
});

// Update the canonical products' name and image
updatedProducts.forEach((p) => {
  const conf = CANONICAL_ATTA_MAP[p.id];
  if (conf) {
    p.name = conf.name;
    p.image_url = conf.image_url;
  }
});

// 3. Update variants
const updatedVariants = variants.filter((v) => {
  // Remove variants of deleted products
  if (ATTA_MERGE_MAP[v.product_id]) return false;
  // Remove old variants of canonical products to replace with clean variants
  if (CANONICAL_ATTA_MAP[v.product_id]) return false;
  return true;
});

// Add clean variants for all 26 canonical products
for (const [prodId, conf] of Object.entries(CANONICAL_ATTA_MAP)) {
  conf.variants.forEach((v, idx) => {
    updatedVariants.push({
      id: `${prodId}-v${idx + 1}`,
      product_id: prodId,
      size_label: v.size_label,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      image_url: v.image_url || conf.image_url
    });
  });
}

fs.writeFileSync('data/migrated_products.json', JSON.stringify(updatedProducts, null, 2), 'utf8');
fs.writeFileSync('data/migrated_product_variants.json', JSON.stringify(updatedVariants, null, 2), 'utf8');

console.log('Successfully consolidated atta-rice-dal to exactly 26 canonical products!');
