# G1 Mart UI/UX Audit & Findings (F1 - F11)

Audit conducted by Principal Product Designer & Senior Front-End Engineer.
Scope: Customer storefront mobile web application (Vercel + Next.js 15 + Supabase).

---

## Findings Matrix

### F1: Persistent Delivery Bar across all screens
- **Observed Behavior**: The delivery ETA bar (`"Delivery in ~61 min · Venkatachalam, Nellore"`) was rendered across Home, `/categories`, `/category/[slug]`, `/account`, and `/orders`.
- **File Path**: `src/components/layout/Header.tsx` (lines 148–176)
- **Root Cause**: The mobile location pill had condition `isHomePage ? 'bg-white' : 'bg-emerald-50/50'`, meaning it was unconditionally rendered on all routes, only changing background color instead of being scoped strictly to Home.
- **Resolution**: Mobile header with location pill is rendered solely on `pathname === '/'`. On inner routes, it is completely removed. Desktop header location pill is also restricted strictly to `pathname === '/'`.

---

### F2: Account page wider than 100vw (horizontal scroll / overflow)
- **Observed Behavior**: Container overflowed by ~20–25% on mobile (360px–412px viewports). Welcome card and "Sign In" button clipped, APK card clipped, list row chevrons off-screen, footer centered at ~61% width instead of 50%. Grey page background contrasted awkwardly with white background of other pages.
- **File Path**: `src/app/(storefront)/account/page.tsx` (lines 50, 101–173) & `src/app/(storefront)/layout.tsx`
- **Root Cause**: Cards had nested negative margins / fixed desktop padding (`px-3 sm:px-0` with unconstrained flex children) and an unconstrained horizontal flex card (`App Installation Card`) whose action buttons and badges didn't wrap, pushing container width beyond `innerWidth`. In addition, background was inconsistent with the rest of the app.
- **Resolution**: Refactored `AccountPage` to use design system tokens (`var(--g1-bg)`, `var(--g1-surface)`, `var(--g1-border)`), `w-full max-w-2xl mx-auto`, removed rigid horizontal flex containers, stacked buttons for signed-out card, standard 56px menu rows with chevrons within gutters, and consistent `#FFFFFF` background.

---

### F3: Misleading & competitor copy on Account page
- **Observed Behavior**: "Blinkit Speed" badge (competitor brand), "Fast 10-minute grocery delivery" (contradicts real 61-minute delivery ETA), fake "★ 4.8 Rating", and APK installation placard dominating above essential account navigation. Dev footer read "G1 Mart Customer Application".
- **File Path**: `src/app/(storefront)/account/page.tsx` (lines 122–131, 138, 267)
- **Root Cause**: Copy-pasted template code mimicking competitor apps rather than reflecting G1 Mart's Nellore store reality.
- **Resolution**: Removed all competitor brand names ("Blinkit Speed"), eliminated fake 4.8 rating and false 10-minute promises. App download moved to a clean, secondary-styled row near the bottom. Footer rewritten to: `"G1 Mart · Delivering in Nellore"`.

---

### F4: Bottom Nav active-state dot overlapping text
- **Observed Behavior**: An absolute green dot indicator was positioned at `bottom-1`, directly on top of the 10px tab label text on all screens.
- **File Path**: `src/components/layout/BottomNav.tsx` (lines 122–124)
- **Root Cause**: `<span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2E7D32]" />` sat inside the same centered flex column as the label without vertical clearance.
- **Resolution**: Replaced the overlapping bottom dot with a sleek 24x3px active bar indicator pinned to the top edge of the active tab (`.g1-nav-bar`), increased tab bar height to 64px + `env(safe-area-inset-bottom)`, and styled active icon & label in `var(--g1-primary)`.

---

### F5: Header cart button layout shift & redundancy
- **Observed Behavior**: Header cart button jumped in width from "Cart" (empty) to "14 · ₹655" (with items), causing layout shift. Profile button was a grey square duplicating the Account tab. On Home, header cart duplicated the sticky floating bottom cart bar.
- **File Path**: `src/components/layout/Header.tsx` (lines 107–123)
- **Root Cause**: Conditional inline text rendering without min-width constraint; redundant cart triggers across both header and sticky bottom bar.
- **Resolution**: Removed the mobile header cart button completely as mandated. Cart access is cleanly provided via the sticky bottom cart bar (56px, e2 shadow, 12px above bottom nav) and desktop nav. Replaced grey square profile button with a 40px circle with Lucide `UserRound`.

---

### F6: Static home search placeholder with quotation marks
- **Observed Behavior**: Placeholder was static: `'Search "sugar", "oil", "soap"'`. Height was only ~44px.
- **File Path**: `src/components/storefront/StickyHomeSearchBar.tsx` & `src/components/layout/Header.tsx`
- **Root Cause**: Hardcoded input placeholder attribute; fixed 44px container.
- **Resolution**: Search bar elevated to 52px height, 14px border radius, 1px border. Created animated rotating placeholder (`Search for soap`, `atta`, `oil`, `milk`, `biscuits`, `rice`, `tea`) cycling smoothly every 2.4s (250ms slide-up fade). Removed all quotation marks. Automatically pauses on focus/input, and respects `prefers-reduced-motion`.

