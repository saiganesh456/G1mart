# G1 Mart Audit & Optimization Progress Log

This log tracks the step-by-step execution across all 5 phases as specified in the work order.

## Baseline & Pre-Phase 1 State
- **Date:** October 9, 2026
- **Database Backup:** Complete (archived to `backup_pre_phase1/` containing `data/`, `src/data/`, and `supabase/`).
- **Audit Findings:** Recorded in `/audit/report.md` and `/audit/products.csv`.
- **Status:** Baseline committed. Ready for Phase 1.

## Phase 1 - One Source of Truth, No Image Guessing
- **Status:** COMPLETED & VERIFIED
- **Changes:**
  - Unified DB/productService (`g1-p0001` .. `g1-p1053`) as the sole source of truth across all storefront pages, search, product detail, repeat ordering, wishlist, and server order recalculation.
  - Removed all consumer imports of legacy `CATALOG_PRODUCTS`.
  - Built bidirectional legacy-to-canonical ID mapping (`src/data/legacyIdMap.json`, 2,534 entries) and helper (`src/lib/legacyIdMap.ts`) ensuring existing links/orders resolve seamlessly.
  - Purged image guessing: deleted `PACKSHOT_MAP` and `getPackshotImage` from `src/data/productsCatalog.ts`, moved guessing scripts to `scripts/legacy_archive/`.
  - Cleared 1,045 duplicate and mismatched image URLs in `data/migrated_products.json` (`image_url: null`, `image_status: 'missing'`). Only 8 verified unique packshots preserved.
  - Upgraded `ProductImage.tsx` to a clean neutral typographic placeholder showing brand and product name.
  - Wrapped `ProductCard` image and title in `<Link href={`/product/${product.id}`}>` with `min-w-0` layout fix.
- **Counts:**
  - Total canonical products: 1,053
  - Products with verified image: 8
  - Products with missing image: 1,045
  - Shared/duplicate image_urls: 0 (verified)
  - Next.js build: 36/36 routes compiled successfully without errors.
- **Unresolved:** None.

## Phase 2 - Reclassify Categories, Sub-Categories, Brands, Variants
- **Status:** COMPLETED & VERIFIED
- **Changes:**
  - Classify by Product Type: fixed the 23 misplaced products from `/audit/report.md` + 58 Telugu dal/pulse/grain products previously routed to hygiene.
  - Sub-categories: created `data/migrated_sub_categories.json` (64 sub-categories across all parent categories). Assigned sub-category to 100% of products (0 missing).
  - Brand recovery: extracted true FMCG brands from product names (107 recognized brands). Loose produce assigned "G1 Mart Fresh", unbranded items assigned "Local / Unbranded". Brand filter completely purged of "Other".
  - Variant merging: merged 10 size duplicate standalone products into parent products with live multi-variant pricing per size. Updated `src/data/legacyIdMap.json` so secondary product IDs redirect to the primary product.
  - Review CSV: exported 16 low-confidence / ambiguous items to `/audit/review.csv`.
- **Counts:**
  - Products: 1,053 -> 1,043 (10 size duplicates merged into parent variants)
  - Variants: 1,231 (100% preserved)
  - Brands: 62 -> 107
  - Products with brand 'Other': 0 (100% eliminated)
  - Products without sub-category: 0 (100% assigned)
  - Sub-categories: 64
  - Next.js build: 36/36 routes compiled successfully.
- **Unresolved:** None.

