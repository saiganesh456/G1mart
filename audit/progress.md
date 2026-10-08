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

