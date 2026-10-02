# G1 Mart — Codebase Audit Report
**Against:** `docs/SPEC.md` v1.0 (1 October 2026)  
**Audited by:** Antigravity AI  
**Date:** 2 October 2026  
**Scope:** All files in `d:\web-agency-projects\G1mart` as of commit `0fda933`

> Only what was directly verified in source files is reported. Items marked **unverified** could not be confirmed from the files inspected.

---

## 1. Current Tech Stack

### Framework & Language
- **Framework:** React 19 (Vite SPA) — **NOT Next.js**
- **Language:** TypeScript 7
- **Routing:** Custom in-memory state machine in `AppContext.tsx` — screen names stored in `useState`, no URL-based routing (no React Router, no Next.js App Router)
- **Build tool:** Vite 8.3
- **Styling:** Tailwind CSS v4 — matches spec

### State Management
- Single React Context (`AppContext`) with `useState` — all state is ephemeral in-memory; nothing persisted to `localStorage` or `sessionStorage` (verified: no `localStorage` calls found in any file)
- On mount, attempts to hydrate from Supabase **only if** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured (`isSupabaseConfigured()` guard)

### Data Storage (current)
- **Products:** `INITIAL_PRODUCTS` array in `src/data/mockData.ts` — 43 hardcoded products, all with prices, ratings, stock counts, and discount percentages
- **Orders:** `INITIAL_ORDERS` array in `src/data/mockData.ts` — 2 pre-seeded fake orders
- **Addresses:** `INITIAL_ADDRESSES` in `src/data/mockData.ts` — 2 hardcoded Nellore addresses for "Sai Ganesh"
- **Coupons:** `INITIAL_COUPONS` in `src/data/mockData.ts` — 4 hardcoded coupons including `HYDERABAD100`
- **Notifications:** `INITIAL_NOTIFICATIONS` in `src/data/mockData.ts` — 3 hardcoded fake notifications
- **Supabase:** Client (`@supabase/supabase-js 2.117`) initialised but falls back to mock data unless env vars are set. No `.env` file present in repo (only `.env.example`).

### Package List (`package.json`)
| Package | Version | Role |
|---|---|---|
| `react` / `react-dom` | 19.0.1 | UI framework |
| `@supabase/supabase-js` | 2.117.2 | DB / Auth client |
| `@tailwindcss/vite` | 4.3.3 | Styling |
| `lucide-react` | 0.546.0 | Icons |
| `motion` | 12.23.24 | Animations |
| `@google/genai` | 2.4.0 | **Unused — no AI feature found in any component** |
| `vite` | 8.3.0 | Build / dev server |
| `typescript` | 7.0.2 | Type checking |
| `autoprefixer` | 10.4.21 | CSS post-processing |

### Supabase Schema (migrations present, not applied)
Three SQL migration files exist in `supabase/migrations/` and `supabase/seed.sql`. They define the DB schema and RLS policies but have **not been applied** — no Supabase project URL is configured.

---

## 2. Screen & Component Inventory

### Customer Screens (`src/components/customer/`)
| Screen name (state key) | File | What it does |
|---|---|---|
| `splash` | `SplashScreen.tsx` | Animated G1 Mart logo intro |
| `onboarding` | `OnboardingScreen.tsx` | Feature highlight slides |
| `login` | `LoginScreen.tsx` | Phone number entry for OTP login |
| `otp` | `OtpScreen.tsx` | OTP verification (accepts any 4+ digit code) |
| `home` | `HomeScreen.tsx` | Banner carousel, category grid, popular & best-deal product sections |
| `search` | `SearchScreen.tsx` | Product search with live filter |
| `category` | `CategoryScreen.tsx` | Products filtered by selected category |
| `product_details` | `ProductDetailsScreen.tsx` | Single product view with add-to-cart |
| `cart` | `CartScreen.tsx` | Cart items, saved-for-later, coupon input, subtotal |
| `address_list` | `AddressListScreen.tsx` | List of saved addresses, select/default/delete |
| `add_address` | `AddAddressScreen.tsx` | Form to add a new address |
| `checkout` | `CheckoutScreen.tsx` | Address confirm, delivery slot, payment method, order summary |
| `payment` | `PaymentScreen.tsx` | Payment method selection + fake "Pay Now" that places order immediately |
| `order_success` | `OrderSuccessScreen.tsx` | Confirmation page after order placed |
| `my_orders` | `MyOrdersScreen.tsx` | Order history list |
| `order_tracking` | `OrderTrackingScreen.tsx` | Order status timeline + delivery boy details |
| `wishlist` | `WishlistScreen.tsx` | Wishlisted products |
| `profile` | `ProfileScreen.tsx` | User profile, wallet balance, logout |
| `notifications` | `NotificationsScreen.tsx` | In-app notification list |
| `help_support` | `HelpSupportScreen.tsx` | FAQ accordion + contact info |

