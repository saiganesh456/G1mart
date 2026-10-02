import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Address } from '../types';

export const addressService = {
  /**
   * Fetch customer addresses from Supabase (clean fallback to empty array)
   */
  async getAddresses(userId?: string): Promise<Address[]> {
    if (!isSupabaseConfigured() || !userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        mobileNumber: row.phone,
        houseFlat: row.address_line1,
        streetArea: row.address_line2 || '',
        landmark: row.landmark || '',
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        type: (row.type as 'Home' | 'Work' | 'Other') || 'Home',
        isDefault: Boolean(row.is_default),
        deliveryInstructions: row.delivery_instructions || undefined,
      }));
    } catch (err) {
      console.warn('[G1 Mart AddressService] getAddresses error:', err);
      return [];
    }
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address | null> {
    if (!isSupabaseConfigured()) {
      return {
        ...address,
        id: `addr-${Date.now()}`,
      };
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          full_name: address.fullName,
          phone: address.mobileNumber,
          address_line1: address.houseFlat,
          address_line2: address.streetArea,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          type: address.type,
          is_default: address.isDefault,
          delivery_instructions: address.deliveryInstructions,
        })
        .select()
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        fullName: data.full_name,
        mobileNumber: data.phone,
        houseFlat: data.address_line1,
        streetArea: data.address_line2 || '',
        landmark: data.landmark || '',
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        type: data.type as 'Home' | 'Work' | 'Other',
        isDefault: Boolean(data.is_default),
        deliveryInstructions: data.delivery_instructions,
      };
    } catch {
      return null;
    }
  },
};
