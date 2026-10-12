const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODS_PATH = path.join(ROOT, 'data', 'migrated_products.json');
const VARS_PATH = path.join(ROOT, 'data', 'migrated_product_variants.json');
const MAP_PATH = path.join(ROOT, 'src', 'data', 'legacyIdMap.json');

const prods = JSON.parse(fs.readFileSync(PRODS_PATH, 'utf8'));
const vars = JSON.parse(fs.readFileSync(VARS_PATH, 'utf8'));
const legacyMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));

// Build variant lookup
const varsByPid = new Map();
for (const v of vars) {
  if (!varsByPid.has(v.product_id)) varsByPid.set(v.product_id, []);
  varsByPid.get(v.product_id).push(v);
}

const excludedIds = new Set();

// 1. FREEDOM SUNFLOWER OIL CONSOLIDATION
const primaryFreedomId = 'g1-p1701';
const freedomSunflowerProds = prods.filter(p => {
  const n = (p.name || '').toLowerCase();
  const b = (p.brand || '').toLowerCase();
  return (b.includes('freedom') || n.includes('freedom')) && n.includes('sunflower');
});
const freedomProduct = prods.find(p => p.id === primaryFreedomId) || freedomSunflowerProds[0];

if (freedomProduct) {
  freedomProduct.id = primaryFreedomId;
  freedomProduct.name = 'Freedom Refined Sunflower Oil';
  freedomProduct.brand = 'Freedom';
  freedomProduct.brand_id = 'brand-freedom';
  freedomProduct.category_id = 'oil-ghee-masala';
  freedomProduct.category = 'oil-ghee-masala';
  freedomProduct.sub_category = 'Edible Cooking Oils & Ghee';
  freedomProduct.subCategory = 'Edible Cooking Oils & Ghee';
  freedomProduct.image_url = '/products/packshots/freedom-oil-1l.jpg';
  freedomProduct.imageUrl = '/products/packshots/freedom-oil-1l.jpg';
  freedomProduct.image = '/products/packshots/freedom-oil-1l.jpg';
  freedomProduct.image_status = 'VERIFIED';
  freedomProduct.imageStatus = 'VERIFIED';

  const freedomVariants = [
    { id: `${primaryFreedomId}-v1`, product_id: primaryFreedomId, size_label: '500 ml', price: 75, mrp: 75, stock: 25, image_url: '/products/packshots/freedom-oil-1l.jpg' },
    { id: `${primaryFreedomId}-v2`, product_id: primaryFreedomId, size_label: '1 L', price: 145, mrp: 145, stock: 30, image_url: '/products/packshots/freedom-oil-1l.jpg' },
    { id: `${primaryFreedomId}-v3`, product_id: primaryFreedomId, size_label: '2 L', price: 305, mrp: 305, stock: 20, image_url: '/products/packshots/freedom-oil-1l.jpg' },
    { id: `${primaryFreedomId}-v4`, product_id: primaryFreedomId, size_label: '5 L', price: 745, mrp: 745, stock: 15, image_url: '/products/packshots/freedom-oil-5l.jpg' },
    { id: `${primaryFreedomId}-v5`, product_id: primaryFreedomId, size_label: '15 L', price: 2250, mrp: 2250, stock: 10, image_url: '/products/packshots/freedom-oil-5l.jpg' },
    { id: `${primaryFreedomId}-v6`, product_id: primaryFreedomId, size_label: '15 kg', price: 2450, mrp: 2450, stock: 8, image_url: '/products/packshots/freedom-oil-5l.jpg' }
  ];
  varsByPid.set(primaryFreedomId, freedomVariants);

  for (const fp of freedomSunflowerProds) {
    if (fp.id !== primaryFreedomId) {
      excludedIds.add(fp.id);
      legacyMap[fp.id] = primaryFreedomId;
      varsByPid.delete(fp.id);
    }
  }
}

// 2. GOLD DROP SUNFLOWER OIL CONSOLIDATION
const goldDropProds = prods.filter(p => {
  const n = (p.name || '').toLowerCase();
  const b = (p.brand || '').toLowerCase();
  return (b.includes('gold drop') || n.includes('gold drop')) && n.includes('sunflower');
});
const primaryGoldDropId = goldDropProds[0]?.id || 'g1-p1622';
const goldDropProduct = prods.find(p => p.id === primaryGoldDropId);

