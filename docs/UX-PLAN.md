# G1 Mart — UX Plan & Mobile Architecture (Stage A / Step 1)
**Author:** Senior Product Engineer & UX Lead  
**Date:** 7 October 2026  
**Audience & Target:** Families doing monthly grocery shopping with large baskets (₹3,000–₹4,000, 40–100 items).  
**Device Target:** Mobile first (360px, 390px, 412px viewports), mid-range Android, slow 3G/4G network, offline resilience.  
**Strict Directives:**  
- Keep official G1 Mart deep green (`#2E7D32` / `#1b5e20`) theme & brand identity exactly.
- Use reference screenshots (`ref-blinkit`, `ref-flipkart-1`, `ref-flipkart-2`, `ref-current`) purely as layout inspiration. Zero copying of external logos, delivery claims (no 10/25 min), ads, or colors.
- Only supermarket goods from verified database; zero ghost categories with 0 items; zero fake discounts or fabricated offers.

---

## 1. Audit of Current UI (360px, 390px, 412px Viewports)

| Area / Component | Current Implementation | Defect & Mobile UX Failure | Impact on Big Basket Shopper (₹3k–₹4k) |
| :--- | :--- | :--- | :--- |
| **Icon Font Bug** | Home page & category listings rely on raw Unicode emoji characters (`🧼`, `✨`, `🪔`, `🌾`, `🍪`) alongside mixed Lucide icons. | On budget Android devices (Android 9–12), emojis render with inconsistent OS glyph fallbacks, broken font tofu (`[]`), and misalignment. | Unprofessional, breaks visual hierarchy and department recognition. |
| **Banner Height** | `BannerCarousel.tsx` occupies `h-44 sm:h-64 md:h-72` (~180px–220px) with 3 rotating slide cards with stock photos. | On a 360x640 or 390x844 screen, the header + address + search + banner pushes product listings completely below the fold. Users must scroll 400px before seeing a single grocery item. | Heavy friction for repeat monthly grocery buyers who want to immediately buy staples. |
| **Product Card Size** | Cards have variable paddings, redundant full-width review flags, unconstrained card heights, and generic ADD buttons. | In a 2-column mobile grid at 360px, cards stretch to ~260px high each, showing only 2–3 products per screen viewport. | Scrolling through 50–100 items requires endless scrolling. Needs compact, standardized 1:1 square packshot box with 2-line title and compact stepper. |
| **Flat Categories** | Currently, categories are flat in `src/data/demo-seed.ts` without explicit parent-child relational hierarchy (`parent_id`). Subcategories exist as a plain string array. | No clear supermarket taxonomy (e.g. `Groceries & Staples` $\rightarrow$ `Atta & Flours`, `Dals & Pulses`, `Edible Oils`). Users cannot navigate with a fixed left category rail. | Monthly grocery buyers cannot systematically browse department by department. |
| **Bottom Navigation** | Has 4 tabs: `Home`, `Categories`, `Orders`, `Account`. Touch targets are ~44px, and missing safe-area padding for Android gesture bars. | Violates 48px touch minimum; missing direct access to "Order Again" and customer support "Chat/Help"; "Orders" redirects to generic order list without 1-tap re-order. | Re-ordering a monthly ₹3,500 basket requires manually re-searching 50 products. |
| **Placeholder Data & Hardcoded Text** | Delivery text in several locations had hardcoded `"Delivery in 30-60 mins"` or `"Delivery in approx 2 hours"`. Categories include `other` or `Packaged Groceries`. | Violates SPEC Section 4.2 ("No speed promises, delivery text from store.ts"). Ghost categories or generic labels confuse customers. | Erodes trust when actual store fulfillment timeline differs. |

---

## 2. ASCII Wireframes

