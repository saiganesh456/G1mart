const prods = require('../data/migrated_products.json');

// Subcategories that clearly belong to other categories:
const MISMATCHES = [
  // In sweets-chocolates
  { cat: 'sweets-chocolates', sub: 'Milk & Curd', newSub: 'Chocolates' },
  { cat: 'sweets-chocolates', sub: 'Laundry & Detergents', newSub: 'Candies & Gums' },
  
  // In atta-rice-dal
  { cat: 'atta-rice-dal', sub: 'Cleaners', newSub: 'Atta & Flours' },
  { cat: 'atta-rice-dal', sub: 'Laundry & Detergents', newSub: 'Pulses & Dal' },
  { cat: 'atta-rice-dal', sub: 'Sanitary Pads & Napkins', newSub: 'Rice & Grains' },

  // In oil-ghee-masala
  { cat: 'oil-ghee-masala', sub: 'Detergent Powders & Liquids', newSub: 'Edible Oils' },
  { cat: 'oil-ghee-masala', sub: 'Chocolates & Sweets', newSub: 'Whole Spices' },

  // In biscuits-bakery
  { cat: 'biscuits-bakery', sub: 'Milk & Curd', newSub: 'Biscuits & Cookies' },
  { cat: 'biscuits-bakery', sub: 'Dry Fruits & Nuts', newSub: 'Biscuits & Cookies' },
  { cat: 'biscuits-bakery', sub: 'Chocolates & Sweets', newSub: 'Cookies' },
  { cat: 'biscuits-bakery', sub: 'Chocolates', newSub: 'Cookies' },

  // In drinks-juices
  { cat: 'drinks-juices', sub: 'Detergent Powders & Liquids', newSub: 'Soft Drinks & Sodas' },

  // In hair-care
  { cat: 'hair-care', sub: 'Eggs', newSub: 'Shampoo' },
  { cat: 'hair-care', sub: 'Spices & Oils', newSub: 'Hair Oil' },
  { cat: 'hair-care', sub: 'Edible Oils', newSub: 'Hair Oil' },

  // In pooja-needs
  { cat: 'pooja-needs', sub: 'Candies & Gums', newSub: 'Pooja Items' },
  { cat: 'pooja-needs', sub: 'Sanitary Pads & Napkins', newSub: 'Pooja Needs' },
  { cat: 'pooja-needs', sub: 'Spices, Masalas & Oils', newSub: 'Pooja Oil' },
  { cat: 'pooja-needs', sub: 'Pulses & Dal', newSub: 'Pooja Items' },

  // In floor-surface-cleaners
  { cat: 'floor-surface-cleaners', sub: 'Tea & Coffee', newSub: 'Cleaners' },
  { cat: 'floor-surface-cleaners', sub: 'Sanitary Pads & Napkins', newSub: 'Cleaners' },
  { cat: 'floor-surface-cleaners', sub: 'Chocolates', newSub: 'Cleaners' },

  // In dairy-bread-eggs
  { cat: 'dairy-bread-eggs', sub: 'Detergent Powders & Liquids', newSub: 'Milk & Curd' },
  { cat: 'dairy-bread-eggs', sub: 'Laundry & Detergents', newSub: 'Milk & Curd' },
  { cat: 'dairy-bread-eggs', sub: 'Chocolates', newSub: 'Dairy' },

  // In sugar-salt-staples
  { cat: 'sugar-salt-staples', sub: 'Sanitary Pads & Napkins', newSub: 'Sugar & Jaggery' },
  { cat: 'sugar-salt-staples', sub: 'Detergent Powders & Liquids', newSub: 'Salt' },
  { cat: 'sugar-salt-staples', sub: 'Edible Oils', newSub: 'Other Staples' },

  // In oral-care
  { cat: 'oral-care', sub: 'Tea & Coffee', newSub: 'Toothpaste' },

  // In tea-coffee-milk-drinks
  { cat: 'tea-coffee-milk-drinks', sub: 'Chocolates & Sweets', newSub: 'Tea & Coffee' },
  { cat: 'tea-coffee-milk-drinks', sub: 'Chocolates', newSub: 'Tea & Coffee' },
  { cat: 'tea-coffee-milk-drinks', sub: 'Whole Spices', newSub: 'Tea & Coffee' },
];

let fixedCount = 0;
prods.forEach(p => {
  const cat = p.category_id || p.category;
  const sub = p.sub_category || p.subCategory;
  const match = MISMATCHES.find(m => m.cat === cat && m.sub === sub);
  if (match) {
    console.log(`Fixing [${p.id}] "${p.name}" in cat "${cat}": "${sub}" -> "${match.newSub}"`);
    fixedCount++;
  }
});

console.log(`Total items to fix: ${fixedCount}`);
