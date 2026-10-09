# G1 Mart Audit & Optimization Progress Log

This log tracks the step-by-step execution across all 5 phases as specified in the work order.

## Baseline & Pre-Phase 1 State
- **Date:** October 9, 2026
- **Database Backup:** Complete (archived to `backup_pre_phase1/` containing `data/`, `src/data/`, and `supabase/`).
- **Audit Findings:** Recorded in `/audit/report.md` and `/audit/products.csv`.
- **Status:** Baseline committed. Ready for Phase 1.

---

## Master Task Execution Report: Blinkit-Style Quick Commerce Experience

### Global Rules Compliance
1. **Source of Truth:** Catalog data is served strictly from `DB / productService` (1,043 products). All legacy catalogs and guessing routines (`PACKSHOT_MAP`, `getPackshotImage`) are deleted. Zero duplicate image URLs across the catalog.
2. **Truthful Packshots & Text:** Zero AI-generated packs, zero competitor brand assets (Blinkit/Flipkart/Zepto), zero stock packshots. Photos originate exclusively from verified transparent cut-outs, high-confidence Open Food Facts, free-license produce cutouts, and store camera captures. All filler text ("Photo coming soon", "Genuine Store Item", invented fake discounts) has been 100% eliminated. Products without verified photos cleanly render a soft-tinted pack silhouette (pouch, bottle, bar, box, packet, jar) with the brand monogram.
3. **Visual Identity:** G1 Mart deep green accent (`#1B5E20`, `#2E7D32`), clean white backgrounds, soft-tinted section tiles (light teal, warm cream, soft blue, blush), 16px corner radiuses, subtle elevation shadows, and single-font typography (`Plus Jakarta Sans`).
4. **Mobile Responsiveness:** Zero horizontal overflow across all tested viewports (360px, 390px, 430px).

---

### Phase 1 - Data & Architecture Clean-Up
- **Status:** COMPLETED & VERIFIED
- **Changes:**
  - `productService` (`g1-p0001` .. `g1-p1053`) unified as sole source of truth across home, categories, search, detail, cart, and admin.
  - Purged all regex, brand, and category guessing logic.
  - Fixed Category Header Bug: Sub-category titles are no longer glued to category headers (e.g. cleanly renders "Atta, Rice & Dal" without duplicated sub-category labels).
  - Cleaned horizontal overflow on category explorer.
  - Updated `ProductCard` to link directly to `/product/:id`.
  - Completely removed delivery / address strip from all headers. Delivery address is prompted strictly in a clean bottom sheet during Checkout.

---

### Phase 2 - Hero Shot List & Shooting Screen
- **Status:** COMPLETED & VERIFIED
- **Artifacts:**
  - `/audit/hero-shot-list.csv`: 169 target hero products (4 popular items per category + top brand anchors).
  - `/audit/images-needed.csv`: Full manifest of all missing items categorized by priority.
- **Owner Dashboard ("Shoot list" Tab):**
  - Live at `/admin` (Tab: "Shoot list").
  - Mobile-first interface organized by category with live progress counters (e.g., "Atta Rice & Dal 3/4").
  - Live preview of category tile collages and brand rail thumbnails.
  - One-tap camera upload with instant background removal (`rembg`), 800x800 WebP square formatting, and instant publication.
  - Bulk photo folder importer supporting `<product_id>.jpg` batch drops.

---

### Phase 3 - Home Page (Blinkit / Flipkart Minutes Architecture)
- **Status:** COMPLETED & VERIFIED
- **Hierarchy:**
  1. **Top Bar:** G1 Mart logo, cart icon, profile link. Scrolls naturally off-screen.
  2. **Sticky Search Bar:** Features slip scan camera button; locks to `top: 0` (`position: sticky`) when scrolled.
  3. **Banner Carousel:** Auto-sliding (4s interval), touch swipe enabled, pagination dots, 16px rounded corners, ~2.2:1 aspect ratio. Seeded 4 custom SVG brand banners ("Monthly Grocery List", "Fresh Vegetables & Fruits", "Household & Cleaning", "Snacks & Drinks").
  4. **Sectioned Grids:** 4 structured sections (Grocery & Kitchen, Snacks & Drinks, Household Essentials, Beauty & Personal Care) with 4-column soft-tinted collage tiles and 2-line labels.
  5. **Dynamic Category Collages:** Generated from 3 verified cut-out images layered with soft drop shadows; falls back to ambient vector icons when fewer than 3 photos are verified.
  6. **Floating Cart Pill:** Green "View cart • N items" pill floating above the bottom navigation bar.