### A. Home Page (Mobile: 360px – 412px)
```text
+------------------------------------------+
| [G1 Mart Logo]         [Help/Chat] [User]| <-- Fixed Header (Sticky)
| [DELIVERY TO: MDR032, Venkatachalam] [v] |
| +--------------------------------------+ |
| | [Q] Search groceries, atta, oil...[] | | <-- Search + [Scan] Icon
| +--------------------------------------+ |
| [All] [Staples] [Cleaning] [Snacks] [Pooja] <-- Sticky Top-Level Chip Strip
+==========================================+ <== (Scroll Boundary Starts Here)
| [ Banner: G1 Mart In-Store Savings ~100px] | <-- Compact Banner (max 110px)
+------------------------------------------+
| [ Quick Action: [Order Again] [Upload List]| <-- 1-Tap Repeat Ordering
+------------------------------------------+
| POPULAR MONTHLY ESSENTIALS               |
| +------------------+ +------------------+ |
| | [600x600 Img]    | | [600x600 Img]    | |
| | Mysore Sandal    | | Freedom Sun Oil  | |
| | 125g  | Rs.63    | | 1L     | Rs.145  | |
| | [  ADD +  ]      | | [ -  2  + ]      | |
| +------------------+ +------------------+ |
+------------------------------------------+
| BROWSE BY DEPARTMENT (Blinkit 4-Col Grid)|
| [Atta/Dal] [Edible Oil] [Spices] [Rice]   |
| [Cleaning] [Soaps]      [Snacks] [Pooja]  |
+------------------------------------------+
| ... Content scrolls under fixed header ... |
+==========================================+
| [VIEW CART: 42 items | Rs.3,420 -> ]     | <-- Floating Pill (z-50)
+------------------------------------------+
| [Home] [Categories] [Order Again] [Chat] [Account] <-- 48px Bottom Nav
+------------------------------------------+
```

### B. Categories Page (`/categories`) & Department Listing
```text
+------------------------------------------+
| [<- Back]  All Departments         [Cart]|
+==========================================+
| GROCERY & STAPLES                        |
| +----------+ +----------+ +----------+   |
| | [Icon]   | | [Icon]   | | [Icon]   |   |
| | Atta &   | | Rice &   | | Dals &   |   |
| | Flours   | | Grains   | | Pulses   |   |
| +----------+ +----------+ +----------+   |
|                                          |
| HOUSEHOLD & CLEANING                     |
| +----------+ +----------+ +----------+   |
| | [Icon]   | | [Icon]   | | [Icon]   |   |
| | Laundry  | | Dishwash | | Surface  |   |
| +----------+ +----------+ +----------+   |
+------------------------------------------+
| [Home] [Categories*] [Order Again] [Chat] [Account]
+------------------------------------------+
```

### C. Product Listing Page (Blinkit/Flipkart Left Rail)
```text
+------------------------------------------+
| [<-] Grocery & Staples       [Q]  [Cart] | <-- Fixed Sticky Top Header
+==========================================+
| FIXED LEFT RAIL     | SCROLLING PRODUCT GRID
| (Own scroll area)   | (2-column compact cards)
|---------------------+--------------------|
| [*] All Staples (48)| +--------+ +-------+
| [ ] Atta & Flours(12)| |[Image] | |[Image]|
| [ ] Dals & Pulses(16)| |Aashirv.| |Toor D.|
| [ ] Edible Oils  (8)| |1kg     | |1kg    |
| [ ] Salt & Sugar (6)| |Rs.65   | |Rs.140 |
| [ ] Spices & Masala | |[ADD +] | |[- 1 +]|
| [ ] Rice & Grains   | +--------+ +-------+
|                     | +--------+ +-------+
|                     | |[Image] | |[Image]|
|                     | |Freedom | |Tata S.|
|                     | |1L      | |1kg    |
|                     | |Rs.145  | |Rs.28  |
|                     | |[ADD +] | |[ADD +]|
+---------------------+--------------------+
| [VIEW CART: 18 items | Rs.1,890 -> ]     |
+------------------------------------------+
| [Home] [Categories*] [Order Again] [Chat] [Account]
+------------------------------------------+
```

