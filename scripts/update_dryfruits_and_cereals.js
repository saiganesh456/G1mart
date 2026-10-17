const fs = require('fs');

const prodsPath = './data/migrated_products.json';
const varsPath = './data/migrated_product_variants.json';

const prods = JSON.parse(fs.readFileSync(prodsPath, 'utf8'));
const variants = JSON.parse(fs.readFileSync(varsPath, 'utf8'));

// 1. Update Kellogg's and Quaker Oats images
const kelloggs = prods.find(p => p.id === 'g1-kelloggs-corn-flakes');
if (kelloggs) {
  kelloggs.image_url = '/products/packshots/kelloggs-corn-flakes.webp';
  kelloggs.imageUrl = '/products/packshots/kelloggs-corn-flakes.webp';
}

const quaker = prods.find(p => p.id === 'g1-quaker-oats');
if (quaker) {
  quaker.image_url = '/products/packshots/quaker-oats.webp';
  quaker.imageUrl = '/products/packshots/quaker-oats.webp';
}

// 2. Deactivate unbranded duplicates in Dry Fruits & Nuts
const duplicatesToDeactivate = [
  'g1-p0985', // Pistachio -> merged into g1-nut021
  'g1-p0583', // Badam -> merged into g1-p0295
  'g1-p0776', // SP Badam -> merged into g1-p0295
  'g1-p0984', // Almond Roasted -> merged into g1-p0295
  'g1-p0394', // Gokulam Dates -> merged into g1-p0077
  'g1-p0492', // Gkl Black Dates -> merged into g1-p0077
  'g1-p0909', // Gokilam Dates -> merged into g1-p0077
];

duplicatesToDeactivate.forEach(id => {
  const p = prods.find(x => x.id === id);
  if (p) {
    p.is_active = false;
    p.isActive = false;
    console.log(`Deactivated dry fruits duplicate: ${id} (${p.name})`);
  }
});

// Ensure g1-nut021 (G1 Mart Pista) has 250g and 500g variants
const pista = prods.find(p => p.id === 'g1-nut021');
if (pista) {
  pista.name = 'G1 Mart Pista (Salted Pistachios / పిస్తా)';
  pista.brand = 'G1 Mart';
  pista.image_url = '/products/generated_pouches/g1_pista_pouch.webp';
  pista.imageUrl = '/products/generated_pouches/g1_pista_pouch.webp';
}

// Save back
fs.writeFileSync(prodsPath, JSON.stringify(prods, null, 2), 'utf8');
fs.writeFileSync(varsPath, JSON.stringify(variants, null, 2), 'utf8');

console.log('Successfully updated Dry Fruits & Cereals packshots and deduplication!');
