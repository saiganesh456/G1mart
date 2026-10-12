const fs = require('fs');
const path = require('path');

const prodsPath = path.join(__dirname, '..', 'data', 'migrated_products.json');
const prods = JSON.parse(fs.readFileSync(prodsPath, 'utf8'));

// 1. Update verified images for sweets products
const SWEET_IMAGE_FIXES = {
  'g1-p0011': '/products/verified/g1-p0011.webp',
  'g1-p0110': '/products/verified/g1-p0110.webp',
  'g1-p0118': '/products/verified/g1-p0118.webp',
  'g1-p0199': '/products/verified/g1-p0199.webp',
  'g1-p0208': '/products/verified/g1-p0208.webp',
  'g1-p0209': '/products/verified/g1-p0209.webp',
  'g1-p0246': '/products/verified/g1-p0246.webp',
  'g1-p0248': '/products/verified/g1-p0248.webp',
  'g1-p0256': '/products/verified/g1-p0256.webp',
  'g1-p0269': '/products/verified/g1-p0269.webp',
  'g1-p0270': '/products/verified/g1-p0270.webp',
  'g1-p0571': '/products/verified/g1-p0571.webp',
  'g1-p0676': '/products/verified/g1-p0676.webp',
  'g1-p0680': '/products/verified/g1-p0680.webp',
  'g1-p0683': '/products/verified/g1-p0683.webp',
  'g1-p0692': '/products/verified/g1-p0692.webp',
  'g1-p0700': '/products/verified/g1-p0700.webp',
  'g1-p0746': '/products/verified/g1-p0746.webp',
  'g1-p0747': '/products/verified/g1-p0747.webp',
  'g1-p0749': '/products/verified/g1-p0749.webp',
  'g1-p0794': '/products/verified/g1-p0794.webp',
  'g1-p0935': '/products/verified/g1-p0935.webp',
  'g1-p0966': '/products/verified/g1-p0966.webp',
  'g1-p0968': '/products/verified/g1-p0968.webp',
  'g1-p0972': '/products/verified/g1-p0972.webp',
  'g1-p0975': '/products/verified/g1-p0975.webp',
  'g1-p1148': '/products/verified/g1-p1148.webp',
  'g1-p1149': '/products/verified/g1-p1149.webp',
  'g1-p1549': '/products/verified/g1-p1549.webp',
  'g1-p1550': '/products/verified/g1-p1550.webp',
  'g1-p1552': '/products/verified/g1-p1552.webp',
  'g1-p1553': '/products/verified/g1-p1553.webp',
};

// 2. Specific item field corrections
const SPECIFIC_FIXES = {
  'g1-p0110': { brand_id: 'brand-nestle', brand: 'Nestle', sub_category: 'Chocolates' },
  'g1-p0118': { brand_id: 'brand-nestle', brand: 'Nestle', sub_category: 'Chocolates' },
  'g1-p0749': { brand_id: 'brand-cadbury', brand: 'Cadbury', sub_category: 'Chocolates' },
  'g1-p0968': { sub_category: 'Candies & Gums' },
  'g1-p0246': { sub_category: 'Chocolates & Sweets' },
  'g1-p0208': { brand: 'Lavian' },
  'g1-p0680': { brand: 'Fitday' },
};

