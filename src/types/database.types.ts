export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin' | 'delivery_partner';
          wallet_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin' | 'delivery_partner';
          wallet_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin' | 'delivery_partner';
          wallet_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_zones: {
        Row: {
          id: string;
          name: string;
          code: string;
          type: 'city' | 'rural_extended' | 'out_of_coverage';
          geographic_coverage: string;
          max_radius_km: number;
          estimated_min_delivery_time: number;
          estimated_max_delivery_time: number;
          estimated_delivery_time_text: string;
          delivery_fee: number;
          min_order_value: number;
          free_delivery_threshold: number;
          is_active: boolean;
          pincodes: string[];
          supported_areas: string[];
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          code: string;
          type: 'city' | 'rural_extended' | 'out_of_coverage';
          geographic_coverage: string;
          max_radius_km: number;
          estimated_min_delivery_time: number;
          estimated_max_delivery_time: number;
          estimated_delivery_time_text: string;
          delivery_fee?: number;
          min_order_value?: number;
          free_delivery_threshold?: number;
          is_active?: boolean;
          pincodes?: string[];
          supported_areas?: string[];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          type?: 'city' | 'rural_extended' | 'out_of_coverage';
          geographic_coverage?: string;
          max_radius_km?: number;
          estimated_min_delivery_time?: number;
          estimated_max_delivery_time?: number;
          estimated_delivery_time_text?: string;
          delivery_fee?: number;
          min_order_value?: number;
          free_delivery_threshold?: number;
          is_active?: boolean;
          pincodes?: string[];
          supported_areas?: string[];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          category_id: string;
          sub_category: string | null;
          unit: string;
          price: number;
          original_price: number;
          discount_percentage: number;
          in_stock: boolean;
          stock_count: number;
          image: string;
          description: string;
          rating: number;
          reviews_count: number;
          is_popular: boolean;
          is_best_deal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          brand: string;
          category_id: string;
          sub_category?: string | null;
          unit: string;
          price: number;
          original_price: number;
          discount_percentage?: number;
          in_stock?: boolean;
          stock_count?: number;
          image: string;
          description: string;
          rating?: number;
          reviews_count?: number;
          is_popular?: boolean;
          is_best_deal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          category_id?: string;
          sub_category?: string | null;
          unit?: string;
          price?: number;
          original_price?: number;
          discount_percentage?: number;
          in_stock?: boolean;
          stock_count?: number;
          image?: string;
          description?: string;
          rating?: number;
          reviews_count?: number;
          is_popular?: boolean;
          is_best_deal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          mobile_number: string;
          house_flat: string;
          street_area: string;
          landmark: string | null;
          city: string;
          state: string;
          pincode: string;
          type: 'Home' | 'Work' | 'Other';
          is_default: boolean;
          delivery_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          mobile_number: string;
          house_flat: string;
          street_area: string;
          landmark?: string | null;
          city?: string;
          state?: string;
          pincode: string;
          type?: 'Home' | 'Work' | 'Other';
          is_default?: boolean;
          delivery_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          mobile_number?: string;
          house_flat?: string;
          street_area?: string;
          landmark?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          type?: 'Home' | 'Work' | 'Other';
          is_default?: boolean;
          delivery_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          is_saved_for_later: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          is_saved_for_later?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          is_saved_for_later?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          date: string;
          slot: string;
          payment_method: string;
          is_paid: boolean;
          status: 'Order Placed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
          subtotal: number;
          discount: number;
          delivery_fee: number;
          taxes: number;
          grand_total: number;
          coupon_applied: string | null;
          address: Json;
          delivery_zone_id: string | null;
          assigned_rider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          date: string;
          slot: string;
          payment_method: string;
          is_paid?: boolean;
          status?: 'Order Placed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
          subtotal: number;
          discount?: number;
          delivery_fee?: number;
          taxes?: number;
          grand_total: number;
          coupon_applied?: string | null;
          address: Json;
          delivery_zone_id?: string | null;
          assigned_rider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          date?: string;
          slot?: string;
          payment_method?: string;
          is_paid?: boolean;
          status?: 'Order Placed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
          subtotal?: number;
          discount?: number;
          delivery_fee?: number;
          taxes?: number;
          grand_total?: number;
          coupon_applied?: string | null;
          address?: Json;
          delivery_zone_id?: string | null;
          assigned_rider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          unit: string;
          price: number;
          quantity: number;
          image: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          unit: string;
          price: number;
          quantity: number;
          image: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          unit?: string;
          price?: number;
          quantity?: number;
          image?: string;
          created_at?: string;
        };
      };
      riders: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          vehicle_number: string;
          rating: number;
          current_location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone: string;
          vehicle_number: string;
          rating?: number;
          current_location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          vehicle_number?: string;
          rating?: number;
          current_location?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          code: string;
          description: string;
          discount_amount: number | null;
          discount_percent: number | null;
          min_order: number;
          max_discount: number | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          description: string;
          discount_amount?: number | null;
          discount_percent?: number | null;
          min_order?: number;
          max_discount?: number | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          code?: string;
          description?: string;
          discount_amount?: number | null;
          discount_percent?: number | null;
          min_order?: number;
          max_discount?: number | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      banners: {
        Row: {
          id: number;
          title: string;
          subtitle: string;
          tag: string;
          image: string;
          cta: string;
          category_id: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          subtitle: string;
          tag: string;
          image: string;
          cta?: string;
          category_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          subtitle?: string;
          tag?: string;
          image?: string;
          cta?: string;
          category_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          time_text: string | null;
          is_read: boolean;
          type: 'order' | 'offer' | 'info';
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          time_text?: string | null;
          is_read?: boolean;
          type: 'order' | 'offer' | 'info';
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          time_text?: string | null;
          is_read?: boolean;
          type?: 'order' | 'offer' | 'info';
          order_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