### Admin Screens (`src/components/admin/`)
| Screen | File | What it does |
|---|---|---|
| `admin_dashboard` | `AdminDashboard.tsx` | Orders tab, inventory tab, add-product form, delivery zones tab |

### Delivery / Rider Screens (`src/components/delivery/`)
| Screen | File | What it does |
|---|---|---|
| `delivery_dashboard` | `DeliveryDashboard.tsx` | Rider order list; mark Packed / Out for Delivery / Delivered |

### Common / Shared Components (`src/components/common/`)
| Component | File | What it does |
|---|---|---|
| `Header` | `Header.tsx` | Desktop nav bar + mobile header; includes role-switcher pill, notification bell, cart button, location modal |
| `BottomNav` | `BottomNav.tsx` | Mobile bottom navigation tabs |
| `MobileFrame` | `MobileFrame.tsx` | Root layout wrapper; renders `DesktopFooter` |
| `DesktopSidebar` | `DesktopSidebar.tsx` | Category sidebar shown on desktop browse screens |
| `DesktopFooter` | `DesktopFooter.tsx` | Site-wide desktop footer |
| `ProductCard` | `ProductCard.tsx` | Reusable product card with add-to-cart / quantity stepper |
| `G1Logo` | `G1Logo.tsx` | SVG/image logo component |

### Services (`src/services/`)
| Service | File | What it does |
|---|---|---|
| `authService` | `authService.ts` | Supabase Auth — OTP sign-in, session, profile, Google OAuth stubs |
| `productService` | `productService.ts` | Supabase CRUD for products table |
| `orderService` | `orderService.ts` | Supabase CRUD for orders / order_items |
| `addressService` | `addressService.ts` | Supabase CRUD for addresses |
| `deliveryZoneService` | `deliveryZoneService.ts` | In-memory zone config, fee calculation, zone resolution by pincode/area |

---

## 3. Spec Coverage (Sections 4, 6, 8, 10, 11, 12)

### Section 4 — Goals & Success Criteria

| Requirement | Status | Evidence |
|---|---|---|
| Browse, search, filter products on mobile and desktop | **Done** | `HomeScreen.tsx`, `SearchScreen.tsx`, `CategoryScreen.tsx` |
| Add/update/remove cart items, accurate subtotal | **Done** | `CartScreen.tsx`, `AppContext.tsx` lines 311–336 |
| Submit contact, address, delivery instructions | **Done** | `AddAddressScreen.tsx`, `CheckoutScreen.tsx` |
| Store can view orders and update status | **Done** | `AdminDashboard.tsx` orders tab with status `<select>` |
| Distinguish pending / paid / failed / cash payment states | **Partial** | `isPaid` boolean exists; payment status only has "paid"/"not paid" — no "failed", "pending", or "cash" distinction in the data model (`types/index.ts`) |
| Staff can maintain products, prices, availability, images | **Partial** | Price and availability editable in admin inventory tab; no image upload, no SKU/barcode field, no bulk import |
| System protects customer data / cross-order access | **Missing** | No real auth enforcement — `verifyOtp` accepts any 4+ digit string (`AppContext.tsx` line 286); admin accessible via role-switcher button with no password |
| Customer can place test order end-to-end on a phone | **Done** | Full flow exists (mock) |
| Admin can update product and see change on storefront | **Done** | `adminUpdateProduct` updates React state; reflected immediately |
| Customer cannot alter price sent to server | **Missing** | `placeOrder()` in `AppContext.tsx` line 517 copies `item.product.price` from **client-side state** — not re-validated server-side |
| Payment verified server-side before marked paid | **Missing** | `PaymentScreen.tsx` line 70–75: `setTimeout → placeOrder()` — no real payment gateway call |
| Store can process, fulfil, cancel, reconcile test orders | **Partial** | Cancel supported; reconciliation/refund UI absent |

### Section 6 — Feature Requirements

