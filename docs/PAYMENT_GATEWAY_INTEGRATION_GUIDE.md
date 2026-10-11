# G1 MART (`g1mart.in`) — PAYMENT GATEWAY INTEGRATION & ARCHITECTURE GUIDE

**Domain**: `https://g1mart.in`  
**Application**: G1 Mart Hyperlocal Grocery E-Commerce  
**Tech Stack**: Next.js 15.3 (App Router), React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL  
**Document Version**: 1.0 (Production Blueprint)

---

## 1. PRESENT PROJECT STRUCTURE IN FULL DETAIL

The G1 Mart codebase is organized under `d:\web-agency-projects\G1mart`. The core directory layout and payment-related subsystems are detailed below:

```text
G1mart/
├── .env.example                       <-- Environment variable template
├── .env.local                         <-- Active local variables (currently PhonePe UAT test keys)
├── package.json                       <-- Next 15.3, React 19, Supabase SSR, Lucide, Web-Push
├── public/                            <-- Static assets, icons, product placeholders
├── data/
│   ├── g1mart_orders.json             <-- Server-side persistent order fallback store
│   ├── products-catalog.json          <-- Product master data
│   └── migrated_product_variants.json <-- Size variants and pricing
├── supabase/
│   └── migrations/
│       ├── 20261002000001_g1_mart_schema.sql         <-- Base schema (orders, items, users)
│       ├── 20261002000004_g1_mart_payments.sql       <-- Payments table & order payment columns
│       └── 20261011000001_store_settings_and_delivery_zones.sql <-- COD fee & zone config
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── cart/page.tsx                         <-- Cart review & quantity modification
│   │   │   ├── checkout/page.tsx                     <-- Address, slot, 30km radius & min-order gate
│   │   │   ├── payment/page.tsx                      <-- Payment selection (Online vs COD)
│   │   │   ├── payment/result/page.tsx               <-- Gateway return handler & UPI QR fallback
│   │   │   └── orders/[id]/page.tsx                  <-- Order tracking & confirmation screen
│   │   ├── api/
│   │   │   ├── checkout/initiate/route.ts            <-- Order creation & payment session init
│   │   │   ├── payment/verify/route.ts               <-- Signature verification (Razorpay)
│   │   │   ├── payment/webhook/route.ts              <-- S2S Webhook listener (Razorpay & PhonePe)
│   │   │   ├── payment/test-simulate/route.ts        <-- UAT / Sandbox test simulation endpoint
│   │   │   ├── orders/route.ts                       <-- User order retrieval & registration
│   │   │   ├── orders/[id]/route.ts                  <-- Single order detail fetch
│   │   │   ├── orders/[id]/payment-status/route.ts   <-- Status polling (PhonePe S2S polling)
│   │   │   └── admin/orders/[id]/mark-paid/route.ts  <-- Staff/Admin manual verification
│   ├── lib/
│   │   ├── payment/
│   │   │   ├── types.ts                              <-- PaymentAdapter, CreatePaymentParams, results
│   │   │   ├── razorpayAdapter.ts                    <-- Razorpay Orders API & HMAC verification
│   │   │   ├── phonepeAdapter.ts                     <-- PhonePe /pg/v1/pay, /status & Webhook parser
│   │   │   └── index.ts                              <-- Module export barrel
│   │   ├── serverOrderStore.ts                       <-- Server-side order state & DB recalculation
│   │   ├── serverStoreSettings.ts                    <-- COD fee & dynamic store parameters
│   │   └── supabase/
│   │       ├── client.ts                             <-- Browser Supabase client
│   │       └── server.ts                             <-- Server-side Supabase client
│   └── context/
│       ├── CartContext.tsx                           <-- Client cart state & persistence
│       └── AuthContext.tsx                           <-- Supabase Auth & phone login state
```

---

## 2. AUDIT OF CURRENT FLOW & ARCHITECTURAL GAPS

### 2.1 The Current User Journey
1. **Cart (`/cart`)**: Customer selects grocery items and pack sizes.
2. **Checkout (`/checkout`)**:
   - Customer chooses **Home Delivery** or **Store Pickup**.
   - Delivery location is verified against store hub (Padarupalli, Nellore). Maximum radius is **30 km**.
   - If distance is within zone, server checks **zone minimum order value** (e.g., ₹500). Delivery is **100% FREE**.
   - Address and fulfillment data are saved to `sessionStorage` (`g1mart_checkout_address`).
3. **Payment Choice (`/payment`)**:
   - Customer chooses either **"Pay online (UPI / Cards / NetBanking)"** or **"Pay on delivery (Cash on Delivery)"**.
   - If **Pay on Delivery (COD)**: Adds dynamic COD handling fee (default ₹50). Calls `POST /api/checkout/initiate` -> status set to `Order Placed`, `paymentStatus = 'COD_PENDING'`, redirects directly to `/orders/[id]?placed=true`. **(Working fully)**
   - If **Pay Online**: Calls `POST /api/checkout/initiate` -> Server recalculates price from DB catalog -> calls adapter.

### 2.2 The Current Inconsistencies / Gaps
There is currently a dual-implementation state in the code that needs unification for production on `g1mart.in`:

