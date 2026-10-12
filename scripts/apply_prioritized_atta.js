const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = 'data/migrated_products.json';
const VARIANTS_FILE = 'data/migrated_product_variants.json';
const CATALOG_FILE = 'src/data/products-catalog.json';

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VARIANTS_FILE, 'utf8'));
const catalog = fs.existsSync(CATALOG_FILE) ? JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) : null;

// Exact prioritized order and configuration for atta-rice-dal
const ORDERED_ATTA_PRODUCTS = [
  // 1. TOP PRIORITY: Aashirvaad
  {
    id: 'g1-p1572',
    name: 'Aashirvaad Superior MP Whole Wheat Chakki Atta',
    brand: 'Aashirvaad',
    brand_id: 'brand-aashirvaad',
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/aashirvaad-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 58, mrp: 65, stock: 50, image_url: '/products/packshots/aashirvaad-atta-1kg.jpg' },
      { size_label: '2 kg', price: 114, mrp: 125, stock: 35, image_url: '/products/packshots/aashirvaad-atta-1kg.jpg' },
      { size_label: '5 kg', price: 270, mrp: 295, stock: 45, image_url: '/products/packshots/aashirvaad-atta-5kg.jpg' },
      { size_label: '10 kg', price: 495, mrp: 540, stock: 40, image_url: '/products/packshots/aashirvaad-atta-10kg.jpg' }
    ]
  },
  {
    id: 'g1-p0457',
    name: 'Aashirvaad Double Roasted Suji Rava',
    brand: 'Aashirvaad',
    brand_id: 'brand-aashirvaad',
    category_id: 'atta-rice-dal',
    sub_category: 'Idli & Bombay Rava',
    image_url: '/products/packshots/aashirvaad-suji-rava.jpg',
    variants: [
      { size_label: '500 g', price: 38, mrp: 42, stock: 40 },
      { size_label: '1 kg', price: 72, mrp: 80, stock: 50 }
    ]
  },

  // 2. SECOND PRIORITY: Rice
  {
    id: 'g1-p0219',
    name: 'Sona Masoori Raw Rice (సోనా మసూరి బియ్యం)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Sonamasuri & Basmati Rice',
    image_url: '/products/generated_pouches/g1_rice_pouch.webp',
    variants: [
      { size_label: '1 kg', price: 55, mrp: 62, stock: 50 },
      { size_label: '5 kg', price: 265, mrp: 295, stock: 40 },
      { size_label: '10 kg', price: 520, mrp: 575, stock: 35 },
      { size_label: '25 kg', price: 1250, mrp: 1380, stock: 25 }
    ]
  },
  {
    id: 'g1-p0411',
    name: 'India Gate Basmati Rice Feast Rozzana',
    brand: 'India Gate',
    brand_id: 'b-093',
    category_id: 'atta-rice-dal',
    sub_category: 'Sonamasuri & Basmati Rice',
    image_url: '/products/packshots/basmati-rice.jpg',
    variants: [
      { size_label: '1 kg', price: 105, mrp: 125, stock: 45 },
      { size_label: '5 kg', price: 495, mrp: 575, stock: 30 }
    ]
  },
  {
    id: 'g1-p0417',
    name: 'Flattened Rice / Thick Poha (అటుకులు)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Sonamasuri & Basmati Rice',
    image_url: '/products/generated_pouches/g1_poha_pouch.webp',
    variants: [
      { size_label: '500 g', price: 30, mrp: 35, stock: 40 },
      { size_label: '1 kg', price: 55, mrp: 65, stock: 45 }
    ]
  },
  {
    id: 'g1-p0728',
    name: 'Saggubiyyam / Sabudana (సగ్గుబియ్యం)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Sonamasuri & Basmati Rice',
    image_url: '/products/generated_pouches/g1_sabudana_pouch.webp',
    variants: [
      { size_label: '500 g', price: 42, mrp: 48, stock: 30 },
      { size_label: '1 kg', price: 80, mrp: 92, stock: 35 }
    ]
  },

  // 3. THIRD PRIORITY: Flours, Ravas & Grains (Consistent G1 Mart stand-up pouches)
  {
    id: 'g1-p0063',
    name: 'Rice Flour (బియ్యం పిండి)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/generated_pouches/g1_rice_flour_pouch.webp',
    variants: [
      { size_label: '500 g', price: 25, mrp: 28, stock: 40 },
      { size_label: '1 kg', price: 45, mrp: 50, stock: 50 }
    ]
  },
  {
    id: 'g1-p0198',
    name: 'Chakki Fresh Whole Wheat Atta (గోధుమ పిండి)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/generated_pouches/g1_atta_pouch.webp',
    variants: [
      { size_label: '1 kg', price: 45, mrp: 50, stock: 40 },
      { size_label: '5 kg', price: 215, mrp: 240, stock: 30 }
    ]
  },
  {
    id: 'g1-p1030',
    name: 'Maida Pindi / Refined Wheat Flour (మైదా)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Maida & Besan',
    image_url: '/products/generated_pouches/g1_maida_pouch.webp',
    variants: [
      { size_label: '500 g', price: 25, mrp: 28, stock: 40 },
      { size_label: '1 kg', price: 45, mrp: 50, stock: 50 }
    ]
  },
  {
    id: 'g1-p0197',
    name: 'Pure Corn Flour (మొక్కజొన్న పిండి)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/generated_pouches/g1_corn_flour_pouch.webp',
    variants: [
      { size_label: '500 g', price: 28, mrp: 32, stock: 40 },
      { size_label: '1 kg', price: 52, mrp: 60, stock: 45 }
    ]
  },
  {
    id: 'g1-p0704',
    name: 'Pure Ragi Flour / Powder (రాగి పిండి)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/generated_pouches/g1_ragi_flour_pouch.webp',
    variants: [
      { size_label: '500 g', price: 32, mrp: 38, stock: 35 },
      { size_label: '1 kg', price: 58, mrp: 68, stock: 40 }
    ]
  },
  {
    id: 'g1-p1028',
    name: 'Fortune Chana Besan (Pure Gram Flour)',
    brand: 'Fortune',
    brand_id: 'brand-fortune',
    category_id: 'atta-rice-dal',
    sub_category: 'Maida & Besan',
    image_url: '/products/packshots/fortune-besan.jpg',
    variants: [
      { size_label: '500 g', price: 55, mrp: 62, stock: 45 },
      { size_label: '1 kg', price: 105, mrp: 118, stock: 40 }
    ]
  },
  {
    id: 'g1-p1140',
    name: 'Weikfield Corn Starch / Corn Flour',
    brand: 'Weikfield',
    brand_id: 'brand-weikfield',
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/weikfield-corn-flour.jpg',
    variants: [
      { size_label: '100 g', price: 20, mrp: 22, stock: 50 },
      { size_label: '500 g', price: 55, mrp: 60, stock: 40 }
    ]
  },
  {
    id: 'g1-p0196',
    name: 'Bansi Ravva / Wheat Rava (బాన్సీ రవ్వ)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Idli & Bombay Rava',
    image_url: '/products/generated_pouches/g1_bansi_rava_pouch.webp',
    variants: [
      { size_label: '500 g', price: 28, mrp: 32, stock: 40 },
      { size_label: '1 kg', price: 52, mrp: 60, stock: 50 }
    ]
  },
  {
    id: 'g1-p0427',
    name: 'Upma Ravva / Bombay Rava (ఉప్మా రవ్వ)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Idli & Bombay Rava',
    image_url: '/products/generated_pouches/g1_upma_rava_pouch.webp',
    variants: [
      { size_label: '500 g', price: 28, mrp: 32, stock: 40 },
      { size_label: '1 kg', price: 52, mrp: 60, stock: 50 }
    ]
  },
  {
    id: 'g1-p0428',
    name: 'Sri Lalitha Idli Rava (ఇడ్లీ రవ్వ)',
    brand: 'Sri Lalitha',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Idli & Bombay Rava',
    image_url: '/products/packshots/lalitha-idli-rava.jpg',
    variants: [
      { size_label: '500 g', price: 32, mrp: 36, stock: 40 },
      { size_label: '1 kg', price: 60, mrp: 68, stock: 50 }
    ]
  },
  {
    id: 'g1-p1581',
    name: 'Pillsbury Chakki Fresh Whole Wheat Atta',
    brand: 'Pillsbury',
    brand_id: 'brand-pillsbury',
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/pillsbury-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 55, mrp: 60, stock: 35, image_url: '/products/packshots/pillsbury-atta-2kg.jpg' },
      { size_label: '2 kg', price: 108, mrp: 120, stock: 25, image_url: '/products/packshots/pillsbury-atta-2kg.jpg' },
      { size_label: '5 kg', price: 265, mrp: 290, stock: 40, image_url: '/products/packshots/pillsbury-atta-5kg.jpg' },
      { size_label: '10 kg', price: 485, mrp: 530, stock: 30, image_url: '/products/packshots/pillsbury-atta-10kg.jpg' }
    ]
  },
  {
    id: 'g1-p1585',
    name: 'Nature Fresh Sampoorna Chakki Atta',
    brand: 'Nature Fresh',
    brand_id: 'brand-nature-fresh',
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/nature-fresh-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 52, mrp: 58, stock: 30, image_url: '/products/packshots/nature-fresh-atta-5kg.jpg' },
      { size_label: '5 kg', price: 248, mrp: 275, stock: 35, image_url: '/products/packshots/nature-fresh-atta-5kg.jpg' },
      { size_label: '10 kg', price: 465, mrp: 510, stock: 25, image_url: '/products/packshots/nature-fresh-atta-10kg.jpg' }
    ]
  },
  {
    id: 'g1-p1586',
    name: 'Fortune Chakki Fresh Atta 100% Whole Wheat',
    brand: 'Fortune',
    brand_id: 'brand-fortune',
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/fortune-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 50, mrp: 56, stock: 30, image_url: '/products/packshots/fortune-atta-5kg.jpg' },
      { size_label: '5 kg', price: 245, mrp: 270, stock: 35, image_url: '/products/packshots/fortune-atta-5kg.jpg' },
      { size_label: '10 kg', price: 460, mrp: 500, stock: 25, image_url: '/products/packshots/fortune-atta-5kg.jpg' }
    ]
  },
  {
    id: 'g1-p1590',
    name: 'Patanjali Traditional Whole Wheat Chakki Atta',
    brand: 'Patanjali',
    brand_id: 'brand-patanjali',
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/patanjali-atta-5kg.jpg',
    variants: [
      { size_label: '1 kg', price: 45, mrp: 50, stock: 35, image_url: '/products/packshots/patanjali-atta-5kg.jpg' },
      { size_label: '5 kg', price: 215, mrp: 240, stock: 40, image_url: '/products/packshots/patanjali-atta-5kg.jpg' },
      { size_label: '10 kg', price: 410, mrp: 450, stock: 30, image_url: '/products/packshots/patanjali-atta-5kg.jpg' }
    ]
  },
  {
    id: 'g1-p0080',
    name: 'Korralu / Foxtail Millet (కొర్రలు)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Millets & Poha',
    image_url: '/products/generated_pouches/g1_korralu_pouch.webp',
    variants: [
      { size_label: '500 g', price: 45, mrp: 50, stock: 35 },
      { size_label: '1 kg', price: 85, mrp: 95, stock: 40 }
    ]
  },
  {
    id: 'g1-p0203',
    name: 'Sajjalu / Pearl Millet (సజ్జలు)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Millets & Poha',
    image_url: '/products/generated_pouches/g1_sajjalu_pouch.webp',
    variants: [
      { size_label: '500 g', price: 35, mrp: 40, stock: 30 },
      { size_label: '1 kg', price: 65, mrp: 75, stock: 40 }
    ]
  },
  {
    id: 'g1-p0407',
    name: 'Sorghum / Jowar Grains (జొన్నలు)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Millets & Poha',
    image_url: '/products/generated_pouches/g1_jowar_pouch.webp',
    variants: [
      { size_label: '500 g', price: 35, mrp: 40, stock: 30 },
      { size_label: '1 kg', price: 65, mrp: 75, stock: 40 }
    ]
  },
  {
    id: 'g1-p0409',
    name: 'Finger Millet / Whole Ragi (రాగులు)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Millets & Poha',
    image_url: '/products/generated_pouches/g1_whole_ragi_pouch.webp',
    variants: [
      { size_label: '500 g', price: 30, mrp: 35, stock: 35 },
      { size_label: '1 kg', price: 55, mrp: 65, stock: 45 }
    ]
  },
  {
    id: 'g1-p0406',
    name: 'Whole Wheat Grains (గోధుమలు)',
    brand: 'Local / Unbranded',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/generated_pouches/g1_wheat_grains_pouch.webp',
    variants: [
      { size_label: '1 kg', price: 42, mrp: 48, stock: 40 },
      { size_label: '5 kg', price: 200, mrp: 230, stock: 35 }
    ]
  },
  {
    id: 'g1-p1613',
    name: 'Double Horse Roasted Vermicelli (సేమియా)',
    brand: 'Staples',
    brand_id: null,
    category_id: 'atta-rice-dal',
    sub_category: 'Atta & Wheat Flour',
    image_url: '/products/packshots/vermicelli.jpg',
    variants: [
      { size_label: '400 g', price: 42, mrp: 48, stock: 50 },
      { size_label: '850 g', price: 82, mrp: 92, stock: 35 }
    ]
  }
];