### D. Search Results Page (`/search`)
```text
+------------------------------------------+
| [<-] [Q sugar / chini / panchadara    [X]| <-- Debounced typo-tolerant
+------------------------------------------+
| Recent: [kandipappu] [sunflower oil] [surf]|
|------------------------------------------|
| 4 results found for "sugar"              |
| +--------------------+ +----------------+ |
| | [Packshot]         | | [Packshot]     | |
| | Parry's White Sugar| | Organic Jaggery| |
| | 1kg | Rs.48        | | 1kg | Rs.70    | |
| | [   ADD +   ]      | | [   ADD +   ]  | |
| +--------------------+ +----------------+ |
+------------------------------------------+
| [VIEW CART: 5 items | Rs.410 -> ]        |
+------------------------------------------+
```

### E. Cart Page for Big Baskets (₹3k–₹4k / 40–100 items)
```text
+------------------------------------------+
| [<-] Shopping Cart (46 Items)            |
+==========================================+
| [ Save as Monthly List ] [ Clear Cart ]  |
+------------------------------------------+
| GROUP: GROCERY & STAPLES (18 items)      |
| [Img] Aashirvaad Shudh Chakki Atta 5kg   |
|       Rs.240   Qty: [-] [ 2 ] [+] [x]    |
|       (Tap quantity to type exact number)|
| [Img] Toor Dal Premium 1kg               |
|       Rs.165   Qty: [-] [ 4 ] [+] [x]    |
|------------------------------------------|
| GROUP: HOUSEHOLD & CLEANING (14 items)   |
| [Img] Surf Excel Quick Wash 1kg          |
|       Rs.145   Qty: [-] [ 1 ] [+] [x]    |
|------------------------------------------|
| BILL SUMMARY                             |
| Items Total (46 items):       Rs.3,640   |
| Delivery Partner Fee:             FREE   |
| Store Packing:                    FREE   |
| To Pay:                       Rs.3,640   |
+------------------------------------------+
| [ PROCEED TO CHECKOUT  |  Rs.3,640 -> ]  | <-- Fixed Action Footer
+------------------------------------------+
```

---

## 3. Data Changes & Minimal Schema Proposal

### A. Minimal Categories Schema (`parent_id`)
To enable the two-level hierarchy (Department $\rightarrow$ Sub-category) without breaking existing product records:
```sql
-- 1. Categories table with parent_id hierarchy
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES categories(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Index for instant hierarchical category lookup
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
```

### B. Search Synonyms Table (`search_synonyms`)
To support Telugu transliterated and colloquial search terms without hardcoding them into product titles:
```sql
CREATE TABLE IF NOT EXISTS search_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,          -- e.g. "kandipappu"
  synonyms TEXT[] NOT NULL,           -- e.g. ARRAY['toor dal', 'red gram', 'arhar dal']
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_synonyms_term ON search_synonyms(term);
```
*Seed examples:*
- `kandipappu` $\rightarrow$ `['toor dal', 'arhar dal']`
- `minapappu` $\rightarrow$ `['urad dal', 'black gram']`
- `nune` / `oil` $\rightarrow$ `['sunflower oil', 'cooking oil', 'freedom']`
- `panchadara` / `cheeni` $\rightarrow$ `['sugar', 'madhur']`
- `sabbu` $\rightarrow$ `['soap', 'mysore sandal', 'cinthol']`

### C. Minimal Customer Identity for "Order Again" & "Monthly Essentials"
- **Phone-Based Identity (OTP / Quick Verified Phone)**:
  - No bloated social OAuth or complex passwords.
  - User enters their 10-digit Indian mobile number.
  - Associated records:
    - `customer_lists`: `(id, phone, name, list_type ['monthly_essentials' | 'saved_template'], items_json, updated_at)`
    - `orders`: queried by `customer_phone` for 1-tap "Order Again" with real-time stock/price validation.

