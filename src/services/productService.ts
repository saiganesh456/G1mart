import { Product, ProductVariant, Category, Section } from '../types';
import { DEMO_CATEGORIES, DEMO_SECTIONS } from '../data/demo-seed';
import { resolveLegacyId } from '../lib/legacyIdMap';

// ---------------------------------------------------------------------------
// Load migrated JSON data (1 053 products + 1 231 variants) as server-side module
// These are plain JSON files read at build-time / server startup.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MIGRATED_PRODUCTS: Array<{
  id: string;
  name: string;
  brand_id?: string | null;
  category_id?: string | null;
  image_url?: string | null;
}> = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../data/migrated_products.json');
  } catch {
    return [];
  }
})();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MIGRATED_VARIANTS: ProductVariant[] = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../data/migrated_product_variants.json');
  } catch {
    return [];
  }
})();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MIGRATED_BRANDS: Array<{ id: string; name: string; logo_url?: string | null }> = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../data/migrated_brands.json');
  } catch {
    return [];
  }
})();

// Build lookup maps once
const brandNameById = new Map<string, string>(MIGRATED_BRANDS.map((b) => [b.id, b.name]));
const variantsByProductId = new Map<string, ProductVariant[]>();
for (const v of MIGRATED_VARIANTS) {
  if (!variantsByProductId.has(v.product_id)) variantsByProductId.set(v.product_id, []);
  variantsByProductId.get(v.product_id)!.push(v);
}

/**
 * Convert a migrated_products.json row → Product shape used across the storefront.
 */
function mapMigratedProduct(row: typeof MIGRATED_PRODUCTS[number]): Product {
  const brandName = brandNameById.get(row.brand_id ?? '') || (row as any).brand || 'Local / Unbranded';
  const variants = variantsByProductId.get(row.id) || [];
  const cheapest = variants.length > 0 ? variants.reduce((a, b) => (a.price <= b.price ? a : b)) : null;

  const price = cheapest?.price ?? 0;
  const mrp = cheapest?.mrp ?? price;
  const inStock = variants.length === 0 || variants.some((v) => v.stock > 0);
  const discount =
    mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return {
    id: row.id,
    name: row.name,
    brand: brandName,
    brand_id: row.brand_id ?? null,
    category: row.category_id ?? '',
    category_id: row.category_id ?? null,
    subCategory: (row as any).sub_category || (row as any).subCategory || undefined,
    unit: cheapest?.size_label ?? '1 unit',
    price,
    priceConfirmed: price > 0,
    originalPrice: mrp,
    discountPercentage: discount,
    inStock,
    stockCount: variants.reduce((s, v) => s + v.stock, 0),
    image: row.image_url ?? '/products/placeholder.svg',
    image_url: row.image_url ?? null,
    imageUrl: row.image_url ?? null,
    image_path: row.image_url ?? undefined,
    image_source: row.image_url ? 'manufacturer' : 'placeholder',
    image_status: row.image_url ? 'VERIFIED' : 'missing',
    imageStatus: row.image_url ? 'VERIFIED' : 'missing',
    description: `${brandName} — ${row.name}`,
    rating: 4.8,
    reviewsCount: 12,
    isPopular: false,
    isBestDeal: false,
    isActive: true,
    is_verified: true,
    variants,
  };
}

export const MIGRATED_PRODUCT_LIST: Product[] = MIGRATED_PRODUCTS.map(mapMigratedProduct);

