import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Address } from '../types';
import { INITIAL_ADDRESSES } from '../data/mockData';

export const addressService = {
  /**
   * Fetch customer addresses from Supabase (with fallback to mock data)
   */
  async getAddresses(userId?: string): Promise<Address[]> {
    if (!isSupabaseConfigured() || !userId) {
      return INITIAL_ADDRESSES;
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_ADDRESSES;
      }

      return data.map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        mobileNumber: row.mobile_number,
        houseFlat: row.house_flat,
        streetArea: row.street_area,
        landmark: row.landmark || '',
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        type: row.type as 'Home' | 'Work' | 'Other',
        isDefault: row.is_default,
        deliveryInstructions: row.delivery_instructions || undefined,
      }));
    } catch (err) {
      console.warn('[G1 Mart AddressService] Failed to fetch addresses from Supabase, using mock data:', err);
      return INITIAL_ADDRESSES;
    }
  },

  /**
   * Add new address to Supabase
   */
  async addAddress(address: Omit<Address, 'id'>, userId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const localId = `addr-${Date.now()}`;
    if (!isSupabaseConfigured() || !userId) {
      return { success: true, id: localId };
    }

    try {
      if (address.isDefault) {
        // Reset previous default
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          full_name: address.fullName,
          mobile_number: address.mobileNumber,
          house_flat: address.houseFlat,
          street_area: address.streetArea,
          landmark: address.landmark || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          type: address.type,
          is_default: address.isDefault,
          delivery_instructions: address.deliveryInstructions || null,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: data.id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add address' };
    }
  },

  /**
   * Update address in Supabase
   */
  async updateAddress(address: Address, userId?: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || !userId) {
      return { success: true };
    }

    try {
      if (address.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { error } = await supabase
        .from('addresses')
        .update({
          full_name: address.fullName,
          mobile_number: address.mobileNumber,
          house_flat: address.houseFlat,
          street_area: address.streetArea,
          landmark: address.landmark || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          type: address.type,
          is_default: address.isDefault,
          delivery_instructions: address.deliveryInstructions || null,
        })
        .eq('id', address.id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update address' };
    }
  },

  /**
   * Delete address in Supabase
   */
  async deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete address' };
    }
  },
};