| Component | Current State | Production Need (`g1mart.in`) |
| :--- | :--- | :--- |
| `.env.local` | Has `PHONEPE_MERCHANT_ID=PGTESTPAYUAT` (Sandbox) | Needs Live API credentials for selected gateway |
| `api/checkout/initiate` | Directly imports and calls `razorpayAdapter` | Needs unified gateway selector or standardized driver |
| `payment/page.tsx` | Displays a simulated Razorpay modal dialog | Must open official Razorpay Checkout SDK or redirect to PhonePe hosted checkout |
| `payment/result/page.tsx` | Displays static UPI QR code and calls PhonePe status check | Must handle official return redirect from gateway |
| Domain references | Mixed `localhost:3000` / fallback | Must strictly bind to `https://g1mart.in` |

---

## 3. PRODUCTION URLS & ROUTING SPECIFICATION (`g1mart.in`)

Every communication between customer devices, the G1 Mart Next.js server, and the Payment Gateway provider uses the following absolute production URLs:

### 3.1 Public Storefront URLs
- **Storefront Base**: `https://g1mart.in`
- **Checkout Page**: `https://g1mart.in/checkout`
- **Payment Method Selection**: `https://g1mart.in/payment`
- **Payment Return / Callback Page**: `https://g1mart.in/payment/result?orderId=G1-XXXXXX`
- **Order Confirmation & Live Tracking**: `https://g1mart.in/orders/{orderId}?placed=true` (or `?paid=true`)

### 3.2 Backend API & Webhook Endpoints
- **Order & Payment Session Creation**:
  `POST https://g1mart.in/api/checkout/initiate`
  - *Payload*: `{ items, address, paymentMethod, orderType, slot, userId, userEmail }`
  - *Response*: `{ success, orderId, providerOrderId, amountInPaise, grandTotal, keyId, redirectUrl }`

- **Client Signature Verification (Razorpay)**:
  `POST https://g1mart.in/api/payment/verify`
  - *Payload*: `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`
  - *Response*: `{ success, orderId, paymentStatus: 'paid', transactionId, redirectUrl }`

- **Server-to-Server Webhook (Asynchronous Settlement)**:
  `POST https://g1mart.in/api/payment/webhook`
  - Registered inside Gateway Merchant Portal.
  - Receives raw webhook notifications (`order.paid`, `payment.captured`, or PhonePe Base64 callbacks).
  - Verifies HMAC signature or Basic Auth header.
  - Updates Supabase `orders` and `payments` tables with idempotency protection.

- **Order Status Polling (Fallback for Drops/Network Glitches)**:
  `GET https://g1mart.in/api/orders/{orderId}/payment-status`
  - Polled every 2.5 seconds by `payment/result` page if customer returns before webhook finishes.

---

## 4. COMPLETE SYSTEM ARCHITECTURE & PAYMENT FLOW

```
[ Customer Browser (g1mart.in) ]
         │
         │ 1. Click "Pay Online"
         ▼
[ Next.js API: POST /api/checkout/initiate ]
         │
         │ 2. Recalculate cart totals from DB catalog (Anti-tamper)
         │ 3. Create Pending Order (status: 'Order Placed', paymentStatus: 'pending')
         ▼
[ Payment Gateway API (Razorpay / PhonePe) ]
         │
         │ 4. Return providerOrderId (e.g. order_Nw82Xy... or MT_G1-...)
         ▼
[ Customer Device ]
         │
         │ 5. Opens Payment Gateway (Razorpay Popup OR PhonePe Redirect)
         │ 6. Customer approves UPI / Card / NetBanking in UPI App (GPay/PhonePe/Paytm)
         ▼
  ┌─────────────────────────────────┴─────────────────────────────────┐
  │                                                                   │
  ▼ (Channel A: S2S Instant Webhook)                                   ▼ (Channel B: Frontend Redirect)
[ Gateway Server-to-Server Webhook ]                           [ Browser Redirects to g1mart.in ]
  │                                                                   │
  │ POST https://g1mart.in/api/payment/webhook                        │ POST https://g1mart.in/api/payment/verify
  │ Headers: x-razorpay-signature / x-verify                          │ Body: { orderId, paymentId, signature }
  ▼                                                                   ▼
[ Verify HMAC SHA256 Signature ]                               [ Verify Signature on Server ]
  │                                                                   │
  │ Check Idempotency Key (${orderId}_${txnId})                      │ Match amount in paise with order total
  ▼                                                                   ▼
[ Update Supabase DB ] ◄───────────────────────────────────────────────┘
  │ - orders.payment_status = 'completed'
  │ - orders.is_paid = true
  │ - payments.status = 'COMPLETED'
  ▼
[ Customer lands on https://g1mart.in/orders/{orderId}?paid=true ]
  │
  ▼
[ Broadcast to Store Admin & Rider for Immediate Dispatch ]
```

---

## 5. GATEWAY OPTIONS COMPARISON FOR G1 MART

Both adapters exist in `src/lib/payment/`. Choose your active gateway based on your merchant account status:

