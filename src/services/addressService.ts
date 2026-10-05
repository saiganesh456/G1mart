import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Address } from '../types';

function getStorageKey(userKey?: string): string {
  if (userKey) {
    const clean = userKey.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `g1mart_saved_addresses_${clean}`;
  }
  return 'g1mart_saved_addresses_guest';
}

export const addressService = {
  /**
   * Fetch customer addresses from LocalStorage + Supabase
   */
  async getAddresses(userId?: string, userEmail?: string): Promise<Address[]> {
    const userKey = userEmail || userId;
    const storageKey = getStorageKey(userKey);

    // 1. Load instantly from LocalStorage
    let localAddresses: Address[] = [];
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          localAddresses = JSON.parse(raw);
        }

        // If user-specific list is empty, check guest list or last used address
        if (localAddresses.length === 0 && userKey) {
          const guestRaw = localStorage.getItem('g1mart_saved_addresses_guest');
          if (guestRaw) {
            const guestList: Address[] = JSON.parse(guestRaw);
            if (guestList.length > 0) {
              localAddresses = guestList;
              localStorage.setItem(storageKey, JSON.stringify(localAddresses));
            }
          }
          if (localAddresses.length === 0) {
            const lastUsedRaw = localStorage.getItem('g1mart_last_used_address');
            if (lastUsedRaw) {
              const lastUsed: Address = JSON.parse(lastUsedRaw);
              localAddresses = [lastUsed];
              localStorage.setItem(storageKey, JSON.stringify(localAddresses));
            }
          }
        }
      }
    } catch {}

    // 2. If Supabase is configured and userId is available, sync with database
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const dbAddresses: Address[] = data.map((row: any) => ({
            id: row.id,
            fullName: row.full_name,
            mobileNumber: row.mobile_number,
            houseFlat: row.house_flat,
            streetArea: row.street_area || '',
            landmark: row.landmark || '',
            city: row.city || 'Nellore',
            state: row.state || 'Andhra Pradesh',
            pincode: row.pincode,
            type: (row.type as 'Home' | 'Work' | 'Other') || 'Home',
            isDefault: Boolean(row.is_default),
            deliveryInstructions: row.delivery_instructions || undefined,
          }));

          // Merge db and local addresses uniquely by id or matching houseFlat + streetArea
          const mergedMap = new Map<string, Address>();
          dbAddresses.forEach((a) => mergedMap.set(a.id, a));
          localAddresses.forEach((a) => {
            const isDuplicate = dbAddresses.some(
              (dba) =>
                dba.houseFlat.toLowerCase() === a.houseFlat.toLowerCase() &&
                dba.streetArea.toLowerCase() === a.streetArea.toLowerCase()
            );
            if (!isDuplicate && !mergedMap.has(a.id)) {
              mergedMap.set(a.id, a);
            }
          });

          const merged = Array.from(mergedMap.values());
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(storageKey, JSON.stringify(merged));
            }
          } catch {}

          return merged;
        }
      } catch (err) {
        console.warn('[AddressService] Supabase getAddresses error:', err);
      }
    }

    return localAddresses;
  },

  /**
   * Save a new address or update existing
   */
  async saveAddress(
    userId: string | undefined,
    userEmail: string | undefined,
    address: Omit<Address, 'id'> & { id?: string }
  ): Promise<Address> {
    const userKey = userEmail || userId;
    const storageKey = getStorageKey(userKey);

    const addressId = address.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullAddress: Address = {
      ...address,
      id: addressId,
      isDefault: address.isDefault ?? true,
    };

    // 1. Update LocalStorage immediately
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(storageKey);
        let list: Address[] = raw ? JSON.parse(raw) : [];

        // If this address is set to default, unset others
        if (fullAddress.isDefault) {
          list = list.map((a) => ({ ...a, isDefault: false }));
        }

        const existingIndex = list.findIndex((a) => a.id === fullAddress.id);
        if (existingIndex >= 0) {
          list[existingIndex] = fullAddress;
        } else {
          list.unshift(fullAddress);
        }

        localStorage.setItem(storageKey, JSON.stringify(list));
        // Also keep a copy in guest storage so unauthenticated visits still remember
        localStorage.setItem('g1mart_saved_addresses_guest', JSON.stringify(list));
        localStorage.setItem('g1mart_last_used_address', JSON.stringify(fullAddress));
      }
    } catch (e) {
      console.warn('[AddressService] LocalStorage error:', e);
    }

    // 2. Persist to Supabase if configured and user is logged in
    if (isSupabaseConfigured() && userId) {
      try {
        const row = {
          user_id: userId,
          full_name: fullAddress.fullName,
          mobile_number: fullAddress.mobileNumber,
          house_flat: fullAddress.houseFlat,
          street_area: fullAddress.streetArea,
          landmark: fullAddress.landmark || null,
          city: fullAddress.city || 'Nellore',
          state: fullAddress.state || 'Andhra Pradesh',
          pincode: fullAddress.pincode,
          type: fullAddress.type || 'Home',
          is_default: fullAddress.isDefault,
          delivery_instructions: fullAddress.deliveryInstructions || null,
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fullAddress.id);
        if (isUuid) {
          await supabase.from('addresses').update(row).eq('id', fullAddress.id);
        } else {
          const { data, error } = await supabase
            .from('addresses')
            .insert(row)
            .select()
            .maybeSingle();

          if (!error && data) {
            fullAddress.id = data.id;
          }
        }
      } catch (err) {
        console.warn('[AddressService] Supabase insert error:', err);
      }
    }

    return fullAddress;
  },

  /**
   * Delete an address
   */
  async deleteAddress(
    userId: string | undefined,
    userEmail: string | undefined,
    addressId: string
  ): Promise<boolean> {
    const userKey = userEmail || userId;
    const storageKey = getStorageKey(userKey);

    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const list: Address[] = JSON.parse(raw);
          const filtered = list.filter((a) => a.id !== addressId);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }
      }
    } catch {}

    if (isSupabaseConfigured() && userId) {
      try {
        await supabase.from('addresses').delete().eq('id', addressId).eq('user_id', userId);
      } catch {}
    }

    return true;
  },
};