---

### F7: Banner dark green overlay & poor contrast
- **Observed Behavior**: Aggressive dark green gradient overlay (`from-[#1b5e20]/90 via-[#2e7d32]/80`) placed across vegetable photos, template appearance, unreadable text, tiny dots.
- **File Path**: `src/components/storefront/BannerCarousel.tsx` (lines 81–118)
- **Root Cause**: Full-bleed dark gradient overlay covering photo and text alike.
- **Resolution**: Standardized banner height to 160px (mobile) with 20px radius. Removed dark photo overlay entirely. Replaced with a crisp light text panel (`linear-gradient(90deg, rgba(255,255,255,0.92) 60%, rgba(255,255,255,0) 100%)`) providing >= 4.5:1 WCAG AA text contrast. Added active 16px pill indicator with 6px inactive dots. Auto-advance pauses on touch.

---

### F8: Inconsistent category tile backgrounds & conflicting subtitles
- **Observed Behavior**: Grocery tiles were beige (`#FAF7EE`), Snacks tiles mint (`#E8F4F3`), Household blue (`#EEF5FB`), etc. Weak shadows. Labels were 14px and wrapped irregularly. Subtitle `"Explore 24 departments with instant delivery"` contradicted the 61-min ETA.
- **File Path**: `src/components/storefront/BlinkitHomeSections.tsx` (lines 17–23) & `src/app/(storefront)/categories/page.tsx`
- **Root Cause**: Hardcoded `SECTION_TINTS` dictionary applying different pastels per category group.
- **Resolution**: Unified all category tiles across all sections to use the identical design token `var(--g1-surface)` (`#F6F7F8`) with 1px border (`var(--g1-border)`) and e1 elevation shadow. Category labels set to 12px weight 500, max 2 lines. Removed the contradictory subtitle on `/categories`.

---

### F9: Category Detail layout conflict (rail vs chips)
- **Observed Behavior**: Left rail (~22% width) and top chips competed for navigation; "Cleaners" subcategory erroneously appeared inside "Atta, Rice & Dal"; header + delivery bar + chips pushed the first product 25% down the viewport.
- **File Path**: `src/components/categories/BlinkitCategoryExplorer.tsx` & `src/app/(storefront)/category/[slug]/CategoryDashboardClient.tsx`
- **Root Cause**: Confused layout hierarchy mixing brands into the left rail and subcategories into top chips, plus data mismatch where cleaning supplies shared the atta category id.
- **Resolution**: Established strict hierarchy: Left rail fixed to 76px containing sub-categories (48px circular image + 11px label). Top chip row reserved strictly for Brands (All, branded items, Local). Removed delivery bar from Category detail. Logged data anomalies in `DATA_ISSUES.md`.

---

### F10: Product card display issues
- **Observed Behavior**: Repetitive fake "10% OFF" badges; bare unit labels ("g", "1 unit") when pouches showed 1 KG; mismatched images (e.g. "Javva Wheat Ravva" showing "BANSI RAVA" pouch; "Rajma Seds" typo); grey background rectangles behind cutouts; heavy outlined ADD; "LOCAL / UNBRANDED" label stamped on cards.
- **File Path**: `src/components/storefront/ProductCard.tsx`
- **Root Cause**: Hardcoded fallback values, missing null-checks, raw database brand strings rendered uncritically.
- **Resolution**: Suppressed "LOCAL / UNBRANDED" label entirely (brand rendered only for genuine brands, 12px secondary). Unit chip rendered only when valid quantity and unit coexist; bare "g" and "1 unit" hidden and logged. Discount badge rendered only when `mrp > price` in yellow accent token (`var(--g1-yellow)`). ADD button refined to 32px height, 1.5px green outline, radius 8, morphing cleanly into stepper upon tap.

---

### F11: Orders page broken formatting & empty space
- **Observed Behavior**: Subtitle "Guest & Local Orders"; ID displayed as raw `#SLIP-312841`; unreadable grey placeholder icons; status dot overlapping the first letter of "Order Placed"; address and phone running together on one line; ~60% empty space without status tracking timeline.
- **File Path**: `src/app/(storefront)/orders/page.tsx`
- **Root Cause**: Missing layout container formatting, raw string concatenation of internal database IDs, missing stepper timeline.
- **Resolution**: Title updated to "My orders" (removed "Guest & Local Orders"). Stripped "SLIP-" prefix to display clean numeric `Order #312841`. Fixed status chip dot with 6px right margin (never overlapping text). Added 48px product thumbnails with neutral Lucide `Package` fallback icon and `+N` badge. Address formatted on single line with ellipsis (phone reserved for order detail). Added interactive 4-step progress timeline: Placed > Packed > Out for delivery > Delivered.
