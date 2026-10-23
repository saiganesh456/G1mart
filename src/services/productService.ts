import { Product, ProductVariant, Category, Section } from '../types';
import { DEMO_CATEGORIES, DEMO_SECTIONS } from '../data/demo-seed';
import { resolveLegacyId } from '../lib/legacyIdMap';
import { serverProductOverrides } from '../lib/serverProductOverrides';

export function normalizeCategory(cat?: string | null): string {
  if (!cat) return 'atta-rice-dal';
  const c = cat.trim().toLowerCase();
  const map: Record<string, string> = {
    'grocery-staples': 'atta-rice-dal',
    'staples': 'atta-rice-dal',
    'atta': 'atta-rice-dal',
    'rice': 'atta-rice-dal',
    'snacks-beverages': 'chips-namkeen',
    'household-cleaning': 'floor-surface-cleaners',
    'cleaning-household': 'floor-surface-cleaners',
    'pooja-essentials': 'pooja-needs',
    'personal-care': 'soaps-bath',
  };
  return map[c] || c;
}

// ---------------------------------------------------------------------------
// Load migrated JSON data (1 043 products + 1 231 variants) as server-side module
// These are plain JSON files read at build-time / server startup.
// ---------------------------------------------------------------------------
import migratedProductsData from '../../data/migrated_products.json';
import migratedVariantsData from '../../data/migrated_product_variants.json';
import migratedBrandsData from '../../data/migrated_brands.json';

const MIGRATED_PRODUCTS: Array<{
  id: string;
  name: string;
  brand_id?: string | null;
  category_id?: string | null;
  image_url?: string | null;
}> = migratedProductsData;

const MIGRATED_VARIANTS: ProductVariant[] = migratedVariantsData as ProductVariant[];

const MIGRATED_BRANDS: Array<{ id: string; name: string; logo_url?: string | null }> = migratedBrandsData;

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
  let brandName = (row as any).brand || brandNameById.get(row.brand_id ?? '');
  if (!brandName || brandName === 'Local / Unbranded') {
    if (row.name?.startsWith('G1 Mart') || row.name?.startsWith('G1Mart') || (row as any).brand === 'G1 Mart') {
      brandName = 'G1 Mart';
    } else {
      brandName = 'Local / Unbranded';
    }
  }
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
    image_source: ((row as any).image_source || (row.image_url ? 'manufacturer' : 'placeholder')) as any,
    image_license: (row as any).image_license ?? null,
    image_status: (row.image_url ? 'verified' : 'missing') as any,
    imageStatus: (row.image_url ? 'verified' : 'missing') as any,
    barcode: (row as any).barcode || undefined,
    description: `${brandName} — ${row.name}`,
    rating: 4.8,
    reviewsCount: 12,
    isPopular: false,
    isBestDeal: false,
    isActive: (row as any).is_active !== false && (row as any).isActive !== false,
    is_verified: true,
    variants,
  };
}

function isG1MartOrLocalBrand(brand?: string | null): boolean {
  if (!brand) return true;
  const b = brand.trim().toLowerCase();
  return (
    b === 'g1 mart' ||
    b === 'g1mart' ||
    b === 'g1 mart fresh' ||
    b === 'g1 mart loose staples' ||
    b === 'g1 mart hygiene' ||
    b === 'g1 mart utility' ||
    b === 'g1 mart puja' ||
    b === 'g1 mart puja essentials' ||
    b === 'g1 mart kitchenware' ||
    b === 'local / unbranded' ||
    b === 'unbranded' ||
    b === 'staples' ||
    b.startsWith('g1 mart') ||
    b.startsWith('g1mart')
  );
}

function getProductBrandTier(brand?: string | null, name?: string | null): number {
  const b = (brand || '').trim().toLowerCase();
  const n = (name || '').trim().toLowerCase();
  if (
    isG1MartOrLocalBrand(b) ||
    b.includes('g1') ||
    b.includes('g1mart') ||
    n.startsWith('g1 mart') ||
    n.startsWith('g1mart')
  ) {
    return 1;
  }
  if (b.includes('tata') || n.includes('tata')) {
    return 3;
  }
  return 2;
}

