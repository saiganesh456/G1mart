const fs = require('fs');

const PROD_PATH = './data/migrated_products.json';
const VAR_PATH = './data/migrated_product_variants.json';
const CAT_PATH = './src/data/products-catalog.json';

const products = JSON.parse(fs.readFileSync(PROD_PATH, 'utf8'));
const variants = JSON.parse(fs.readFileSync(VAR_PATH, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(CAT_PATH, 'utf8'));

// Specific duplicates to deactivate
const deactivateIds = new Set([
  'g1-p0238',
  'g1-nut016',
  'g1-nut017',
  'g1-p0494',
  'g1-nut019',
  'g1-p0344',
  'g1-p0423',
  'g1-p0495',
  'g1-nut023',
  'g1-p0493',
  'g1-nut002',
  'g1-nut004'
]);

// 1. Deactivate in migrated_products
products.forEach(p => {
  if (deactivateIds.has(p.id)) {
    p.is_active = false;
    p.status = 'inactive';
    p.name = p.name.startsWith('[INACTIVE DUPLICATE]') ? p.name : `[INACTIVE DUPLICATE] ${p.name}`;
    console.log(`Deactivated in products: ${p.id}`);
  }
});

// 2. Fix Happilo Almonds variants (remove mistakenly added cashew variants)
const filteredVariants = variants.filter(v => !deactivateIds.has(v.product_id) && !v.id.startsWith('g1-nut001-v100') && !v.id.startsWith('g1-nut001-v250') && !v.id.startsWith('g1-nut001-v1k'));

// Ensure Happilo Almonds has proper 200g and 500g
let nut001_200 = filteredVariants.find(v => v.id === 'g1-nut001-v200');
if (!nut001_200) {
  filteredVariants.push({
    id: 'g1-nut001-v200',
    product_id: 'g1-nut001',
    size_label: '200 g',
    price: 245,
    mrp: 245,
    stock: 50,
    image_url: '/products/packshots/happilo-almonds-200g.webp'
  });
}
let nut001_500 = filteredVariants.find(v => v.id === 'g1-nut001-v-500g');
if (!nut001_500) {
  filteredVariants.push({
    id: 'g1-nut001-v-500g',
    product_id: 'g1-nut001',
    size_label: '500 g',
    price: 585,
    mrp: 585,
    stock: 50,
    image_url: '/products/packshots/happilo-almonds-200g.webp'
  });
}

// 3. Update catalog
catalog.forEach(p => {
  if (deactivateIds.has(p.id)) {
    p.is_active = false;
    p.status = 'inactive';
    p.name = p.name.startsWith('[INACTIVE DUPLICATE]') ? p.name : `[INACTIVE DUPLICATE] ${p.name}`;
    console.log(`Deactivated in catalog: ${p.id}`);
  }
  if (p.id === 'g1-nut001') {
    p.variants = [
      { id: 'g1-nut001-v200', title: '200 g', size_label: '200 g', price: 245, mrp: 245, stock: 50, image: '/products/packshots/happilo-almonds-200g.webp' },
      { id: 'g1-nut001-v-500g', title: '500 g', size_label: '500 g', price: 585, mrp: 585, stock: 50, image: '/products/packshots/happilo-almonds-200g.webp' }
    ];
    p.price = 245;
    p.mrp = 245;
    p.image = '/products/packshots/happilo-almonds-200g.webp';
    p.image_url = '/products/packshots/happilo-almonds-200g.webp';
  }
  if (p.id === 'g1-nut003') {
    p.variants = [
      { id: 'g1-nut003-v1', title: '200 g', size_label: '200 g', price: 285, mrp: 285, stock: 50, image: '/products/packshots/happilo-cashews-200g.webp' },
      { id: 'g1-nut003-v-500g', title: '500 g', size_label: '500 g', price: 675, mrp: 675, stock: 50, image: '/products/packshots/happilo-cashews-200g.webp' }
    ];
    p.price = 285;
    p.mrp = 285;
    p.image = '/products/packshots/happilo-cashews-200g.webp';
    p.image_url = '/products/packshots/happilo-cashews-200g.webp';
  }
});

fs.writeFileSync(PROD_PATH, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(VAR_PATH, JSON.stringify(filteredVariants, null, 2), 'utf8');
fs.writeFileSync(CAT_PATH, JSON.stringify(catalog, null, 2), 'utf8');

console.log('Successfully completed full duplicate cleanup in Dry Fruits!');
