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
 * Securely verifies machine-to-machine admin keys, Bearer tokens, or Supabase SSR cookies.
 * Does NOT trust client-spoofed headers (x-admin-client or Referer).
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

      if (error || !user) {
        return {
          authorized: false,
          error: 'Unauthorized: Authentication required to access administrative resources.',
          status: 401,
        };
      }

      const email = (user.email || '').toLowerCase().trim();
      if (!serverStaffStore.isAdmin(email) && !KNOWN_ADMIN_EMAILS.includes(email)) {
        return {
          authorized: false,
          error: 'Forbidden: Administrator privileges required.',
          status: 403,
        };
      }

      return { authorized: true, email };
    } catch (err: any) {
      return {
        authorized: false,
        error: err?.message || 'Authentication verification failed',
        status: 500,
      };
    }
  }

  // 4. Offline / local development fallback ONLY when running in local development mode without Supabase
  if (process.env.NODE_ENV === 'development' && !isSupabaseConfigured()) {
    const devEmail = req.headers.get('x-user-email') || 'dev-admin@g1mart.local';
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

      if (error || !user) {
        return {
          authorized: false,
          error: 'Unauthorized: Authentication required.',
          status: 401,
        };
      }

      const email = (user.email || '').toLowerCase().trim();
      if (!serverStaffStore.isRider(email) && !serverStaffStore.isAdmin(email) && !KNOWN_ADMIN_EMAILS.includes(email)) {
        return {
          authorized: false,
          error: 'Forbidden: Rider or admin privileges required.',
          status: 403,
        };
      }

      return { authorized: true, email };
    } catch (err: any) {
      return {
        authorized: false,
        error: err?.message || 'Authentication verification failed',
        status: 500,
      };
    }
  }

  // 3. Local development fallback
  if (process.env.NODE_ENV === 'development' && !isSupabaseConfigured()) {
    return { authorized: true, email: 'dev-rider@g1mart.local' };
  }

  return {
    authorized: false,
    error: 'Unauthorized: Authentication required.',
    status: 401,
  };
}
