const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = 'data/migrated_products.json';
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// 1. Strict Category Corrections
const CATEGORY_CORRECTIONS = {
  // Hair oils mistakenly placed in cooking oil
  'g1-p0449': 'hair-care', // Kesh King Oil 100ml
  'g1-p0766': 'hair-care', // Navaratna OIL
  'g1-p0655': 'hair-care', // Castor OIL
  
  // Non-cooking oil items in oil-ghee-masala
  'g1-p0730': 'instant-food',   // Masala Noodels
  'g1-p0541': 'chips-namkeen',   // Aachi Appalam / Papad
  'g1-p0894': 'sugar-salt-staples', // Sunflower Seeds
  
  // Misplaced items in sweets-chocolates
  'g1-p1023': 'oil-ghee-masala', // ITC Chikkin Masala
  'g1-p0312': 'sauces-spreads',  // Kissan Sweet&spicy
  'g1-p0724': 'tea-coffee-milk-drinks', // Horlicks Womens Plus Chocolate
  'g1-p0281': 'dairy-bread-eggs', // Arun Chocolate Ball
  'g1-p0013': 'pooja-needs',     // Nirmala Sweet Betek NUT Packet
  'g1-p0173': 'tea-coffee-milk-drinks', // 5 Star TEA
  'g1-p0555': 'biscuits-bakery', // Unibic Chocolate Wafer
  'g1-p0573': 'biscuits-bakery', // Unibic Rich Chocolate Wafer
  'g1-p0801': 'biscuits-bakery', // Dark Fantasy Chocolate Notes
  'g1-p0802': 'biscuits-bakery', // Dark Fantasy Chocolate Cookie
  'g1-p0667': 'biscuits-bakery', // Malkist Double Chocolatey
  
  // Misplaced items in laundry-detergents
  'g1-p0167': 'dairy-bread-eggs', // Arun FUN Wheel (ice cream)
  'g1-p0214': 'dairy-bread-eggs', // Arun Tringo (ice cream)
  'g1-p0228': 'floor-surface-cleaners', // Prince Broom
  'g1-p0335': 'drinks-juices',    // Aniva Orange Drink
  'g1-p0403': 'sugar-salt-staples', // Tamarind500g
  'g1-p0404': 'sugar-salt-staples', // Tamarind250g
  'g1-p0644': 'oil-ghee-masala',  // Sri Durga Green Tamarind Pickleb
  'g1-p0968': 'sweets-chocolates', // Oringe Candy
  
  // Brushes misplaced in tea-coffee
  'g1-p0230': 'floor-surface-cleaners', // Cleaning Brush Round
  'g1-p0836': 'floor-surface-cleaners', // Cloth Brushb1
  'g1-p0590': 'oral-care', // Ajay Brush
  'g1-p0720': 'oral-care', // Ultra Soft Brush
  'g1-p0454': 'oral-care', // Brush
  
  // Items misplaced in hygiene
  'g1-p0138': 'sugar-salt-staples', // Dabur Honey
  'g1-p0855': 'sugar-salt-staples', // Lion Honey
  'g1-p0964': 'sugar-salt-staples', // Spis Himalaya Honey
  'g1-p0976': 'sugar-salt-staples', // Honey
  'g1-p0233': 'floor-surface-cleaners', // Smile MOP
  'g1-p0234': 'floor-surface-cleaners', // Twist MOP Color
  'g1-p1003': 'floor-surface-cleaners', // Super MOP
};

// 2. Specific Image Corrections (Fixing Toor Dal wrongly assigned, and assigning authentic pouches/packshots)
const IMAGE_CORRECTIONS = {
  // Spices: authentic transparent pouches
  'g1-p0003': '/products/generated_pouches/g1_pepper_powder_pouch.webp',
  'g1-p0444': '/products/generated_pouches/g1_black_pepper_pouch.webp',
  'g1-p0872': '/products/generated_pouches/g1_black_pepper_pouch.webp',
  'g1-p0455': '/products/generated_pouches/g1_turmeric_powder_pouch.webp',
  'g1-p0503': '/products/generated_pouches/g1_turmeric_powder_pouch.webp',
  'g1-p0778': '/products/generated_pouches/g1_turmeric_powder_pouch.webp',
  'g1-p1014': '/products/generated_pouches/g1_turmeric_powder_pouch.webp',
  'g1-p0587': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0906': '/products/generated_pouches/g1_elaichi_pouch.webp',
  'g1-p0539': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0955': '/products/generated_pouches/g1_jeera_pouch.webp',
  'g1-p0990': '/products/generated_pouches/g1_coriander_powder_pouch.webp',
  'g1-p0951': '/products/generated_pouches/g1_chilli_powder_pouch.webp',
  'g1-p1022': '/products/generated_pouches/g1_coriander_powder_pouch.webp',
  
  // Chocolates: real branded packshots
  'g1-p0011': '/products/verified/g1-p0011.webp', // Dairy Milk
  'g1-p0110': '/products/verified/g1-p0110.webp', // Milkybar
  'g1-p0118': '/products/verified/g1-p0118.webp', // Milkybar Big Box
  'g1-p0199': '/products/verified/g1-p0199.webp', // Nestle Munch
  'g1-p0746': '/products/verified/g1-p0746.webp', // 5 Star
  'g1-p0747': '/products/verified/g1-p0747.webp', // 5 Star
  'g1-p0749': '/products/verified/g1-p0749.webp', // 5 Star
};

let catFixCount = 0;
let imgFixCount = 0;

products.forEach(p => {
  // Apply category correction
  if (CATEGORY_CORRECTIONS[p.id]) {
    p.category_id = CATEGORY_CORRECTIONS[p.id];
    p.category = CATEGORY_CORRECTIONS[p.id];
    catFixCount++;
  }
  
  // Apply image correction
  if (IMAGE_CORRECTIONS[p.id]) {
    const newImg = IMAGE_CORRECTIONS[p.id];
    p.image = newImg;
    p.image_url = newImg;
    p.imageUrl = newImg;
    p.image_status = 'verified';
    p.imageStatus = 'verified';
    
    // Also copy to public/products/verified/[id].webp
    const localSrc = path.join('public', newImg.replace(/^\//, ''));
    const localDest = path.join('public/products/verified', `${p.id}.webp`);
    if (fs.existsSync(localSrc) && localSrc !== localDest) {
      try {
        fs.copyFileSync(localSrc, localDest);
      } catch (e) {}
    }
    imgFixCount++;
  }
});

fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
console.log(`Updated ${catFixCount} category assignments and ${imgFixCount} image mappings.`);
