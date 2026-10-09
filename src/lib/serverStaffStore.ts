import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { StaffMember, UserRole } from '@/types';

// Default primary super admin emails
export const ROOT_ADMIN_EMAILS = ['g1mart@gmail.com', 'lingalamahendra0@gmail.com'];
export const ROOT_ADMIN_EMAIL = 'g1mart@gmail.com';

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
  // 1. First, load from the permanent repository staff file (data/g1mart_staff.json)
  try {
    if (fs.existsSync(REPO_STAFF_FILE)) {
      const raw = fs.readFileSync(REPO_STAFF_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.admins)) {
        parsed.admins.forEach((a: StaffMember) => {
          if (a?.email) adminsMap.set(a.email.toLowerCase().trim(), a);
        });
      }
      if (Array.isArray(parsed.riders)) {
        parsed.riders.forEach((r: StaffMember) => {
          if (r?.email) ridersMap.set(r.email.toLowerCase().trim(), r);
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
          if (a?.email) adminsMap.set(a.email.toLowerCase().trim(), a);
        });
      }
      if (Array.isArray(parsed.riders)) {
        parsed.riders.forEach((r: StaffMember) => {
          if (r?.email) ridersMap.set(r.email.toLowerCase().trim(), r);
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
        name: rootEmail.includes('lingala') ? 'Mahendra Lingala (Store Admin)' : 'Primary Store Admin',
        createdAt: '2026-10-01T00:00:00Z',
        status: 'active',
      });
    }
  });

  // 4. Ensure known core riders are ALWAYS present
  const defaultRidersList: { email: string; name: string; phone: string; vehicle: string }[] = [
    { email: 'gummasaiganesh57@gmail.com', name: 'Sai Ganesh', phone: '9876543210', vehicle: 'AP 26 EQ 4589' },
    { email: 'vv727457@gmail.com', name: 'Vamsi Vardhan', phone: '9876543211', vehicle: 'AP 26 EQ 4590' },
    { email: 'rider@g1mart.com', name: 'Express Delivery Rider', phone: '9876543212', vehicle: 'AP 26 EQ 4591' },
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

export const serverStaffStore = {
  /**
   * Determine role for a given email address
   */
  getRoleForEmail(rawEmail?: string | null): UserRole {
    if (!rawEmail) return 'customer';
    const email = rawEmail.toLowerCase().trim();

    // Check if in admin map or root list
    if (adminsMap.has(email) || ROOT_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email)) {
      return 'admin';
    }

    // Check if in riders map or default list
    if (
      ridersMap.has(email) ||
      email === 'gummasaiganesh57@gmail.com' ||
      email === 'vv727457@gmail.com' ||
      email === 'rider@g1mart.com'
    ) {
      return 'delivery_partner';
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
   * List all current admins and riders
   */
  getStaff(): { admins: StaffMember[]; riders: StaffMember[] } {
    loadCacheFromDisk();
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

    const newAdmin: StaffMember = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      role: 'admin',
      name: name || 'Administrator',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    adminsMap.set(email, newAdmin);
    persistCacheToDisk();

    // Sync to Supabase profiles if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', email);
      } catch (err) {
        console.warn('[StaffStore] Supabase profile sync warning:', err);
      }
    }

    return { success: true, staff: newAdmin };
  },

  /**
   * Remove admin access from an email
   */
  async removeAdmin(rawEmail: string): Promise<{ success: boolean; error?: string }> {
    const email = rawEmail.toLowerCase().trim();
    if (ROOT_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email)) {
      return { success: false, error: 'Cannot remove primary root store admin.' };
    }

    if (!adminsMap.has(email)) {
      return { success: false, error: 'Admin email not found.' };
    }

    adminsMap.delete(email);
    persistCacheToDisk();

    // Downgrade in Supabase to customer
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('profiles')
          .update({ role: 'customer' })
          .eq('email', email);
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
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    // Disallow overriding root admin
    if (email === ROOT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Root admin cannot be assigned as rider.' };
    }

    // If exists in admins, remove from admins
    if (adminsMap.has(email)) {
      adminsMap.delete(email);
    }

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
    persistCacheToDisk();

    // Sync to Supabase profiles & riders table if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('profiles')
          .update({ role: 'delivery_partner' })
          .eq('email', email);

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

    if (!ridersMap.has(emailKey)) {
      return { success: false, error: 'Rider not found.' };
    }

    ridersMap.delete(emailKey);
    persistCacheToDisk();

    // Downgrade in Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('profiles')
          .update({ role: 'customer' })
          .eq('email', emailKey);
      } catch (err) {
        console.warn('[StaffStore] Supabase rider downgrade warning:', err);
      }
    }

    return { success: true };
  },
};
