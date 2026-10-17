const fs = require('fs');

const prods = JSON.parse(fs.readFileSync('./data/migrated_products.json', 'utf8'));
const seedContent = fs.readFileSync('./src/data/demo-seed.ts', 'utf8');
const demoCatsPart = seedContent.split('export const SUPERMARKET_CATEGORIES')[1].split('export const DEMO_CATEGORIES')[0];
const catRegex = /"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"/g;
let m;
const categories = [];
while ((m = catRegex.exec(demoCatsPart)) !== null) {
  categories.push({ id: m[1], name: m[2] });
}

console.log(`Found ${categories.length} categories:`);
categories.forEach((cat, idx) => {
  const catProds = prods.filter(p => (p.category_id === cat.id || p.category === cat.id));
  const g1Items = catProds.filter(p => {
    const b = (p.brand || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    const isG1 = b.includes('g1') || b.includes('jeevan') || n.startsWith('g1 mart') || n.startsWith('jeevan mart') || (p.image_url && p.image_url.includes('g1_'));
    return isG1;
  });
  console.log(`${idx + 1}. [${cat.id}] "${cat.name}" -> ${catProds.length} products, ${g1Items.length} private label items`);
});
