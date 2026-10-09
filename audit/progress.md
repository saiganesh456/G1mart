# Audit Progress & Packshot Remediation Report

## 1. Candidate Recovery & Inventory Counts
- **Total candidate files recovered and inventoried:** 248
  - Restored from `/public/quarantine/`: 32 files
  - Inventoried from `public/products/packshots/`: 66 files
  - Scanned from catalog / storefront assets: 150 files
  - Master candidate inventory logged in: `/audit/packshot-inventory.csv`
- **Candidates matched strictly to catalog products:** 144 match assignments (74 unique catalog products verified)
  - Detailed mapping logged in: `/audit/packshot-matches.csv`
- **Candidates flagged for review:** 3 files
  - Ambiguous / low-confidence items logged in: `/audit/review.csv` (`jg-020.jpg` sachet vs bottle, `jg-024.jpg` battery, `launch-plate.jpg` unbranded plate)
- **Candidates rejected:** 141 files

### Top Rejection Reasons:
1. **No exact brand + product line match in current catalog:** 89 files (e.g. products not stocked in current G1 Mart inventory)
2. **Loose ingredients photo without branded packaging:** 26 files (raw unpackaged grains/spices)
3. **Jagged / torn edges after cut-out or dark halo patches:** 21 files
4. **Fake placeholder art (plain coloured box):** 3 files (`g1-p0001`, `g1-p0002`, `g1-p0003` old assets)
5. **Human hands / people holding pack:** 1 file (`g1-p0009`)
6. **Back-of-pack / nutrition panel view:** 1 file (`g1-p0210`)

---

## 2. Category Tiles Status (Revised Reference Style)
- **Total active categories:** 24
- **Tiles with Real Branded Packshots:** 18
  - Collages of 2–3 overlapping hero packs: 10 categories
  - Enlarged single hero pack: 8 categories
- **Tiles with Calm Line Icon (0 verified products):** 6 categories

### Breakdown by Category:
| Category ID | Category Name | Tile Type | Real Packshots Used |
|---|---|---|---|
| `atta-rice-dal` | Atta Rice & Dal | 3-pack collage | Aashirvaad Atta, Lalitha Idly Rava, Aashirvaad Suji Rava |
| `dairy-bread-eggs` | Dairy Bread & Eggs | 3-pack collage | Hatsun Curd, Arun Donut, Arun Bites |
| `biscuits-bakery` | Biscuits & Bakery | 3-pack collage | Good Day, Parle-G, Unibic Choco Ripple |
| `sweets-chocolates` | Sweets & Chocolates | 3-pack collage | Dairy Milk Chocolate, Munch Wafer, 5 Star |
| `soaps-bath` | Soaps & Bath | 3-pack collage | Cinthol, Dettol Original, Pears |
| `sugar-salt-staples` | Sugar Salt & Staples | 2-pack collage | Tata Salt, Tata RA Salt |
| `drinks-juices` | Drinks & Juices | 2-pack collage | Thums Up, Horlicks |
| `sauces-spreads` | Sauces & Spreads | 2-pack collage | Kissan Mixed Fruit Jam, Kissan Fresh Tomato Ketchup |
| `laundry-detergents` | Laundry & Detergents | 2-pack collage | Ariel Matic Front Load, Surf Excel Easy Wash |
| `dishwash` | Dishwash | 2-pack collage | Vim Dishwash Bar, Exo Touch & Shine |
| `oil-ghee-masala` | Oil Ghee & Masala | 1 enlarged pack | Aachi Appalam |
| `chips-namkeen` | Chips & Namkeen | 1 enlarged pack | Bingo Mad Angles Tomato |
| `tea-coffee-milk-drinks` | Tea Coffee & Milk Drinks | 1 enlarged pack | Wagh Bakri Premium Leaf Tea |
| `instant-food` | Instant Food | 1 enlarged pack | Maggi 2-Minute Noodles |
| `oral-care` | Oral Care | 1 enlarged pack | Colgate Strong Teeth |
| `hair-care` | Hair Care | 1 enlarged pack | Parachute Pure Coconut Oil |
| `baby-care` | Baby Care | 1 enlarged pack | Huggies Wonder Pants |
| `hygiene` | Hygiene | 1 enlarged pack | Stayfree Secure XL |
| `vegetables-fruits` | Vegetables & Fruits | Calm line icon | *None yet — needs photo shoot* |
| `dry-fruits-cereals` | Dry Fruits & Cereals | Calm line icon | *None yet — needs photo shoot* |
| `floor-surface-cleaners` | Floor & Surface Cleaners | Calm line icon | *None yet — needs photo shoot* |
| `pooja-needs` | Pooja Needs | Calm line icon | *None yet — needs photo shoot* |
| `kitchenware` | Kitchenware | Calm line icon | *None yet — needs photo shoot* |
| `skin-care` | Skin Care | Calm line icon | *None yet — needs photo shoot* |