#### 6.1 Customer Storefront
| Requirement | Status | Evidence |
|---|---|---|
| Homepage: store identity, search, category shortcuts, selected products | **Done** | `HomeScreen.tsx` |
| Category listing + product cards with image, name, pack/weight, price, availability | **Done** | `CategoryScreen.tsx`, `ProductCard.tsx` |
| Search by product name | **Done** | `SearchScreen.tsx` |
| Filters (category, in-stock); sort | **Partial** | Category filter done; in-stock filter not visible; sort not implemented |
| Product details: pack size, description | **Done** | `ProductDetailsScreen.tsx` |
| Quantity controls and add-to-cart | **Done** | `ProductCard.tsx`, `ProductDetailsScreen.tsx` |
| Cart with editable quantities, remove, subtotal, delivery fee, total | **Done** | `CartScreen.tsx` |
| Checkout form: name, phone, address, landmark, delivery instructions | **Done** | `AddAddressScreen.tsx`, `CheckoutScreen.tsx` |
| Order confirmation with order number | **Done** | `OrderSuccessScreen.tsx` |
| Responsive layout, loading states, empty states, error messages | **Partial** | Layout done; loading states minimal; error messages limited |

#### 6.2 Admin Dashboard
| Requirement | Status | Evidence |
|---|---|---|
| Secure admin login; no public admin registration | **Missing** | Admin accessible via role-switcher button in Header — no authentication at all |
| Product list with search, category filter, status, pagination | **Partial** | Search done; category filter missing; pagination missing; no active/inactive status |
| Create/edit product: name, SKU, category, pack size, price, MRP, image, availability | **Partial** | Create form has name, brand, category, unit, price, MRP, description — no SKU/barcode, no image upload |
| Bulk import from CSV/XLSX | **Missing** | No import functionality |
| Order list with date, number, contact, total, payment state, order state | **Partial** | Present but payment state only shows method, not verified status |
| Order detail: items, quantities, address, payment reference, timeline | **Partial** | Items shown on tracking screen; admin view only shows summary |
| Status actions: New→Accepted→Preparing→Ready→Delivered; Cancelled | **Partial** | Status values differ — uses "Order Placed / Packed / Out for Delivery / Delivered / Cancelled" — "Accepted" and "Preparing" are absent |
| Basic audit: who changed status and when | **Missing** | No `order_status_events` tracking in UI or frontend logic |

### Section 8 — Data Model
| Table / Field | Status | Evidence |
|---|---|---|
| `categories` table | **Partial** | In `supabase/migrations/` SQL (unverified applied); frontend uses `INITIAL_CATEGORIES` mock array |
| `products` with `slug`, `sku/barcode`, `image_path`, `is_active` | **Partial** | Frontend `Product` type (`types/index.ts`) lacks `slug`, `sku`, `is_active`; has `inStock` / `stockCount` instead |
| `customers` table | **Partial** | In migrations; frontend uses `UserProfile` mock object hardcoded as "Sai Ganesh" |
| `addresses` with `customer_id` (nullable for guest) | **Partial** | `Address` type has no `customer_id` field (`types/index.ts` lines 62–75) |
| `orders` with `order_number`, `customer_id` (nullable), `address snapshot`, `payment_status` | **Partial** | `Order` type has `id` not `order_number`; `payment_status` field absent (only `isPaid: boolean`); missing `payment_method` enum alignment |
| `order_items` with `product_name_snapshot`, `sku_snapshot`, `unit_price_snapshot` | **Partial** | `OrderItem` type has `productName` and `price` (snapshot); no `sku_snapshot` |
| `payments` table (separate from orders) | **Missing** | No `payments` table in frontend types; no payment record created |
| `order_status_events` | **Missing** | Not present in frontend types or UI |
| Store snapshots of name/price in order_items | **Done** | `placeOrder()` copies `item.product.name` and `item.product.price` into order at placement time |

### Section 10 — Payment Design
| Requirement | Status | Evidence |
|---|---|---|
| Server validates product IDs, prices, availability before payment | **Missing** | `placeOrder()` in `AppContext.tsx` trusts client-side cart state entirely |
| Server creates order in pending-payment state | **Missing** | Order is created as "Order Placed" immediately — no pending state |
| Customer redirected to PhonePe hosted checkout | **Missing** | `PaymentScreen.tsx` calls `setTimeout → placeOrder()` with no API call |
| Server verifies transaction via PhonePe status API / webhook | **Missing** | No server-side code exists (Vite SPA — no server) |
| Handle pending states, verify with provider | **Missing** | No payment provider integration |
| Static UPI QR fallback clearly labelled | **Fake** | COD option mentions "scan UPI QR at doorstep" but no actual QR is shown |
| Order NOT marked paid based only on customer clicking "I paid" | **Violated** | Clicking "Pay Now" immediately calls `placeOrder()` and sets `isPaid: true` for non-COD methods |

