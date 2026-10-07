/**
 * Server Slip Store
 *
 * Handles server-side persistence of customer slip uploads.
 * Combines persistent local disk JSON storage (data/g1mart_slips.json),
 * global server memory caching, and Supabase cloud sync.
 */

import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase/client';

export interface SlipRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  image_path: string;
  image_url?: string;
  image_urls?: string[];
  image_paths?: string[];
  customer_note?: string;
  status: 'new' | 'reviewed' | 'converted_to_order' | 'rejected';
  extracted_json?: any | null;
  confirmed_json?: any | null;
  admin_notes?: string | null;
  handled_by?: string | null;
  handled_at?: string | null;
  created_at: string;
  ip?: string | null;
}

const SLIPS_FILE_PATH = path.join(process.cwd(), 'data', 'g1mart_slips.json');

declare global {
  // eslint-disable-next-line no-var
  var __g1Slips: SlipRecord[] | undefined;
}

if (!global.__g1Slips) {
  global.__g1Slips = [];
}

// Rate limiting tracking: maps key (phone or IP) -> timestamp[]
const RATE_LIMIT_CACHE = new Map<string, number[]>();

function ensureDataDir(): void {
  const dir = path.dirname(SLIPS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDiskSlips(): SlipRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SLIPS_FILE_PATH)) {
      const raw = fs.readFileSync(SLIPS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[serverSlipStore] Error reading slips from disk:', err);
  }
  return [];
}

function persistDiskSlips(slips: SlipRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SLIPS_FILE_PATH, JSON.stringify(slips, null, 2), 'utf-8');
  } catch (err) {
    console.error('[serverSlipStore] Error writing slips to disk:', err);
  }
}

// Initial load into global cache
if (global.__g1Slips.length === 0) {
  const disk = loadDiskSlips();
  if (disk.length > 0) {
    global.__g1Slips = disk;
  }
}

export const serverSlipStore = {
  /**
   * Check rate limits (Max 5 uploads per phone or IP per 10 minutes)
   */
  checkRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = (RATE_LIMIT_CACHE.get(key) || []).filter((t) => now - t < windowMs);
    RATE_LIMIT_CACHE.set(key, timestamps);

    if (timestamps.length >= limit) {
      return { allowed: false, remaining: 0 };
    }

    timestamps.push(now);
    RATE_LIMIT_CACHE.set(key, timestamps);
    return { allowed: true, remaining: limit - timestamps.length };
  },

  /**
   * Save a newly uploaded slip
   */
  async createSlip(data: {
    customer_name: string;
    customer_phone: string;
    image_path: string;
    image_url?: string;
    image_paths?: string[];
    image_urls?: string[];
    customer_note?: string;
    ip?: string | null;
  }): Promise<SlipRecord> {
    const id = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record: SlipRecord = {
      id,
      customer_name: data.customer_name.trim(),
      customer_phone: data.customer_phone.trim(),
      image_path: data.image_path,
      image_url: data.image_url,
      image_paths: data.image_paths || [data.image_path],
      image_urls: data.image_urls || (data.image_url ? [data.image_url] : []),
      customer_note: data.customer_note,
      status: 'new',
      extracted_json: null,
      confirmed_json: null,
      admin_notes: null,
      handled_by: null,
      handled_at: null,
      created_at: new Date().toISOString(),
      ip: data.ip || null,
    };

    // 1. Sync in-memory global
    const diskSlips = loadDiskSlips();
    const map = new Map<string, SlipRecord>();
    diskSlips.forEach((s) => map.set(s.id, s));
    (global.__g1Slips || []).forEach((s) => map.set(s.id, s));
    map.set(record.id, record);

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    global.__g1Slips = merged;

    // 2. Persist to disk file
    persistDiskSlips(merged);

    // 3. Try persisting to Supabase if table is present
    try {
      const { error } = await supabase.from('slip_uploads').insert({
        id: record.id,
        customer_name: record.customer_name,
        customer_phone: record.customer_phone,
        image_path: record.image_path,
        status: record.status,
        extracted_json: null,
        confirmed_json: null,
        created_at: record.created_at,
      });
      if (error) {
        console.warn('[serverSlipStore] Supabase insert note:', error.message);
      }
    } catch (err: any) {
      console.warn('[serverSlipStore] Supabase offline/unconfigured:', err.message);
    }

    return record;
  },

  /**
   * List all slips (Admin view)
   */
  async getSlips(): Promise<SlipRecord[]> {
    const diskSlips = loadDiskSlips();
    const map = new Map<string, SlipRecord>();
    diskSlips.forEach((s) => map.set(s.id, s));
    (global.__g1Slips || []).forEach((s) => map.set(s.id, s));

    try {
      const { data, error } = await supabase
        .from('slip_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((row: any) => {
          map.set(row.id, {
            id: row.id,
            customer_name: row.customer_name || 'Customer',
            customer_phone: row.customer_phone || '',
            image_path: row.image_path || '',
            image_url: row.image_url || map.get(row.id)?.image_url,
            status: row.status || 'new',
            extracted_json: row.extracted_json || null,
            confirmed_json: row.confirmed_json || null,
            admin_notes: row.admin_notes || null,
            handled_by: row.handled_by || null,
            handled_at: row.handled_at || null,
            created_at: row.created_at || new Date().toISOString(),
          });
        });
      }
    } catch {
      // Fallback to disk + memory
    }

    const all = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    global.__g1Slips = all;
    return all;
  },

  /**
   * Get slip by ID
   */
  async getSlipById(id: string): Promise<SlipRecord | undefined> {
    const slips = await this.getSlips();
    return slips.find((s) => s.id === id);
  },

  /**
   * Update slip status and admin notes
   */
  async updateSlip(
    id: string,
    updates: {
      status?: 'new' | 'reviewed' | 'converted_to_order' | 'rejected';
      admin_notes?: string;
      handled_by?: string;
    }
  ): Promise<SlipRecord | null> {
    const all = await this.getSlips();
    const slip = all.find((s) => s.id === id);
    const now = new Date().toISOString();

    if (slip) {
      if (updates.status) slip.status = updates.status;
      if (updates.admin_notes !== undefined) slip.admin_notes = updates.admin_notes;
      if (updates.handled_by) slip.handled_by = updates.handled_by;
      slip.handled_at = now;

      global.__g1Slips = all;
      persistDiskSlips(all);
    }

    try {
      await supabase
        .from('slip_uploads')
        .update({
          status: updates.status,
          admin_notes: updates.admin_notes,
          handled_by: updates.handled_by,
          handled_at: now,
        })
        .eq('id', id);
    } catch {
      // Supabase update fallback
    }

    return slip || null;
  },
};
