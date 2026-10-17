const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Restoring baseline from 740e9cf...');

// 1. Load baseline data from commit 740e9cf
const baseProducts = JSON.parse(execSync('git show 740e9cf:data/migrated_products.json', { maxBuffer: 50 * 1024 * 1024 }).toString());
const baseVariants = JSON.parse(execSync('git show 740e9cf:data/migrated_product_variants.json', { maxBuffer: 50 * 1024 * 1024 }).toString());
const baseCatalog = JSON.parse(execSync('git show 740e9cf:src/data/products-catalog.json', { maxBuffer: 50 * 1024 * 1024 }).toString());

console.log(`Loaded from 740e9cf: ${baseProducts.length} products, ${baseVariants.length} variants, ${baseCatalog.length} catalog items.`);

// 2. Ensure physical packshot images on disk
const aachiRasamSrc = path.join(__dirname, '../public/products/packshots/aachi-rasam-powder-200g.webp');
const aachiRasamDest1 = path.join(__dirname, '../public/products/verified/aachi-rasam-powder.webp');
const aachiRasamDest2 = path.join(__dirname, '../public/products/verified/g1-p0066.webp');

if (fs.existsSync(aachiRasamSrc)) {
  fs.copyFileSync(aachiRasamSrc, aachiRasamDest1);
  fs.copyFileSync(aachiRasamSrc, aachiRasamDest2);
  console.log('Synchronized Aachi Rasam packshot to verified/aachi-rasam-powder.webp and verified/g1-p0066.webp');
}

const mtrRasamSrc = path.join(__dirname, '../public/products/packshots/mtr-rasam-powder-200g.webp');
const mtrRasamDest = path.join(__dirname, '../public/products/verified/g1-p0064.webp');

if (fs.existsSync(mtrRasamSrc)) {
  fs.copyFileSync(mtrRasamSrc, mtrRasamDest);
  console.log('Synchronized MTR Rasam packshot to verified/g1-p0064.webp');
}

// 3. Update Aachi Rasam in baseProducts
for (const p of baseProducts) {
  if (p.id === 'g1-p0066') {
    p.name = 'Aachi Rasam Powder (రసం పొడి)';
    p.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
    p.imageUrl = '/products/packshots/aachi-rasam-powder-200g.webp';
    p.image = '/products/packshots/aachi-rasam-powder-200g.webp';
  }
  if (p.id === 'g1-spc030') {
    p.name = 'Aachi Rasam Powder (రసం పొడి)';
    p.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
    p.imageUrl = '/products/packshots/aachi-rasam-powder-200g.webp';
    p.image = '/products/packshots/aachi-rasam-powder-200g.webp';
  }
  if (p.id === 'g1-p0064') {
    p.name = 'MTR Rasam Powder (రసం పొడి)';
    p.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
    p.imageUrl = '/products/packshots/mtr-rasam-powder-200g.webp';
    p.image = '/products/packshots/mtr-rasam-powder-200g.webp';
  }
  if (p.id === 'g1-spc026') {
    p.name = 'MTR Rasam Powder';
    p.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
    p.imageUrl = '/products/packshots/mtr-rasam-powder-200g.webp';
    p.image = '/products/packshots/mtr-rasam-powder-200g.webp';
  }
  if (p.id === 'g1-p0074') {
    p.name = 'Aachi Chicken Masala (చికెన్ మసాలా)';
    p.image_url = '/products/verified/g1-p0074.webp';
    p.imageUrl = '/products/verified/g1-p0074.webp';
    p.image = '/products/verified/g1-p0074.webp';
  }
  if (p.id === 'g1-spc031') {
    p.name = 'Aachi Chicken Masala';
    p.image_url = '/products/verified/g1-p0074.webp';
    p.imageUrl = '/products/verified/g1-p0074.webp';
    p.image = '/products/verified/g1-p0074.webp';
  }
}

