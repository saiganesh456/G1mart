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