if (goldDropProduct) {
  goldDropProduct.id = primaryGoldDropId;
  goldDropProduct.name = 'Gold Drop Refined Sunflower Oil';
  goldDropProduct.brand = 'Gold Drop';
  goldDropProduct.brand_id = 'brand-gold-drop';
  goldDropProduct.category_id = 'oil-ghee-masala';
  goldDropProduct.category = 'oil-ghee-masala';
  goldDropProduct.sub_category = 'Edible Cooking Oils & Ghee';
  goldDropProduct.subCategory = 'Edible Cooking Oils & Ghee';
  goldDropProduct.image_url = '/products/packshots/gold-drop-sunflower-clean.jpg';
  goldDropProduct.imageUrl = '/products/packshots/gold-drop-sunflower-clean.jpg';
  goldDropProduct.image = '/products/packshots/gold-drop-sunflower-clean.jpg';
  goldDropProduct.image_status = 'VERIFIED';
  goldDropProduct.imageStatus = 'VERIFIED';

  const goldDropVariants = [
    { id: `${primaryGoldDropId}-v1`, product_id: primaryGoldDropId, size_label: '500 ml', price: 75, mrp: 80, stock: 25, image_url: '/products/packshots/gold-drop-sunflower-clean.jpg' },
    { id: `${primaryGoldDropId}-v2`, product_id: primaryGoldDropId, size_label: '1 L', price: 145, mrp: 155, stock: 30, image_url: '/products/packshots/gold-drop-sunflower-clean.jpg' },
    { id: `${primaryGoldDropId}-v3`, product_id: primaryGoldDropId, size_label: '2 L', price: 300, mrp: 310, stock: 20, image_url: '/products/packshots/gold-drop-sunflower-clean.jpg' },
    { id: `${primaryGoldDropId}-v4`, product_id: primaryGoldDropId, size_label: '5 L', price: 740, mrp: 760, stock: 15, image_url: '/products/packshots/gold-drop-sunflower-clean.jpg' },
    { id: `${primaryGoldDropId}-v5`, product_id: primaryGoldDropId, size_label: '15 L', price: 2200, mrp: 2300, stock: 10, image_url: '/products/packshots/gold-drop-sunflower-clean.jpg' }
  ];
  varsByPid.set(primaryGoldDropId, goldDropVariants);

  for (const gp of goldDropProds) {
    if (gp.id !== primaryGoldDropId) {
      excludedIds.add(gp.id);
      legacyMap[gp.id] = primaryGoldDropId;
      varsByPid.delete(gp.id);
    }
  }
}

// 3. FREEDOM RICE BRAN OIL CONSOLIDATION
const freedomRiceProds = prods.filter(p => {
  const n = (p.name || '').toLowerCase();
  const b = (p.brand || '').toLowerCase();
  return (b.includes('freedom') || n.includes('freedom')) && n.includes('rice');
});
const primaryFreedomRiceId = freedomRiceProds[0]?.id || 'g1-p1652';
const freedomRiceProduct = prods.find(p => p.id === primaryFreedomRiceId);

if (freedomRiceProduct) {
  freedomRiceProduct.id = primaryFreedomRiceId;
  freedomRiceProduct.name = 'Freedom Physically Refined Rice Bran Oil';
  freedomRiceProduct.brand = 'Freedom';
  freedomRiceProduct.brand_id = 'brand-freedom';
  freedomRiceProduct.category_id = 'oil-ghee-masala';
  freedomRiceProduct.category = 'oil-ghee-masala';
  freedomRiceProduct.sub_category = 'Edible Cooking Oils & Ghee';
  freedomRiceProduct.subCategory = 'Edible Cooking Oils & Ghee';
  freedomRiceProduct.image_url = '/products/verified/g1-p0952.webp';
  freedomRiceProduct.imageUrl = '/products/verified/g1-p0952.webp';
  freedomRiceProduct.image = '/products/verified/g1-p0952.webp';
  freedomRiceProduct.image_status = 'VERIFIED';
  freedomRiceProduct.imageStatus = 'VERIFIED';

  const freedomRiceVariants = [
    { id: `${primaryFreedomRiceId}-v1`, product_id: primaryFreedomRiceId, size_label: '500 ml', price: 72, mrp: 75, stock: 25, image_url: '/products/verified/g1-p0952.webp' },
    { id: `${primaryFreedomRiceId}-v2`, product_id: primaryFreedomRiceId, size_label: '1 L', price: 140, mrp: 145, stock: 30, image_url: '/products/verified/g1-p0952.webp' },
    { id: `${primaryFreedomRiceId}-v3`, product_id: primaryFreedomRiceId, size_label: '2 L', price: 295, mrp: 305, stock: 20, image_url: '/products/verified/g1-p0952.webp' },
    { id: `${primaryFreedomRiceId}-v4`, product_id: primaryFreedomRiceId, size_label: '5 L', price: 720, mrp: 750, stock: 15, image_url: '/products/verified/g1-p0952.webp' }
  ];
  varsByPid.set(primaryFreedomRiceId, freedomRiceVariants);

  for (const rp of freedomRiceProds) {
    if (rp.id !== primaryFreedomRiceId) {
      excludedIds.add(rp.id);
      legacyMap[rp.id] = primaryFreedomRiceId;
      varsByPid.delete(rp.id);
    }
  }
}

// 4. FORTUNE SUNFLOWER OIL CONSOLIDATION
const fortuneProds = prods.filter(p => {
  const n = (p.name || '').toLowerCase();
  const b = (p.brand || '').toLowerCase();
  return (b.includes('fortune') || n.includes('fortune')) && n.includes('sunflower');
});
const primaryFortuneId = fortuneProds[0]?.id || 'g1-p1627';
const fortuneProduct = prods.find(p => p.id === primaryFortuneId);

