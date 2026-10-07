import { Product, Category } from '../types';
import { DEMO_CATEGORIES } from '../data/demo-seed';
import { CATALOG_PRODUCTS } from '../data/productsCatalog';

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
  /**
   * Fetch all active categories with verified products only
   */
  async getCategories(): Promise<Category[]> {
    try {
      const verifiedProducts = await this.getProducts();
      const productCountMap = new Map<string, number>();
      verifiedProducts.forEach((p) => {
        if (p.category) {
          productCountMap.set(p.category, (productCountMap.get(p.category) || 0) + 1);
        }
      });

      const populated = DEMO_CATEGORIES.map((cat) => ({
        ...cat,
        itemCount: productCountMap.get(cat.id) || 0,
      })).filter((cat) => cat.itemCount > 0);

      return populated;
    } catch (err) {
      console.warn('[G1 Mart ProductService] getCategories fallback:', err);
      return [];
    }
  },

  /**
   * Fetch verified products only (Strict Rule: is_verified === true)
   */
  async getProducts(): Promise<Product[]> {
    return CATALOG_PRODUCTS.filter((p) => p.is_verified === true);
  },

  /**
   * Fetch all products regardless of verification status (Admin use only)
   */
  async getAllProductsRaw(): Promise<Product[]> {
    return CATALOG_PRODUCTS;
  },

  /**
   * Fetch a single product by ID or slug
   */
  async getProductById(id: string): Promise<Product | null> {
    const verified = await this.getProducts();
    const local = verified.find((p) => p.id === id || p.slug === id);
    return local || null;
  },

  /**
   * Fetch products by category ID
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const all = await this.getProducts();
    return all.filter((p) => p.category === categoryId);
  },

  /**
   * Update product image URL and status in Supabase
   */
  async updateProductImage(
    productId: string,
    imageUrl: string,
    imageStatus: 'VERIFIED' | 'PENDING' | 'MISSING' = 'VERIFIED'
  ): Promise<boolean> {
    const prod = CATALOG_PRODUCTS.find((p) => p.id === productId);
    if (prod) {
      prod.imageUrl = imageUrl;
      prod.image = imageUrl;
      prod.imageStatus = imageStatus;
      return true;
    }
    return false;
  },

  /**
   * Search products with typo-tolerance, brand matching, and Telugu/synonym expansion
   */
  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG_PRODUCTS;

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

    return CATALOG_PRODUCTS.filter((p) => {
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
    const idx = CATALOG_PRODUCTS.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      CATALOG_PRODUCTS[idx] = product;
      return true;
    }
    return false;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    const newProd = {
      ...product,
      id: `prod-${Date.now()}`,
    } as Product;
    CATALOG_PRODUCTS.unshift(newProd);
    return newProd;
  },
};

