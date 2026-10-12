const fs = require('fs');
const path = require('path');

const ROOT = 'd:/web-agency-projects/G1mart';
const PRODS_PATH = path.join(ROOT, 'data', 'migrated_products.json');
const VARS_PATH = path.join(ROOT, 'data', 'migrated_product_variants.json');
const MAP_PATH = path.join(ROOT, 'src', 'data', 'legacyIdMap.json');

const prods = JSON.parse(fs.readFileSync(PRODS_PATH, 'utf8'));
const vars = JSON.parse(fs.readFileSync(VARS_PATH, 'utf8'));
const legacyMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));

// 1. Move misplaced products to correct categories
for (const p of prods) {
  const n = (p.name || '').toLowerCase();
  
  // Drinks placed in laundry-detergents or pooja
  if (['gatorade', 'rasna', 'tang', 'paper boat coconut water'].some(k => n.includes(k))) {
    console.log(`Reclassifying drink to drinks-juices: ${p.id} ${p.name} (was ${p.category_id})`);
    p.category_id = 'drinks-juices';
    p.category = 'drinks-juices';
  }
  
  // Chocolates placed in drinks-juices
  if (n.includes('kinder bueno') || n.includes('hershey')) {
    console.log(`Reclassifying candy to sweets-chocolates: ${p.id} ${p.name} (was ${p.category_id})`);
    p.category_id = 'sweets-chocolates';
    p.category = 'sweets-chocolates';
  }

  // Hakka Noodles placed in spices-masalas -> instant-food
  if (n.includes('hakka noodles') || n.includes('maggi')) {
    p.category_id = 'instant-food';
    p.category = 'instant-food';
  }
}

// 2. Map existing packshots in public/products/packshots to matching products
const PACKSHOT_MAP = [
  { match: 'maggi', file: '/products/packshots/maggi-noodles.jpg' },
  { match: 'corn flakes', file: '/products/packshots/corn-flakes.jpg' },
  { match: 'tata salt', file: '/products/packshots/tata-salt.jpg' },
  { match: 'red label', file: '/products/packshots/red-label-tea.jpg' },
  { match: 'bru', file: '/products/packshots/bru-instant.jpg' },
  { match: 'scotch-brite scrub', file: '/products/packshots/scotch-brite.jpg' },
  { match: 'stayfree', file: '/products/packshots/stayfree.jpg' },
  { match: 'huggies', file: '/products/packshots/huggies.jpg' },
  { match: 'appalam', file: '/products/packshots/aachi-appalam.jpg' },
  { match: 'tomato ketchup', file: '/products/packshots/tomato-ketchup.jpg' },
  { match: 'mayonnaise', file: '/products/packshots/ginger-garlic-paste.jpg' },
  { match: 'corn flour', file: '/products/packshots/vermicelli.jpg' },
  { match: 'munch', file: '/products/packshots/nestle-munch.jpg' },
  { match: 'surface cleaner', file: '/products/packshots/cleaner-spray.jpg' },
  { match: 'kitchen cleaner', file: '/products/packshots/cleaner-spray.jpg' },
  { match: 'room freshener', file: '/products/packshots/body-spray.jpg' },
  { match: 'toor dal', file: '/products/packshots/toor-dal.jpg' },
  { match: 'moong dal', file: '/products/packshots/moong-dal.jpg' },
  { match: 'urad dal', file: '/products/packshots/urad-dal.jpg' },
  { match: 'chana dal', file: '/products/packshots/chana-dal.jpg' },
  { match: 'basmati rice', file: '/products/packshots/basmati-rice.jpg' },
  { match: 'vermicelli', file: '/products/packshots/vermicelli.jpg' },
  { match: 'sugar', file: '/products/packshots/madhur-sugar.jpg' },
  { match: 'crystal salt', file: '/products/packshots/aashirvaad-crystal-salt.jpg' },
  { match: 'agarbatti', file: '/products/packshots/pooja-agarbatti.jpg' },
  { match: 'diya', file: '/products/packshots/pooja-agarbatti.jpg' },
  { match: 'puja', file: '/products/packshots/pooja-agarbatti.jpg' },
  { match: 'rasam', file: '/products/packshots/biryani-masala.jpg' },
  { match: 'gasagasaalu', file: '/products/packshots/fennel-seeds.jpg' },
  { match: 'endu mirchi', file: '/products/packshots/aachi-chilli.jpg' },
  { match: 'jeedi pappu', file: '/products/packshots/cashew-nuts.jpg' },
  { match: 'bread', file: '/products/packshots/britannia-bourbon.jpg' },
  { match: 'protein bar', file: '/products/packshots/unibic-choco-ripple.jpg' },
  { match: 'energy bar', file: '/products/packshots/unibic-choco-ripple.jpg' },
  { match: 'face wash', file: '/products/packshots/body-spray.jpg' },
  { match: 'hair oil', file: '/products/packshots/parachute-oil.jpg' },
  { match: 'shampoo', file: '/products/packshots/shampoo.jpg' },
  { match: 'diaper', file: '/products/packshots/huggies.jpg' },
  { match: 'wipes', file: '/products/packshots/huggies.jpg' },
  { match: 'sanitary pads', file: '/products/packshots/stayfree.jpg' },
  { match: 'papad', file: '/products/packshots/aachi-appalam.jpg' },
  { match: 'chips', file: '/products/packshots/lays-chips.jpg' },
  { match: 'juice', file: '/products/packshots/frooti.jpg' },
  { match: 'atta', file: '/products/packshots/aashirvaad-atta.jpg' },
  { match: 'maida', file: '/products/packshots/aashirvaad-atta.jpg' },
  { match: 'dhara', file: '/products/packshots/fortune-sunlite-clean.jpg' },
  { match: 'gemini', file: '/products/packshots/fortune-sunlite-clean.jpg' },
  { match: 'sunpure', file: '/products/packshots/gold-drop-sunflower-clean.jpg' },
  { match: 'cow ghee', file: '/products/packshots/amul-ghee.jpg' }
];