// 4. Update variants
for (const v of baseVariants) {
  if (v.product_id === 'g1-p0066') {
    v.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
    if (v.size_label === ' g' || !v.size_label) v.size_label = '100 g';
  }
  if (v.product_id === 'g1-spc030') {
    v.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
  }
  if (v.product_id === 'g1-p0064') {
    v.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
    if (v.size_label === ' g' || !v.size_label) v.size_label = '100 g';
  }
  if (v.product_id === 'g1-spc026') {
    v.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
  }
  if (v.product_id === 'g1-p0074') {
    v.image_url = '/products/verified/g1-p0074.webp';
    if (v.size_label === ' g' || !v.size_label) v.size_label = '100 g';
  }
  if (v.product_id === 'g1-spc031') {
    v.image_url = '/products/verified/g1-p0074.webp';
  }
  // Preserve Sprite size variant packshots
  if (v.id === 'g1-bev003-v1') v.image_url = '/products/verified/bev-sprite-250ml.webp';
  if (v.id === 'g1-bev003-v2') v.image_url = '/products/verified/bev-sprite-750ml.webp';
  if (v.id === 'g1-bev003-v3') v.image_url = '/products/verified/bev-sprite-1l.webp';
  if (v.id === 'g1-bev003-v4') v.image_url = '/products/verified/bev-sprite-2l.webp';
}

// 5. Update catalog entries
for (const c of baseCatalog) {
  if (c.id === 'g1-p0066') {
    c.name = 'Aachi Rasam Powder (రసం పొడి)';
    c.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
    c.imageUrl = '/products/packshots/aachi-rasam-powder-200g.webp';
    c.image = '/products/packshots/aachi-rasam-powder-200g.webp';
    if (Array.isArray(c.variants)) {
      c.variants.forEach(v => {
        v.image = '/products/packshots/aachi-rasam-powder-200g.webp';
        v.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
        if (v.name === ' g' || v.unit === ' g') {
          v.name = '100 g';
          v.unit = '100 g';
        }
      });
    }
  }
  if (c.id === 'g1-spc030') {
    c.name = 'Aachi Rasam Powder (రసం పొడి)';
    c.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
    c.imageUrl = '/products/packshots/aachi-rasam-powder-200g.webp';
    c.image = '/products/packshots/aachi-rasam-powder-200g.webp';
    if (Array.isArray(c.variants)) {
      c.variants.forEach(v => {
        v.image = '/products/packshots/aachi-rasam-powder-200g.webp';
        v.image_url = '/products/packshots/aachi-rasam-powder-200g.webp';
      });
    }
  }
  if (c.id === 'g1-p0064') {
    c.name = 'MTR Rasam Powder (రసం పొడి)';
    c.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
    c.imageUrl = '/products/packshots/mtr-rasam-powder-200g.webp';
    c.image = '/products/packshots/mtr-rasam-powder-200g.webp';
    if (Array.isArray(c.variants)) {
      c.variants.forEach(v => {
        v.image = '/products/packshots/mtr-rasam-powder-200g.webp';
        v.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
        if (v.name === ' g' || v.unit === ' g') {
          v.name = '100 g';
          v.unit = '100 g';
        }
      });
    }
  }
  if (c.id === 'g1-spc026') {
    c.name = 'MTR Rasam Powder';
    c.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
    c.imageUrl = '/products/packshots/mtr-rasam-powder-200g.webp';
    c.image = '/products/packshots/mtr-rasam-powder-200g.webp';
    if (Array.isArray(c.variants)) {
      c.variants.forEach(v => {
        v.image = '/products/packshots/mtr-rasam-powder-200g.webp';
        v.image_url = '/products/packshots/mtr-rasam-powder-200g.webp';
      });
    }
  }
  if (c.id === 'g1-p0074') {
    c.name = 'Aachi Chicken Masala (చికెన్ మసాలా)';
    c.image_url = '/products/verified/g1-p0074.webp';
    c.imageUrl = '/products/verified/g1-p0074.webp';
    c.image = '/products/verified/g1-p0074.webp';
    if (Array.isArray(c.variants)) {
      c.variants.forEach(v => {
        v.image = '/products/verified/g1-p0074.webp';
        v.image_url = '/products/verified/g1-p0074.webp';
      });
    }
  }
  if (c.id === 'g1-spc031') {
    c.name = 'Aachi Chicken Masala';
    c.image_url = '/products/verified/g1-p0074.webp';
    c.imageUrl = '/products/verified/g1-p0074.webp';
    c.image = '/products/verified/g1-p0074.webp';
    if (Array.isArray(c.variants)) {
      c.variants.forEach(v => {
        v.image = '/products/verified/g1-p0074.webp';
        v.image_url = '/products/verified/g1-p0074.webp';
      });
    }
  }
  // Sprite variants
  if (c.id === 'g1-bev003' && Array.isArray(c.variants)) {
    c.variants.forEach(v => {
      if (v.id === 'g1-bev003-v1') { v.image = '/products/verified/bev-sprite-250ml.webp'; v.image_url = '/products/verified/bev-sprite-250ml.webp'; }
      if (v.id === 'g1-bev003-v2') { v.image = '/products/verified/bev-sprite-750ml.webp'; v.image_url = '/products/verified/bev-sprite-750ml.webp'; }
      if (v.id === 'g1-bev003-v3') { v.image = '/products/verified/bev-sprite-1l.webp'; v.image_url = '/products/verified/bev-sprite-1l.webp'; }
      if (v.id === 'g1-bev003-v4') { v.image = '/products/verified/bev-sprite-2l.webp'; v.image_url = '/products/verified/bev-sprite-2l.webp'; }
    });
  }
}

