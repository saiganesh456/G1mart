import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { StoreSettings, DeliveryZone } from '@/types/deliveryZone';

import { DEFAULT_STORE_SETTINGS, DEFAULT_DELIVERY_ZONES } from './storeSettingsConstants';
export { DEFAULT_STORE_SETTINGS, DEFAULT_DELIVERY_ZONES };

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'g1mart_store_settings.json');
const ZONES_FILE_PATH = path.join(process.cwd(), 'data', 'g1mart_delivery_zones.json');

declare global {
  // eslint-disable-next-line no-var
  var __g1StoreSettings: StoreSettings | undefined;
  // eslint-disable-next-line no-var
  var __g1DeliveryZones: DeliveryZone[] | undefined;
}

function ensureDataDir(): void {
  const dir = path.dirname(SETTINGS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDiskSettings(): StoreSettings {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.store_lat === 'number') {
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
    }
  } catch (err) {
    console.warn('[serverStoreSettings] Error reading settings from disk:', err);
  }
  return { ...DEFAULT_STORE_SETTINGS };
}

function persistDiskSettings(settings: StoreSettings): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('[serverStoreSettings] Error writing settings to disk:', err);
  }
}

function loadDiskZones(): DeliveryZone[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ZONES_FILE_PATH)) {
      const raw = fs.readFileSync(ZONES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((z: any) => ({
          ...z,
          deliveryFee: 0,
          min_order: Number(z.min_order ?? z.minOrderValue ?? 500),
          minOrderValue: Number(z.min_order ?? z.minOrderValue ?? 500),
          min_km: Number(z.min_km ?? 0),
          max_km: Number(z.max_km ?? 30),
          active: z.active !== undefined ? Boolean(z.active) : Boolean(z.isActive ?? true),
          isActive: z.active !== undefined ? Boolean(z.active) : Boolean(z.isActive ?? true),
        }));
      }
    }
  } catch (err) {
    console.warn('[serverStoreSettings] Error reading zones from disk:', err);
  }
  return [...DEFAULT_DELIVERY_ZONES];
}

function persistDiskZones(zones: DeliveryZone[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(ZONES_FILE_PATH, JSON.stringify(zones, null, 2), 'utf-8');
  } catch (err) {
    console.error('[serverStoreSettings] Error writing zones to disk:', err);
  }
}

// Initialize in-memory cache
if (!global.__g1StoreSettings) {
  global.__g1StoreSettings = loadDiskSettings();
}
if (!global.__g1DeliveryZones) {
  global.__g1DeliveryZones = loadDiskZones();
}

