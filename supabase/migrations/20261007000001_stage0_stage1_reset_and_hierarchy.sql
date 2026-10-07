-- Migration: 20261007000001_stage0_stage1_reset_and_hierarchy.sql
-- Purpose:
-- 1. Reset unconfirmed prices and enforce is_verified flag on products.
-- 2. Add category parent-child hierarchy (parent_id).
-- 3. Create brands table and product family/pack-size variant relations.

-- Step 1: Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Categories Hierarchy
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Step 3: Product Verification & Hierarchy Fields
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_confirmed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_price_notes TEXT,
  ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS family_id TEXT,
  ADD COLUMN IF NOT EXISTS pack_size TEXT;

CREATE INDEX IF NOT EXISTS idx_products_is_verified ON products(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_family_id ON products(family_id);

-- Step 4: Reset all prices derived from PDF until confirmed by owner spreadsheet
UPDATE products 
SET 
  price = 0,
  original_price = 0,
  price_confirmed = false,
  is_verified = false;
