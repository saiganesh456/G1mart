# G1 Mart — Catalogue Data Questions for Store Owner
**Date:** 7 October 2026  
**Audited by:** Senior Product Engineer & UX Lead  
**Rule (§9.1):** Zero Guessing. If a POS sales record lacks an explicit pack size, brand, or barcode, it is flagged here for owner verification rather than guessed.

---

## 1. Summary of Items Requiring Owner Clarification

Total catalogue items analyzed: **768**  
Items with clean pack sizes & brand names: **560**  
Items requiring owner confirmation of exact pack size or brand: **208**

Below are the priority items from invoices where brand or pack size was not explicitly verifiable from the cashier register:

| Item ID | Raw POS Name from Invoice / Register | Cleaned Name Proposal | Missing / Ambiguous Field | Question for Owner |
| :--- | :--- | :--- | :--- | :--- |
| `pdf1-056` | `Maya Agarbatti Rose Rs.50 X 60P` | Maya Rose Incense Sticks Box | Exact Stick Count / Weight in grams | Does the ₹50 box contain 60 sticks, or is it 60 boxes per master carton? |
| `pdf1-094` | `CHIMALA MANDU 100G X 250PC - Rs.20/-` | Cheemala Mandu (Ant & Insect Pest Powder) | Brand / Manufacturer | Is this local store-packaged, or from a specific brand (e.g. Laxman Rekha / Baygon / Local)? |
| `pdf1-095` | `GANJI PINDI 100G X 250PC - Rs.20/-` | Ganji Pindi (Natural Fabric Starch Powder) | Brand / Manufacturer | Is this store-packaged 100g pouch, or branded (e.g. Revive / Commercial)? |
| `pdf1-096` | `WASHING SHODA 100G X Rs.20/-` | Washing Soda (Sodium Carbonate Booster) | Brand / Manufacturer | Is this packaged under G1 Mart store brand or local bulk brand? |
| `st-007` | `BROWNIE 10RS` | Rich Chocolate Fudge Brownie Cake (Rs 10) | Pack weight in grams | What is the net weight in grams for the ₹10 brownie cake? |
| `st-009` | `KAMARKATTU JAR 200RS` | Kamarkattu Coconut Jaggery Candy Jar | Net weight or piece count | What is the total weight in grams or count of pieces in the ₹200 jar? |
| `st-011` | `MANGO FRUIT BARS JAR` | Traditional Mango Fruit Bars Candy Jar | Net weight or piece count | What is the net weight (e.g. 800g / 1kg) or piece count in this jar? |
| `jg-023` | `NIPPO AAA` | Nippo AAA Heavy Duty Batteries | Exact pack format | Is this sold as a blister pack of 2, pack of 4, or box of 10? |
| `jg-024` | `NIPPO GOLD` | Nippo Gold AA Batteries | Exact pack format | Is this sold as individual cells, pair of 2, or pack of 10? |
| `g1-prod-085`| `SANTOOR` | Santoor Sandal & Turmeric Soap | Pack size in grams | Is this single 100g, 150g, or 4x100g multipack? |

---

## 2. Action Required from Store Owner
1. **Spreadsheet Pricing Confirmation:** Provide the official price list spreadsheet to confirm selling prices (replacing all PDF calculated prices).
2. **Pack Size Clarification:** Confirm the pack sizes and piece counts for the items listed above so they can be grouped into product families with their variants.
