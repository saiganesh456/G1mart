import fs from 'fs';
import path from 'path';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';
import type { StaffMember, UserRole } from '@/types';

// Default primary super admin emails (Protected store root owners)
export const ROOT_ADMIN_EMAILS = [
  'sureshdega466@gmail.com',
  'g1mart@gmail.com',
  'lingalamahendra0@gmail.com',
];
export const ROOT_ADMIN_EMAIL = 'sureshdega466@gmail.com';
export const PROTECTED_MASTER_ADMIN = 'sureshdega466@gmail.com';

/**
 * Normalizes email address for consistent matching.
 * Removes Gmail dots and plus-tags so gumma.saiganesh57@gmail.com matches gummasaiganesh57@gmail.com.
 */
export function normalizeEmail(email?: string | null): string {
  if (!email) return '';
  const clean = email.toLowerCase().trim();
  const parts = clean.split('@');
  if (parts.length !== 2) return clean;
  let [user, domain] = parts;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    user = user.replace(/\./g, '').split('+')[0];
    domain = 'gmail.com';
  }
  return `${user}@${domain}`;
}

// Permanent bundled repository file (persists across Git commits & Vercel builds)
const REPO_STAFF_FILE = path.join(process.cwd(), 'data', 'g1mart_staff.json');

// Ephemeral runtime cache file for lambda execution
const STAFF_CACHE_FILE =
  typeof process !== 'undefined' && process.platform === 'win32'
    ? path.join(process.cwd(), '.next', 'g1mart_staff.json')
    : '/tmp/g1mart_staff.json';

// In-memory global store to survive Turbopack fast reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __g1Admins: Map<string, StaffMember> | undefined;
  // eslint-disable-next-line no-var
  var __g1Riders: Map<string, StaffMember> | undefined;
}

if (!global.__g1Admins) global.__g1Admins = new Map<string, StaffMember>();
if (!global.__g1Riders) global.__g1Riders = new Map<string, StaffMember>();

const adminsMap = global.__g1Admins;
const ridersMap = global.__g1Riders;

