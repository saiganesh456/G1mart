const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.resolve('data/migrated_products.json');
const VARIANTS_FILE = path.resolve('data/migrated_product_variants.json');
const CATALOG_FILE = path.resolve('src/data/products-catalog.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VARIANTS_FILE, 'utf8'));
const catalog = fs.existsSync(CATALOG_FILE) ? JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) : [];

console.log(`Loaded ${products.length} products, ${variants.length} variants, ${catalog.length} catalog items.`);

// Specification for the 8 Canonical Spice Groups
const CANONICAL_SPICES = [
  {
    id: 'g1-spc051',
    name: 'G1 Mart Miriyalu (Whole Black Pepper / మిరియాలు)',
    sub_category: 'Whole Spices',
    image_url: '/products/generated_pouches/g1_miriyalu_pouch.webp',
    description: 'Premium whole black peppercorns sourced from authentic spice gardens, sun-dried to perfection with bold aroma, pungent heat, and natural essential oils. Packed in a crystal-clear zipper pouch.',
    variants: [
      { size_label: '₹10 Pack (15g)', price: 10, mrp: 10, stock: 50 },
      { size_label: '50 g', price: 35, mrp: 40, stock: 40 },
      { size_label: '100 g', price: 65, mrp: 75, stock: 60 },
      { size_label: '250 g', price: 155, mrp: 180, stock: 35 }
    ],
    duplicates: ['g1-p0342', 'g1-p0444', 'g1-p0661', 'g1-p0872']
  },
  {
    id: 'g1-spc053',
    name: 'G1 Mart Dalchini (Cinnamon Sticks / దాల్చిన చెక్క)',
    sub_category: 'Whole Spices',
    image_url: '/products/generated_pouches/g1_dalchina_pouch.webp',
    description: 'Aromatic, sweet-woody whole cinnamon bark rolls (Dalchini) selected for authentic flavor in biryanis, curries, and masala chai. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '₹10 Pack (15g)', price: 10, mrp: 10, stock: 40 },
      { size_label: '50 g', price: 35, mrp: 40, stock: 50 },
      { size_label: '100 g', price: 65, mrp: 75, stock: 40 },
      { size_label: '250 g', price: 150, mrp: 175, stock: 25 }
    ],
    duplicates: ['g1-p0163']
  },
  {
    id: 'g1-spc058',
    name: 'G1 Mart Tella Nuvvulu (White Sesame Seeds / తెల్ల నువ్వులు)',
    sub_category: 'Whole Spices',
    image_url: '/products/generated_pouches/g1_nuvvulu_pouch.webp',
    description: 'Selected premium ivory-white sesame seeds (Tella Nuvvulu / Til). Cleaned, stone-free, rich in nutty flavor and healthy oils, perfect for Andhra podis, sweets, and snacks. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 35, mrp: 40, stock: 50 },
      { size_label: '250 g', price: 80, mrp: 95, stock: 50 },
      { size_label: '500 g', price: 155, mrp: 180, stock: 30 }
    ],
    duplicates: ['g1-p0184']
  },
  {
    id: 'g1-spc052',
    name: 'G1 Mart Lavangalu (Whole Cloves / లవంగాలు)',
    sub_category: 'Whole Spices',
    image_url: '/products/generated_pouches/g1_lavangalu_pouch.webp',
    description: 'Hand-picked whole aromatic cloves with fully intact bud heads, delivering pungent warmth and intense aroma for curries, biryanis, and medicinal use. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '₹10 Pack (10g)', price: 10, mrp: 10, stock: 60 },
      { size_label: '50 g', price: 45, mrp: 55, stock: 50 },
      { size_label: '100 g', price: 85, mrp: 100, stock: 40 },
      { size_label: '250 g', price: 200, mrp: 240, stock: 20 }
    ],
    duplicates: ['g1-p0280', 'g1-p0341']
  },
  {
    id: 'g1-p0286',
    name: 'G1 Mart Vamu (Ajwain Seeds / వాము)',
    sub_category: 'Whole Spices',
    image_url: '/products/generated_pouches/g1_vamu_pouch.webp',
    description: 'Natural striped ajwain (carom seeds / Vamu) known for crisp aroma and digestive benefits. Cleaned and packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '₹10 Pack (20g)', price: 10, mrp: 10, stock: 40 },
      { size_label: '50 g', price: 25, mrp: 30, stock: 40 },
      { size_label: '100 g', price: 45, mrp: 55, stock: 50 },
      { size_label: '250 g', price: 105, mrp: 125, stock: 30 }
    ],
    duplicates: []
  },
  {
    id: 'g1-p0707',
    name: 'G1 Mart Nellore Nalla Karam Podi (నల్ల కారం పొడి)',
    sub_category: 'Masala Powders',
    image_url: '/products/generated_pouches/g1_nalla_karam_pouch.webp',
    description: 'Authentic traditional Nellore roasted garlic and curry leaf herbal podi (Nalla Karam) made with sun-dried red chillies, roasted lentils, and aromatic spices. Perfect with hot rice and ghee or idli/dosa. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '100 g', price: 45, mrp: 55, stock: 50 },
      { size_label: '250 g', price: 105, mrp: 125, stock: 40 },
      { size_label: '500 g', price: 199, mrp: 240, stock: 25 }
    ],
    duplicates: ['g1-p0096']
  },
  {
    id: 'g1-p0333',
    name: 'G1 Mart Jeelakarra (Cumin Seeds / జీలకర్ర)',
    sub_category: 'Whole Spices',
    image_url: '/products/generated_pouches/g1_jeera_pouch.webp',
    description: 'Cleaned whole earthy cumin seeds (Jeera / Jeelakarra) with distinct aroma and essential oils. Essential for South Indian tadkas, rasam, and sambar. Packed in a transparent zip-lock pouch.',
    variants: [
      { size_label: '₹10 Pack (20g)', price: 10, mrp: 10, stock: 50 },
      { size_label: '50 g', price: 25, mrp: 30, stock: 50 },
      { size_label: '100 g', price: 45, mrp: 55, stock: 60 },
      { size_label: '250 g', price: 105, mrp: 125, stock: 50 },
      { size_label: '500 g', price: 199, mrp: 240, stock: 30 }
    ],
    duplicates: ['g1-p0336', 'g1-p0396', 'g1-p0466', 'g1-p0539', 'g1-p0594', 'g1-spc045', 'g1-spc047']
  },
  {
    id: 'g1-canon-mirchi-01',
    name: 'G1 Mart Guntur Dry Red Mirchi (ఎండు మిర్చి)',
    sub_category: 'Chilli & Turmeric Powder',
    image_url: '/products/generated_pouches/g1_dry_mirchi_pouch.webp',
    description: 'Premium sun-dried whole Guntur red chillies with intact stems packed in clean transparent food-grade pouch with official G1 Mart label. Known for vibrant deep red color and sharp pungency. Essential for Andhra tadka, sambar, rasam, and spicy chutneys.',
    variants: [
      { size_label: '100 g', price: 38, mrp: 45, stock: 60 },
      { size_label: '250 g', price: 89, mrp: 105, stock: 80 },
      { size_label: '500 g', price: 169, mrp: 199, stock: 50 },
      { size_label: '1 kg', price: 320, mrp: 380, stock: 30 }
    ],
    duplicates: ['g1-p0088', 'g1-p0290', 'g1-p1006', 'g1-spc043', 'g1-spc044']
  }
];

