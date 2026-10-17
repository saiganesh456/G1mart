const fs = require('fs');

const PROD_PATH = './data/migrated_products.json';
const CAT_PATH = './src/data/products-catalog.json';

const products = JSON.parse(fs.readFileSync(PROD_PATH, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(CAT_PATH, 'utf8'));

// Canonical IDs to KEEP active
const canonicalKeepIds = new Set([
  // G1 Mart Private Label Pouch Packshots
  'g1-p0295', // California Badam
  'g1-p0422', // Jeedipappu / Cashews
  'g1-nut021', // Salted Pistachios
  'g1-nut020', // Golden Raisins / Kismis
  'g1-p0077', // Endu Kharjuram (Dry Hard Dates)
  'g1-lion-dates', // Lion Desert King Arabian Dates
  'g1-p0979', // Phool Makhana
  'g1-p0893', // Pumpkin Seeds
  'g1-p0894', // Sunflower Seeds
  'g1-p0895', // Muskmelon Seeds
  'g1-p0898', // Watermelon Seeds
  'g1-p0677', // Crispy Corn Flakes
  'g1-p1000', // Rolled Oats

  // Branded FMCG Packs
  'g1-nut001', // Happilo Almonds
  'g1-nut003', // Happilo Cashews
  'g1-nut005', // Happilo Pistachios
  'g1-nut006', // Happilo Raisins
  'g1-nut007', // Happilo Anjeer
  'g1-nut008', // Happilo Walnuts
  'g1-nut009', // Nutraj Almonds
  'g1-nut010', // Nutraj Cashews
  'g1-nut011', // Farmley Mixed Dry Fruits
  'g1-nut012', // Lion Dates Seedless 200g Box
  'g1-nut013', // Lion Arabian Dates 500g Box
  'g1-nut014', // True Elements Chia Seeds
  'g1-nut015'  // True Elements Pumpkin Seeds
]);

// Deactivate duplicates in products
products.forEach(p => {
  if (p.category_id === 'dry-fruits-cereals' || p.category === 'dry-fruits-cereals') {
    if (!canonicalKeepIds.has(p.id)) {
      p.is_active = false;
      p.status = 'inactive';
      p.name = p.name.startsWith('[INACTIVE DUPLICATE]') ? p.name : `[INACTIVE DUPLICATE] ${p.name}`;
    } else {
      p.is_active = true;
      p.status = 'active';
      if (p.name.startsWith('[INACTIVE DUPLICATE]')) {
        p.name = p.name.replace('[INACTIVE DUPLICATE] ', '');
      }
    }
  }
});

// Deactivate duplicates in catalog
catalog.forEach(p => {
  if (p.category_id === 'dry-fruits-cereals' || p.category === 'dry-fruits-cereals') {
    if (!canonicalKeepIds.has(p.id)) {
      p.is_active = false;
      p.status = 'inactive';
      p.name = p.name.startsWith('[INACTIVE DUPLICATE]') ? p.name : `[INACTIVE DUPLICATE] ${p.name}`;
    } else {
      p.is_active = true;
      p.status = 'active';
      if (p.name.startsWith('[INACTIVE DUPLICATE]')) {
        p.name = p.name.replace('[INACTIVE DUPLICATE] ', '');
      }
    }
  }
});

fs.writeFileSync(PROD_PATH, JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(CAT_PATH, JSON.stringify(catalog, null, 2), 'utf8');

console.log('Catalog and products updated: only canonical and FMCG packs are active!');