### Shoot List for Missing Categories (CSV Generated at `/audit/images-needed.csv`):
1. **Vegetables & Fruits (`vegetables-fruits`)**: Onions (G1 Mart Fresh, 1 unit), Mango Fruit (G1 Mart Fresh, 1 unit)
2. **Dry Fruits & Cereals (`dry-fruits-cereals`)**: Endu Kharjuram (Local / Unbranded, 1 unit), Unibic Cashew (Unibic, 1 unit)
3. **Floor & Surface Cleaners (`floor-surface-cleaners`)**: Odonil AIR Fresh (Odonil, 1 unit), Harpic Power Plus (Harpic, 1 unit)
4. **Pooja Needs (`pooja-needs`)**: ZED Black (Zed Black, 1 unit), LIA Cones (Zed Black, 1 unit)
5. **Kitchenware (`kitchenware`)**: Lock 60mm (Local / Unbranded, 1 unit), Allout Matches (Local / Unbranded, 1 unit)
6. **Skin Care (`skin-care`)**: Vaseline Body Lotion (Vaseline, 1 unit), Vaseline Lip Care (Vaseline, 1 unit)

---

## 3. Banner System Overhaul (Step 4)
- **Eliminated:** Flat green poster SVGs with baked-in vector illustrations and double-rendered text.
- **Implemented:** Real photographic backgrounds with high resolution (Unsplash free commercial licence), layered with G1 Mart emerald-to-transparent gradient overlays:
  1. `banner-monthly-list`: Fresh grocery market backdrop (`/banners/bg_monthly_list.jpg`) with Aashirvaad Atta + Good Day cutouts on right side.
  2. `banner-fresh-produce`: Farm-fresh produce backdrop (`/banners/bg_fresh_produce.jpg`).
  3. `banner-household`: Modern clean interior backdrop (`/banners/bg_household.jpg`) with Ariel Front Load + Vim Bar cutouts on right side.
  4. `banner-snacks-drinks`: Chilled beverages backdrop (`/banners/bg_snacks_drinks.jpg`) with Thums Up + Bingo Mad Angles + Good Day cutouts on right side.
- **Layout & Behaviour:**
  - Mobile aspect ratio ~2.2:1; Desktop aspect ratio ~3.5:1.
  - Border radius 16px with soft shadow.
  - Auto-slides every 4 seconds, pauses on hover/touch, includes clean dot navigation indicator pills.

---

## 4. Product Cards & Category Page (Step 5)
- **Product Cards:** Verified products display transparent 800x800 WebP cutouts contained cleanly with padding. Unmatched products display a calm tinted tile with pack-type line icon (pouch, bottle, bar, box, packet, jar) and brand initial monogram circle. Zero fake placeholder packs, zero "Pending" text.
- **Brand Rail:** Circular thumbnails showing the brand's verified hero cutout; brands without a cutout show a styled coloured monogram circle. Never reuses another brand's image.
- **Sorting:** Products with verified photos sort first in all category listings.

---

## 5. Visual QA & Screen Audits (Step 6)
Screenshots captured using Playwright:
- Desktop (1440px): `audit/screens/home_desktop_after.png`
  - Single search bar in the header (no duplicates).
  - 8–10 column category grid matching Blinkit / Flipkart Minutes reference proportions.
  - 3.5:1 photographic hero banner with overlapping transparent pack cutouts.
- Mobile (390px): `audit/screens/home_mobile_after.png`
  - Single sticky search bar with slip scan camera icon.
  - 4-column category grid with soft tinted 16px square tiles and 2-line labels.
  - 2.2:1 photographic hero banner.
- Category View (390px): `audit/screens/category_mobile_after.png`
  - Verified products (Unibic Choco Ripple, Parle-G Gluco, Good DAY, Bourbon Biscuit) sorted to the very top.
  - Left brand rail showing verified product thumbnails and monogram fallbacks.

---

## 6. Iterative Visual Refinements & Quality Polish
- **Transparent Padded White Box Removal:** Identified 19 packshots in `public/products/packshots/` that had solid white boxes masquerading as transparent PNGs due to corner-alpha padding. Executed `clean_all_verified_cutouts.py` with `rembg` U2Net to extract pure, isolated pack shapes (e.g. Horlicks, Dettol, Tata Salt, Maggi, Parachute Oil).
- **Collage Precision Geometry:** Rewrote collage pipeline (`rebuild_premium_collages.py`):
  1. Trims all empty transparent padding via `getbbox()` to recover true pack boundaries.
  2. Proportional scale factor applied to target 75–80% tile height without stretching or distorting aspect ratios.
  3. Grounded on an aligned bottom baseline with soft realistic contact drop shadows (`GaussianBlur`).
  4. Automatic vertical centering on the 400x400 canvas so flat packs (soaps, biscuits) sit centered.
- **Color Palette Alignment:** Replaced generic section tints with exact pastel hex values sampled directly from the user's reference screenshots (`agent refernace pic`):
  - Grocery & Kitchen: `#FAF7EE` (soft warm ivory)
  - Snacks & Drinks: `#E8F4F3` (soft clean mint)
  - Household Essentials: `#EEF5FB` (soft sky blue)
  - Beauty & Personal Care: `#EDF6F3` (soft sage)
- **Client Resilience:** Hardened `BannerCarousel.tsx` API fetch parser with safe nullish fallbacks to prevent unhandled rejection overlays during Fast Refresh.