### Option A: Razorpay (Standard Seamless Checkout)
- **Customer Experience**: Opens native in-app modal popup. Customer does not leave `g1mart.in`.
- **UPI Support**: GPay, PhonePe, Paytm, BHIM, CRED, plus all Credit/Debit cards & NetBanking.
- **Client Script**: `https://checkout.razorpay.com/v1/checkout.js`
- **Verification Formula**: `crypto.createHmac('sha256', KEY_SECRET).update(order_id + '|' + payment_id).digest('hex')`

### Option B: PhonePe PG (Standard Redirect)
- **Customer Experience**: Redirects browser to PhonePe's secure hosted payment page, then redirects back to `https://g1mart.in/payment/result?orderId=...`.
- **UPI Support**: Native PhonePe UPI app intent deep linking.
- **Verification Formula**: `crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + SALT_KEY).digest('hex') + '###' + SALT_INDEX`

---

## 6. REQUIRED PRODUCTION ENVIRONMENT VARIABLES

Add these variables to your production hosting environment (Vercel / Cloudflare / VPS) and `.env.local`:

```env
# ==============================================================================
# APP BASE CONFIGURATION
# ==============================================================================
NEXT_PUBLIC_APP_URL=https://g1mart.in

# ==============================================================================
# SUPABASE DATABASE (LIVE INSTANCE)
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ==============================================================================
# OPTION 1: RAZORPAY PRODUCTION KEYS (If using Razorpay)
# ==============================================================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_live_secret_key
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# ==============================================================================
# OPTION 2: PHONEPE PRODUCTION KEYS (If using PhonePe)
# ==============================================================================
PHONEPE_MERCHANT_ID=Mxxxxxxxxxxxxxx
PHONEPE_SALT_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=PRODUCTION
PHONEPE_WEBHOOK_USERNAME=g1mart_webhook_user
PHONEPE_WEBHOOK_PASSWORD=g1mart_webhook_secure_pass

# ==============================================================================
# STORE UPI FALLBACK & CONTACTS
# ==============================================================================
NEXT_PUBLIC_STORE_PHONE=+91 91107 59629
NEXT_PUBLIC_STORE_UPI_ID=9110759629@ybl
```

---

## 7. MERCHANT DASHBOARD CONFIGURATION CHECKLIST

### If using Razorpay:
1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Switch from **Test Mode** to **Live Mode**.
3. Go to **Settings -> API Keys** -> Generate **Key ID** and **Key Secret**.
4. Go to **Settings -> Webhooks** -> Click **Add New Webhook**:
   - **Webhook URL**: `https://g1mart.in/api/payment/webhook`
   - **Secret**: Set a strong secret (save as `RAZORPAY_WEBHOOK_SECRET`).
   - **Active Events**: Check `order.paid`, `payment.captured`, `payment.failed`.
5. Under **Settings -> Configuration -> Whitelist Domains**, ensure `g1mart.in` is registered.

### If using PhonePe:
1. Log in to [PhonePe Merchant Dashboard](https://business.phonepe.com).
2. Complete KYC and obtain **Production Merchant ID (MID)**, **Salt Key**, and **Salt Index**.
3. Under **Developer Settings -> Webhook Settings**:
   - **Callback URL**: `https://g1mart.in/api/payment/webhook`
   - **Authentication**: Set Basic Auth with credentials matching `PHONEPE_WEBHOOK_USERNAME` and `PHONEPE_WEBHOOK_PASSWORD`.
4. Whitelist domain: `https://g1mart.in`.

---

## 8. DATABASE SCHEMA VERIFICATION

The database schema is defined in `supabase/migrations/20261002000004_g1_mart_payments.sql`:

```sql
-- Payments Audit Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,         -- 'razorpay' | 'phonepe' | 'cash_on_delivery'
  provider_order_id TEXT,        -- Gateway order id (e.g. order_xxxxxxxx)
  transaction_id TEXT,           -- Payment ID / UPI UTR (e.g. pay_xxxxxxxx)
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  raw_response JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table status column checks
-- orders.payment_status must support: 'pending', 'completed', 'failed', 'COD_PENDING'
```

---

## 9. IMPLEMENTATION CHECKLIST TO GO LIVE

To finalize and switch from development mode to live payments on `g1mart.in`:

- [ ] **Step 1: Choose Active Provider**: Confirm whether you are deploying with **Razorpay** (recommended for standard modal) or **PhonePe**.
- [ ] **Step 2: Update `payment/page.tsx`**:
  - Replace the sandbox modal with the live Razorpay checkout script (`https://checkout.razorpay.com/v1/checkout.js`) or redirect to PhonePe.
- [ ] **Step 3: Set Live Keys in `.env.local` / Production Dashboard**: Add your live credentials.
- [ ] **Step 4: Register Webhook**: Enter `https://g1mart.in/api/payment/webhook` in the gateway merchant dashboard.
- [ ] **Step 5: Run End-to-End Test**:
  - Place a test order of ₹1 (or minimum pack).
  - Verify payment in UPI app (GPay / PhonePe).
  - Verify order changes to `Order Placed` / `Paid` in `/orders/[id]` and Admin panel.
  - Verify webhook returns HTTP 200.
