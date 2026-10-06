# G1 MART — FINAL PRE-IMPORT AUDIT REPORT (PDF #1)
**Source Document:** `AltaScanner_10_04_2026(1)(1).pdf`  
**Supplier:** RR ENTERPRISES (Vedayapalem, Nellore)  
**Audit Scope:** Rigorous visual, packaging, variant, and image source audit of all candidate READY products before live catalog import.

---

## 1. Summary Metrics

- **TOTAL UNIQUE SKUs:** 96
- **READY AFTER FINAL AUDIT:** 28
- **MOVED TO NEEDS_REVIEW:** 35 (from candidate group) + 33 (from regional/store group) = 68 total
- **DUPLICATES:** 11 (6 cross-invoice duplicate SKUs + 5 free scheme lines)
- **MRP CONFLICTS:** 2 (`DRN Suji Ravva 500g`: col ₹50.00 vs title Rs.60/-; `Morelight 1L`: col ₹0.00 vs title Rs.99/-)
- **IMAGE MISMATCHES:** 12 (Multipacks/1+1 offer packs where only single-unit photos exist online)
- **IMAGE SOURCE PROBLEMS:** 35 (Third-party dynamic CDN URLs returning 404 or missing high-res packshots)

---

## 2. Itemized Candidate Audit Table (All 63 Audited Products)