---

## 4. List of Files to Change

1. **Configuration & Data Layers:**
   - [`src/types/index.ts`](file:///d:/web-agency-projects/G1mart/src/types/index.ts) — Add `parent_id` & `display_order` to `Category`, add `SearchSynonym` type, add `CustomerList` type.
   - [`src/data/demo-seed.ts`](file:///d:/web-agency-projects/G1mart/src/data/demo-seed.ts) — Update category hierarchy with `parent_id`, subcategories mapping, and ensure strict `itemCount > 0`.
   - [`src/data/searchSynonyms.ts`](file:///d:/web-agency-projects/G1mart/src/data/searchSynonyms.ts) *(New)* — Seed data for typo tolerance & Telugu/English synonyms.
   - [`src/services/productService.ts`](file:///d:/web-agency-projects/G1mart/src/services/productService.ts) — Add subcategory querying, synonym-expanded search filtering, and variant grouping helper.

2. **Navigation & Core Layouts:**
   - [`src/components/layout/Header.tsx`](file:///d:/web-agency-projects/G1mart/src/components/layout/Header.tsx) — Sticky header with store config ETA, scanner button, and sticky top-level chip strip that does not scroll away.
   - [`src/components/layout/BottomNav.tsx`](file:///d:/web-agency-projects/G1mart/src/components/layout/BottomNav.tsx) — 5 tabs (`Home`, `Categories`, `Order Again`, `Chat`, `Account`), 48px touch targets, active brand green, safe area padding.
   - [`src/components/storefront/BannerCarousel.tsx`](file:///d:/web-agency-projects/G1mart/src/components/storefront/BannerCarousel.tsx) — Restrict banner height to $\le 110\text{px}$ so top products are visible above the fold on 360–412px viewports.

3. **Storefront & Listing Pages:**
   - [`src/app/(storefront)/page.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/page.tsx) — Add "Order Again" & "Upload list" quick actions, Blinkit 4-col pastel department grid, and top monthly essentials.
   - [`src/app/(storefront)/categories/page.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/categories/page.tsx) — Clean department-wise directory with sub-category tiles.
   - [`src/app/(storefront)/category/[slug]/CategoryDashboardClient.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/category/[slug]/CategoryDashboardClient.tsx) — Fixed left rail with independent scrolling, right-side 2-col product grid, pack-size variant grouping.
   - [`src/components/storefront/ProductCard.tsx`](file:///d:/web-agency-projects/G1mart/src/components/storefront/ProductCard.tsx) — Standardized square image box, 2-line title limit, MRP strikethrough, stepper with quantity update.

4. **Search, Cart & Order Again:**
   - [`src/app/(storefront)/search/page.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/search/page.tsx) — Debounced instant search, synonym integration, brand/pack matching, recent search chips, empty state.
   - [`src/app/(storefront)/cart/page.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/cart/page.tsx) — Group items by department/category for big basket review, stepper + tap-to-type number input, "Save as Monthly Essentials", price change flags.
   - [`src/app/(storefront)/order-again/page.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/order-again/page.tsx) *(New)* — Past order review, Monthly Essentials list management, "Add all to cart" with availability & price change review modal.
   - [`src/app/(storefront)/help/page.tsx`](file:///d:/web-agency-projects/G1mart/src/app/(storefront)/help/page.tsx) — Dedicated Chat/Help screen displaying store contact phone & hours from `STORE_CONFIG`.

---

## 5. Verification Checklist for Step 2
- Responsive checks at 360px, 390px, 412px and Desktop.
- Header, chip strip, and left rail stay sticky while grids scroll.
- Cart with 100 items verified smooth (no jank) with accurate group subtotals.
- Search test queries: `sugar`, `oil`, `surf`, `kandipappu`, `minapappu`, `sope` (typo), and empty query.
- Zero empty categories rendered anywhere.
