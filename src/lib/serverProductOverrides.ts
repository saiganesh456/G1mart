import fs from 'fs';
import path from 'path';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

export interface ProductOverride {
  id: string;
  name?: string;
  brand?: string;
  unit?: string;
  category?: string;
  subCategory?: string;
  price?: number;
  originalPrice?: number;
  stockCount?: number;
  inStock?: boolean;
  imageUrl?: string;
  imageStatus?: string;
  variants?: any[];
  updatedAt?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __g1ProductOverrides: Map<string, ProductOverride> | undefined;
  // eslint-disable-next-line no-var
  var __g1ProductOverridesLastSync: number | undefined;
}

if (!global.__g1ProductOverrides) {
  global.__g1ProductOverrides = new Map<string, ProductOverride>();
}
if (!global.__g1ProductOverridesLastSync) {
  global.__g1ProductOverridesLastSync = 0;
}

const CACHE_TTL_MS = 5000; // 5-second cache to balance instant freshness with zero latency

function getDiskPath(): string | null {
  if (path && typeof process !== 'undefined' && process.cwd) {
    return path.join(process.cwd(), 'data', 'g1mart_product_overrides.json');
  }
  return null;
}

function loadDiskOverrides(): Map<string, ProductOverride> {
  const map = new Map<string, ProductOverride>();
  try {
    const filePath = getDiskPath();
    if (fs && filePath && fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.id) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    // Read-only filesystem in serverless environments (Vercel)
  }
  return map;
}

function persistDiskOverrides(overrides: Map<string, ProductOverride>): void {
  try {
    const filePath = getDiskPath();
    if (fs && path && filePath) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(overrides.values());
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
    }
  } catch (err) {
    // Read-only filesystem in serverless environments (Vercel) - safely ignored
  }
}