export const MIGRATED_PRODUCT_LIST: Product[] = MIGRATED_PRODUCTS.map(mapMigratedProduct).sort((a, b) => {
  const aCat = a.category_id || a.category;
  const bCat = b.category_id || b.category;
  if (aCat && bCat && aCat === bCat) {
    const aSub = a.subCategory || (a as any).sub_category || '';
    const bSub = b.subCategory || (b as any).sub_category || '';
    if (aSub === bSub) {
      const isDal = aCat === 'local-dals' || aCat === 'dals-pulses';
      if (isDal) {
        const tierA = getProductBrandTier(a.brand, a.name);
        const tierB = getProductBrandTier(b.brand, b.name);
        if (tierA !== tierB) {
          return tierA - tierB;
        }
      } else {
        // In all other categories, top brands are top priority (private label is placed below top brands)
        const aIsG1 = isG1MartOrLocalBrand(a.brand) || (a.name || '').toLowerCase().startsWith('g1 mart');
        const bIsG1 = isG1MartOrLocalBrand(b.brand) || (b.name || '').toLowerCase().startsWith('g1 mart');
        if (aIsG1 !== bIsG1) {
          return aIsG1 ? 1 : -1;
        }
      }
      const aHasImg = a.image_url && !a.image_url.includes('placeholder') ? 1 : 0;
      const bHasImg = b.image_url && !b.image_url.includes('placeholder') ? 1 : 0;
      if (aHasImg !== bHasImg) return bHasImg - aHasImg;
    }
  }
  return 0;
});

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
   * Synchronize dynamic product overrides from Supabase into MIGRATED_PRODUCT_LIST.
   * Updates existing products and registers newly created admin products into customer catalog.
   */
  async syncOverrides(): Promise<void> {
    try {
      const overrides = await serverProductOverrides.getOverrides();
      if (!overrides || overrides.size === 0) return;

      for (const [id, override] of overrides.entries()) {
        const idx = MIGRATED_PRODUCT_LIST.findIndex((p) => p.id === id);
        if (idx !== -1) {
          MIGRATED_PRODUCT_LIST[idx] = serverProductOverrides.applyToProduct(MIGRATED_PRODUCT_LIST[idx], override);
          if (MIGRATED_PRODUCT_LIST[idx].variants && MIGRATED_PRODUCT_LIST[idx].variants!.length > 0) {
            variantsByProductId.set(id, MIGRATED_PRODUCT_LIST[idx].variants!);
          }
        } else if (override.name) {
          // Brand new product created in Admin console - register for storefront & customer views
          const priceNum = Number(override.price) || 0;
          const mrpNum = Number(override.originalPrice) || priceNum;
          const stockNum = override.stockCount !== undefined ? Number(override.stockCount) : 15;
          const img = override.imageUrl || '/products/placeholder.svg';
          const catId = normalizeCategory(override.category || (override as any).category_id);
          const brandName = override.brand || 'G1 Mart';

          let subCat = override.subCategory;
          if (!subCat) {
            const catCfg = DEMO_CATEGORIES.find((c) => c.id === catId);
            if (catCfg && catCfg.subcategories && catCfg.subcategories.length > 0) {
              subCat = catCfg.subcategories[0];
            }
          }

          const newProd: Product = {
            id: override.id,
            name: override.name,
            brand: brandName,
            category: catId,
            category_id: catId,
            subCategory: subCat,
            unit: override.unit || '1 unit',
            price: priceNum,
            priceConfirmed: priceNum > 0,
            originalPrice: mrpNum,
            discountPercentage: mrpNum > priceNum && mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
            stockCount: stockNum,
            inStock: override.inStock !== false && stockNum > 0,
            image: img,
            image_url: img,
            imageUrl: img,
            image_path: img,
            image_source: 'manufacturer',
            image_status: (override.imageStatus as any) || 'verified',
            imageStatus: (override.imageStatus as any) || 'verified',
            description: `${brandName} — ${override.name}`,
            rating: 4.8,
            reviewsCount: 1,
            isPopular: true,
            isActive: override.inStock !== false,
            variants: override.variants || [
              {
                id: `${override.id}-v1`,
                product_id: override.id,
                size_label: override.unit || '1 unit',
                price: priceNum,
                mrp: mrpNum,
                stock: stockNum,
                image_url: img,
              },
            ],
          };

          MIGRATED_PRODUCT_LIST.unshift(newProd);
          if (newProd.variants && newProd.variants.length > 0) {
            variantsByProductId.set(override.id, newProd.variants);
          }
        }
      }
    } catch (err) {
      console.warn('[productService] syncOverrides error:', err);
    }
  },

  /**
   * Fetch canonical products.
   * MIGRATED_PRODUCT_LIST with persistent overrides applied.
   */
  async getProducts(): Promise<Product[]> {
    await this.syncOverrides();
    return MIGRATED_PRODUCT_LIST.filter((p) => p.isActive !== false);
  },

  /**
   * Fetch all products (Admin use)
   */
  async getAllProductsRaw(): Promise<Product[]> {
    await this.syncOverrides();
    return MIGRATED_PRODUCT_LIST;
  },

  /**
   * Fetch a single product by canonical ID, legacy ID, or slug.
   * Uses legacy ID resolution map so past links/orders work seamlessly.
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!id) return null;
    await this.syncOverrides();
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
    const target = normalizeCategory(categoryId).toLowerCase();
    return all.filter((p) => {
      const rawCat = (p.category_id || p.category || '').toLowerCase();
      return normalizeCategory(rawCat) === target || rawCat === target;
    });
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
      await serverProductOverrides.saveOverride({
        id: prod.id,
        imageUrl,
        imageStatus,
      });
      return true;
    }
    return false;
  },

  /**
   * Search products with quick-commerce accuracy (prefix boost, multi-token AND matching, Telugu synonyms)
   */
  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim();
    const all = await this.getProducts();
    if (!q) return all;

    const { rankAndFilterProducts } = await import('../utils/searchEngine');
    return rankAndFilterProducts(q, all);
  },

  async updateProduct(product: Partial<Product> & { id: string }): Promise<boolean> {
    const idx = MIGRATED_PRODUCT_LIST.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      MIGRATED_PRODUCT_LIST[idx] = {
        ...MIGRATED_PRODUCT_LIST[idx],
        ...product,
      };

      // Also sync variants in-memory
      if (product.variants && product.variants.length > 0) {
        variantsByProductId.set(product.id, product.variants);
        MIGRATED_PRODUCT_LIST[idx].variants = product.variants;
        for (const pv of product.variants) {
          const vIdx = MIGRATED_VARIANTS.findIndex((v) => v.id === pv.id);
          if (vIdx !== -1) {
            MIGRATED_VARIANTS[vIdx] = { ...MIGRATED_VARIANTS[vIdx], ...pv };
          } else {
            MIGRATED_VARIANTS.unshift(pv);
          }
        }
      } else {
        const productVariants = variantsByProductId.get(product.id);
        if (productVariants && productVariants.length > 0) {
          if (product.price !== undefined) {
            productVariants[0].price = product.price;
          }
          if (product.originalPrice !== undefined) {
            productVariants[0].mrp = product.originalPrice;
          }
          if (product.stockCount !== undefined) {
            productVariants[0].stock = product.stockCount;
          }
          MIGRATED_PRODUCT_LIST[idx].variants = [...productVariants];
          const vIdx = MIGRATED_VARIANTS.findIndex((v) => v.id === productVariants[0].id);
          if (vIdx !== -1) {
            MIGRATED_VARIANTS[vIdx] = { ...MIGRATED_VARIANTS[vIdx], ...productVariants[0] };
          }
        }
      }

      // Persist to Supabase so it survives restarts and is visible to customer app
      await serverProductOverrides.saveOverride({
        id: product.id,
        name: product.name,
        brand: product.brand,
        unit: product.unit,
        category: product.category || (product as any).category_id,
        subCategory: product.subCategory,
        price: product.price,
        originalPrice: product.originalPrice,
        stockCount: product.stockCount,
        inStock: product.inStock,
        imageUrl: product.imageUrl || product.image,
        imageStatus: (product as any).imageStatus,
        variants: MIGRATED_PRODUCT_LIST[idx].variants,
      });

      return true;
    }
    return false;
  },

  async addProduct(product: Partial<Product> & { id?: string }): Promise<Product | null> {
    const id = product.id || `g1-p${String(MIGRATED_PRODUCT_LIST.length + 1).padStart(4, '0')}`;
    const priceNum = Number(product.price) || 0;
    const mrpNum = Number(product.originalPrice) || priceNum;
    const stockNum = product.stockCount !== undefined ? Number(product.stockCount) : 25;
    const cleanImg = product.imageUrl || product.image || product.image_url || '/products/placeholder.svg';

    const newProd: Product = {
      id,
      name: product.name || 'New Product',
      brand: product.brand || 'G1 Mart',
      category: product.category || (product as any).category_id || 'atta-rice-dal',
      category_id: (product as any).category_id || product.category || 'atta-rice-dal',
      subCategory: product.subCategory,
      unit: product.unit || '1 unit',
      price: priceNum,
      priceConfirmed: priceNum > 0,
      originalPrice: mrpNum,
      discountPercentage: mrpNum > priceNum && mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
      stockCount: stockNum,
      inStock: product.inStock !== false && stockNum > 0,
      image: cleanImg,
      image_url: cleanImg,
      imageUrl: cleanImg,
      image_source: 'manufacturer',
      image_status: 'verified',
      imageStatus: 'VERIFIED',
      description: product.description || `${product.brand || 'G1 Mart'} — ${product.name || 'New Product'}`,
      rating: 4.8,
      reviewsCount: 1,
      isActive: product.inStock !== false,
      variants: product.variants || [
        {
          id: `${id}-v1`,
          product_id: id,
          size_label: product.unit || '1 unit',
          price: priceNum,
          mrp: mrpNum,
          stock: stockNum,
          image_url: cleanImg,
        },
      ],
    };

    const existingIdx = MIGRATED_PRODUCT_LIST.findIndex((p) => p.id === id);
    if (existingIdx !== -1) {
      MIGRATED_PRODUCT_LIST[existingIdx] = { ...MIGRATED_PRODUCT_LIST[existingIdx], ...newProd };
    } else {
      MIGRATED_PRODUCT_LIST.unshift(newProd);
    }

    if (newProd.variants && newProd.variants.length > 0) {
      variantsByProductId.set(id, newProd.variants);
      for (const v of newProd.variants) {
        const vIdx = MIGRATED_VARIANTS.findIndex((mv) => mv.id === v.id);
        if (vIdx !== -1) {
          MIGRATED_VARIANTS[vIdx] = { ...MIGRATED_VARIANTS[vIdx], ...v };
        } else {
          MIGRATED_VARIANTS.unshift(v);
        }
      }
    }

    return newProd;
  },
};
