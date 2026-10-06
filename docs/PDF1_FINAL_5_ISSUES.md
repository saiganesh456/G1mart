# G1 MART — FINAL RESOLUTION OF THE 5 UNRESOLVED PRODUCTS (PDF #1)

**Source Document:** `AltaScanner_10_04_2026(1)(1).pdf`  
**Supplier:** RR ENTERPRISES (Vedayapalem, Nellore, Andhra Pradesh)  
**Invoice References:** `RRE26/27-4158` (dated 11-09-2026)  
**Purpose:** Forensic investigation and resolution of the 5 flagged products from PDF #1.

---

## 1. Forensic Resolution Table

| # | Product | Exact Name | Brand | Variant | Pack Size | MRP | Source Rate | Identity Status | MRP Status | Explanation |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Morelight Liquid Detergent Can — 1 L | MORELIGHT 1LR | Morelight | Liquid Detergent (Plastic Can) | 1 L | ₹99.00 | ₹71.19 | **RESOLVED** | **RESOLVED** | Invoice Page 4, Row 31 item text explicitly reads `MORELIGHT 1LR x 12Pc Rs. 99/-`. The taxable rate is ₹71.19 (+ 18% GST = ₹84.00 landed cost). At retail MRP ₹99.00, retailer margin is ₹15.00/unit (15.15%), exactly standard FMCG liquid detergent margin. Surrounding lines (`MORE LIGHT 3+2 LTR Rs.489/-` and `MORE LIGHT 4KG Rs.540/-`) confirm every row has MRP in the title matching the printed MRP column. In Row 31, the billing clerk left the MRP column as `0.00` by omission. Confirmed MRP = ₹99.00. |
| 2 | DRN Premium Suji Rava / Bombay Rava — 500g | DRN SUJI RAVVA 500G | DRN | Suji / Bombay Rava | 500g | ₹50.00 | ₹28.57 | **RESOLVED** | **MRP_CONFLICT** | Brand is reliably established as DRN (D.R.N. Foods, Andhra Pradesh; HSN 11031110 Groats/meal/rava). Invoice Page 5, Row 52 printed MRP column explicitly specifies `50.00`, whereas the line item text reads `DRN SUJI RAVVA 500G X 50PC - Rs.60/-`. Taxable unit price is ₹28.57 (+ 5% GST = ₹30.00 landed cost). Per instructions, the invoice printed column MRP of ₹50.00 is preserved, but the conflict with the Rs.60 description is formally flagged as MRP_CONFLICT for physical packet confirmation. |
| 3 | Cheemala Mandu — 100g | CHIMALA MANDU 100G | Unspecified on Invoice (Awaiting Physical Pack) | Ant & Insect Pest Powder (చీమల మందు) | 100g | ₹20.00 | ₹3.81 | **IDENTITY_REVIEW** | **VERIFIED** | Invoice Page 6, Row 56 reads `CHIMALA MANDU 100G X 250PC - Rs.20/-`. HSN `38089910` confirms household pest/insecticide powder (Telugu: చీమల మందు = ant powder). Printed MRP column is ₹20.00, taxable unit price is ₹3.81. Unlike branded items on the invoice, RR Enterprises omitted any brand or manufacturer name. In strict adherence to guidelines, no brand is invented or assumed. Pack size and MRP are verified, but exact brand identity remains flagged for store physical pack inspection. |
| 4 | Ganji Pindi — 100g | GANJI PINDI 100G | Unspecified on Invoice (Awaiting Physical Pack) | Natural Fabric Starch Powder (గంజి పిండి) | 100g | ₹20.00 | ₹8.05 | **IDENTITY_REVIEW** | **VERIFIED** | Invoice Page 6, Row 57 reads `GANJI PINDI 100G X 250PC - Rs.20/-`. HSN `11081990` confirms plant/tapioca starch powder (Telugu: గంజి పిండి = fabric starch for cotton clothing). Printed MRP column is ₹20.00, taxable unit price is ₹8.05. No brand name or manufacturer is printed on the invoice. No brand is guessed. Identity remains flagged for store physical pack verification. |
| 5 | Washing Soda — 100g | WASHING SHODA 100G | Unspecified on Invoice (Awaiting Physical Pack) | Sodium Carbonate Laundry Soda (వాషింగ్ సోడా) | 100g | ₹20.00 | ₹5.51 | **IDENTITY_REVIEW** | **VERIFIED** | Invoice Page 6, Row 58 reads `WASHING SHODA 100G X Rs.20/-`. Item is traditional laundry washing soda / sodium carbonate powder. Printed MRP column is ₹20.00, taxable unit price is ₹5.51. The invoice does not state a manufacturer or brand name. No brand is guessed. Identity remains flagged for store physical pack verification. |

---

## 2. Metrics & Status Breakdown

- **TOTAL RESOLVED:** 1 Fully Resolved without flags (`Morelight 1L`); 2 with Brand Identity Resolved (`Morelight 1L` + `DRN Suji Rava`).
- **TOTAL STILL NEEDS_REVIEW:** 4 Products requiring store confirmation (1 for MRP conflict on `DRN Suji Rava`, 3 for Brand Identity on `Cheemala Mandu`, `Ganji Pindi`, `Washing Soda`).
- **MRP CONFLICTS:** 1 (`DRN Suji Rava 500g`: Invoice printed column `₹50.00` vs Description text `Rs.60/-`).
- **IDENTITY CONFLICTS:** 3 (`Cheemala Mandu`, `Ganji Pindi`, `Washing Soda`: Manufacturer/Brand omitted from invoice lines; no brand invented).

---

> **CRITICAL DIRECTIVES OBSERVED:**
> - Zero products imported into Supabase or the live catalogue.
> - PDF #2 has not been touched.
> - Categories and selling prices remain unassigned (`selling_price = NULL`).
> - No AI images generated.