// 6. Add Freedom Refined Sunflower Oil 15L Tin
const freedomTinId = 'g1-freedom-oil-15l-tin';
if (!baseProducts.find(p => p.id === freedomTinId)) {
  baseProducts.push({
    id: freedomTinId,
    name: 'Freedom Refined Sunflower Oil 15 Litre Tin (ఫ్రీడమ్ సన్‌ఫ్లవర్ ఆయిల్ 15L కేన్)',
    brand_id: 'brand-freedom',
    category_id: 'oil-ghee-masala',
    image_url: '/products/verified/freedom-sunflower-oil-15l-tin.webp',
    is_active: true,
    isActive: true,
    inStock: true
  });
  console.log('Added Freedom 15L Tin to baseProducts');
}

if (!baseVariants.find(v => v.product_id === freedomTinId)) {
  baseVariants.push({
    id: `${freedomTinId}-v1`,
    product_id: freedomTinId,
    size_label: '15 L Tin (13.65 kg)',
    price: 1899,
    mrp: 2350,
    stock: 25,
    in_stock: true,
    image_url: '/products/verified/freedom-sunflower-oil-15l-tin.webp'
  });
  console.log('Added Freedom 15L Tin variant to baseVariants');
}

if (!baseCatalog.find(c => c.id === freedomTinId)) {
  baseCatalog.push({
    id: freedomTinId,
    name: 'Freedom Refined Sunflower Oil 15 Litre Tin (ఫ్రీడమ్ సన్‌ఫ్లవర్ ఆయిల్ 15L కేన్)',
    brand_id: 'brand-freedom',
    brand: 'Freedom',
    category_id: 'oil-ghee-masala',
    category: 'oil-ghee-masala',
    sub_category: 'Edible Oils & Ghee',
    subCategory: 'Edible Oils & Ghee',
    image_url: '/products/verified/freedom-sunflower-oil-15l-tin.webp',
    imageUrl: '/products/verified/freedom-sunflower-oil-15l-tin.webp',
    image: '/products/verified/freedom-sunflower-oil-15l-tin.webp',
    category_name: 'Oil, Ghee & Masala',
    price: 1899,
    mrp: 2350,
    discount: 19,
    in_stock: true,
    variants: [
      {
        id: `${freedomTinId}-v1`,
        name: '15 L Tin (13.65 kg)',
        unit: '15 L Tin (13.65 kg)',
        price: 1899,
        mrp: 2350,
        in_stock: true,
        image: '/products/verified/freedom-sunflower-oil-15l-tin.webp',
        image_url: '/products/verified/freedom-sunflower-oil-15l-tin.webp'
      }
    ],
    originalPrice: 2350,
    discountPercentage: 19,
    is_active: true,
    unit: '15 L Tin (13.65 kg)',
    unitLabel: '15 L Tin'
  });
  console.log('Added Freedom 15L Tin to baseCatalog');
}

// 7. Write updated JSON files
fs.writeFileSync(path.join(__dirname, '../data/migrated_products.json'), JSON.stringify(baseProducts, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../data/migrated_product_variants.json'), JSON.stringify(baseVariants, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../src/data/products-catalog.json'), JSON.stringify(baseCatalog, null, 2), 'utf8');

console.log('Successfully written restored files!');
console.log('Summary:');
console.log(`- Products count: ${baseProducts.length} (Spices: ${baseProducts.filter(p => p.category_id === 'spices-masalas' || p.categoryId === 'spices-masalas').length})`);
console.log(`- Variants count: ${baseVariants.length}`);
console.log(`- Catalog items: ${baseCatalog.length}`);
