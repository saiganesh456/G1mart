-- =============================================================================
-- G1 MART — Initial Production Seed Data
-- Seed data aligned with mockData.ts and deliveryZoneService.ts
-- =============================================================================

-- 1. SEED DELIVERY ZONES
INSERT INTO public.delivery_zones (
  id, name, code, type, geographic_coverage, max_radius_km,
  estimated_min_delivery_time, estimated_max_delivery_time, estimated_delivery_time_text,
  delivery_fee, min_order_value, free_delivery_threshold, is_active, pincodes, supported_areas, description
) VALUES
(
  'zone-nellore-city',
  'Nellore City',
  'NELLORE_CITY',
  'city',
  'Nellore Municipal Corporation & Urban Center',
  10.00,
  30, 60, '30 mins - 1 hour',
  30.00, 149.00, 499.00, true,
  ARRAY['524001', '524002', '524003', '524004'],
  ARRAY['Pogathota', 'Magunta Layout', 'Stonehousepet', 'Santhapet', 'Balaji Nagar', 'VRC Centre / Trunk Road', 'Dargamitta', 'Vedayapalem', 'Haranathapuram', 'Ramalingapuram', 'Childrens Park Road', 'BV Nagar', 'Podalakur Road (City limits)', 'Fathekhanpet'],
  'Superfast doorstep delivery across Nellore City in 30 minutes to 1 hour.'
),
(
  'zone-nellore-extended-30km',
  'Nellore Extended (Within 30 km)',
  'NELLORE_RURAL_30KM',
  'rural_extended',
  'Surrounding mandals & villages within ~30 km radius of Nellore',
  30.00,
  90, 120, 'Approx. 2 hours',
  50.00, 249.00, 799.00, true,
  ARRAY['524137', '524305', '524314', '524320', '524316', '524345', '524344', '524315'],
  ARRAY['Kovur', 'Buchireddypalem', 'Indukurpet', 'Venkatachalam', 'Kodavalur', 'Podalakur (Rural)', 'Muthukur', 'Allur', 'Damaramadugu', 'Kakupalli', 'Kanuparthipadu'],
  'Doorstep grocery delivery to villages and surrounding areas within 30 km of Nellore in approx. 2 hours.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  type = EXCLUDED.type,
  delivery_fee = EXCLUDED.delivery_fee,
  free_delivery_threshold = EXCLUDED.free_delivery_threshold;

-- 2. SEED CATEGORIES
INSERT INTO public.categories (id, name, icon, description, display_order, is_active) VALUES
('fruits-vegetables', 'Fruits & Vegetables', 'Apple', 'Farm fresh fruits, leafy greens & organic vegetables', 1, true),
('dairy-bakery', 'Dairy & Bakery', 'Milk', 'Milk, curd, butter, paneer, artisanal bread & eggs', 2, true),
('rice-dal-atta', 'Rice, Dal & Atta', 'Wheat', 'Premium basmati rice, pulses, whole wheat atta & grains', 3, true),
('snacks', 'Snacks', 'Cookie', 'Chips, namkeen, cookies, chocolates & instant foods', 4, true),
('beverages', 'Beverages', 'Coffee', 'Tea, coffee, fruit juices, cold drinks & energy drinks', 5, true),
('personal-care', 'Personal Care', 'Sparkles', 'Soaps, shampoos, oral hygiene, skincare & grooming', 6, true),
('household', 'Household', 'Home', 'Detergents, surface cleaners, dishwash & paper essentials', 7, true),
('baby-care', 'Baby Care', 'Baby', 'Diapers, gentle baby wash, wipes & nourishing baby food', 8, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 3. SEED SUBCATEGORIES
INSERT INTO public.subcategories (category_id, name, slug, display_order) VALUES
('fruits-vegetables', 'Fresh Fruits', 'fresh-fruits', 1),
('fruits-vegetables', 'Daily Veggies', 'daily-veggies', 2),
('fruits-vegetables', 'Herbs & Seasonings', 'herbs-seasonings', 3),
('fruits-vegetables', 'Exotic Produce', 'exotic-produce', 4),

('dairy-bakery', 'Milk & Cream', 'milk-cream', 1),
('dairy-bakery', 'Breads & Buns', 'breads-buns', 2),
('dairy-bakery', 'Paneer & Tofu', 'paneer-tofu', 3),
('dairy-bakery', 'Eggs & Butter', 'eggs-butter', 4),

('rice-dal-atta', 'Atta & Flours', 'atta-flours', 1),
('rice-dal-atta', 'Basmati & Sona Masoori', 'basmati-sona-masoori', 2),
('rice-dal-atta', 'Organic Dals', 'organic-dals', 3),
('rice-dal-atta', 'Edible Oils', 'edible-oils', 4),

('snacks', 'Chips & Crisps', 'chips-crisps', 1),
('snacks', 'Indian Namkeen', 'indian-namkeen', 2),
('snacks', 'Biscuits & Cookies', 'biscuits-cookies', 3),
('snacks', 'Chocolates', 'chocolates', 4),

('beverages', 'Tea & Chai', 'tea-chai', 1),
('beverages', 'Instant Coffee', 'instant-coffee', 2),
('beverages', 'Cold Drinks', 'cold-drinks', 3),
('beverages', 'Juices & Syrups', 'juices-syrups', 4),

('personal-care', 'Oral Care', 'oral-care', 1),
('personal-care', 'Bath & Body', 'bath-body', 2),
('personal-care', 'Hair Care', 'hair-care', 3),
('personal-care', 'Face Wash', 'face-wash', 4),

('household', 'Laundry Detergents', 'laundry-detergents', 1),
('household', 'Dishwashing', 'dishwashing', 2),
('household', 'Floor Cleaners', 'floor-cleaners', 3),
('household', 'Pooja Needs', 'pooja-needs', 4),

('baby-care', 'Diapers & Wipes', 'diapers-wipes', 1),
('baby-care', 'Baby Skin & Hair', 'baby-skin-hair', 2),
('baby-care', 'Baby Food & Formula', 'baby-food-formula', 3)
ON CONFLICT (category_id, name) DO NOTHING;

-- 4. SEED PRODUCTS
INSERT INTO public.products (
  id, name, brand, category_id, sub_category, unit, price, original_price,
  discount_percentage, in_stock, stock_count, image, description, rating, reviews_count, is_popular, is_best_deal
) VALUES
(
  'prod-1',
  'Tata Salt Vacuum Evaporated Iodised Salt',
  'Tata',
  'rice-dal-atta',
  'Atta & Flours',
  '1 kg',
  26.00, 28.00, 7, true, 90,
  '/products/prod-1.jpg',
  'Tata Salt vacuum evaporated iodised salt enriched with vital iodine for mental and physical wellness. Free-flowing, pure and hygienically packed.',
  4.9, 420, true, false
),
(
  'prod-2',
  'Aashirvaad Superior MP Sharbati Whole Wheat Atta',
  'Aashirvaad',
  'rice-dal-atta',
  'Atta & Flours',
  '5 kg',
  285.00, 325.00, 12, true, 45,
  '/products/prod-2.jpg',
  'Made from the finest heavy grains of Sharbati wheat grown in the fertile soils of Madhya Pradesh. Delivers softer, fluffier rotis with superior aroma.',
  4.8, 860, true, true
),
(
  'prod-3',
  'Fortune Sunlite Refined Sunflower Oil Pouch',
  'Fortune',
  'rice-dal-atta',
  'Edible Oils',
  '1 L',
  138.00, 155.00, 11, true, 60,
  '/products/prod-3.jpg',
  'Light, digestible and enriched with Vitamins A & D. Ideal for everyday Indian cooking, sautéing and frying.',
  4.7, 340, true, false
),
(
  'prod-4',
  'Amul Taaza Homogenised Toned Milk',
  'Amul',
  'dairy-bakery',
  'Milk & Cream',
  '1 L Tetra Pak',
  72.00, 75.00, 4, true, 120,
  '/products/prod-4.jpg',
  'Pasteurised toned milk with 3.0% fat and 8.5% SNF. Safe, bacteria-free and convenient with extended shelf life.',
  4.9, 1240, true, false
),
(
  'prod-5',
  'Britannia 100% Whole Wheat Brown Bread',
  'Britannia',
  'dairy-bakery',
  'Breads & Buns',
  '400 g',
  48.00, 52.00, 8, true, 35,
  '/products/prod-5.jpg',
  'Made with 100% whole wheat flour and zero maida. High in dietary fibre, baked fresh daily for breakfast sandwiches and toast.',
  4.6, 210, false, false
),
(
  'prod-6',
  'Amul Pasteurised Salted Table Butter',
  'Amul',
  'dairy-bakery',
  'Eggs & Butter',
  '500 g',
  280.00, 295.00, 5, true, 40,
  '/products/prod-6.jpg',
  'The iconic Utterly Butterly Delicious table butter made from pure fresh cow and buffalo cream. Perfect for parathas, toast and baking.',
  4.9, 990, true, true
),
(
  'prod-7',
  'Daawat Rozana Gold Basmati Rice',
  'Daawat',
  'rice-dal-atta',
  'Basmati & Sona Masoori',
  '5 kg',
  410.00, 499.00, 18, true, 28,
  '/products/prod-7.jpg',
  'Aged basmati rice grains with distinct aroma, pearly white slender texture and fluffy separation. Ideal for daily biryani and pulav.',
  4.7, 430, true, true
),
(
  'prod-8',
  'Tata Sampann Unpolished Toor Dal',
  'Tata Sampann',
  'rice-dal-atta',
  'Organic Dals',
  '1 kg',
  175.00, 195.00, 10, true, 55,
  '/products/prod-8.jpg',
  'Unpolished toor dal that undergoes zero artificial water, oil or marble polishing, retaining wholesome dietary fibre and authentic taste.',
  4.8, 310, false, false
),
(
  'prod-9',
  'Fresh Farm Cavendish Bananas',
  'G1 Farm Direct',
  'fruits-vegetables',
  'Fresh Fruits',
  '1 kg (5-6 pcs)',
  49.00, 60.00, 18, true, 80,
  '/products/prod-9.jpg',
  'Sweet, uniformly ripened Cavendish bananas sourced directly from Andhra orchards. Rich in potassium and energy.',
  4.8, 520, true, true
),
(
  'prod-10',
  'Farm Fresh Country Hybrid Tomatoes',
  'G1 Farm Direct',
  'fruits-vegetables',
  'Daily Veggies',
  '1 kg',
  34.00, 45.00, 24, true, 110,
  '/products/prod-10.jpg',
  'Plump, red and tangy country hybrid tomatoes harvest-picked at dawn. Perfect for rasam, sambar, curries and salads.',
  4.7, 680, true, true
),
(
  'prod-11',
  'Fresh Shimla Royal Delicious Red Apples',
  'G1 Farm Direct',
  'fruits-vegetables',
  'Fresh Fruits',
  '1 kg (4-5 pcs)',
  179.00, 220.00, 19, true, 40,
  '/products/prod-11.jpg',
  'Crisp, juicy and fragrant Royal Delicious apples hand-selected from Himachal orchards. Rich in antioxidants and vitamins.',
  4.9, 390, true, true
),
(
  'prod-12',
  'Farm Fresh Red Onions (Medium-Large)',
  'G1 Farm Direct',
  'fruits-vegetables',
  'Daily Veggies',
  '1 kg',
  38.00, 48.00, 21, true, 150,
  '/products/prod-12.jpg',
  'Firm, thin-skinned red onions with pungent aromatic flavour. Essential staple for daily Indian gravies, tadkas and salads.',
  4.8, 770, true, true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  in_stock = EXCLUDED.in_stock,
  stock_count = EXCLUDED.stock_count;

-- 5. SEED COUPONS
INSERT INTO public.coupons (code, description, discount_amount, discount_percent, min_order, max_discount, is_active) VALUES
('G1FRESH', 'Flat ₹50 OFF on orders above ₹299', 50.00, NULL, 299.00, 50.00, true),
('NELLORE50', 'Flat ₹50 OFF for Nellore residents on orders above ₹399', 50.00, NULL, 399.00, 50.00, true),
('FESTIVE100', 'Flat ₹100 OFF on mega grocery orders above ₹999', 100.00, NULL, 999.00, 100.00, true),
('SAVE10', '10% instant discount up to ₹75 on orders above ₹499', NULL, 10, 499.00, 75.00, true)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_amount = EXCLUDED.discount_amount,
  min_order = EXCLUDED.min_order;

-- 6. SEED BANNERS
INSERT INTO public.banners (id, title, subtitle, tag, image, cta, category_id, display_order, is_active) VALUES
(
  1,
  'Fresh groceries delivered fast',
  'Farm fresh produce directly to your doorstep in 30-60 mins across Nellore',
  'SUPER FAST',
  '/assets/images/g1_grocery_delivery_hero_1790614094753.jpg',
  'Order Now',
  'fruits-vegetables',
  1,
  true
),
(
  2,
  'Special offers on daily essentials',
  'Save up to 25% on atta, rice, dals, oils & household needs',
  'DAILY SAVINGS',
  '/assets/images/g1_special_offers_banner_1790614114336.jpg',
  'View Deals',
  'rice-dal-atta',
  2,
  true
),
(
  3,
  'Free delivery on orders above ₹499',
  'Zero delivery charges on eligible orders across Nellore',
  'ZERO FEE',
  '/assets/images/g1_dairy_bakery_showcase_1790614143664.jpg',
  'Shop Now',
  'dairy-bakery',
  3,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  tag = EXCLUDED.tag;

-- 7. SEED INITIAL SAMPLE RIDER
INSERT INTO public.riders (id, name, phone, vehicle_number, rating, current_location, is_active) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Raju Varma',
  '+91 94401 23456',
  'AP 26 EQ 4421 (Hero Splendor)',
  4.90,
  'Trunk Road, Pogathota, Nellore Hub',
  true
)
ON CONFLICT (id) DO NOTHING;
