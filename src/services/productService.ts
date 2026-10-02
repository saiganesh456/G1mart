import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Product, Category } from '../types';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '../data/demo-seed';

export const productService = {
  /**
   * Fetch all active categories from Supabase (with fallback to demo data)
   */
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return DEMO_CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          icon,
          description,
          subcategories ( name )
        `)
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
        subcategories: (row.subcategories || []).map((s: any) => s.name),
      }));
    } catch (err) {
      console.warn('[G1 Mart ProductService] getCategories fallback:', err);
      return DEMO_CATEGORIES;
    }
  },

  /**
   * Fetch all active catalog products from Supabase (with fallback to demo data)
   */
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      return DEMO_PRODUCTS;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        return DEMO_PRODUCTS;
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        brand: row.brand || '',
        category: row.category_id || '',
        subCategory: row.subcategory_name || undefined,
        unit: row.unit || '1 unit',
        price: Number(row.price),
        originalPrice: Number(row.original_price || row.price),
        discountPercentage: Math.max(
          0,
          Math.round(
            ((Number(row.original_price || row.price) - Number(row.price)) /
              Number(row.original_price || row.price || 1)) *
              100
          )
        ),
        inStock: Boolean(row.in_stock),
        stockCount: Number(row.stock_count || 0),
        image: row.image_url || '/products/prod-1.jpg',
        description: row.description || '',
        rating: Number(row.rating || 0),
        reviewsCount: Number(row.reviews_count || 0),
        isPopular: Boolean(row.is_popular),
        isBestDeal: Boolean(row.is_best_deal),
        sku: row.sku || undefined,
        slug: row.slug || undefined,
        isActive: Boolean(row.is_active),
      }));
    } catch (err) {
      console.warn('[G1 Mart ProductService] getProducts fallback:', err);
      return DEMO_PRODUCTS;
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
          image_url: product.image,
          description: product.description,
          rating: product.rating,
          reviews_count: product.reviewsCount,
          is_popular: Boolean(product.isPopular),
          is_best_deal: Boolean(product.isBestDeal),
        })
        .select()
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        brand: data.brand || '',
        category: data.category_id || '',
        unit: data.unit || '1 unit',
        price: Number(data.price),
        originalPrice: Number(data.original_price || data.price),
        discountPercentage: 0,
        inStock: Boolean(data.in_stock),
        stockCount: Number(data.stock_count || 0),
        image: data.image_url || '/products/prod-1.jpg',
        description: data.description || '',
        rating: Number(data.rating || 0),
        reviewsCount: Number(data.reviews_count || 0),
        isPopular: Boolean(data.is_popular),
        isBestDeal: Boolean(data.is_best_deal),
      };
    } catch (err) {
      console.warn('[G1 Mart ProductService] addProduct error:', err);
      return null;
    }
  },
};