export const serverProductOverrides = {
  /**
   * Fetch all active product overrides.
   * Reads from in-memory cache, or fetches from Supabase / disk if TTL expired.
   */
  async getOverrides(): Promise<Map<string, ProductOverride>> {
    const now = Date.now();
    const cache = global.__g1ProductOverrides!;
    const lastSync = global.__g1ProductOverridesLastSync || 0;

    if (now - lastSync < CACHE_TTL_MS && cache.size > 0) {
      return cache;
    }

    // 1. Try disk first for local dev
    const diskMap = loadDiskOverrides();
    for (const [k, v] of diskMap.entries()) {
      cache.set(k, v);
    }

    // 2. Fetch from Supabase cloud (Shared across all Vercel Lambdas)
    if (isSupabaseConfigured()) {
      try {
        // Try dedicated product_overrides table first
        const { data, error } = await supabase.from('product_overrides').select('*');
        if (!error && Array.isArray(data)) {
          for (const row of data) {
            cache.set(row.id, {
              id: row.id,
              name: row.name ?? undefined,
              brand: row.brand ?? undefined,
              unit: row.unit ?? undefined,
              category: row.category ?? undefined,
              subCategory: row.sub_category ?? undefined,
              price: row.price !== null && row.price !== undefined ? Number(row.price) : undefined,
              originalPrice: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : undefined,
              stockCount: row.stock_count !== null && row.stock_count !== undefined ? Number(row.stock_count) : undefined,
              inStock: row.in_stock !== null && row.in_stock !== undefined ? Boolean(row.in_stock) : undefined,
              imageUrl: row.image_url ?? undefined,
              imageStatus: row.image_status ?? undefined,
              variants: row.variants ?? undefined,
              updatedAt: row.updated_at ?? undefined,
            });
          }
          global.__g1ProductOverridesLastSync = now;
          return cache;
        }

        // If product_overrides table is not yet created, use verified key-value fallback
        const { data: kvData, error: kvError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .like('endpoint', 'product_override:%');

        if (!kvError && Array.isArray(kvData)) {
          for (const row of kvData) {
            if (row.keys && typeof row.keys === 'object' && row.keys.id) {
              cache.set(row.keys.id, row.keys as ProductOverride);
            }
          }
        }
      } catch (cloudErr) {
        console.warn('[serverProductOverrides] Error fetching overrides from Supabase:', cloudErr);
      }
    }

    global.__g1ProductOverridesLastSync = now;
    return cache;
  },

  /**
   * Save a single product override to Supabase and update local cache.
   */
  async saveOverride(override: ProductOverride): Promise<boolean> {
    const cache = global.__g1ProductOverrides!;
    const existing = cache.get(override.id) || { id: override.id };
    const merged: ProductOverride = {
      ...existing,
      ...override,
      updatedAt: new Date().toISOString(),
    };

    // Update in-memory cache immediately
    cache.set(override.id, merged);
    global.__g1ProductOverridesLastSync = Date.now();

    // Persist to local disk (for dev)
    persistDiskOverrides(cache);

    // Persist to Supabase Cloud (for production / Vercel)
    if (isSupabaseConfigured()) {
      try {
        // 1. Try dedicated product_overrides table
        const tablePayload: Record<string, any> = {
          id: merged.id,
          updated_at: merged.updatedAt,
        };
        if (merged.name !== undefined) tablePayload.name = merged.name;
        if (merged.brand !== undefined) tablePayload.brand = merged.brand;
        if (merged.unit !== undefined) tablePayload.unit = merged.unit;
        if (merged.category !== undefined) tablePayload.category = merged.category;
        if (merged.subCategory !== undefined) tablePayload.sub_category = merged.subCategory;
        if (merged.price !== undefined) tablePayload.price = merged.price;
        if (merged.originalPrice !== undefined) tablePayload.original_price = merged.originalPrice;
        if (merged.stockCount !== undefined) tablePayload.stock_count = merged.stockCount;
        if (merged.inStock !== undefined) tablePayload.in_stock = merged.inStock;
        if (merged.imageUrl !== undefined) tablePayload.image_url = merged.imageUrl;
        if (merged.imageStatus !== undefined) tablePayload.image_status = merged.imageStatus;
        if (merged.variants !== undefined) tablePayload.variants = merged.variants;

        const { error } = await supabase.from('product_overrides').upsert(tablePayload);
        if (!error) {
          return true;
        }

        // 2. If table doesn't exist, use zero-setup push_subscriptions table fallback
        const { error: fallbackErr } = await supabase.from('push_subscriptions').upsert({
          endpoint: `product_override:${merged.id}`,
          keys: merged,
          role: 'product_override',
        });

        if (fallbackErr) {
          console.error('[serverProductOverrides] Fallback save error:', fallbackErr);
          return false;
        }

        return true;
      } catch (sbErr) {
        console.error('[serverProductOverrides] Error saving override to Supabase:', sbErr);
        return false;
      }
    }

    return true;
  },

  /**
   * Helper to apply override fields to a Product object.
   */
  applyToProduct(product: any, override: ProductOverride): any {
    const priceNum = override.price !== undefined ? override.price : product.price;
    const mrpNum = override.originalPrice !== undefined ? override.originalPrice : product.originalPrice;
    const discount = mrpNum > priceNum && mrpNum > 0
      ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
      : (override.price !== undefined ? 0 : product.discountPercentage);

    const updatedVariants = override.variants && Array.isArray(override.variants) && override.variants.length > 0
      ? override.variants
      : (product.variants && product.variants.length > 0)
      ? product.variants.map((v: any, i: number) => {
          if (i === 0 || (v.size_label && override.unit && v.size_label.toLowerCase() === override.unit.toLowerCase())) {
            return {
              ...v,
              ...(override.price !== undefined && { price: override.price }),
              ...(override.originalPrice !== undefined && { mrp: override.originalPrice }),
              ...(override.stockCount !== undefined && { stock: override.stockCount }),
            };
          }
          return v;
        })
      : product.variants;

    return {
      ...product,
      ...(override.name !== undefined && { name: override.name }),
      ...(override.brand !== undefined && { brand: override.brand }),
      ...(override.unit !== undefined && { unit: override.unit }),
      ...(override.category !== undefined && { category: override.category, category_id: override.category }),
      ...(override.subCategory !== undefined && { subCategory: override.subCategory, sub_category: override.subCategory }),
      ...(override.price !== undefined && { price: priceNum, priceConfirmed: priceNum > 0 }),
      ...(override.originalPrice !== undefined && { originalPrice: mrpNum }),
      discountPercentage: discount,
      ...(override.stockCount !== undefined && { stockCount: override.stockCount }),
      ...(override.inStock !== undefined && { inStock: override.inStock }),
      ...(override.imageUrl !== undefined && {
        imageUrl: override.imageUrl,
        image_url: override.imageUrl,
        image: override.imageUrl,
        imageStatus: override.imageStatus || 'VERIFIED',
        image_status: override.imageStatus || 'VERIFIED',
      }),
      variants: updatedVariants,
    };
  },
};
