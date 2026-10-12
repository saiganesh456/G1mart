/**
 * G1 Mart Supermarket — Homepage Category Tile Images Configuration
 * Maps category/tileId -> ordered file list.
 *
 * HARD RULES:
 * - Put each tile's files in one config (tileImages.js: tileId -> ordered file list). No hard-coded paths in components.
 * - Fixed image area inside the tile; every product uses object-fit: contain, same height (about 78% of the tile height), bottom-aligned, no cropping, no stretching, never scaled above its natural pixel size.
 * - Two products sit side by side with a slight overlap (max 10%); the three-item vegetable tile overlaps the same way.
 * - Use srcset/WebP; width/height attributes set so nothing jumps while loading; if an image fails to load, fall back to the old image, never a broken-image icon.
 * - If a file is missing or fails validation, keep that tile's CURRENT image, log it in MISSING_IMAGES.md, and move on. Never substitute another product.
 */

// Full manifest of 14 category tiles and their ordered files
export const TILE_IMAGES = {
  // 1. Rice, Atta & Flours
  'atta-rice-dal': [
    '/tiles/aashirvaad-atta.webp',
    '/tiles/india-gate-basmati.webp',
  ],

  // 2. Dals & Pulses: G1 Mart's own white-pouch style
  'local-dals': [
    '/tiles/g1mart-toor-dal.webp',
    '/tiles/g1mart-chana-dal.webp',
  ],

  // 3. Cooking Oils & Ghee: freedom-sunflower-oil.webp + CURRENT ghee jar
  'oil-ghee-masala': [
    '/tiles/freedom-sunflower-oil.webp',
    '/categories/collages/oil-ghee-masala.webp',
  ],

  // 4. Spices & Masalas
  'spices-masalas': [
    '/tiles/aachi-garam-masala.webp',
    '/tiles/aachi-mutton-masala.webp',
  ],

  // 5. Dry Fruits & Nuts
  'dry-fruits-cereals': [
    '/tiles/cashews.webp',
    '/tiles/almonds.webp',
  ],

  // 6. Fresh Vegetables (3 items max, vegetables/greens only, no fruit)
  'vegetables-fruits': [
    '/tiles/cauliflower.webp',
    '/tiles/tomato.webp',
    '/tiles/curry-leaves.webp',
  ],

  // 7. Namkeen & Chips
  'chips-namkeen': [
    '/tiles/haldirams-aloo-bhujia.webp',
    '/tiles/lays-or-kurkure.webp',
  ],

  // 8. Chocolates & Sweets (kitkat.webp, dairy-milk.webp ONLY)
  'sweets-chocolates': [
    '/tiles/kitkat.webp',
    '/tiles/dairy-milk.webp',
  ],

  // 9. Cold Drinks, Juices & Soda (CURRENT cola bottle + maaza.webp, no Horlicks)
  'drinks-juices': [
    '/categories/collages/drinks-juices.webp',
    '/tiles/maaza.webp',
  ],

  // 10. Dishwash & Scrubbers
  'dishwash': [
    '/tiles/exo-dishwash.webp',
    '/tiles/vim-dishwash.webp',
  ],

  // 11. Cleaners & Pest Control
  'floor-surface-cleaners': [
    '/tiles/harpic.webp',
    '/tiles/lizol.webp',
  ],

  // 12. Bathing Soaps & Handwash
  'soaps-bath': [
    '/tiles/santoor.webp',
    '/tiles/cinthol.webp',
  ],

  // 13. Hair Oils & Shampoos
  'hair-care': [
    '/tiles/parachute-hair-oil.webp',
    '/tiles/clinic-plus-shampoo.webp',
  ],

  // 14. Skin Care, Talc & Grooming
  'skin-care': [
    '/tiles/himalaya-face-wash.webp',
    '/tiles/garnier-face-wash.webp',
  ],
};

// Tiles that have passed validation and are active.
// Populated by scripts/check-tiles.js. If files are missing/invalid, tile keeps current image.
export const VALIDATED_TILES = {
  // Empty when files in /public/tiles/ are missing or fail validation
};

export function getTileImages(tileId) {
  return VALIDATED_TILES[tileId] || null;
}

const tileImagesConfig = {
  TILE_IMAGES,
  VALIDATED_TILES,
  getTileImages,
};

export default tileImagesConfig;