function loadCacheFromDisk() {
  adminsMap.clear();
  ridersMap.clear();

  // 1. First, load from the permanent repository staff file (data/g1mart_staff.json)
  try {
    if (fs.existsSync(REPO_STAFF_FILE)) {
      const raw = fs.readFileSync(REPO_STAFF_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.admins)) {
        parsed.admins.forEach((a: StaffMember) => {
          if (a?.email) {
            const clean = a.email.toLowerCase().trim();
            adminsMap.set(clean, a);
            const norm = normalizeEmail(clean);
            if (norm !== clean && !adminsMap.has(norm)) adminsMap.set(norm, a);
          }
        });
      }
      if (Array.isArray(parsed.riders)) {
        parsed.riders.forEach((r: StaffMember) => {
          if (r?.email) {
            const clean = r.email.toLowerCase().trim();
            ridersMap.set(clean, r);
            const norm = normalizeEmail(clean);
            if (norm !== clean && !ridersMap.has(norm)) ridersMap.set(norm, r);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[StaffStore] Error reading repo staff file:', err);
  }

  // 2. Next, load any dynamic additions written to runtime cache (/tmp or .next)
  try {
    if (fs.existsSync(STAFF_CACHE_FILE)) {
      const raw = fs.readFileSync(STAFF_CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.admins)) {
        parsed.admins.forEach((a: StaffMember) => {
          if (a?.email) {
            const clean = a.email.toLowerCase().trim();
            adminsMap.set(clean, a);
            const norm = normalizeEmail(clean);
            if (norm !== clean && !adminsMap.has(norm)) adminsMap.set(norm, a);
          }
        });
      }
      if (Array.isArray(parsed.riders)) {
        parsed.riders.forEach((r: StaffMember) => {
          if (r?.email) {
            const clean = r.email.toLowerCase().trim();
            ridersMap.set(clean, r);
            const norm = normalizeEmail(clean);
            if (norm !== clean && !ridersMap.has(norm)) ridersMap.set(norm, r);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[StaffStore] Error reading staff cache file:', err);
  }

  // 3. Ensure root admins are ALWAYS present
  ROOT_ADMIN_EMAILS.forEach((em, idx) => {
    const rootEmail = em.toLowerCase().trim();
    if (!adminsMap.has(rootEmail)) {
      adminsMap.set(rootEmail, {
        id: `root-admin-0${idx + 1}`,
        email: rootEmail,
        role: 'admin',
        name: rootEmail.includes('suresh')
          ? 'Suresh Dega (Super Admin)'
          : rootEmail.includes('lingala')
          ? 'Mahendra Lingala (Store Admin)'
          : 'Primary Store Admin',
        createdAt: '2026-10-01T00:00:00Z',
        status: 'active',
      });
    }
  });

  // 4. Ensure known core riders are ALWAYS present
  const defaultRidersList: { email: string; name: string; phone: string; vehicle: string }[] = [
    { email: 'rider@g1mart.com', name: 'Express Delivery Rider', phone: '9876543212', vehicle: 'AP 26 EQ 4591' },
    { email: 'gummasaiganesh57@gmail.com', name: 'Sai Ganesh (Delivery Partner)', phone: '9876543210', vehicle: 'AP 26 EQ 4589' },
    { email: 'gumma.saiganesh57@gmail.com', name: 'Sai Ganesh (Delivery Partner)', phone: '9876543210', vehicle: 'AP 26 EQ 4589' },
  ];

  defaultRidersList.forEach((r) => {
    const cleanEmail = r.email.toLowerCase().trim();
    if (!ridersMap.has(cleanEmail)) {
      ridersMap.set(cleanEmail, {
        id: `rider-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
        email: cleanEmail,
        role: 'rider',
        name: r.name,
        phone: r.phone,
        vehicleNumber: r.vehicle,
        createdAt: '2026-10-01T00:00:00Z',
        status: 'active',
      });
    }
  });

  // 5. Check additional env emails
  const envAdmins = process.env.ADMIN_EMAILS || '';
  if (envAdmins) {
    envAdmins.split(',').forEach((em) => {
      const clean = em.trim().toLowerCase();
      if (clean && !adminsMap.has(clean)) {
        adminsMap.set(clean, {
          id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: clean,
          role: 'admin',
          name: 'Store Manager',
          createdAt: new Date().toISOString(),
          status: 'active',
        });
      }
    });
  }

  const envRiders = process.env.RIDER_EMAILS || '';
  if (envRiders) {
    envRiders.split(',').forEach((em) => {
      const clean = em.trim().toLowerCase();
      if (clean && !ridersMap.has(clean)) {
        ridersMap.set(clean, {
          id: `rider-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: clean,
          role: 'rider',
          name: 'Express Delivery Partner',
          phone: '',
          vehicleNumber: 'AP 26 EQ 4589',
          createdAt: new Date().toISOString(),
          status: 'active',
        });
      }
    });
  }
}

function persistCacheToDisk() {
  const data = {
    admins: Array.from(adminsMap.values()),
    riders: Array.from(ridersMap.values()),
    updatedAt: new Date().toISOString(),
  };
  const jsonContent = JSON.stringify(data, null, 2);

  // 1. Write to runtime cache file (/tmp or .next)
  try {
    const dir = path.dirname(STAFF_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STAFF_CACHE_FILE, jsonContent, 'utf-8');
  } catch (err) {
    console.warn('[StaffStore] Error writing runtime staff cache file:', err);
  }

  // 2. Also try to write to permanent repo file (works in dev and writeable environments)
  try {
    const repoDir = path.dirname(REPO_STAFF_FILE);
    if (!fs.existsSync(repoDir)) {
      fs.mkdirSync(repoDir, { recursive: true });
    }
    fs.writeFileSync(REPO_STAFF_FILE, jsonContent, 'utf-8');
  } catch {
    // Expected on read-only environments like Vercel serverless
  }
}

// Initial hydration
loadCacheFromDisk();

async function loadStaffFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .like('endpoint', 'staff:%');

    if (!error && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (!row.endpoint) return;
        const parts = row.endpoint.split(':');
        const type = parts[1]; // 'admin' | 'rider'
        const email = (row.user_email || parts.slice(2).join(':')).toLowerCase().trim();
        const norm = normalizeEmail(email);
        const keys = row.keys || {};

        if (type === 'admin') {
          const adm: StaffMember = {
            id: `admin-${email.replace(/[^a-z0-9]/g, '_')}`,
            email,
            role: 'admin',
            name: keys.name || 'Store Administrator',
            createdAt: row.created_at || new Date().toISOString(),
            status: 'active',
          };
          adminsMap.set(email, adm);
          if (norm && norm !== email) adminsMap.set(norm, adm);
        } else if (type === 'rider') {
          const rdr: StaffMember = {
            id: `rider-${email.replace(/[^a-z0-9]/g, '_')}`,
            email,
            role: 'rider',
            name: keys.name || 'Delivery Partner',
            phone: keys.phone || '',
            vehicleNumber: keys.vehicleNumber || 'AP 26 EQ 4589',
            createdAt: row.created_at || new Date().toISOString(),
            status: 'active',
          };
          ridersMap.set(email, rdr);
          if (norm && norm !== email) ridersMap.set(norm, rdr);
        }
      });
    }
  } catch (err) {
    console.warn('[StaffStore] Supabase staff sync note:', err);
  }
}

// Trigger background sync on module load
if (isSupabaseConfigured()) {
  loadStaffFromSupabase().catch(() => {});
}

export const serverStaffStore = {
  /**
   * Determine role for a given email address
   */
  getRoleForEmail(rawEmail?: string | null): UserRole {
    if (!rawEmail) return 'customer';
    loadCacheFromDisk();
    const email = rawEmail.toLowerCase().trim();
    const norm = normalizeEmail(email);

    // 1. Check if root admin
    const rootNorms = ROOT_ADMIN_EMAILS.map(normalizeEmail);
    if (rootNorms.includes(norm) || ROOT_ADMIN_EMAILS.map((e) => e.toLowerCase().trim()).includes(email)) {
      return 'admin';
    }

    // 2. Check admin map directly or normalized
    if (adminsMap.has(email) || adminsMap.has(norm)) {
      return 'admin';
    }
    for (const [key] of adminsMap.entries()) {
      if (normalizeEmail(key) === norm) {
        return 'admin';
      }
    }

    // 3. Check rider map directly or normalized
    if (ridersMap.has(email) || ridersMap.has(norm)) {
      return 'delivery_partner';
    }
    for (const [key] of ridersMap.entries()) {
      if (normalizeEmail(key) === norm) {
        return 'delivery_partner';
      }
    }

    // 4. Default hard-fallback for known delivery partners
    if (
      norm === 'rider@g1mart.com' ||
      norm === 'gummasaiganesh57@gmail.com' ||
      email === 'gumma.saiganesh57@gmail.com'
    ) {
      return 'delivery_partner';
    }

    return 'customer';
  },

  /**
   * Determine role for a given email address asynchronously with live Supabase fallback
   */
  async getRoleForEmailAsync(rawEmail?: string | null): Promise<UserRole> {
    if (!rawEmail) return 'customer';
    const email = rawEmail.toLowerCase().trim();
    const norm = normalizeEmail(email);

    // Fast check: in-memory, disk, root admins, known emails
    const syncRole = this.getRoleForEmail(rawEmail);
    if (syncRole !== 'customer') return syncRole;

    // Live query against Supabase push_subscriptions (persists across all Vercel lambdas)
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('role')
          .in('endpoint', [
            `staff:admin:${email}`,
            `staff:admin:${norm}`,
            `staff:rider:${email}`,
            `staff:rider:${norm}`,
          ]);

        if (!error && Array.isArray(data) && data.length > 0) {
          const found = data[0].role;
          if (found === 'admin') return 'admin';
          if (found === 'delivery_partner' || found === 'rider') return 'delivery_partner';
        }
      } catch (err) {
        console.warn('[StaffStore] Supabase async role check warning:', err);
      }
    }

    return 'customer';
  },

  isAdmin(rawEmail?: string | null): boolean {
    return this.getRoleForEmail(rawEmail) === 'admin';
  },

  isRider(rawEmail?: string | null): boolean {
    const role = this.getRoleForEmail(rawEmail);
    return role === 'delivery_partner' || role === 'rider';
  },

  /**
   * List all current admins and riders synchronously
   */
  getStaff(): { admins: StaffMember[]; riders: StaffMember[] } {
    loadCacheFromDisk();
    return {
      admins: Array.from(adminsMap.values()),
      riders: Array.from(ridersMap.values()),
    };
  },

  /**
   * List all current admins and riders with live Supabase database sync
   */
  async getStaffAsync(): Promise<{ admins: StaffMember[]; riders: StaffMember[] }> {
    loadCacheFromDisk();
    await loadStaffFromSupabase();
    return {
      admins: Array.from(adminsMap.values()),
      riders: Array.from(ridersMap.values()),
    };
  },

  /**
   * Sync staff from client-side storage (prevents loss on cold starts)
   */
  syncClientStaff(clientAdmins?: StaffMember[], clientRiders?: StaffMember[]) {
    let changed = false;
    if (Array.isArray(clientAdmins)) {
      clientAdmins.forEach((a) => {
        if (a?.email) {
          const em = a.email.toLowerCase().trim();
          if (!adminsMap.has(em)) {
            adminsMap.set(em, a);
            changed = true;
            if (isSupabaseConfigured()) {
              supabase.from('push_subscriptions').upsert({
                endpoint: `staff:admin:${em}`,
                keys: { name: a.name || 'Store Administrator' },
                user_email: em,
                role: 'admin',
                is_admin: true,
                created_at: a.createdAt || new Date().toISOString(),
              }).then(() => {}).catch(() => {});
            }
          }
        }
      });
    }
    if (Array.isArray(clientRiders)) {
      clientRiders.forEach((r) => {
        if (r?.email) {
          const em = r.email.toLowerCase().trim();
          if (!ridersMap.has(em)) {
            ridersMap.set(em, r);
            changed = true;
            if (isSupabaseConfigured()) {
              supabase.from('push_subscriptions').upsert({
                endpoint: `staff:rider:${em}`,
                keys: {
                  name: r.name || 'Delivery Partner',
                  phone: r.phone || '',
                  vehicleNumber: r.vehicleNumber || 'AP 26 EQ 4589',
                },
                user_email: em,
                role: 'delivery_partner',
                is_admin: false,
                created_at: r.createdAt || new Date().toISOString(),
              }).then(() => {}).catch(() => {});
            }
          }
        }
      });
    }
    if (changed) {
      persistCacheToDisk();
    }
  },

  /**
   * Grant admin access to an email
   */
  async addAdmin(
    rawEmail: string,
    name?: string
  ): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
    const email = rawEmail.toLowerCase().trim();
    const normEmail = normalizeEmail(email);
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    // If already admin
    if (adminsMap.has(email)) {
      return { success: true, staff: adminsMap.get(email) };
    }

    // Remove from riders if moving to admin
    if (ridersMap.has(email)) {
      ridersMap.delete(email);
    }
    if (normEmail && ridersMap.has(normEmail)) {
      ridersMap.delete(normEmail);
    }

    const newAdmin: StaffMember = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      role: 'admin',
      name: name || 'Administrator',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    adminsMap.set(email, newAdmin);
    if (normEmail && normEmail !== email) {
      adminsMap.set(normEmail, { ...newAdmin, email: normEmail });
    }
    persistCacheToDisk();

    // Persist to Supabase push_subscriptions so every serverless instance knows immediately
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('push_subscriptions').upsert({
          endpoint: `staff:admin:${email}`,
          keys: { name: newAdmin.name },
          user_email: email,
          role: 'admin',
          is_admin: true,
          created_at: newAdmin.createdAt,
        });
        if (normEmail && normEmail !== email) {
          await supabase.from('push_subscriptions').upsert({
            endpoint: `staff:admin:${normEmail}`,
            keys: { name: newAdmin.name },
            user_email: normEmail,
            role: 'admin',
            is_admin: true,
            created_at: newAdmin.createdAt,
          });
        }
      } catch (err) {
        console.warn('[StaffStore] Supabase admin persist warning:', err);
      }
    }

    return { success: true, staff: newAdmin };
  },

  /**
   * Remove admin access from an email
   */
  async removeAdmin(rawEmail: string, requesterEmail?: string): Promise<{ success: boolean; error?: string }> {
    const email = rawEmail.toLowerCase().trim();
    const normEmail = normalizeEmail(email);
    const requester = (requesterEmail || '').toLowerCase().trim();
    const reqNorm = normalizeEmail(requester);

    // 1. Permanent protection: Suresh Dega cannot be removed by anyone
    if (
      email === 'sureshdega466@gmail.com' ||
      normEmail === normalizeEmail('sureshdega466@gmail.com')
    ) {
      return {
        success: false,
        error: 'Suresh Dega (sureshdega466@gmail.com) is the protected master administrator and cannot be removed.',
      };
    }

    const isSuresh =
      requester === 'sureshdega466@gmail.com' ||
      reqNorm === normalizeEmail('sureshdega466@gmail.com');
    const isOwner =
      isSuresh ||
      requester === 'lingalamahendra0@gmail.com' ||
      requester === 'g1mart@gmail.com' ||
      requester === 'admin@g1mart.com' ||
      requester === 'system@g1mart.com';

    // Disallow non-owners from removing root owner accounts
    if (!isOwner && (email === 'g1mart@gmail.com' || email === 'lingalamahendra0@gmail.com')) {
      return { success: false, error: 'Only authorized superadmins can modify primary store accounts.' };
    }

    if (!adminsMap.has(email)) {
      persistCacheToDisk();
      return { success: true };
    }

    adminsMap.delete(email);
    if (normEmail) adminsMap.delete(normEmail);
    persistCacheToDisk();

    // Delete from Supabase push_subscriptions & downgrade profiles
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', [`staff:admin:${email}`, `staff:admin:${normEmail}`]);

        await supabase
          .from('profiles')
          .update({ role: 'customer' })
          .or(`email.eq.${email},email.eq.${normEmail}`);
      } catch (err) {
        console.warn('[StaffStore] Supabase profile downgrade warning:', err);
      }
    }

    return { success: true };
  },

  /**
   * Register or assign a delivery rider
   */
  async addRider(params: {
    email: string;
    name: string;
    phone?: string;
    vehicleNumber?: string;
  }): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
    const email = params.email.toLowerCase().trim();
    const normEmail = normalizeEmail(email);
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    // Disallow overriding root admin
    if (ROOT_ADMIN_EMAILS.map(normalizeEmail).includes(normEmail)) {
      return { success: false, error: 'Root admin cannot be assigned as rider.' };
    }

    // If exists in admins, remove from admins
    if (adminsMap.has(email)) adminsMap.delete(email);
    if (adminsMap.has(normEmail)) adminsMap.delete(normEmail);

    const newRider: StaffMember = {
      id: `rider-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      role: 'rider',
      name: params.name || 'Delivery Partner',
      phone: params.phone || '',
      vehicleNumber: params.vehicleNumber || 'AP 26 EQ 4589',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    ridersMap.set(email, newRider);
    if (normEmail && normEmail !== email) {
      ridersMap.set(normEmail, { ...newRider, email: normEmail });
    }
    persistCacheToDisk();

    // Sync to Supabase push_subscriptions & profiles
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('push_subscriptions').upsert({
          endpoint: `staff:rider:${email}`,
          keys: {
            name: newRider.name,
            phone: newRider.phone,
            vehicleNumber: newRider.vehicleNumber,
          },
          user_email: email,
          role: 'delivery_partner',
          is_admin: false,
          created_at: newRider.createdAt,
        });
        if (normEmail && normEmail !== email) {
          await supabase.from('push_subscriptions').upsert({
            endpoint: `staff:rider:${normEmail}`,
            keys: {
              name: newRider.name,
              phone: newRider.phone,
              vehicleNumber: newRider.vehicleNumber,
            },
            user_email: normEmail,
            role: 'delivery_partner',
            is_admin: false,
            created_at: newRider.createdAt,
          });
        }

        await supabase
          .from('profiles')
          .update({ role: 'delivery_partner' })
          .or(`email.eq.${email},email.eq.${normEmail}`);

        await supabase.from('riders').upsert({
          name: newRider.name,
          phone: newRider.phone || '0000000000',
          vehicle_number: newRider.vehicleNumber || 'AP 26 EQ 4589',
          is_active: true,
        });
      } catch (err) {
        console.warn('[StaffStore] Supabase rider sync warning:', err);
      }
    }

    return { success: true, staff: newRider };
  },

  /**
   * Remove a delivery rider
   */
  async removeRider(idOrEmail: string): Promise<{ success: boolean; error?: string }> {
    const key = idOrEmail.toLowerCase().trim();
    let emailKey = key;

    if (!ridersMap.has(emailKey)) {
      // Check by id
      const found = Array.from(ridersMap.values()).find((r) => r.id === idOrEmail);
      if (found) emailKey = found.email.toLowerCase().trim();
    }

    const normEmail = normalizeEmail(emailKey);
    if (!ridersMap.has(emailKey) && !ridersMap.has(normEmail)) {
      persistCacheToDisk();
      return { success: true };
    }

    ridersMap.delete(emailKey);
    if (normEmail) ridersMap.delete(normEmail);
    persistCacheToDisk();

    // Delete from Supabase push_subscriptions & downgrade in profiles
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', [`staff:rider:${emailKey}`, `staff:rider:${normEmail}`]);

        await supabase
          .from('profiles')
          .update({ role: 'customer' })
          .or(`email.eq.${emailKey},email.eq.${normEmail}`);
      } catch (err) {
        console.warn('[StaffStore] Supabase rider downgrade warning:', err);
      }
    }

    return { success: true };
  },
};