// 3. Category/Subcategory domain cleanup across whole catalog
const SUBCAT_MISMATCHES = [
  { cat: 'sweets-chocolates', sub: 'Milk & Curd', newSub: 'Chocolates' },
  { cat: 'sweets-chocolates', sub: 'Laundry & Detergents', newSub: 'Candies & Gums' },
  { cat: 'atta-rice-dal', sub: 'Cleaners', newSub: 'Atta & Flours' },
  { cat: 'atta-rice-dal', sub: 'Laundry & Detergents', newSub: 'Pulses & Dal' },
  { cat: 'atta-rice-dal', sub: 'Sanitary Pads & Napkins', newSub: 'Rice & Grains' },
  { cat: 'oil-ghee-masala', sub: 'Detergent Powders & Liquids', newSub: 'Edible Oils' },
  { cat: 'oil-ghee-masala', sub: 'Chocolates & Sweets', newSub: 'Whole Spices' },
  { cat: 'biscuits-bakery', sub: 'Milk & Curd', newSub: 'Biscuits & Cookies' },
  { cat: 'biscuits-bakery', sub: 'Dry Fruits & Nuts', newSub: 'Biscuits & Cookies' },
  { cat: 'biscuits-bakery', sub: 'Chocolates & Sweets', newSub: 'Cookies' },
  { cat: 'biscuits-bakery', sub: 'Chocolates', newSub: 'Cookies' },
  { cat: 'drinks-juices', sub: 'Detergent Powders & Liquids', newSub: 'Soft Drinks & Sodas' },
  { cat: 'hair-care', sub: 'Eggs', newSub: 'Shampoo' },
  { cat: 'hair-care', sub: 'Spices & Oils', newSub: 'Hair Oil' },
  { cat: 'hair-care', sub: 'Edible Oils', newSub: 'Hair Oil' },
  { cat: 'pooja-needs', sub: 'Candies & Gums', newSub: 'Pooja Items' },
  { cat: 'pooja-needs', sub: 'Sanitary Pads & Napkins', newSub: 'Pooja Needs' },
  { cat: 'pooja-needs', sub: 'Spices, Masalas & Oils', newSub: 'Pooja Oil' },
  { cat: 'pooja-needs', sub: 'Pulses & Dal', newSub: 'Pooja Items' },
  { cat: 'floor-surface-cleaners', sub: 'Tea & Coffee', newSub: 'Cleaners' },
  { cat: 'floor-surface-cleaners', sub: 'Sanitary Pads & Napkins', newSub: 'Cleaners' },
  { cat: 'floor-surface-cleaners', sub: 'Chocolates', newSub: 'Cleaners' },
  { cat: 'dairy-bread-eggs', sub: 'Detergent Powders & Liquids', newSub: 'Milk & Curd' },
  { cat: 'dairy-bread-eggs', sub: 'Laundry & Detergents', newSub: 'Milk & Curd' },
  { cat: 'dairy-bread-eggs', sub: 'Chocolates', newSub: 'Dairy' },
  { cat: 'sugar-salt-staples', sub: 'Sanitary Pads & Napkins', newSub: 'Sugar & Jaggery' },
  { cat: 'sugar-salt-staples', sub: 'Detergent Powders & Liquids', newSub: 'Salt' },
  { cat: 'sugar-salt-staples', sub: 'Edible Oils', newSub: 'Other Staples' },
  { cat: 'oral-care', sub: 'Tea & Coffee', newSub: 'Toothpaste' },
  { cat: 'tea-coffee-milk-drinks', sub: 'Chocolates & Sweets', newSub: 'Tea & Coffee' },
  { cat: 'tea-coffee-milk-drinks', sub: 'Chocolates', newSub: 'Tea & Coffee' },
  { cat: 'tea-coffee-milk-drinks', sub: 'Whole Spices', newSub: 'Tea & Coffee' },
];

let updatedImages = 0;
let updatedFields = 0;
let updatedSubcats = 0;

prods.forEach(p => {
  // Update image
  if (SWEET_IMAGE_FIXES[p.id]) {
    p.image_url = SWEET_IMAGE_FIXES[p.id];
    updatedImages++;
  }

  // Update specific fields
  if (SPECIFIC_FIXES[p.id]) {
    Object.assign(p, SPECIFIC_FIXES[p.id]);
    updatedFields++;
  }

  // Update mismatched subcategories
  const cat = p.category_id || p.category;
  const sub = p.sub_category || p.subCategory;
  const match = SUBCAT_MISMATCHES.find(m => m.cat === cat && m.sub === sub);
  if (match) {
    p.sub_category = match.newSub;
    if (p.subCategory) p.subCategory = match.newSub;
    updatedSubcats++;
  }
});

fs.writeFileSync(prodsPath, JSON.stringify(prods, null, 2), 'utf8');

console.log(`Applied catalog updates:`);
console.log(`- Images updated: ${updatedImages}`);
console.log(`- Specific products updated: ${updatedFields}`);
console.log(`- Subcategory cross-domain mismatches fixed: ${updatedSubcats}`);