function mapDbRowToProduct(row: any, fallback?: Product): Product {
  const priceNum = (row.price !== null && row.price !== undefined && Number(row.price) > 0) 
    ? Number(row.price) 
    : (fallback?.price || 0);
  const origPriceNum = (row.original_price !== null && row.original_price !== undefined && Number(row.original_price) > 0)
    ? Number(row.original_price)
    : (fallback?.originalPrice || priceNum);
  const isConfirmed = Boolean(
    (row.price !== null && row.price !== undefined && Number(row.price) > 0) || 
    fallback?.priceConfirmed
  );
  const discount = origPriceNum > priceNum && origPriceNum > 0
    ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
    : 0;

  // Check if DB image_url is a broken legacy path
  const isLegacyBrokenUrl = typeof row.image_url === 'string' && row.image_url.includes('/product-images/products/');

  // Use verified local image URL if verified in catalog, else clean placeholder if broken
  let finalImageUrl: string | null = null;
  let finalImage: string = '/products/placeholder.svg';
  let finalStatus = fallback?.imageStatus || row.image_status || 'NEEDS_REVIEW';

  if (fallback?.imageStatus === 'VERIFIED' && fallback.imageUrl) {
    finalImageUrl = fallback.imageUrl;
    finalImage = fallback.imageUrl;
    finalStatus = 'VERIFIED';
  } else if (!isLegacyBrokenUrl && row.image_url) {
    finalImageUrl = row.image_url;
    finalImage = row.image_url;
  } else if (fallback?.image) {
    finalImage = fallback.image;
  }

  return {
    id: row.id || fallback?.id,
    source_item_no: row.source_item_no ?? fallback?.source_item_no ?? fallback?.itemNumber,
    source_name: row.source_name ?? fallback?.source_name ?? fallback?.rawName,
    name: fallback?.name || row.name,
    brand: fallback?.brand || row.brand || '',
    category: fallback?.category || row.category_id || '',
    subCategory: row.sub_category || fallback?.subCategory,
    variant: fallback?.variant || row.variant || undefined,
    unit: fallback?.unit || row.unit || '1 unit',
    price: priceNum,
    priceConfirmed: isConfirmed,
    originalPrice: origPriceNum,
    discountPercentage: discount,
    inStock: Boolean(row.in_stock ?? fallback?.inStock ?? true),
    stockCount: Number(row.stock_count || fallback?.stockCount || 15),
    image_url: finalImageUrl,
    imageUrl: finalImageUrl,
    image: finalImage,
    image_path: finalImageUrl || undefined,
    image_source: finalStatus === 'VERIFIED' ? 'manufacturer' : 'placeholder',
    image_license: finalStatus === 'VERIFIED' ? 'Brand Pack' : null,
    image_status: finalStatus,
    imageStatus: finalStatus,
    image_match_note: row.image_match_note || fallback?.image_match_note,
    description: fallback?.description || row.description || '',
    rating: Number(row.rating || fallback?.rating || 4.8),
    reviewsCount: Number(row.reviews_count || fallback?.reviewsCount || 12),
    isPopular: Boolean(fallback?.isPopular ?? row.is_popular),
    isBestDeal: Boolean(fallback?.isBestDeal ?? row.is_best_deal),
    sku: row.sku || undefined,
    slug: row.slug || undefined,
    isActive: Boolean(row.is_active ?? fallback?.isActive ?? true),
    itemNumber: row.source_item_no ?? fallback?.itemNumber,
    rawName: row.source_name ?? fallback?.rawName,
  };
}

