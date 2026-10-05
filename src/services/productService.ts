import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
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
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return DEMO_CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon, description, display_order, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return DEMO_CATEGORIES;
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon || '🛍️',
        description: row.description || '',
        itemCount: 0,
        subcategories: [],
      }));
    } catch (err) {
      console.warn('[G1 Mart ProductService] getCategories fallback:', err);
      return DEMO_CATEGORIES;
    }
  },

  /**
   * Fetch all active products (reconciled across Supabase DB and local master catalog)
   */
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      return CATALOG_PRODUCTS;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('source_item_no', { ascending: true });

      const dbMap = new Map((data || []).map((row: any) => [row.id, row]));

      return CATALOG_PRODUCTS.map((local) => {
        const dbRow = dbMap.get(local.id);
        if (dbRow) {
          return mapDbRowToProduct(dbRow, local);
        }
        return local;
      });
    } catch (err) {
      console.warn('[G1 Mart ProductService] getProducts fallback to local catalog:', err);
      return CATALOG_PRODUCTS;
    }
  },

  /**
   * Fetch a single product by ID or slug
   */
  async getProductById(id: string): Promise<Product | null> {
    const local = CATALOG_PRODUCTS.find((p) => p.id === id);

    if (!isSupabaseConfigured()) {
      return local || null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        return mapDbRowToProduct(data, local);
      }
      return local || null;
    } catch (err) {
      console.warn('[G1 Mart ProductService] getProductById fallback:', err);
      return local || null;
    }
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
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          image_url: imageUrl,
          image_status: imageStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      return !error;
    } catch (err) {
      console.warn('[G1 Mart ProductService] updateProductImage error:', err);
      return false;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(product: Product): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          brand: product.brand,
          price: product.price,
          original_price: product.originalPrice,
          in_stock: product.inStock,
          stock_count: product.stockCount,
          image_url: product.image_url || product.image,
          image_status: product.image_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      return !error;
    } catch (err) {
      console.warn('[G1 Mart ProductService] updateProduct error:', err);
      return false;
    }
  },

  /**
   * Add a new product
   */
  async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    if (!isSupabaseConfigured()) {
      return {
        ...product,
        id: `prod-${Date.now()}`,
      };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          brand: product.brand,
          category_id: product.category,
          unit: product.unit,
          price: product.price,
          original_price: product.originalPrice,
          in_stock: product.inStock,
          stock_count: product.stockCount,
          image_url: product.image_url || product.image,
          image_status: product.image_status || 'MISSING',
          description: product.description,
          rating: product.rating,
          reviews_count: product.reviewsCount,
          is_popular: Boolean(product.isPopular),
          is_best_deal: Boolean(product.isBestDeal),
        })
        .select()
        .single();

      if (error || !data) return null;
      return mapDbRowToProduct(data);
    } catch (err) {
      console.warn('[G1 Mart ProductService] addProduct error:', err);
      return null;
    }
  },
};