---

### Phase 4 - Categories & Category Detail Experience
- **Status:** COMPLETED & VERIFIED
- **Architecture:**
  1. **Categories Page:** Grouped sections with soft-tinted collage tiles matching the home screen.
  2. **Category Detail Header:** Back arrow + category title + sort dropdown + horizontal sub-category chip row.
  3. **Left Brand Rail (76px):** Sticky vertical rail with circular (~56px) product cut-out thumbnails, brand names, and product counts. Coloured monogram circles for brands lacking photos. "All Brands" at top, "Local Brands" at bottom. Green vertical accent bar on active selection.
  4. **Product Grid:** 2 columns. Cards feature verified transparent cut-outs, 2-line title, small-caps brand, live variant selector chip, true MRP and discount badges, and green `ADD` / `- 1 +` quantity steppers.
  5. **Sorting:** Verified photo products automatically sorted first, followed by popularity.
  6. **Product Detail Page:** Large hero image, brand link, live variant selector, ADD stepper, and "More from this brand" recommendations.

---

### Phase 5 - Verification & Test Audit
- **Status:** COMPLETED & VERIFIED
- **Automated Test Results (Playwright Chromium):**
  - Horizontal Overflow: 0px overflow across 360px, 390px, and 430px (15/15 tests passed).
  - Sticky Search: Pinned at `rectTop: 0px` on home page scroll (passed).
  - Prohibited Copy: 0 occurrences of "Photo coming soon", "Genuine Store Item", or fake discounts (passed).
  - Brand Cleanliness: 0 brands named "Other" (passed).
  - Interactive Journeys: Home > Category > Brand rail filter > Variant bottom sheet > Product detail > Checkout address sheet tested and passing.
- **Screenshots Captured (390px Mobile Viewport in `/audit/screens/`):**
  1. `01_home_top.png` - Home header, banner carousel, and top grocery tiles.
  2. `02_home_scrolled.png` - Home scrolled down showing search bar pinned sticky to top.
  3. `03_category_atta_rice_dal.png` - Atta, Rice & Dal category detail with left brand rail and product grid.
  4. `04_category_chips_namkeen.png` - Chips & Namkeen category detail.
  5. `05_category_soaps_bath.png` - Soaps & Bath category detail.
  6. `06_product_page.png` - Product detail page with live variant pricing and "More from this brand".
  7. `07_checkout_address_sheet.png` - Checkout delivery address bottom sheet.
- **Build Verification:**
  - `npm run build` compiled 41/41 routes with 0 errors.

---

### Catalog Photo Coverage & Statistics

| Metric | Count | Percentage |
| :--- | :--- | :--- |
| **Total Catalog Products** | 1,043 | 100.0% |
| **Verified Transparent Packshots** | 33 | 3.2% |
| **Products with Pack Silhouette Fallback** | 1,010 | 96.8% |
| **Duplicate Image URLs** | 0 | 0.0% |
| **Hero Shot List Target Items** | 169 | 100.0% |
| **Hero Shots Completed** | 28 | 16.6% |
| **Hero Shots Remaining** | 141 | 83.4% |

#### Per-Category Coverage Breakdown