const attaMap = new Map();
ORDERED_ATTA_PRODUCTS.forEach(p => attaMap.set(p.id, p));

// 1. Rebuild products array keeping other categories intact, but placing atta-rice-dal with exact prioritized order
const nonAttaProducts = products.filter(p => p.category_id !== 'atta-rice-dal');

const updatedAttaProducts = ORDERED_ATTA_PRODUCTS.map(conf => {
  const existing = products.find(p => p.id === conf.id) || {};
  return {
    ...existing,
    id: conf.id,
    name: conf.name,
    brand: conf.brand,
    brand_id: conf.brand_id,
    category_id: conf.category_id,
    sub_category: conf.sub_category,
    image_url: conf.image_url,
    imageUrl: conf.image_url,
    image: conf.image_url,
    image_status: 'verified',
    imageStatus: 'verified',
    is_active: true
  };
});

// Put updatedAttaProducts right at the position where atta-rice-dal products were, or at top
const finalProducts = [...updatedAttaProducts, ...nonAttaProducts];

// 2. Update variants
const nonAttaVariants = variants.filter(v => !attaMap.has(v.product_id));
const updatedAttaVariants = [];

ORDERED_ATTA_PRODUCTS.forEach(conf => {
  conf.variants.forEach((v, idx) => {
    updatedAttaVariants.push({
      id: `${conf.id}-v${idx + 1}`,
      product_id: conf.id,
      size_label: v.size_label,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      image_url: v.image_url || conf.image_url
    });
  });
});

const finalVariants = [...updatedAttaVariants, ...nonAttaVariants];

fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(finalProducts, null, 2), 'utf8');
fs.writeFileSync(VARIANTS_FILE, JSON.stringify(finalVariants, null, 2), 'utf8');

// 3. Update products-catalog.json if it exists
if (catalog) {
  const catNonAtta = catalog.filter(p => p.category_id !== 'atta-rice-dal' && p.category !== 'atta-rice-dal');
  const catAtta = ORDERED_ATTA_PRODUCTS.map(conf => {
    const existing = catalog.find(p => p.id === conf.id) || {};
    return {
      ...existing,
      id: conf.id,
      name: conf.name,
      brand: conf.brand,
      category_id: conf.category_id,
      sub_category: conf.sub_category,
      imageUrl: conf.image_url,
      image: conf.image_url,
      image_url: conf.image_url,
      image_status: 'verified',
      is_active: true
    };
  });
  fs.writeFileSync(CATALOG_FILE, JSON.stringify([...catAtta, ...catNonAtta], null, 2), 'utf8');
}

console.log('Successfully updated atta-rice-dal products in prioritized order with clean G1 Mart pouches!');