## Phase 3 - UI Fixes & Mobile Responsiveness
- **Status:** COMPLETED & VERIFIED
- **Changes:**
  - Categories Page Overflow: adjusted left category rail to ~72px (`w-[72px] sm:w-56`), reduced paddings (`p-1.5 sm:p-4`), eliminated clipping `overflow-hidden`, enforced `min-w-0` on cards and grid columns.
  - ProductCard Mobile Layout: stacked price above ADD button on narrow screens (`<380px`) to prevent right edge cut-off; kept horizontal row on wider cards.
  - Detail Navigation: verified `ProductCard` image and title link directly to `/product/:id` from home, search, and category explorers without interfering with ADD button or size chip.
  - Product Detail Page: added "More from this brand" section querying verified brand siblings; validated variant selector with live price calculation, MRP, discount badges, and sticky cart action bar.
  - Category Explorer: dynamic sub-category chip row and real brand chips updating item counts live.
- **Verification:**
  - Viewports: tested at 360px, 390px, 430px viewports (zero horizontal overflow or cut-off).
  - User Journey: end-to-end flow verified (home > category > sub-category > product > add to cart, and search > product).
  - Next.js build: 36/36 routes compiled successfully.
- **Unresolved:** None.

## Phase 4 - Photo Pipeline Tools
- **Status:** COMPLETED & VERIFIED
- **Changes:**
  - Added barcode, image_status ('verified' | 'missing'), image_source, and image_license fields across catalog schema and Product types.
  - Open Food Facts Tool: built `scripts/photo_pipeline/fetch_open_food_facts.py` with high-confidence fuzzy matching (>=0.82) and barcode matching, downloading, and license attribution.
  - Bulk Importer: built `scripts/photo_pipeline/bulk_import_photos.py` with 800x800 WebP transparent centering and background removal for phone photos.
  - Owner Photo Queue: created mobile-friendly owner dashboard page at `/admin/photo-queue` with live progress counter, priority sorting (Top 3 items per subcategory first), camera capture button, and API endpoint at `/api/admin/products/upload-photo`.
  - Images Needed: exported `/audit/images-needed.csv` with all missing catalog products categorized into Priority 1 (171 items) and Priority 2 (861 items).
  - Test Verification: verified photo pipeline end to end on 3 sample phone photos (`g1-p0001`, `g1-p0002`, `g1-p0003`); generated 800x800 WebP cutouts, verified dimensions and transparency, and catalog status updated to 'verified'.
- **Verification:**
  - Tested 3 photos end-to-end with verified 800x800 WebP outputs.
## Phase 5 - Category Tile Collages & Clean Icon Fallback
- **Status:** COMPLETED & VERIFIED
- **Changes:**
  - Built Category Collage Generator: `scripts/photo_pipeline/generate_category_collages.py` to composite the 3 best verified cut-out images onto a soft tinted rounded square (Blinkit / Flipkart Minutes style, with subtle drop-shadows and angled offset), exported as high-fidelity WebP files (`/public/categories/collages/<category_id>.webp`).
  - Clean Icon Fallbacks: For any category with fewer than 3 verified cut-outs, the generator automatically renders a modern, minimalist SVG icon tile on a soft tinted rounded square with ambient lighting, completely replacing all old single boxed product packshots and generic stock photos.
  - Automatic Regeneration: Integrated automatic category collage regeneration into the photo upload route (`/api/admin/products/upload-photo`) and the bulk importer (`scripts/photo_pipeline/bulk_import_photos.py`) so collages update dynamically whenever new store photos are captured and verified.
  - Category Mapping: Generated `src/data/categoryTiles.json` and updated `src/data/demo-seed.ts` (`SUPERMARKET_CATEGORIES` and `DEMO_CATEGORIES`) so all 24 categories dynamically source their `tile_image_url` and `image` from `/categories/collages/`.
- **Verification:**
  - Collage rendering: `biscuits-bakery.webp` composited from 3 verified product cut-outs (`Unibic Wafer`, `Unibic Choco Ripple`, and `Good DAY`).
  - Icon fallbacks: 23 categories cleanly rendered as soft-tinted SVG icon tiles (`.svg`).
  - Single boxed photos: 0 (completely eliminated; all old packshot and generic jpg refs removed).
  - Next.js build: 38/38 routes compiled successfully.
- **Unresolved:** None.
