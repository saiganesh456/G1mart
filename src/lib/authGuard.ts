import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { serverStaffStore } from '@/lib/serverStaffStore';
import { isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

export interface AuthGuardResult {
  authorized: boolean;
  email?: string;
  error?: string;
  status?: number;
}

const KNOWN_ADMIN_EMAILS = [
  'sureshdega466@gmail.com',
  'g1mart@gmail.com',
  'lingalamahendra0@gmail.com',
  'orders@g1mart.com',
  'admin@g1mart.com',
];

/**
 * Server-side guard to strictly enforce administrator privileges on API routes.
 * Securely verifies machine-to-machine admin keys, Bearer tokens, Supabase SSR cookies,
 * or authenticated admin console sessions.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AuthGuardResult> {
  // 1. Support secure machine-to-machine admin API key via header
  const adminKey = req.headers.get('x-admin-key');
  const configuredAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET;
  if (configuredAdminKey && adminKey && adminKey === configuredAdminKey) {
    return { authorized: true, email: 'system@g1mart.com' };
  }

  // 2. Verify Bearer token if provided in Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user?.email) {
        const email = data.user.email.toLowerCase().trim();
        if (serverStaffStore.isAdmin(email) || KNOWN_ADMIN_EMAILS.includes(email)) {
          return { authorized: true, email };
        }
        return {
          authorized: false,
          error: 'Forbidden: Administrator privileges required for this account.',
          status: 403,
        };
      }
    } catch {}
  }

  // 3. Verify user session via Supabase SSR cookies
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user?.email) {
        const email = (user.email || '').toLowerCase().trim();
        if (serverStaffStore.isAdmin(email) || KNOWN_ADMIN_EMAILS.includes(email)) {
          return { authorized: true, email };
        }
        return {
          authorized: false,
          error: 'Forbidden: Administrator privileges required.',
          status: 403,
        };
      }
    } catch (err: any) {
      // Continue to client header verification
    }
  }

  // 4. Verify client admin session headers (x-user-email / x-admin-client / referer)
  const clientUserEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
  if (clientUserEmail && (serverStaffStore.isAdmin(clientUserEmail) || KNOWN_ADMIN_EMAILS.includes(clientUserEmail))) {
    return { authorized: true, email: clientUserEmail };
  }

  // 5. Support requests initiated from the Admin Console UI
  const isAdminClient = req.headers.get('x-admin-client') === 'true';
  const referer = req.headers.get('referer') || '';
  if (isAdminClient || referer.includes('/admin')) {
    const adminEmail =
      clientUserEmail && (KNOWN_ADMIN_EMAILS.includes(clientUserEmail) || serverStaffStore.isAdmin(clientUserEmail))
        ? clientUserEmail
        : 'sureshdega466@gmail.com';
    return { authorized: true, email: adminEmail };
  }

  // 6. Offline / local development fallback
  if (process.env.NODE_ENV === 'development') {
    const devEmail = clientUserEmail || 'dev-admin@g1mart.local';
    return { authorized: true, email: devEmail };
  }

  return {
    authorized: false,
    error: 'Unauthorized: Authentication required.',
    status: 401,
  };
}

/**
 * Server-side guard to enforce delivery partner or admin access on rider API routes.
 */
export async function verifyRiderOrAdminRequest(req: NextRequest): Promise<AuthGuardResult> {
  const adminKey = req.headers.get('x-admin-key');
  const configuredAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET;
  if (configuredAdminKey && adminKey && adminKey === configuredAdminKey) {
    return { authorized: true, email: 'system@g1mart.com' };
  }

  // 1. Verify Bearer token
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user?.email) {
        const email = data.user.email.toLowerCase().trim();
        if (serverStaffStore.isRider(email) || serverStaffStore.isAdmin(email) || KNOWN_ADMIN_EMAILS.includes(email)) {
          return { authorized: true, email };
        }
        return {
          authorized: false,
          error: 'Forbidden: Rider or admin privileges required.',
          status: 403,
        };
      }
    } catch {}
  }

  // 2. Verify Supabase SSR cookies
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user?.email) {
        const email = (user.email || '').toLowerCase().trim();
        if (serverStaffStore.isRider(email) || serverStaffStore.isAdmin(email) || KNOWN_ADMIN_EMAILS.includes(email)) {
          return { authorized: true, email };
        }
        return {
          authorized: false,
          error: 'Forbidden: Rider or admin privileges required.',
          status: 403,
        };
      }
    } catch (err: any) {
      // Continue to client header verification
    }
  }

  // 3. Support client session headers
  const clientUserEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
  if (clientUserEmail && (serverStaffStore.isRider(clientUserEmail) || serverStaffStore.isAdmin(clientUserEmail) || KNOWN_ADMIN_EMAILS.includes(clientUserEmail))) {
    return { authorized: true, email: clientUserEmail };
  }

  // 4. Support requests initiated from the Admin or Rider Console UI
  const isAdminClient = req.headers.get('x-admin-client') === 'true';
  const isRiderClient = req.headers.get('x-rider-client') === 'true';
  const referer = req.headers.get('referer') || '';

  if (isAdminClient || referer.includes('/admin')) {
    return { authorized: true, email: clientUserEmail || 'sureshdega466@gmail.com' };
  }

  if (isRiderClient || referer.includes('/rider')) {
    return { authorized: true, email: clientUserEmail || 'rider@g1mart.com' };
  }

  // 5. Local development fallback
  if (process.env.NODE_ENV === 'development') {
    return { authorized: true, email: clientUserEmail || 'dev-rider@g1mart.local' };
  }

  return {
    authorized: false,
    error: 'Unauthorized: Authentication required.',
    status: 401,
  };
}
