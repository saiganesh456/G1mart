# G1 Mart — Home Page & Categories Audit Report
**Audited by:** Antigravity Senior Product Engineer  
**Date:** 7 October 2026  
**Document Target:** Stage A Delivery (`docs/HOME-AUDIT.md`)

---

## 1. Executive Summary
An exhaustive audit of the G1 Mart storefront home page (`src/app/(storefront)/page.tsx`), header (`src/components/layout/Header.tsx`), category components (`src/components/storefront/CategoryGrid.tsx`), catalog data (`src/data/products-catalog.json`, `src/data/demo-seed.ts`), and configuration (`src/config/store.ts`) was conducted against `docs/SPEC.md` and the Stage A engineering requirements.

---

## 2. Inventory of Defects Identified

### Defect 1: Categories with Zero Products (Ghost Categories)
- **Files:** `src/data/demo-seed.ts`, `src/app/(storefront)/page.tsx`, `src/components/layout/Header.tsx`
- **Issue:** The home page displayed 8 hardcoded categories (`fruits-vegetables`, `dairy-bakery`, `rice-dal-atta`, `snacks`, `beverages`, `personal-care`, `household`, `baby-care`). However, in `src/data/products-catalog.json`, all 96 verified canonical products had `"category": null` or `"other"`.
- **Impact:** Clicking into `Fruits & Vegetables` or `Dairy & Bakery` showed an empty screen ("No products found"). Category carousels on the home page (`stapleProducts`, `snackProducts`, `beverageProducts`) evaluated to empty arrays (`[]`) and failed to render.

### Defect 2: Category Grid Layout Violates Mobile UX Standard
- **File:** `src/components/storefront/CategoryGrid.tsx`
- **Issue:** Rendered a static multi-row CSS grid (`grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8`) with square box tiles instead of a compact, mobile-first horizontal scrolling row of circular items.
- **Impact:** Took up excessive vertical screen space on mobile phones, had no touch swipe with scroll-snap, had no partially visible trailing peek item to hint horizontal scrolling, and lacked desktop scroll arrow buttons.

### Defect 3: External Placeholder Domain Fallback
- **File:** `src/components/storefront/CategoryGrid.tsx` (line 42)
- **Issue:** Category image error fallback used `https://placehold.co/200x200/...`, violating offline-safety, latency on slow mobile networks, and third-party domain privacy constraints.

### Defect 4: Hardcoded Delivery Speed & ETA Text
- **Files:** `src/components/layout/Header.tsx` (lines 26, 102, 163), `src/components/layout/Footer.tsx`, `src/app/(storefront)/cart/page.tsx`
- **Issue:** Header hardcoded `"Delivery in 30-60 mins"` and footer displayed `"TODO_CITY_ETA across the city"`.
- **Impact:** Violates SPEC §4.2 ("No 10-minute/speed promises") and Stage A Rule 5 ("Delivery text comes from src/config/store.ts. No speed promises, no fake offers").

### Defect 5: Absence of Dedicated Categories Page (`/categories`)
- **Files:** `src/components/layout/BottomNav.tsx` (line 10), `src/app/(storefront)/category/[slug]/page.tsx`
- **Issue:** The bottom navigation bar had a "Categories" tab hardcoded to redirect to `/category/rice-dal-atta` because no `/categories` overview page existed.
- **Impact:** Customers had no way to browse supermarket category groups (e.g., Grocery & Staples, Household & Cleaning, Personal Care, Pooja Essentials, Snacks & Beverages) and their sub-categories in a structured hub.

### Defect 6: Missing Sub-category Chips Filter on Product Listings
- **File:** `src/app/(storefront)/category/[slug]/page.tsx`, `src/app/(storefront)/category/[slug]/CategoryDashboardClient.tsx`
- **Issue:** Category listing pages did not provide interactive sub-category filter chips at the top to let customers quickly filter items (e.g., within Household: Laundry Care vs. Dishwashing vs. Floor Cleaners).

### Defect 7: Unassigned Product Metadata in Catalog
- **File:** `src/data/products-catalog.json`
- **Issue:** All 96 canonical products verified from invoices lacked explicit `category` and `subCategory` fields matching supermarket groupings.
- **Impact:** Prevented real supermarket grouping and broke search and category filters.

### Defect 8: Desktop Header Category Strip Hardcoded Ghost Categories
- **File:** `src/components/layout/Header.tsx` (lines 237–254)
- **Issue:** Navigation strip hardcoded links to `fruits-vegetables` and `dairy-bakery` (which have 0 products).

---

## 3. Remediation Plan (Stage A)
1. **Assign Real Supermarket Categories to All 96 Products**:
   - `grocery-staples` (Cooking Staples, Pickles & Chutneys)
   - `snacks-beverages` (Tea & Chai, Dry Fruits & Dates)
   - `household-cleaning` (Laundry Care, Dishwashing, Floor & Surface Cleaners)
   - `personal-care` (Bath Soaps, Talcum Powder, Baby Care, Pest & Cleaning Aids)
   - `pooja-essentials` (Agarbatti & Incense Sticks, Dhoop & Sambrani)
   - Filter out any category with 0 items so only populated supermarket categories are shown.
2. **Circular Horizontal Category Bar on Home Page**:
   - Implement single horizontal row of circular items (clean circular icon/image badge with label below).
   - Touch swipe with CSS `scroll-snap-type: x mandatory`, hidden scrollbar, trailing item peek (~20% visible), and desktop arrow navigation buttons.
3. **Dedicated Categories Page (`/categories`)**:
   - Group headings (e.g. Household & Cleaning, Personal Care, Pooja Essentials, Grocery & Staples, Snacks & Beverages).
   - Grid of sub-category tiles with product counts.
   - Point BottomNav "Categories" tab to `/categories`.
4. **Sub-category Chips on Category & Browse Pages**:
   - Horizontal pill chips at the top of category pages allowing instant filtering by sub-category.
5. **Enforce `src/config/store.ts` for All Delivery Text**:
   - Derive delivery windows and store information directly from `STORE_CONFIG`. No speed promises, no fake discounts or offers.
