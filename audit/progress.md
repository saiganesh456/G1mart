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

## 2. Category Tiles Status: 100% Commercial Studio Multi-Brand Collages (Blinkit Style)
- **Total active categories:** 24 (100% complete)
- **Tiles with Commercial Studio Cutouts (2–3 Top Iconic Brands):** 24 out of 24
- **Tiles with Calm Line Icons / Placeholders:** 0 (Zero fallbacks needed)
- **Tile Specifications:**
  - Square 1:1 aspect ratio with 16px soft radius (`rounded-[16px]`).
  - Section-specific pastel tints sampled directly from Blinkit reference screenshots:
    - **Grocery & Kitchen:** `#FAF7EE` (soft warm ivory)
    - **Snacks & Drinks:** `#E8F4F3` (soft clean mint)
    - **Household Essentials:** `#EEF5FB` (soft sky blue)
    - **Beauty & Personal Care:** `#EDF6F3` (soft sage)
  - Ground contact shadow with realistic blur and opacity.
  - Transparent WebP canvas (400x400) vertically and horizontally centered.
  - 2-line centered label below the tile with clean typography (`leading-[14px] line-clamp-2`).

### Complete Breakdown of All 24 Category Tiles:
| Section | Category ID | Category Name | Top Iconic Brands Featured (2–3 Packs) |
|---|---|---|---|
| **Grocery & Kitchen** | `vegetables-fruits` | Vegetables & Fruits | Fresh Yellow Bananas + Red Gala Apple |
| **Grocery & Kitchen** | `atta-rice-dal` | Atta Rice & Dal | Aashirvaad Shudh Chakki Atta + Sri Lalitha Idly Rava |
| **Grocery & Kitchen** | `oil-ghee-masala` | Oil Ghee & Masala | Fortune Sunlite Sunflower Oil + Everest Tikhalal Chilli Powder |
| **Grocery & Kitchen** | `dairy-bread-eggs` | Dairy Bread & Eggs | Hatsun Curd Tub + Arun Donut |
| **Grocery & Kitchen** | `dry-fruits-cereals` | Dry Fruits & Cereals | Premium Raw Almonds Jar + Kellogg's Corn Flakes Pack |
| **Grocery & Kitchen** | `sugar-salt-staples` | Sugar Salt & Staples | Tata Salt Blue Pouch + Tata RA Salt Yellow Pouch |
| **Snacks & Drinks** | `chips-namkeen` | Chips & Namkeen | Lay's Classic Salted Potato Chips + Haldiram's Aloo Bhujia Pouch |
| **Snacks & Drinks** | `biscuits-bakery` | Biscuits & Bakery | Britannia Good Day Butter + Parle-G Gluco Biscuit |
| **Snacks & Drinks** | `sweets-chocolates` | Sweets & Chocolates | Cadbury Dairy Milk Chocolate + Nestle Munch Wafer Bar |
| **Snacks & Drinks** | `drinks-juices` | Drinks & Juices | Thums Up Pet Bottle + Classic Horlicks Jar |
| **Snacks & Drinks** | `tea-coffee-milk-drinks` | Tea Coffee & Milk Drinks | Brooke Bond Red Label Tea Pouch + Nescafé Classic Coffee Glass Jar |
| **Snacks & Drinks** | `instant-food` | Instant Food | Maggi 2-Minute Masala Noodles + Bingo Mad Angles Snack |
| **Snacks & Drinks** | `sauces-spreads` | Sauces & Spreads | Kissan Mixed Fruit Jam Jar + Kissan Fresh Tomato Ketchup Bottle |
| **Household Essentials** | `laundry-detergents` | Laundry & Detergents | Ariel Matic Front Load Detergent + Surf Excel Easy Wash Pack |
| **Household Essentials** | `dishwash` | Dishwash | Vim Dishwash Bar + Exo Anti-Bacterial Round Scrubber |
| **Household Essentials** | `floor-surface-cleaners` | Floor & Surface Cleaners | Lizol Floral Floor Cleaner Bottle + Harpic 10x Power Plus Toilet Cleaner |
| **Household Essentials** | `pooja-needs` | Pooja Needs | Mangaldeep Agarbatti Box + Brass Diya + Pure Camphor Jar |
| **Household Essentials** | `kitchenware` | Kitchenware | Milton Thermosteel Flask + Prestige Non-Stick Frying Pan |
| **Beauty & Personal Care** | `soaps-bath` | Soaps & Bath | Cinthol Confidence Soap + Dettol Original Soap + Pears Pure & Gentle |
| **Beauty & Personal Care** | `oral-care` | Oral Care | Colgate Total Carton + Oral-B Pro-Health Toothbrush |
| **Beauty & Personal Care** | `hair-care` | Hair Care | Parachute 100% Pure Coconut Oil + Pantene Pro-V Shampoo Bottle |
| **Beauty & Personal Care** | `skin-care` | Skin Care | Nivea Soft Light Moisturiser Jar + Vaseline Intensive Care Lotion Pump Bottle |
| **Beauty & Personal Care** | `baby-care` | Baby Care | Pampers All Round Protection Diaper Pants + Johnson's Baby Lotion Bottle |
| **Beauty & Personal Care** | `hygiene` | Hygiene | Whisper Choice Ultra Sanitary Pads + Dettol Antiseptic Liquid Bottle |

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
Screenshots captured using Playwright (`audit/screenshot.js`):
- Desktop (1440px): `audit/screens/home_desktop_after.png`
  - Single search bar in the header (no duplicates).
  - 8–10 column category grid matching Blinkit / Flipkart Minutes reference proportions.
  - 3.5:1 photographic hero banner with overlapping transparent pack cutouts.
  - All 24 categories render multi-pack commercial studio collages with soft tints.
- Mobile (390px): `audit/screens/home_mobile_after.png`
  - Single sticky search bar with slip scan camera icon.
  - 4-column category grid with soft tinted 16px square tiles and 2-line labels.
  - 2.2:1 photographic hero banner.
  - Perfect touch targets, clean bottom navigation.
- Category View (390px): `audit/screens/category_mobile_after.png`
  - Verified products (Unibic Choco Ripple, Parle-G Gluco, Good DAY, Bourbon Biscuit) sorted to the very top.
  - Left brand rail showing verified product thumbnails and monogram fallbacks.

---

## 6. Summary of Solved Reference Issues
1. **Tiles with rectangular photo crops, hands, dark backgrounds and jagged edges:** Completely replaced with clean studio cutouts on transparent backgrounds with soft ground shadows.
2. **Tiles with back-of-pack nutrition tables:** Replaced with front-of-pack studio photoshoots.
3. **Fake placeholder pack art, plain icons, and pending verification cards:** 100% eliminated from homepage category tiles. All 24 categories now have real 2–3 pack commercial product studio cutouts.
4. **Two search bars at once on desktop:** Fixed. Desktop has a single unified search bar in the header with integrated slip scan. Mobile has a single pinned search bar.
5. **Flat green poster-style banner:** Replaced with full photographic high-resolution banners with smooth brand gradients and overlapping catalog packshots.