export const serverStoreSettings = {
  /**
   * Get current store settings
   */
  async getStoreSettings(): Promise<StoreSettings> {
    // If Supabase is available, attempt read
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          const loaded: StoreSettings = {
            id: data.id || 'default',
            store_lat: Number(data.store_lat),
            store_lng: Number(data.store_lng),
            store_address: data.store_address || DEFAULT_STORE_SETTINGS.store_address,
            max_radius_km: Number(data.max_radius_km ?? 30),
            prep_time_min: Number(data.prep_time_min ?? 10),
            cod_fee: Number(data.cod_fee ?? 50),
            updated_at: data.updated_at || new Date().toISOString(),
          };
          global.__g1StoreSettings = loaded;
          persistDiskSettings(loaded);
          return loaded;
        }
      } catch (err) {
        console.warn('[serverStoreSettings] Supabase fetch fallback to disk:', err);
      }
    }

    if (!global.__g1StoreSettings) {
      global.__g1StoreSettings = loadDiskSettings();
    }
    return global.__g1StoreSettings;
  },

  /**
   * Update store settings
   */
  async updateStoreSettings(partial: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated: StoreSettings = {
      ...current,
      ...partial,
      store_lat: partial.store_lat !== undefined ? Number(partial.store_lat) : current.store_lat,
      store_lng: partial.store_lng !== undefined ? Number(partial.store_lng) : current.store_lng,
      max_radius_km: partial.max_radius_km !== undefined ? Number(partial.max_radius_km) : current.max_radius_km,
      prep_time_min: partial.prep_time_min !== undefined ? Number(partial.prep_time_min) : current.prep_time_min,
      cod_fee: partial.cod_fee !== undefined ? Number(partial.cod_fee) : current.cod_fee,
      store_address: partial.store_address || current.store_address,
      updated_at: new Date().toISOString(),
    };

    global.__g1StoreSettings = updated;
    persistDiskSettings(updated);

    // Try Supabase write
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('store_settings')
          .upsert({
            id: updated.id || 'default',
            store_lat: updated.store_lat,
            store_lng: updated.store_lng,
            store_address: updated.store_address,
            max_radius_km: updated.max_radius_km,
            prep_time_min: updated.prep_time_min,
            cod_fee: updated.cod_fee,
            updated_at: updated.updated_at,
          });
      } catch (err) {
        console.warn('[serverStoreSettings] Supabase save error:', err);
      }
    }

    return updated;
  },

  /**
   * Get all delivery zones
   */
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('delivery_zones')
          .select('*')
          .order('min_km', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: DeliveryZone[] = data.map((z: any) => ({
            id: z.id,
            name: z.name || `${z.min_km ?? 0}–${z.max_km ?? 30} km`,
            min_km: Number(z.min_km ?? 0),
            max_km: Number(z.max_km ?? 30),
            min_order: Number(z.min_order ?? z.min_order_value ?? 500),
            active: z.active !== undefined ? Boolean(z.active) : Boolean(z.is_active ?? true),
            deliveryFee: 0,
            minOrderValue: Number(z.min_order ?? z.min_order_value ?? 500),
            isActive: z.active !== undefined ? Boolean(z.active) : Boolean(z.is_active ?? true),
            estimatedDeliveryTimeText: z.estimated_delivery_time_text,
          }));
          global.__g1DeliveryZones = mapped;
          persistDiskZones(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[serverStoreSettings] Supabase fetch zones fallback:', err);
      }
    }

    if (!global.__g1DeliveryZones || global.__g1DeliveryZones.length === 0) {
      global.__g1DeliveryZones = loadDiskZones();
    }
    return global.__g1DeliveryZones;
  },

  /**
   * Save delivery zones
   */
  async saveDeliveryZones(zones: DeliveryZone[]): Promise<DeliveryZone[]> {
    const normalized: DeliveryZone[] = zones.map((z, idx) => {
      const min_km = Number(z.min_km ?? 0);
      const max_km = Number(z.max_km ?? 30);
      const min_order = Number(z.min_order ?? z.minOrderValue ?? 500);
      const active = z.active !== undefined ? Boolean(z.active) : Boolean(z.isActive ?? true);
      const id = z.id || `zone-${min_km}-${max_km}-${idx}`;
      const name = z.name || `${min_km}–${max_km} km`;

      return {
        ...z,
        id,
        name,
        min_km,
        max_km,
        min_order,
        active,
        deliveryFee: 0,
        minOrderValue: min_order,
        isActive: active,
      };
    });

    // Sort ascending by min_km
    normalized.sort((a, b) => a.min_km - b.min_km);

    global.__g1DeliveryZones = normalized;
    persistDiskZones(normalized);

    // Try Supabase write
    if (isSupabaseConfigured()) {
      try {
        const rows = normalized.map((z) => ({
          id: z.id,
          name: z.name,
          min_km: z.min_km,
          max_km: z.max_km,
          min_order: z.min_order,
          active: z.active,
          delivery_fee: 0,
          min_order_value: z.min_order,
          is_active: z.active,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('delivery_zones').upsert(rows);
      } catch (err) {
        console.warn('[serverStoreSettings] Supabase save zones error:', err);
      }
    }

    return normalized;
  },

  /**
   * Find the matching delivery zone for a road distance in km
   * Returns null if beyond max radius or inactive
   */
  findZoneForDistance(distanceKm: number, zones: DeliveryZone[], maxRadiusKm = 30): DeliveryZone | null {
    if (distanceKm > maxRadiusKm) {
      return null;
    }

    const activeZones = zones.filter((z) => (z.active !== undefined ? z.active : z.isActive ?? true));
    if (activeZones.length === 0) return null;

    // Find zone where distance fits in [min_km, max_km]
    // Tie-breaker: If on exact boundary (e.g. 5.0 km), match the tier that starts or ends there
    for (const z of activeZones) {
      const min = Number(z.min_km ?? 0);
      const max = Number(z.max_km ?? 30);
      if (min === 0) {
        if (distanceKm >= 0 && distanceKm <= max) return z;
      } else {
        if (distanceKm > min && distanceKm <= max) return z;
      }
    }

    // Fallback: nearest upper bracket
    const upper = activeZones.find((z) => Number(z.max_km) >= distanceKm);
    if (upper) return upper;

    return null;
  },
};