const JUNK_ITEMS = ['g1-p0367'];

// Collect all duplicate IDs
const allDuplicateIds = new Set();
CANONICAL_SPICES.forEach(cs => {
  cs.duplicates.forEach(d => allDuplicateIds.add(d));
});
JUNK_ITEMS.forEach(j => allDuplicateIds.add(j));

console.log(`Identified ${allDuplicateIds.size} duplicates & junk items to deactivate.`);

// 1. Update Variants
// Remove old variants for canonical spices and replace with new suites
const canonicalIds = new Set(CANONICAL_SPICES.map(c => c.id));
let updatedVariants = variants.filter(v => !canonicalIds.has(v.product_id) && !allDuplicateIds.has(v.product_id));

CANONICAL_SPICES.forEach(cs => {
  cs.variants.forEach((v, idx) => {
    updatedVariants.push({
      id: `${cs.id}-v${idx + 1}`,
      product_id: cs.id,
      size_label: v.size_label,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock,
      image_url: cs.image_url,
      in_stock: true
    });
  });
});

console.log(`Variants updated: ${variants.length} -> ${updatedVariants.length}`);

// 2. Update Migrated Products
const canonicalMap = new Map(CANONICAL_SPICES.map(c => [c.id, c]));

products.forEach(p => {
  // If canonical
  if (canonicalMap.has(p.id)) {
    const cs = canonicalMap.get(p.id);
    p.name = cs.name;
    p.brand = 'G1 Mart';
    p.brand_id = 'brand-g1mart';
    p.sub_category = cs.sub_category;
    p.subCategory = cs.sub_category;
    p.image_url = cs.image_url;
    p.imageUrl = cs.image_url;
    p.image = cs.image_url;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.description = cs.description;
    p.inStock = true;
    p.is_active = true;
    p.isActive = true;
    p.is_verified = true;
    console.log(`  [CANONICAL CONFIGURED] ${p.id} -> ${p.name}`);
  }
  // If duplicate or junk
  else if (allDuplicateIds.has(p.id)) {
    p.is_active = false;
    p.isActive = false;
    p.inStock = false;
    console.log(`  [DEACTIVATED DUPLICATE] ${p.id} (${p.name})`);
  }
  // Also clean up any other loose staples brand name in spices
  else if ((p.category_id === 'spices-masalas' || p.category === 'spices-masalas') && p.brand === 'G1 Mart Loose Staples') {
    p.brand = 'G1 Mart';
    p.brand_id = 'brand-g1mart';
  }
});

