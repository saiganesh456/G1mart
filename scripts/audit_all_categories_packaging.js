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

console.log(`Found ${categories.length} storefront categories in exact supermarket order:`);

const BAD_POUCH_SUBSTRINGS = [
  'g1_atta_pouch',
  'g1_rice_pouch',
  'g1_corn_flour_pouch',
  'g1_maida_pouch',
  'g1_pista_pouch',
  'g1_poha_pouch',
  'g1_ragi_pouch',
  'g1_sugar_pouch',
  'g1_wheat_grains_pouch',
  'g1_white_peas_pouch',
  'g1_bellam_pouch'
];

categories.forEach((cat, idx) => {
  const catProds = prods.filter(p => (p.category_id === cat.id || p.category === cat.id));
  const g1Items = catProds.filter(p => {
    const b = (p.brand || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    return b.includes('g1') || b.includes('jeevan') || n.startsWith('g1 mart') || n.startsWith('jeevan mart');
  });

  const badItems = catProds.filter(p => {
    const img = p.image_url || p.imageUrl || '';
    return BAD_POUCH_SUBSTRINGS.some(b => img.includes(b));
  });

  console.log(`\nCategory ${idx + 1}: ${cat.name} (id: ${cat.id}) — Total: ${catProds.length}, G1 Items: ${g1Items.length}, Bad Trapezoid Labels: ${badItems.length}`);
  if (badItems.length > 0) {
    console.log(`  BAD LABEL ITEMS TO FIX:`);
    badItems.forEach(it => {
      console.log(`    - ID: ${it.id} | Name: ${it.name} | Img: ${it.image_url}`);
    });
  }
  if (g1Items.length > 0 && badItems.length === 0) {
    console.log(`  G1 Mart items (${g1Items.length}):`);
    g1Items.slice(0, 5).forEach(it => {
      console.log(`    * ID: ${it.id} | Name: ${it.name} | Img: ${it.image_url}`);
    });
    if (g1Items.length > 5) {
      console.log(`    * ...and ${g1Items.length - 5} more`);
    }
  }
});
