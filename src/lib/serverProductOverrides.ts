import fs from 'fs';
import path from 'path';
import { executeSupabaseWithFallback, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

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
  isActive?: boolean;
  is_active?: boolean;
  deleted?: boolean;
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

const CACHE_TTL_MS = 60000; // 60-second in-memory cache to eliminate repeated Supabase queries

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
          if (item && item.id && !item.deleted && !(item as any).is_deleted && item.isActive !== false) {
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
      const list = Array.from(overrides.values()).filter(
        (item) => !item.deleted && !(item as any).is_deleted && item.isActive !== false
      );
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
      if (!cache.has(k) || !cache.get(k)?.deleted) {
        cache.set(k, v);
      }
    }

    // 2. Fetch from Supabase cloud (Shared across all Vercel Lambdas)
    if (isSupabaseConfigured()) {
      try {
        // Query verified key-value store via push_subscriptions directly (0 error overhead)
        const { data: kvData, error: kvError } = await executeSupabaseWithFallback(async (client) => {
          return client
            .from('push_subscriptions')
            .select('*')
            .like('endpoint', 'product_override:%');
        });

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
   * Invalidate in-memory cache to trigger fresh fetch on next call.
   */
  invalidateCache(): void {
    global.__g1ProductOverridesLastSync = 0;
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
      deleted: false,
      is_active: override.inStock !== false,
      isActive: override.inStock !== false,
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
        const kvRes = await executeSupabaseWithFallback(async (client) => {
          return client.from('push_subscriptions').upsert({
            endpoint: `product_override:${merged.id}`,
            keys: merged,
            role: 'product_override',
          });
        });

        if (kvRes.error) {
          console.error('[serverProductOverrides] Save error:', kvRes.error);
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
   * Delete an override permanently by setting a tombstone and removing it from cloud and cache.
   */
  async deleteOverride(id: string): Promise<boolean> {
    const cache = global.__g1ProductOverrides!;
    const tombstone: ProductOverride = {
      id,
      deleted: true,
      inStock: false,
      stockCount: 0,
      isActive: false,
      is_active: false,
      updatedAt: new Date().toISOString(),
    };

    cache.set(id, tombstone);
    global.__g1ProductOverridesLastSync = Date.now();

    persistDiskOverrides(cache);

    if (isSupabaseConfigured()) {
      try {
        // Persist tombstone to push_subscriptions so restarts/other lambdas know it was deleted
        await executeSupabaseWithFallback(async (client) => {
          return client.from('push_subscriptions').upsert({
            endpoint: `product_override:${id}`,
            keys: tombstone,
            role: 'product_override',
          });
        });
      } catch (err) {
        console.warn('[serverProductOverrides] Error deleting from Supabase:', err);
      }
    }

    return true;
  },

  /**
   * Helper to apply override fields to a Product object.
   */
  applyToProduct(product: any, override: ProductOverride): any {
    if (override.deleted || (override as any).is_deleted || override.isActive === false) {
      return {
        ...product,
        isActive: false,
        inStock: false,
        stockCount: 0,
        deleted: true,
      };
    }

    const priceNum = override.price !== undefined ? override.price : product.price;
    const mrpNum = override.originalPrice !== undefined ? override.originalPrice : product.originalPrice;
    const discount = mrpNum > priceNum && mrpNum > 0
      ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
      : (override.price !== undefined ? 0 : product.discountPercentage);

    let updatedVariants = product.variants;

    if (override.variants && Array.isArray(override.variants) && override.variants.length > 0) {
      if (override.variants.length > 1 || !product.variants || product.variants.length <= 1) {
        updatedVariants = override.variants;
      } else {
        // Single-variant override on a multi-variant catalog item: merge the single variant update without wiping others
        const singleV = override.variants[0];
        updatedVariants = product.variants.map((v: any, i: number) => {
          const isMatch =
            (singleV.id && v.id === singleV.id) ||
            (singleV.size_label && v.size_label && singleV.size_label.toLowerCase().trim() === v.size_label.toLowerCase().trim()) ||
            i === 0;
          if (isMatch) {
            return {
              ...v,
              ...singleV,
              ...(singleV.price !== undefined && { price: singleV.price }),
              ...(singleV.mrp !== undefined && { mrp: singleV.mrp }),
              ...(singleV.stock !== undefined && { stock: singleV.stock }),
              ...(singleV.image_url && { image_url: singleV.image_url }),
            };
          }
          return v;
        });
      }
    } else if (product.variants && product.variants.length > 0) {
      updatedVariants = product.variants.map((v: any, i: number) => {
        if (i === 0 || (v.size_label && override.unit && v.size_label.toLowerCase().trim() === override.unit.toLowerCase().trim())) {
          return {
            ...v,
            ...(override.price !== undefined && { price: override.price }),
            ...(override.originalPrice !== undefined && { mrp: override.originalPrice }),
            ...(override.stockCount !== undefined && { stock: override.stockCount }),
          };
        }
        return v;
      });
    }

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
      isActive: override.inStock !== false && (override.isActive as any) !== false,
      variants: updatedVariants,
    };
  },
};