// 3. Update products-catalog.json
catalog.forEach(p => {
  if (canonicalMap.has(p.id)) {
    const cs = canonicalMap.get(p.id);
    p.name = cs.name;
    p.brand = 'G1 Mart';
    p.brand_id = 'brand-g1mart';
    p.sub_category = cs.sub_category;
    p.subCategory = cs.sub_category;
    p.image_url = cs.image_url;
    p.imageUrl = cs.image_url;
    p.image = cs.image_url;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    p.is_active = true;
    p.in_stock = true;
    
    // Map variants
    p.variants = cs.variants.map((v, idx) => ({
      id: `${cs.id}-v${idx + 1}`,
      name: v.size_label,
      unit: v.size_label,
      price: v.price,
      mrp: v.mrp,
      in_stock: true,
      image: cs.image_url
    }));
    
    // Primary display price is cheapest
    const cheapest = cs.variants[0];
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
  } else if ((p.category_id === 'spices-masalas' || p.category === 'spices-masalas') && p.brand === 'G1 Mart Loose Staples') {
    p.brand = 'G1 Mart';
    p.brand_id = 'brand-g1mart';
  }
});

// Ensure all canonical spices are in catalog
CANONICAL_SPICES.forEach(cs => {
  const exists = catalog.some(p => p.id === cs.id);
  if (!exists) {
    const cheapest = cs.variants[0];
    catalog.push({
      id: cs.id,
      name: cs.name,
      brand_id: 'brand-g1mart',
      brand: 'G1 Mart',
      category_id: 'spices-masalas',
      category: 'spices-masalas',
      sub_category: cs.sub_category,
      subCategory: cs.sub_category,
      image_url: cs.image_url,
      imageUrl: cs.image_url,
      image: cs.image_url,
      image_status: 'verified',
      imageStatus: 'verified',
      category_name: 'Spices & Masalas',
      unit: cheapest.size_label,
      unitLabel: cheapest.size_label,
      is_active: true,
      price: cheapest.price,
      mrp: cheapest.mrp,
      originalPrice: cheapest.mrp,
      discount: cheapest.mrp > cheapest.price ? Math.round(((cheapest.mrp - cheapest.price) / cheapest.mrp) * 100) : 0,
      discountPercentage: 0,
      in_stock: true,
      variants: cs.variants.map((v, idx) => ({
        id: `${cs.id}-v${idx + 1}`,
        name: v.size_label,
        unit: v.size_label,
        price: v.price,
        mrp: v.mrp,
        in_stock: true,
        image: cs.image_url
      }))
    });
    console.log(`  [ADDED TO CATALOG] ${cs.id} (${cs.name})`);
  }
});

// Write files
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(VARIANTS_FILE, JSON.stringify(updatedVariants, null, 2), 'utf8');
fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');

console.log('\nAll 3 catalog and variant files successfully updated!');