| # | Product | Brand | Variant | Pack Size | MRP | Source Rate | Image URL | Image Match | MRP Match | Final Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mysore Sandal Pure Sandalwood Soap | Mysore Sandal | Original Sandal | 75g | ₹42.00 | ₹36.19 | `https://www.mysoresandal.co.in/products/75g` | VERIFIED_EXACT | MATCHED | **READY** |
| 2 | Mysore Sandal Pure Sandalwood Soap | Mysore Sandal | Original Sandal | 125g | ₹63.00 | ₹53.33 | `https://www.mysoresandal.co.in/products/125g` | VERIFIED_EXACT | MATCHED | **READY** |
| 3 | Mysore Sandal Pure Sandalwood Soap | Mysore Sandal | Original Sandal | 150g | ₹75.00 | ₹64.76 | `https://www.mysoresandal.co.in/products/150g` | VERIFIED_EXACT | MATCHED | **READY** |
| 4 | Mysore Sandal Soap (Pack of 3) | Mysore Sandal | Original Sandal (3 x 150g Multipack) | 150g x 3 | ₹245.00 | ₹209.52 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 5 | Margo Original Neem Soap | Margo | Original Neem | 100g | ₹40.00 | ₹35.27 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 6 | Wagh Bakri Premium Leaf Tea | Wagh Bakri | Premium Leaf Tea | 100g | ₹50.00 | ₹42.86 | `https://www.waghbakritea.com/products/100g` | VERIFIED_EXACT | MATCHED | **READY** |
| 7 | Wagh Bakri Premium Leaf Tea | Wagh Bakri | Premium Leaf Tea | 250g | ₹160.00 | ₹138.53 | `https://www.waghbakritea.com/products/250g` | VERIFIED_EXACT | MATCHED | **READY** |
| 8 | Wagh Bakri Premium Leaf Tea | Wagh Bakri | Premium Leaf Tea | 500g | ₹320.00 | ₹277.06 | `https://www.waghbakritea.com/products/500g` | VERIFIED_EXACT | MATCHED | **READY** |
| 9 | Wagh Bakri Navchetan Elaichi Tea Jar | Wagh Bakri | Navchetan Elaichi Chai Jar | 100g | ₹50.00 | ₹41.90 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 10 | GKL Seeded Dates (Buy 1 Get 1 Free Pack) | GKL | Seeded Dates (1+1 Set) | 500g x 2 | ₹238.00 | ₹195.24 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 11 | GKL Seedless Dates (Buy 1 Get 1 Free Pack) | GKL | Seedless Dates (1+1 Set) | 250g x 2 | ₹160.00 | ₹128.57 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 12 | GKL Premium Black Dates | GKL | Premium Black Dates | 400g | ₹272.00 | ₹190.48 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 13 | Swastiks Roasted Vermicelli / Semiya | Swastiks | Roasted Vermicelli | 800g | ₹85.00 | ₹57.14 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 14 | Swastiks Roasted Vermicelli / Semiya | Swastiks | Roasted Vermicelli | 400g | ₹44.00 | ₹30.48 | `https://www.bbassets.com/media/uploads/p/l/40053896_5-swastiks-roasted-vermicelli.jpg` | VERIFIED_EXACT | MATCHED | **READY** |
| 15 | Swastiks Vermicelli / Semiya (₹10 Pack) | Swastiks | Vermicelli | 90g | ₹10.00 | ₹7.62 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 16 | Mysore Sandal Dhoop Cup Sambrani | Mysore Sandal | Cup Sambrani | 12 Cups | ₹75.00 | ₹52.38 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 17 | Mysore Sandal Baby Soap | Mysore Sandal | Baby Care | 75g | ₹45.00 | ₹38.96 | `https://www.mysoresandal.co.in/products/75g` | VERIFIED_EXACT | MATCHED | **READY** |
| 18 | Exo Touch & Shine Dishwash Bar (₹5 Pack) | Exo | Dishwash Bar | 60g | ₹5.00 | ₹3.60 | `https://www.jyothylabs.com/brands/exo/60g` | VERIFIED_EXACT | MATCHED | **READY** |
| 19 | Exo Touch & Shine Dishwash Bar | Exo | Dishwash Bar | 125g | ₹10.00 | ₹7.54 | `https://www.jyothylabs.com/brands/exo/125g` | VERIFIED_EXACT | MATCHED | **READY** |
| 20 | Exo Touch & Shine Dishwash Bar with Scrubber | Exo | Bar with Scrubber | 300g | ₹30.00 | ₹22.88 | `https://www.jyothylabs.com/brands/exo/300g` | VERIFIED_EXACT | MATCHED | **READY** |
| 21 | Exo Touch & Shine Dishwash Round Tub | Exo | Round Tub | 250g | ₹30.00 | ₹22.88 | `https://www.jyothylabs.com/brands/exo/250g` | VERIFIED_EXACT | MATCHED | **READY** |
| 22 | Exo Touch & Shine Dishwash Round Tub | Exo | Round Tub | 500g | ₹60.00 | ₹44.92 | `https://www.jyothylabs.com/brands/exo/500g` | VERIFIED_EXACT | MATCHED | **READY** |
| 23 | Ujala Supreme Fabric Whitener Liquid (₹10 Pack) | Ujala | Fabric Whitener | 30ml | ₹10.00 | ₹7.51 | `https://www.jyothylabs.com/brands/ujala/30ml` | VERIFIED_EXACT | MATCHED | **READY** |
| 24 | Ujala Supreme Fabric Whitener Liquid | Ujala | Fabric Whitener | 75ml | ₹40.00 | ₹30.04 | `https://www.jyothylabs.com/brands/ujala/75ml` | VERIFIED_EXACT | MATCHED | **READY** |
| 25 | Ujala Supreme Fabric Whitener Liquid | Ujala | Fabric Whitener | 250ml | ₹90.00 | ₹67.60 | `https://www.jyothylabs.com/brands/ujala/250ml` | VERIFIED_EXACT | MATCHED | **READY** |
| 26 | Exo Safai Stainless Steel Scrubber | Exo | Steel Scrubber | 1 Pc (Sheet) | ₹20.00 | ₹7.20 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 27 | Exo Safai Scrub Pad (1+1 Free) | Exo | Sponge / Scrubber Pad (1+1) | 2 units | ₹10.00 | ₹7.20 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 28 | Crisp & Shine Fabric Stiffener Pouch | Crisp & Shine | Conditioner Pouch | 100g | ₹35.00 | ₹26.97 | `https://www.jyothylabs.com/brands/crisp-shine/100g` | VERIFIED_EXACT | MATCHED | **READY** |
| 29 | Crisp & Shine Fabric Stiffener Pouch | Crisp & Shine | Conditioner Pouch | 200g | ₹72.00 | ₹55.47 | `https://www.jyothylabs.com/brands/crisp-shine/200g` | VERIFIED_EXACT | MATCHED | **READY** |
| 30 | Crisp & Shine Fabric Stiffener Bottle | Crisp & Shine | Conditioner Bottle | 500g | ₹160.00 | ₹123.26 | `https://www.jyothylabs.com/brands/crisp-shine/500g` | VERIFIED_EXACT | MATCHED | **READY** |
| 31 | Crisp & Shine Fabric Stiffener Refill Pouch | Crisp & Shine | Conditioner Refill | 500g | ₹160.00 | ₹123.26 | `https://www.jyothylabs.com/brands/crisp-shine/500gp` | VERIFIED_EXACT | MATCHED | **READY** |
| 32 | Crisp & Shine Fabric Stiffener Sachet (₹5 Pack) | Crisp & Shine | Sachet | 15g | ₹5.00 | ₹3.69 | `https://www.jyothylabs.com/brands/crisp-shine/15g` | VERIFIED_EXACT | MATCHED | **READY** |
| 33 | Margo Original Neem Soap (4 + 1 Offer Pack) | Margo | Original Neem (4+1 Multipack) | 100g x 5 | ₹190.00 | ₹164.20 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 34 | Exo Dishwash Liquid Ginger/Lemon | Exo | Yellow Liquid | 115ml | ₹15.00 | ₹11.44 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 35 | Exo Dishwash Liquid Bottle | Exo | Yellow Liquid Bottle | 250ml | ₹60.00 | ₹46.14 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 36 | Exo Safai Utensil Scouring Powder | Exo | Scouring Powder | 500g | ₹15.00 | ₹11.44 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 37 | Henko Matic Top Load Liquid Detergent Pouch | Henko | Top Load Pouch | 50ml | ₹10.00 | ₹6.99 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 38 | Henko Matic Front Load Liquid Detergent Bottle | Henko | Front Load Bottle | 50ml | ₹10.00 | ₹6.99 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 39 | Henko Matic Front Load Liquid Detergent Bottle | Henko | Front Load Bottle | 1 L | ₹175.00 | ₹134.82 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 40 | Henko Matic Top Load Liquid Detergent Bottle | Henko | Top Load Bottle | 1 L | ₹149.00 | ₹114.41 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 41 | Wagh Bakri Premium Leaf Tea (₹10 Pack) | Wagh Bakri | Leaf Tea Pouch | 32g | ₹10.00 | ₹7.86 | `https://www.waghbakritea.com/products/32g` | VERIFIED_EXACT | MATCHED | **READY** |
| 42 | Wagh Bakri Spiced Elaichi Tea (₹10 Pack) | Wagh Bakri | Elaichi Chai Pouch | 1 pack | ₹10.00 | ₹7.86 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 43 | Medimix Ayurvedic 18 Herbs Classic Bath Soap | Medimix | 18 Herbs Classic | 75g | ₹35.00 | ₹30.87 | `https://www.medimixayurveda.com/products/75g` | VERIFIED_EXACT | MATCHED | **READY** |
| 44 | Medimix Ayurvedic Sandal & Eladi Oil Soap | Medimix | Sandal with Eladi Oil | 125g | ₹60.00 | ₹51.95 | `https://www.medimixayurveda.com/products/125g-sandal` | VERIFIED_EXACT | MATCHED | **READY** |
| 45 | Medimix Ayurvedic Natural Glycerine Soap | Medimix | Transparent Glycerine | 125g | ₹55.00 | ₹47.62 | `https://www.medimixayurveda.com/products/125g-glycerine` | VERIFIED_EXACT | MATCHED | **READY** |
| 46 | Medimix Ayurvedic 18 Herbs Soap Multipack | Medimix | 18 Herbs Multipack | 125g x 3 | ₹156.00 | ₹135.07 | `https://www.medimixayurveda.com/products/125g-multipack` | VERIFIED_EXACT | MATCHED | **READY** |
| 47 | GKL Seeded Dates Regular Pack | GKL | Seeded Dates | 250g | ₹67.00 | ₹52.38 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 48 | GKL Seeded Dates (Buy 1 Get 1 Free Pack) | GKL | Seeded Dates (1+1 Set) | 250g x 2 | ₹130.00 | ₹104.76 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 49 | GKL Premium Black Dates | GKL | Black Dates | 200g | ₹118.00 | ₹95.24 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 50 | Medimix Ayurvedic 18 Herbs Classic Bath Soap | Medimix | 18 Herbs Classic Single Bar | 125g | ₹52.00 | ₹45.85 | `https://www.medimixayurveda.com/products/125g` | VERIFIED_EXACT | MATCHED | **READY** |
| 51 | Mysore Sandal Gold Classic Soap | Mysore Sandal | Gold | 125g | ₹90.00 | ₹71.92 | `https://www.mysoresandal.co.in/products/125g` | VERIFIED_EXACT | MATCHED | **READY** |
| 52 | Mysore Sandal Talcum Powder | Mysore Sandal | Sandalwood Talc | 50g | ₹26.00 | ₹21.90 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 53 | Mysore Sandal Talcum Powder | Mysore Sandal | Sandalwood Talc | 100g | ₹44.00 | ₹36.19 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 54 | Mysore Sandal Talcum Powder | Mysore Sandal | Sandalwood Talc | 300g | ₹160.00 | ₹132.38 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 55 | Mysore Sandal Pushpam Incense Sticks | Mysore Sandal | Pushpam Agarbatti | 90g | ₹54.00 | ₹38.10 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 56 | Mysore Sandal Tejah Incense Sticks | Mysore Sandal | Tejah Agarbatti | 90g | ₹54.00 | ₹38.10 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 57 | Mysore Sandal Gulab Incense Sticks | Mysore Sandal | Gulab / Rose Agarbatti | 90g | ₹54.00 | ₹38.10 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 58 | Mysore Sandal Lavender Incense Sticks | Mysore Sandal | Lavender Agarbatti | 90g | ₹54.00 | ₹38.10 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 59 | Mysore Sandal Flora Incense Sticks | Mysore Sandal | Mix Flora Agarbatti | 90g | ₹54.00 | ₹38.10 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 60 | Mysore Sandal Rose Incense Sticks (₹10 Pack) | Mysore Sandal | Rose Agarbatti | 1 pack | ₹10.00 | ₹7.94 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 61 | Mysore Sandal Freshnol Floor Cleaner (Buy 1 Get 1 Free) | Mysore Sandal | Freshnol Disinfectant Surface Cleaner (1+1 Offer) | 1 L x 2 | ₹150.00 | ₹104.24 | `AWAITING_REVIEW_SOURCE` | MISMATCH_OR_UNAVAILABLE | MATCHED | **NEEDS_REVIEW** |
| 62 | Mysore Sandal Mystic Incense Sticks | Mysore Sandal | Mystic Agarbatti | 1 pack | ₹60.00 | ₹41.90 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
| 63 | Mysore Sandal Agarbatti Pouch | Mysore Sandal | Sandal Agarbatti Zipper Pouch | 125g | ₹55.00 | ₹40.00 | `AWAITING_REVIEW_SOURCE` | SOURCE_UNRESOLVED | MATCHED | **NEEDS_REVIEW** |
