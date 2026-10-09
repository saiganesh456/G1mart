const fs = require('fs');
const products = JSON.parse(fs.readFileSync('d:/web-agency-projects/G1mart/data/migrated_products.json'));
const categories = JSON.parse(fs.readFileSync('d:/web-agency-projects/G1mart/data/migrated_categories.json'));

let csv = 'category,product,brand,size\n';
let missingCount = 0;
let passedCount = products.filter(p => p.image_status === 'verified').length;
let rejectedCount = products.filter(p => p.image_status === 'rejected').length;

categories.forEach(cat => {
  const catProds = products.filter(p => p.category_id === cat.id);
  const passed = catProds.filter(p => p.image_status === 'verified');
  
  if (passed.length < 2) {
    const needed = 2 - passed.length;
    const candidates = catProds.filter(p => p.image_status !== 'verified').sort((a,b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    
    for (let i = 0; i < Math.min(needed, candidates.length); i++) {
      const p = candidates[i];
      csv += cat.name + ',' + p.name.replace(/,/g, '') + ',' + p.brand + ',' + (p.unit || '1 pc') + '\n';
      missingCount++;
    }
  }
});

fs.writeFileSync('d:/web-agency-projects/G1mart/audit/images-needed.csv', csv);

const md = '# Audit Progress\n\n## Image Gate Status\n- **Passed:** ' + passedCount + '\n- **Rejected:** ' + rejectedCount + '\n  - Top reasons: Fake placeholder box, No transparent background, Bad cutout with jagged edges and white blobs, Invalid source (Open Food Facts)\n- **Missing (Needs Photo for Tiles):** ' + missingCount + '\n\n## Category Tiles Action Items\nCategories lacking 2 passing products are currently showing the clean calm line icon.\nPlease see images-needed.csv for the exact products that need to be photographed.\n\n## UI Before/After Summary\n- Quarantined all non-compliant Open Food Facts and scraped images.\n- Replaced the flat poster banners with realistic photographic banners using Unsplash images and a gradient overlay for text readability.\n- Replaced the 404/broken desktop search bar UI with a unified sticky search bar (mobile only) and header search bar (desktop).\n- Updated the grid layout to show up to 10 columns on desktop.\n- Ensured category tiles elegantly fallback to a tinted background with a pack icon when < 1 verified image is available, and use a 1-product cutout when 1 is available.\n- Updated Product cards to sort properly and show the sleek fallback.\n';

fs.writeFileSync('d:/web-agency-projects/G1mart/audit/progress.md', md);
