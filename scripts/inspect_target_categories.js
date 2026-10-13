const fs = require('fs');
const prods = JSON.parse(fs.readFileSync('data/migrated_products.json', 'utf8'));
const brands = JSON.parse(fs.readFileSync('data/migrated_brands.json', 'utf8'));
const brandMap = new Map(brands.map(b => [b.id, b.name]));

const cats = ['tea-coffee-milk-drinks', 'drinks-juices', 'sweets-chocolates', 'instant-food', 'dairy-bread-eggs'];
for (const c of cats) {
  const items = prods.filter(p => p.category_id === c);
  console.log(`=== ${c} (${items.length} products) ===`);
  items.slice(0, 15).forEach(p => console.log(' ', p.id, '|', brandMap.get(p.brand_id) || p.brand, '|', p.name, '|', p.image_url || p.image));
}
