# G1 Mart Specification Document

## Section 9: Product Catalogue & Image Specification

### 9.1 Catalogue Data Rules
1. **Clean Customer-Facing Names**: Product names from POS reports must be cleaned of internal cashier abbreviations and OCR noise into human-readable customer-facing titles.
2. **Zero Guessing**: Do NOT guess a brand, variant, pack size, or barcode if it is not explicitly verifiable from the POS record.
3. **Ambiguity Review Gate**: If a product name is ambiguous, cryptic, or missing critical variant details (e.g. `5 MUCH`, `SSCG3`, `NSR`, `MROW`, `ALL IN ONE 100G`, `707 SOAP`), flag it as `is_ambiguous = true` with a detailed note for store owner review.
4. **Price Confirmation Rule**: Do NOT derive customer selling prices or MRP from net sales totals. Leave prices unconfirmed (`priceConfirmed = false` / `Price TBA`) until verified directly by store management.

### 9.2 Product Image Rules (Strict Standard)

#### GOAL
Every product image must show the **exact product**:
- Same brand
- Same variant
- Same pack size

> **Cardinal Rule**: *A wrong image is worse than no image. If you are not 100% sure, use the official G1 Mart placeholder.*

#### FORBIDDEN
- ❌ Do NOT use Google Images, Bing, Pinterest, social media, blogs, or generic web image search.
- ❌ Do NOT use lifestyle photos, photos of people, kitchens, or generic stock photos.
- ❌ Do NOT use AI-generated product pack illustrations or cartoon graphics.
- ❌ Do NOT scrape retailer sites (Amazon, BigBasket, Blinkit, Zepto, etc.).
- ❌ Do NOT download any image without explicit user approval.

#### ALLOWED SOURCES (In Strict Priority Order)
1. **Store Owner Photos**: Images uploaded directly by the store owner into `/product-photos-raw/` (named by product ID or exact product name).
2. **Open Food Facts**: Queried by **exact barcode only** (never by loose text or name search). Image URL and license must be recorded for legal attribution.
3. **Manufacturer Brand Assets**: Official manufacturer brand media packs provided directly by the store owner.
4. **Official G1 Mart Placeholder**: Clean, neutral, branded placeholder (`/products/placeholder.svg`) displayed in all other cases.

#### DATABASE COLUMNS
All products must maintain these image metadata attributes:
- `image_path`: Relative or canonical path to candidate image file.
- `image_source`: One of `own_photo` | `openfoodfacts` | `manufacturer` | `placeholder`.
- `image_license`: License attribution string (e.g., `CC-BY-SA 3.0`, `Proprietary Store Asset`, `Public Domain`).
- `image_status`: One of `pending` | `approved` | `placeholder`.
- `image_match_note`: Verifiable rationale explaining why candidate matches exact pack/variant, or reason for placeholder.

#### STOREFRONT RENDERING RULE
**The storefront must show an image ONLY when `image_status === 'approved'`. Anything else (`pending` or `placeholder`) MUST display the official placeholder.**
*The AI agent must never mark anything approved itself. Approval belongs strictly to the user.*

#### REVIEW GATE (`docs/image-review.html`)
The system must generate a visual contact sheet at `docs/image-review.html` with:
- Product ID & Raw POS Name
- Customer-Facing Name
- Candidate Image Preview
- Image Source
- Match Note / License
- Approval Actions (Approve / Reject)

#### IMAGE QUALITY STANDARDS
- Front-of-pack orientation
- Single product centered (no hands, no multi-packs unless sold as a multi-pack)
- Clean neutral / transparent background
- At least 600px on the shortest dimension
- Zero watermarks or third-party retailer logos