if (fortuneProduct) {
  fortuneProduct.id = primaryFortuneId;
  fortuneProduct.name = 'Fortune Sunlite Refined Sunflower Oil';
  fortuneProduct.brand = 'Fortune';
  fortuneProduct.brand_id = 'brand-fortune';
  fortuneProduct.category_id = 'oil-ghee-masala';
  fortuneProduct.category = 'oil-ghee-masala';
  fortuneProduct.sub_category = 'Edible Cooking Oils & Ghee';
  fortuneProduct.subCategory = 'Edible Cooking Oils & Ghee';
  fortuneProduct.image_url = '/products/packshots/fortune-sunlite-clean.jpg';
  fortuneProduct.imageUrl = '/products/packshots/fortune-sunlite-clean.jpg';
  fortuneProduct.image = '/products/packshots/fortune-sunlite-clean.jpg';
  fortuneProduct.image_status = 'VERIFIED';
  fortuneProduct.imageStatus = 'VERIFIED';

  const fortuneVariants = [
    { id: `${primaryFortuneId}-v1`, product_id: primaryFortuneId, size_label: '1 L', price: 145, mrp: 150, stock: 25, image_url: '/products/packshots/fortune-sunlite-clean.jpg' },
    { id: `${primaryFortuneId}-v2`, product_id: primaryFortuneId, size_label: '5 L', price: 745, mrp: 780, stock: 15, image_url: '/products/packshots/fortune-sunlite-clean.jpg' }
  ];
  varsByPid.set(primaryFortuneId, fortuneVariants);

  for (const fp of fortuneProds) {
    if (fp.id !== primaryFortuneId) {
      excludedIds.add(fp.id);
      legacyMap[fp.id] = primaryFortuneId;
      varsByPid.delete(fp.id);
    }
  }
}

// 5. UPDATE OIL IMAGES (Saffola, Idhayam, Amul, Freedom Groundnut)
for (const p of prods) {
  const n = (p.name || '').toLowerCase();
  if (n.includes('saffola') && n.includes('gold')) {
    p.image_url = '/products/packshots/saffola-gold-oil.jpg';
    p.imageUrl = '/products/packshots/saffola-gold-oil.jpg';
    p.image = '/products/packshots/saffola-gold-oil.jpg';
    p.image_status = 'VERIFIED';
  } else if (n.includes('idhayam')) {
    p.image_url = '/products/packshots/idhayam-oil.jpg';
    p.imageUrl = '/products/packshots/idhayam-oil.jpg';
    p.image = '/products/packshots/idhayam-oil.jpg';
    p.image_status = 'VERIFIED';
  } else if (n.includes('amul') && n.includes('ghee')) {
    p.image_url = '/products/packshots/amul-ghee.jpg';
    p.imageUrl = '/products/packshots/amul-ghee.jpg';
    p.image = '/products/packshots/amul-ghee.jpg';
    p.image_status = 'VERIFIED';
  } else if (n.includes('freedom') && n.includes('groundnut')) {
    p.image_url = '/products/verified/g1-p0874.webp';
    p.imageUrl = '/products/verified/g1-p0874.webp';
    p.image = '/products/verified/g1-p0874.webp';
    p.image_status = 'VERIFIED';
  }
}

// 6. Fix any other duplicate items with same brand + same name + same category
const groups = {};
for (const p of prods) {
  if (excludedIds.has(p.id)) continue;
  const key = `${(p.brand || '').trim().toLowerCase()}|||${(p.name || '').trim().toLowerCase()}|||${p.category_id}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(p);
}

let autoMergedCount = 0;
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
            product_id: primary.id
          });
        }
      }
      if (item.id !== primary.id) {
        excludedIds.add(item.id);
        legacyMap[item.id] = primary.id;
        varsByPid.delete(item.id);
        autoMergedCount++;
      }
    }
    if (combinedVariants.length > 0) {
      varsByPid.set(primary.id, combinedVariants);
    }
  }
}

console.log(`Auto-merged duplicate product groups: ${autoMergedCount} duplicate products combined.`);

// Final filtered products & variants
const finalProducts = prods.filter(p => !excludedIds.has(p.id));
const finalVariants = [];
for (const [pid, vList] of varsByPid.entries()) {
  if (!excludedIds.has(pid)) {
    finalVariants.push(...vList);
  }
}

console.log('Final products count:', finalProducts.length);
console.log('Final variants count:', finalVariants.length);

fs.writeFileSync(PRODS_PATH, JSON.stringify(finalProducts, null, 2));
fs.writeFileSync(VARS_PATH, JSON.stringify(finalVariants, null, 2));
fs.writeFileSync(MAP_PATH, JSON.stringify(legacyMap, null, 2));
console.log('Successfully completed full catalog consolidation and image remediation!');