### Section 11 — Order, Stock & Pricing Rules
| Requirement | Status | Evidence |
|---|---|---|
| Server calculates totals from trusted DB prices | **Missing** | All totals calculated in `AppContext.tsx` from client state |
| Recheck availability at checkout | **Missing** | No recheck — out-of-stock items can be checked out if in cart |
| Clear unavailable-item policy | **Missing** | No policy enforced |
| Delivery fee, minimum order, service area defined | **Done** | `deliveryZoneService.ts` defines fees and thresholds per zone |
| Cancellation/refund rules | **Missing** | `cancelOrder()` exists but no refund flow |

### Section 12 — Security, Privacy & Reliability
| Requirement | Status | Evidence |
|---|---|---|
| Enable Supabase RLS on client-exposed tables | **Partial** | `supabase/migrations/20261002000002_g1_mart_rls.sql` exists but not applied (no env config) |
| Customers access only own records | **Missing** | No auth enforcement; all data shared in single React context |
| Never expose service-role key in browser code | **Done** | Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.example`; comment in `supabase.ts` warns against service-role key |
| Validate inputs/quantities server-side | **Missing** | No server exists; frontend validates name/brand required but no quantity bounds |
| Do not trust client-supplied prices/totals | **Violated** | `placeOrder()` uses `cartGrandTotal` computed entirely on client |
| Restrict admin access; strong auth | **Missing** | Admin tab accessible via single button tap — no password, no role check |
| Collect only necessary customer data | **Partial** | Profile has `walletBalance`, `avatar` (Unsplash URL), `memberSince` not needed for MVP |
| Error logging, failed payment handling | **Missing** | `console.warn` used throughout; no structured logging or monitoring |

---

## 4. Conflicts with the Spec

The following items are **built into the code but explicitly excluded or contradicted by SPEC.md**:

| Item | Location | Spec Verdict |
|---|---|---|
| **Rider / Delivery Partner role and tab** | `DeliveryDashboard.tsx`, `types/index.ts` (`UserRole`), `Header.tsx` role-switcher, `App.tsx` | SPEC §4.2: "No rider app" in first release. Entire `DeliveryDashboard` is out of scope. |
| **Demo role-switcher** (Customer / Admin / Rider buttons) | `Header.tsx` lines 92–134 (desktop), lines 396–407 (mobile) | Not in spec; exposes admin without auth; dangerous in production |
| **"15-30 MINS" delivery claim** | `Header.tsx` line 382 (mobile header hardcoded), `HomeScreen.tsx` trust-bar line 186 | SPEC §4.2 explicitly says no "10-minute delivery or Blinkit/Zepto-level" promise. Actual zone 1 ETA is "30 mins – 1 hour". The "15-30 mins" label is false. |
| **"SUPER FAST" delivery tag on hero banner** | `HomeScreen.tsx` line 28 | Same as above — misleading delivery promise |
| **"Save up to 25% off" / "Up to 25% Off" banners** | `HomeScreen.tsx` lines 36, 299 | SPEC §4.2: Coupons/offers deferred. These are fake marketing claims not backed by real offer management |
| **"Direct Farm Fresh" / "Farm Fresh" product brand** | `mockData.ts` — 12 of 43 products use brand `'Farm Fresh'` | SPEC §2.4 & §3: No verified product image catalogue or confirmed farm-fresh claim. SPEC warns against inventing claims. |
| **"Easy Returns / Instant Replacement" claim** | `HomeScreen.tsx` lines 208–213 | SPEC §6.3: Returns deferred to "useful later features". FAQ in `mockData.ts` line 1157 promises "No-Questions-Asked instant return" — unverified policy. |
| **Hardcoded city — "Nellore"** throughout | `deliveryZoneService.ts`, `Header.tsx` ("Deliver to Nellore"), `AdminDashboard.tsx`, `DeliveryDashboard.tsx`, `AppContext.tsx` line 146 | SPEC §17: Store name, address, and service area are **open questions** not yet confirmed by the owner. |
| **Hardcoded Hyderabad reference** | `mockData.ts` line 1140 (`HYDERABAD_AREAS` alias), coupon code `HYDERABAD100` (line 977), `DeliveryDashboard.tsx` line 205 ("Jubilee Hills & Madhapur") | Wrong city — these are Hyderabad neighbourhoods. `HYDERABAD_AREAS` is aliased to `NELLORE_AREAS`. |
| **Hardcoded product prices and discounts** | All 43 products in `mockData.ts` | SPEC §3: "Historical net sales must not be copied into the website as current selling prices." Prices unverified with store. |
| **Notification bell (unread count)** | `Header.tsx` lines 244–257, `NotificationsScreen.tsx` | SPEC §6.3: Notifications deferred ("add WhatsApp/SMS later"). The bell exists and shows fake notification data. |
| **Fake offers/promotional notifications** | `mockData.ts` line 1003 ("Grab up to 25% off today") | Fake marketing notification with unverified claim |
| **G1 Mart Wallet with balance** | `PaymentScreen.tsx`, `types/index.ts` (`PaymentMethod`), `ProfileScreen.tsx` | SPEC §4.2: Wallet/loyalty not in MVP |
| **Fake delivery-boy details hardcoded** | `AppContext.tsx` lines 531–537 ("Suresh Kumar / AP 26 FA 9920"), `mockData.ts` line 1062 ("Raju Varma") | Hardcoded fictional person data presented as live |
| **Fake payout stats in DeliveryDashboard** | `DeliveryDashboard.tsx` lines 67–84 ("₹680.00", "8 Deliveries") | Entirely static fake operational data |
| **`@google/genai` dependency** | `package.json` | Not used anywhere in the codebase — imported but no AI feature exists |

---

## 5. Dead Code

| Item | File(s) | Reason Safe to Remove |
|---|---|---|
| `@google/genai` package | `package.json` | Imported as dependency but zero usage found in any `.tsx` / `.ts` file |
| `motion` package | `package.json` | Installed but no `import { ... } from 'motion'` found in any component |
| `HYDERABAD_AREAS` export | `mockData.ts` line 1139–1140 | Alias of `NELLORE_AREAS`; name is wrong; not imported anywhere |
| `NELLORE_POPULAR_HUBS` | `deliveryZoneService.ts` lines 109–116 | Defined but never imported or used in any component |
| `NELLORE_AREAS` in `mockData.ts` | `mockData.ts` lines 1122–1137 | Duplicate — identical list already in `deliveryZoneService.ts`; `mockData.ts` version not imported anywhere (only the service version is used in `Header.tsx`) |
| `FAQ_DATA` export | `mockData.ts` lines 1142–1163 | Defined in mockData but unverified whether `HelpSupportScreen.tsx` imports from here or defines its own inline |
| `g1_fresh_produce_showcase_1790614129023.jpg` | `public/assets/images/` | Not referenced in any component or CSS (the three banner images used are `_hero_`, `_offers_`, and `_dairy_bakery_`) |
| `g1_mart_logo_square_1790615979031.jpg` | `public/assets/images/` | Not referenced in any component |
| `g1_mart_official_logo_1790615965836.jpg` | `public/assets/images/` | Not referenced in any component |
| `g1_mart_logo_square_transparent.png` | `public/assets/images/` | Not referenced in any component |
| `logo.jpg` | `public/` | `logo.png` is used in `Header.tsx`; `logo.jpg` is a duplicate not referenced |
| `g1_mart_logo.png` | `public/` | Not referenced (separate from `logo.png`) |
| `src/assets/images/` directory | `src/assets/images/` | All 10 images inside are also present in `public/assets/images/`; the `src/assets/` copies are unused (Vite references from `public/` via absolute paths) |
| `DeliverySlot` value `'Express Delivery (15-30 mins)'` | `types/index.ts` line 80 | Used only in mock order seed (`INITIAL_ORDERS`); conflicts with actual zone ETA of 30–60 mins; misleading |
| `UserRole = 'delivery_partner'` | `types/index.ts` | Entire delivery role is out of scope per SPEC §4.2 |
| `DeliveryDashboard.tsx` | `src/components/delivery/` | Out of scope per SPEC §4.2 |
| `isMobileFrame` / `toggleMobileFrame` state | `AppContext.tsx` lines 132, 272–274 | `isMobileFrame` is set but `toggleMobileFrame` is never called in any component that was inspected; the MobileFrame component no longer uses phone-frame styling |

---

## 6. Security Issues

| Issue | Severity | Location | Detail |
|---|---|---|---|
| **Admin accessible with no auth** | 🔴 Critical | `Header.tsx` lines 98–134, 396–407 | Any user can tap the role-switcher to become admin. No password, session, or Supabase role check. |
| **OTP accepts any 4+ digit code** | 🔴 Critical | `AppContext.tsx` line 286 | `verifyOtp` returns `true` for `otp.length >= 4`. Anyone can log in as any phone number. |
| **Client-side price & total calculation** | 🔴 Critical | `AppContext.tsx` lines 311–336, 500–544 | Cart subtotal, delivery fee, taxes, and grand total are all computed in the browser. `placeOrder()` uses these client values with no server recheck — violates SPEC §11 and §12. |
| **`isPaid` set by client logic** | 🔴 Critical | `AppContext.tsx` line 523 | `isPaid: selectedPaymentMethod !== 'Cash on Delivery'` — payment status decided by UI selection, not server verification. |
| **Google login auto-logs in with hardcoded profile** | 🔴 High | `AppContext.tsx` lines 293–300 | `loginWithGoogle()` immediately sets `isLoggedIn = true` with hardcoded name/email regardless of actual OAuth result. |
| **Hardcoded personal data in source** | 🟠 Medium | `AppContext.tsx` lines 137–143 | Real name `'Sai Ganesh'`, real email `gummasaiganesh57@gmail.com`, and phone in source code committed to GitHub. |
| **Hardcoded rider personal data** | 🟠 Medium | `mockData.ts` line 1062, `AppContext.tsx` line 532 | Real-looking names and phone numbers hardcoded (e.g. `+91 98480 12345`). |
| **No input validation on quantities** | 🟡 Low | `AppContext.tsx` line 354 | `updateCartQuantity` rejects `<= 0` but no upper bound; no server-side validation. |
| **No HTTPS enforcement / CSP** | Unverified | Deployment config | `vercel.json` present but not inspected in detail. |
| **Supabase service-role key risk** | ✅ Not present | `supabase.ts` | Only anon key used — correctly handled. Comment warns against service-role key. |
| **Missing RLS** | 🔴 Critical | `supabase/migrations/` | RLS policies exist in SQL files but **not applied** (no Supabase project configured). If DB is connected without applying migrations, all tables are unprotected. |

---

## 7. Reusable Assets (Keep Unchanged)

### Components
| Component | File | Notes |
|---|---|---|
| `ProductCard` | `src/components/common/ProductCard.tsx` | Well-designed; used throughout — keep as-is |
| `BottomNav` | `src/components/common/BottomNav.tsx` | Mobile nav — keep |
| `DesktopFooter` | `src/components/common/DesktopFooter.tsx` | Footer — keep |
| `DesktopSidebar` | `src/components/common/DesktopSidebar.tsx` | Category sidebar — keep |
| `G1Logo` | `src/components/common/G1Logo.tsx` | Logo component — keep |
| All customer screen layouts | `src/components/customer/*.tsx` | UI shells are good; business logic needs fixing |

### Theme Tokens (Tailwind inline classes, consistent throughout)
| Token | Value | Usage |
|---|---|---|
| Primary green | `#2E7D32` | Buttons, accents, selected states |
| Dark green hover | `#1b5e20` | Button hover states |
| Accent orange | `#FF9800` | Badges, best-deal labels, cart count |
| Text primary | `#212121` | Body text |
| Background | `#F7F7F7` | Page background |
| Stone scale | Tailwind `stone-*` | Cards, borders, secondary text |

### Logo & Image Assets (Keep)
| Asset | Path | Status |
|---|---|---|
| `logo.png` | `public/logo.png` | Used in Header (both mobile and desktop) — keep |
| `g1_mart_banner_transparent.png` | `public/assets/images/` | Used in Admin and Delivery dashboards — keep |
| `g1_mart_banner_transparent_dark.png` | `public/assets/images/` | Available; may be used for dark mode — keep |
| `g1_grocery_delivery_hero_*.jpg` | `public/assets/images/` | Hero banner slide 1 — keep |
| `g1_special_offers_banner_*.jpg` | `public/assets/images/` | Hero banner slide 2 — keep |
| `g1_dairy_bakery_showcase_*.jpg` | `public/assets/images/` | Hero banner slide 3 — keep |
| `public/products/prod-1.jpg` … `prod-43.jpg` | `public/products/` | All 43 product images present — keep |

---

## 8. Proposed Target Folder Structure (Next.js App Router)

```
g1mart/
├── app/                          # Next.js App Router root
│   ├── layout.tsx                # Root layout: fonts, providers, metadata
│   ├── page.tsx                  # Home (/)
│   ├── category/[slug]/page.tsx  # Category listing
│   ├── product/[slug]/page.tsx   # Product detail
│   ├── search/page.tsx           # Search results
│   ├── cart/page.tsx             # Cart
│   ├── checkout/page.tsx         # Checkout form
│   ├── payment/
│   │   ├── page.tsx              # Payment method selection
│   │   └── result/page.tsx       # PhonePe return URL handler
│   ├── orders/
│   │   ├── page.tsx              # Order history
│   │   └── [orderId]/page.tsx    # Order tracking
│   ├── account/
│   │   ├── page.tsx              # Profile
│   │   ├── addresses/page.tsx    # Address list
│   │   └── wishlist/page.tsx     # Wishlist
│   ├── admin/
│   │   ├── layout.tsx            # Auth guard (Supabase admin role check)
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── orders/page.tsx       # Order management
│   │   ├── products/page.tsx     # Product list
│   │   ├── products/new/page.tsx # Add product
│   │   └── products/[id]/page.tsx # Edit product
│   └── api/                      # Route Handlers (server only)
│       ├── checkout/route.ts     # Validate cart, create order (server-side prices)
│       ├── payment/
│       │   ├── initiate/route.ts # Create PhonePe payment session
│       │   └── verify/route.ts   # Verify PhonePe callback/webhook
│       └── orders/[id]/status/route.ts  # Admin status update
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── storefront/               # Customer-facing components
│   │   ├── ProductCard.tsx       # (migrate from common/)
│   │   ├── CategoryGrid.tsx
│   │   ├── BannerCarousel.tsx
│   │   ├── CartDrawer.tsx
│   │   └── SearchBar.tsx
│   ├── checkout/
│   │   ├── AddressForm.tsx
│   │   ├── DeliverySlotPicker.tsx
│   │   └── OrderSummary.tsx
│   ├── admin/
│   │   ├── ProductForm.tsx
│   │   ├── OrderTable.tsx
│   │   └── StatusDropdown.tsx
│   └── layout/
│       ├── Header.tsx            # Cleaned — no role switcher
│       ├── BottomNav.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (anon key only)
│   │   └── server.ts             # Server Supabase client (service-role key, server only)
│   ├── phonepe.ts                # PhonePe PG server-side helper
│   └── delivery-zones.ts         # Zone config (migrated from deliveryZoneService.ts)
├── services/                     # Client-safe data fetching helpers
│   ├── products.ts
│   ├── categories.ts
│   ├── orders.ts
│   └── addresses.ts
├── types/
│   ├── database.types.ts         # (keep — generated from Supabase)
│   ├── index.ts                  # Aligned with DB schema
│   └── delivery-zone.ts          # (keep)
├── public/
│   ├── logo.png                  # (keep)
│   ├── assets/images/            # (keep banner images)
│   └── products/                 # (keep product images)
├── supabase/
│   ├── migrations/               # (keep all 3 SQL files)
│   └── seed.sql                  # (keep — use for staging only)
└── .env.local                    # VITE_ prefix → NEXT_PUBLIC_ for public vars;
                                   # service-role key in non-NEXT_PUBLIC_ var
```

### File-by-File Migration Map

| Current File | Action | Reason |
|---|---|---|
| `src/App.tsx` | **Delete** | Replaced by Next.js `app/layout.tsx` + file-based routing |
| `src/main.tsx` | **Delete** | Replaced by Next.js entry |
| `src/context/AppContext.tsx` | **Modify** | Split: cart/wishlist → client context; auth → Supabase server session; remove role switcher, fake data, delivery_partner role |
| `src/components/customer/HomeScreen.tsx` | **Modify** | Remove fake banners / "15-30 mins" / "up to 25% off" claims; keep layout |
| `src/components/customer/CheckoutScreen.tsx` | **Modify** | Remove client-side total; call `/api/checkout` route handler |
| `src/components/customer/PaymentScreen.tsx` | **Modify** | Replace `setTimeout → placeOrder()` with real PhonePe PG redirect |
| `src/components/customer/OrderSuccessScreen.tsx` | **Keep / Modify** | Minor cleanup |
| `src/components/customer/LoginScreen.tsx` | **Modify** | Wire to real Supabase OTP flow; remove Google login stub |
| `src/components/customer/OtpScreen.tsx` | **Modify** | Remove "any 4-digit accepted" bypass |
| All other customer screens | **Keep / Modify** | Adapt to Next.js pages; keep UI |
| `src/components/common/Header.tsx` | **Modify** | Remove role-switcher, remove "15-30 MINS" hardcode, remove "Deliver to Nellore" hardcode |
| `src/components/common/ProductCard.tsx` | **Keep** | Good component |
| `src/components/common/BottomNav.tsx` | **Keep** | Good component |
| `src/components/common/MobileFrame.tsx` | **Delete** | Replaced by Next.js root layout |
| `src/components/common/DesktopFooter.tsx` | **Keep** | Good component |
| `src/components/common/DesktopSidebar.tsx` | **Keep** | Good component |
| `src/components/admin/AdminDashboard.tsx` | **Modify** | Add auth guard; add image upload; add pagination; add SKU field |
| `src/components/delivery/DeliveryDashboard.tsx` | **Delete** | Out of scope per SPEC §4.2 |
| `src/data/mockData.ts` | **Modify** | Remove hardcoded prices/brands; remove `HYDERABAD_AREAS`, `HYDERABAD100` coupon; remove fake notifications; keep only as dev-seed reference |
| `src/lib/supabase.ts` | **Modify** | Split into `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server-only) |
| `src/services/authService.ts` | **Modify** | Remove `loginWithGoogle` stub; fix OTP verification |
| `src/services/productService.ts` | **Keep** | Solid Supabase CRUD |
| `src/services/orderService.ts` | **Modify** | Move order creation to server route handler |
| `src/services/addressService.ts` | **Keep** | Solid Supabase CRUD |
| `src/services/deliveryZoneService.ts` | **Keep / Modify** | Good logic; remove `NELLORE_POPULAR_HUBS` dead code |
| `src/types/index.ts` | **Modify** | Add `slug`, `sku`, `is_active` to `Product`; add `payment_status` enum to `Order`; remove `delivery_partner` from `UserRole` |
| `src/types/database.types.ts` | **Keep** | Generated schema types |
| `src/types/deliveryZone.ts` | **Keep** | Good types |
| `supabase/migrations/*.sql` | **Keep** | Apply to real Supabase project |
| `supabase/seed.sql` | **Keep** | Use for staging |
| `vite.config.ts` | **Delete** | Replaced by Next.js config |
| `index.html` | **Delete** | Replaced by Next.js |
| `.env.example` | **Modify** | Replace `VITE_` prefix with `NEXT_PUBLIC_`; add `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (non-public) |
| `public/assets/images/` (banner images) | **Keep** | Used in UI |
| `public/products/prod-*.jpg` | **Keep** | Product images |
| `public/logo.png` | **Keep** | Used in header |
| `public/logo.jpg`, `public/g1_mart_logo.png` | **Delete** | Unused duplicates |
| `src/assets/images/` | **Delete** | Duplicate of `public/assets/images/`; unused |

---

## 9. Questions for the Owner / Vamsi (Do Not Guess)

1. **Store identity:** What is the exact store name, official logo file, physical address, phone, and business hours to display on the website?
2. **Service area confirmation:** Is the store definitively located in Nellore? Which specific areas/PIN codes should be listed as serviceable on launch day?
3. **Delivery window:** The spec says "define delivery fee, minimum order, estimated delivery window before launch." The code uses 30–60 mins for city, ~2 hours for 30 km radius. Are these acceptable commitments, or placeholders?
4. **Product data:** Has the current product master (with selling prices, MRP, barcode/SKU, and images) been obtained from the store's billing/POS software? The 43 hardcoded products with prices must not go live unverified.
5. **Payment gateway:** Does the store have a PhonePe **Payment Gateway** (API) account, or only a UPI QR code? This determines whether the checkout can be automated.
6. **Guest checkout vs. customer login:** Should MVP require phone/OTP login, support guest checkout, or both?
7. **`HYDERABAD100` coupon and Hyderabad references:** Is this store also operating in Hyderabad? If not, the coupon and all Hyderabad area references should be removed.
8. **Returns policy:** The FAQ in the code promises "No-Questions-Asked instant return/refund at the doorstep." Has this been agreed with the store owner? If not, the claim must be removed before launch.
9. **Rider role:** The spec excludes a rider app from MVP. Should `DeliveryDashboard.tsx` be deleted now, or preserved as a future branch?
10. **Supabase project:** Has a Supabase project been created? If yes, what are the project URL and anon key so that migrations can be applied and the app can be tested with real data?
11. **`@google/genai` package:** Is an AI assistant or smart-search feature planned? If not, this dependency should be removed to reduce bundle size.
12. **`motion` package:** Is animation via the `motion` library intentional? No usage was found — confirm whether it should be removed or is planned for future use.
13. **Admin authentication:** The spec requires "secure admin login; no public admin registration." What auth method should be used — Supabase email/password, magic link, or restricted to a known phone number?
14. **Order status terminology:** The spec lists `New → Accepted → Preparing → Ready/Out for delivery → Delivered`. The code uses `Order Placed / Packed / Out for Delivery / Delivered`. Which set should be used for the production system?
15. **`walletBalance` / G1 Mart Wallet:** Is a digital wallet feature planned? The current code shows a balance of ₹350 for a test user. This is out of scope per the spec.