export const productService = {
  /**
   * Fetch all active categories from Supabase (with fallback to demo categories)
   */
  async getSections(): Promise<Section[]> {
    return DEMO_SECTIONS;
  },

  /**
   * Fetch all active categories with verified products only
   */
  async getCategories(): Promise<Category[]> {
    try {
      const verifiedProducts = await this.getProducts();
      const productCountMap = new Map<string, number>();
      verifiedProducts.forEach((p) => {
        const catKey = p.category_id || p.category;
        if (catKey) {
          productCountMap.set(catKey, (productCountMap.get(catKey) || 0) + 1);
        }
      });

      const populated = DEMO_CATEGORIES.map((cat) => ({
        ...cat,
        itemCount: productCountMap.get(cat.id) || 0,
      }));

      // Only show categories that have verified products
      const activeOnly = populated.filter((cat) => (cat.itemCount || 0) > 0);
      return activeOnly.length > 0 ? activeOnly : DEMO_CATEGORIES;
    } catch (err) {
      console.warn('[G1 Mart ProductService] getCategories fallback:', err);
      return DEMO_CATEGORIES;
    }
  },

  /**
   * Fetch canonical products.
   * MIGRATED_PRODUCT_LIST is the ONLY product source.
   */
  async getProducts(): Promise<Product[]> {
    return MIGRATED_PRODUCT_LIST;
  },

  /**
   * Fetch all products (Admin use)
   */
  async getAllProductsRaw(): Promise<Product[]> {
    return MIGRATED_PRODUCT_LIST;
  },

  /**
   * Fetch a single product by canonical ID, legacy ID, or slug.
   * Uses legacy ID resolution map so past links/orders work seamlessly.
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!id) return null;
    const canonicalId = resolveLegacyId(id);
    const migrated = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId || p.id === id);
    if (migrated) return migrated;
    const bySlug = MIGRATED_PRODUCT_LIST.find((p) => p.slug === id || p.slug === canonicalId);
    return bySlug || null;
  },

  /**
   * Get variants for a specific product by product ID
   */
  getVariantsForProduct(productId: string): ProductVariant[] {
    const canonicalId = resolveLegacyId(productId);
    return variantsByProductId.get(canonicalId) ?? variantsByProductId.get(productId) ?? [];
  },

  /**
   * Get a single variant by ID
   */
  getVariantById(variantId: string): ProductVariant | null {
    return MIGRATED_VARIANTS.find((v) => v.id === variantId) ?? null;
  },

  /**
   * Fetch products by category ID
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const all = await this.getProducts();
    return all.filter((p) => p.category === categoryId || p.category_id === categoryId);
  },

  /**
   * Update product image URL and status
   */
  async updateProductImage(
    productId: string,
    imageUrl: string,
    imageStatus: 'VERIFIED' | 'PENDING' | 'missing' = 'VERIFIED'
  ): Promise<boolean> {
    const canonicalId = resolveLegacyId(productId);
    const prod = MIGRATED_PRODUCT_LIST.find((p) => p.id === canonicalId || p.id === productId);
    if (prod) {
      prod.imageUrl = imageUrl;
      prod.image = imageUrl;
      prod.image_url = imageUrl;
      prod.imageStatus = imageStatus;
      prod.image_status = imageStatus;
      return true;
    }
    return false;
  },

  /**
   * Search products with typo-tolerance, brand matching, and Telugu/synonym expansion
   */
  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    const all = await this.getProducts();
    if (!q) return all;

    const { DEFAULT_SEARCH_SYNONYMS } = await import('../data/searchSynonyms');
    
    // Check if query or tokens match any synonym terms
    const expandedTokens = new Set<string>();
    expandedTokens.add(q);
    q.split(/\s+/).forEach((tok) => expandedTokens.add(tok));

    DEFAULT_SEARCH_SYNONYMS.forEach((item) => {
      if (q.includes(item.term) || item.synonyms.some((s) => q.includes(s))) {
        expandedTokens.add(item.term);
        item.synonyms.forEach((s) => expandedTokens.add(s));
      }
    });

    const tokens = Array.from(expandedTokens);

    return all.filter((p) => {
      const name = p.name.toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const sub = (p.subCategory || '').toLowerCase();
      const unit = (p.unit || '').toLowerCase();
      const raw = (p.rawName || '').toLowerCase();

      // Direct substring match
      if (name.includes(q) || brand.includes(q) || cat.includes(q) || sub.includes(q) || raw.includes(q)) {
        return true;
      }

      // Check expanded synonym tokens
      return tokens.some((token) => 
        name.includes(token) || 
        brand.includes(token) || 
        cat.includes(token) || 
        sub.includes(token) ||
        unit.includes(token)
      );
    });
  },

  async updateProduct(product: Product): Promise<boolean> {
    const idx = MIGRATED_PRODUCT_LIST.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      MIGRATED_PRODUCT_LIST[idx] = product;
      return true;
    }
    return false;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    const newProd = {
      ...product,
      id: `g1-p${String(MIGRATED_PRODUCT_LIST.length + 1).padStart(4, '0')}`,
    } as Product;
    MIGRATED_PRODUCT_LIST.unshift(newProd);
    return newProd;
  },
};
