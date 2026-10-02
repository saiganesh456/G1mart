import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Category } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/mockData';

export const productService = {
  /**
   * Fetch all active categories from Supabase (with fallback to mock data)
   */
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return INITIAL_CATEGORIES;
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
        return INITIAL_CATEGORIES;
      }

      return data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        description: cat.description || '',
        itemCount: 0,
        subcategories: (cat.subcategories || []).map((s: any) => s.name),
      }));
    } catch (err) {
      console.warn('[G1 Mart ProductService] Failed to fetch categories from Supabase, using mock data:', err);
      return INITIAL_CATEGORIES;
    }
  },

  /**
   * Fetch all products from Supabase (with fallback to mock data)
   */
  async getProducts(categoryId?: string): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      if (categoryId) {
        return INITIAL_PRODUCTS.filter((p) => p.category === categoryId);
      }
      return INITIAL_PRODUCTS;
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return categoryId ? INITIAL_PRODUCTS.filter((p) => p.category === categoryId) : INITIAL_PRODUCTS;
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category_id,
        subCategory: row.sub_category || undefined,
        unit: row.unit,
        price: Number(row.price),
        originalPrice: Number(row.original_price),
        discountPercentage: row.discount_percentage,
        inStock: row.in_stock,
        stockCount: row.stock_count,
        image: row.image,
        description: row.description,
        rating: Number(row.rating),
        reviewsCount: row.reviews_count,
        isPopular: row.is_popular,
        isBestDeal: row.is_best_deal,
      }));
    } catch (err) {
      console.warn('[G1 Mart ProductService] Failed to fetch products from Supabase, using mock data:', err);
      return categoryId ? INITIAL_PRODUCTS.filter((p) => p.category === categoryId) : INITIAL_PRODUCTS;
    }
  },

  /**
   * Admin: Add new product to Supabase
   */
  async addProduct(newProduct: Omit<Product, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    const generatedId = `prod-${Date.now()}`;
    if (!isSupabaseConfigured()) {
      return { success: true, id: generatedId };
    }

    try {
      const { data, error } = await supabase.from('products').insert({
        id: generatedId,
        name: newProduct.name,
        brand: newProduct.brand,
        category_id: newProduct.category,
        sub_category: newProduct.subCategory || null,
        unit: newProduct.unit,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        discount_percentage: newProduct.discountPercentage,
        in_stock: newProduct.inStock,
        stock_count: newProduct.stockCount,
        image: newProduct.image,
        description: newProduct.description,
        rating: newProduct.rating || 5.0,
        reviews_count: newProduct.reviewsCount || 0,
        is_popular: Boolean(newProduct.isPopular),
        is_best_deal: Boolean(newProduct.isBestDeal),
      }).select().single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: data.id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add product' };
    }
  },

  /**
   * Admin: Update product in Supabase
   */
  async updateProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          brand: product.brand,
          category_id: product.category,
          sub_category: product.subCategory || null,
          unit: product.unit,
          price: product.price,
          original_price: product.originalPrice,
          discount_percentage: product.discountPercentage,
          in_stock: product.inStock,
          stock_count: product.stockCount,
          image: product.image,
          description: product.description,
          rating: product.rating,
          reviews_count: product.reviewsCount,
          is_popular: product.isPopular,
          is_best_deal: product.isBestDeal,
        })
        .eq('id', product.id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update product' };
    }
  },

  /**
   * Upload product image to Supabase Storage bucket ('product-images')
   */
  async uploadProductImage(file: File, path?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase storage is not configured yet.' };
    }

    try {
      const filePath = path || `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      return { success: false, error: err.message || 'Image upload failed' };
    }
  },
};
