# G1 Mart Catalog Data Issues Log

As per project guidelines, data errors in the underlying catalog are strictly logged here and handled defensively in the UI rather than modified or guessed.

| # | Product ID | Product Name | Field | Identified Problem | UI Handling Strategy |
|---|------------|--------------|-------|--------------------|----------------------|
| 1 | `g1-177` | White Urad DAL 500g | `subCategory` | Incorrectly assigned to `Cleaners` under category `atta-rice-dal` | Subcategory filter checks prevent cleaning filters under food categories |
| 2 | `g1-179` | White Urad Dal250g | `subCategory` | Incorrectly assigned to `Cleaners` under category `atta-rice-dal` | Subcategory filter checks prevent cleaning filters under food categories |
| 3 | `g1-1072` | Rajma Seds 250g | `name` | Typo in name: "Rajma Seds" instead of "Rajma Seeds" | Displayed as-is per non-negotiables; logged for admin catalog update |
| 4 | `g1-1174` | Javva Wheat Ravva 500g | `image_url` | Pouch packshot displays "BANSI RAVA" instead of Javva Wheat Rava | Cutout packshot used without alteration; logged for darkstore photography queue |
| 5 | `g1-1196` | Idil Rava 1KG | `name` | Typo in name: "Idil Rava" instead of "Idli Rava" | Displayed as-is per non-negotiables; logged for admin catalog update |
| 6 | Various | Unbranded local staples | `brand` | Raw value is `"Local / Unbranded"` | Suppressed on product cards to prevent redundant caps label stampede |
| 7 | Various | Miscellaneous staples | `unit` | Raw value is bare `"g"`, `"unit"`, or `"1 unit"` without quantity context | Suppressed unit chip when quantity/unit are ambiguous |
| 8 | Multiple | Local flour items | `subCategory` | Items under `local-flours` tagged with `Sanitary Pads & Napkins` | Subcategory lists in category detail strictly filtered to category domain |
| 9 | Multiple | Feminine hygiene items | `subCategory` | Items under `feminine-hygiene` tagged with `Milk & Curd` | Isolated to correct category context |
| 10 | Multiple | Surface cleaners | `subCategory` | Items under `floor-surface-cleaners` tagged with `Tea & Coffee` | Excluded from food navigation |
| 11 | Multiple | Edible oils & ghee | `subCategory` | Items under `oil-ghee-masala` tagged with `Detergent Powders & Liquids` | Filtered by category domain logic |
| 12 | Multiple | Pooja items | `subCategory` | Items under `pooja-needs` tagged with `Pulses & Dal` and `Candies & Gums` | Domain-based filtering |
| 13 | Multiple | Oral care | `subCategory` | Items under `oral-care` tagged with `Tea & Coffee` | Domain-based filtering |
| 14 | Multiple | Dairy items | `subCategory` | Items under `dairy-bread-eggs` tagged with `Laundry & Detergents` | Domain-based filtering |
| 15 | Multiple | Hair care items | `subCategory` | Items under `hair-care` tagged with `Eggs` | Domain-based filtering |
| 16 | Multiple | Biscuits & bakery | `subCategory` | Items under `biscuits-bakery` tagged with `Milk & Curd` | Domain-based filtering |
| 17 | Multiple | Drinks & juices | `subCategory` | Items under `drinks-juices` tagged with `Detergent Powders & Liquids` | Domain-based filtering |
| 18 | Multiple | Sugar & salt staples | `subCategory` | Items under `sugar-salt-staples` tagged with `Sanitary Pads & Napkins` | Domain-based filtering |
| 19 | Multiple | Sweets & chocolates | `subCategory` | Items under `sweets-chocolates` tagged with `Laundry & Detergents` | Domain-based filtering |
| 20 | Multiple | Catalog baseline | `discountPercentage` | Stale flat "10% OFF" metadata on items where `originalPrice === price` | Only real calculated discounts `((mrp - price)/mrp * 100)` rendered |

Total logged catalog data anomalies: **20 items**.