| Category Slug | Total Products | Verified Photos | Missing Photos | Coverage % |
| :--- | :--- | :--- | :--- | :--- |
| `sauces-spreads` | 17 | 4 | 13 | 23.5% |
| `biscuits-bakery` | 48 | 6 | 42 | 12.5% |
| `hair-care` | 26 | 3 | 23 | 11.5% |
| `tea-coffee-milk-drinks` | 21 | 2 | 19 | 9.5% |
| `chips-namkeen` | 12 | 1 | 11 | 8.3% |
| `atta-rice-dal` | 49 | 3 | 46 | 6.1% |
| `laundry-detergents` | 39 | 2 | 37 | 5.1% |
| `drinks-juices` | 20 | 1 | 19 | 5.0% |
| `dishwash` | 20 | 1 | 19 | 5.0% |
| `dry-fruits-cereals` | 24 | 1 | 23 | 4.2% |
| `dairy-bread-eggs` | 27 | 1 | 26 | 3.7% |
| `sweets-chocolates` | 31 | 1 | 30 | 3.2% |
| `instant-food` | 110 | 2 | 108 | 1.8% |
| `sugar-salt-staples` | 70 | 1 | 69 | 1.4% |
| `oil-ghee-masala` | 74 | 1 | 73 | 1.4% |
| `soaps-bath` | 112 | 1 | 111 | 0.9% |
| `kitchenware` | 10 | 1 | 9 | 10.0% |
| `hygiene` | 231 | 1 | 230 | 0.4% |
| `oral-care` | 34 | 0 | 34 | 0.0% |
| `floor-surface-cleaners` | 36 | 0 | 36 | 0.0% |
| `baby-care` | 12 | 0 | 12 | 0.0% |
| `pooja-needs` | 12 | 0 | 12 | 0.0% |
| `skin-care` | 5 | 0 | 5 | 0.0% |
| `vegetables-fruits` | 2 | 0 | 2 | 0.0% |
| `feminine-hygiene` | 1 | 0 | 1 | 0.0% |

---

### Key Architectural & Design Decisions Made
1. **Sticky Search on Mobile (`overflow-x: clip`):** Replaced legacy `overflow-x: hidden` in `StorefrontLayout` and `globals.css` with `overflow-x: clip`. This strictly eliminates horizontal scrolling while allowing native CSS `position: sticky` (`top: 0`) to pin the search bar once the logo row scrolls away.
2. **Pack-Type Fallback Silhouettes:** For the 1,010 items awaiting camera photos, custom vector pack silhouettes (pouch, bottle, bar, box, packet, jar) with brand initials are rendered dynamically on soft tinted cards. This avoids broken image icons or deceptive stock photos.
3. **Checkout Address Bottom Sheet:** Stripped all delivery address banners from store headers. Delivery addresses are now requested strictly inside an auto-locating bottom sheet at Checkout for delivery orders, maintaining a focused shopping experience.
4. **Verified Photo Priority Sorting:** The category grid dynamically sorts products with verified transparent photos first, ensuring the richest visual packshots appear prominently at the top of every category.

---

### Blockers
- **None.** All 5 phases are fully built, verified, and passing tests. The Next.js production build (`npm run build`) compiles cleanly (41/41 routes).

---

### Plain-Language Instructions: What the Store Owner Must Do Next

To complete the photo catalog and upgrade the remaining category collages and brand thumbnails:

1. **Open the Admin Portal on your smartphone:**
   - On the store WiFi, navigate to: `http://<your-local-ip>:3000/admin` (or `http://localhost:3000/admin` on your computer).
2. **Switch to the "Shoot list" tab:**
   - Tap the **"Shoot list"** tab in the admin navigation bar.
   - Products are organized by category with clear progress trackers (e.g. *Atta, Rice & Dal: 3/4 complete*).
3. **Capture Pack Photos with your Phone Camera:**
   - Find the physical product on your store shelf.
   - Tap the camera button next to the product in the list.
   - Take a clear, well-lit photo of the front face of the product pack against a plain surface.
   - Tap **Upload**. The system will automatically remove the background, square the image to 800x800 transparent WebP, and publish it live immediately.
   - Once 3 products in a category are shot, the category collage on the home page will automatically assemble and update!
4. **Bulk Camera Upload (Optional Alternative):**
   - If taking photos with a dedicated camera, name the files `<product_id>.jpg` (e.g. `g1-p0012.jpg`) and drop them into the **Bulk Upload** box at the top of the Shoot list tab.