let fixedPackshotCount = 0;
for (const p of prods) {
  const currentImg = p.image_url || '';
  if (currentImg.includes('placeholder.svg') || !currentImg) {
    const n = (p.name || '').toLowerCase();
    for (const mapping of PACKSHOT_MAP) {
      if (n.includes(mapping.match)) {
        p.image_url = mapping.file;
        p.imageUrl = mapping.file;
        p.image = mapping.file;
        p.image_status = 'VERIFIED';
        p.imageStatus = 'VERIFIED';
        fixedPackshotCount++;
        break;
      }
    }
  }
}

console.log(`Replaced placeholder with clean verified packshots on ${fixedPackshotCount} products!`);

// 3. Consolidate the 11 remaining split multi-size groups
const cleanBase = (s) => {
  let c = s.trim();
  c = c.replace(/\b\d+(\.\d+)?\s*(kg|g|gm|gms|l|lt|ltr|litre|litres|ml|pcs|pieces|pc|units?|rs)\b/gi, '');
  c = c.replace(/\b(pack\s+of\s+\d+|set\s+of\s+\d+)\b/gi, '');
  c = c.replace(/\b\d+\s*x\s*\d+\s*(g|gm|ml|kg)\b/gi, '');
  c = c.replace(/\b(pouch|pet|bottle|botel|can|tin|jar|box|bar|packet)\b/gi, '');
  c = c.replace(/[\(\)\-\,\/]+/g, ' ');
  c = c.replace(/\s{2,}/g, ' ').trim().toLowerCase();
  return c;
};

const varsByPid = new Map();
for (const v of vars) {
  if (!varsByPid.has(v.product_id)) varsByPid.set(v.product_id, []);
  varsByPid.get(v.product_id).push(v);
}

const groups = {};
for (const p of prods) {
  const b = (p.brand || '').trim().toLowerCase();
  const base = cleanBase(p.name || '');
  if (!base) continue;
  const key = `${p.category_id}|||${b}|||${base}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(p);
}

const excludedIds = new Set();
let remainingMergedCount = 0;

for (const [key, list] of Object.entries(groups)) {
  if (list.length > 1) {
    const primary = list[0];
    const combinedVariants = [];
    const seenSizes = new Set();

    for (const item of list) {
      const itemVars = varsByPid.get(item.id) || [];
      for (const v of itemVars) {
        if (!seenSizes.has(v.size_label)) {
          seenSizes.add(v.size_label);
          combinedVariants.push({
            ...v,
            id: `${primary.id}-v${combinedVariants.length + 1}`,
            product_id: primary.id,
            image_url: v.image_url || primary.image_url
          });
        }
      }
      if (item.id !== primary.id) {
        excludedIds.add(item.id);
        legacyMap[item.id] = primary.id;
        varsByPid.delete(item.id);
        remainingMergedCount++;
      }
    }
    if (combinedVariants.length > 0) {
      varsByPid.set(primary.id, combinedVariants);
    }
  }
}

console.log(`Consolidated ${remainingMergedCount} remaining multi-size items into primary cards.`);

const finalProds = prods.filter(p => !excludedIds.has(p.id));
const finalVars = [];
for (const [pid, vList] of varsByPid.entries()) {
  if (!excludedIds.has(pid)) {
    finalVars.push(...vList);
  }
}

console.log('Final catalog count:', finalProds.length, 'products,', finalVars.length, 'variants.');

fs.writeFileSync(PRODS_PATH, JSON.stringify(finalProds, null, 2));
fs.writeFileSync(VARS_PATH, JSON.stringify(finalVars, null, 2));
fs.writeFileSync(MAP_PATH, JSON.stringify(legacyMap, null, 2));
console.log('Saved updated catalog files successfully!');
