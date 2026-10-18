import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { serverStaffStore, ROOT_ADMIN_EMAILS } from '@/lib/serverStaffStore';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthGuardResult {
  authorized: boolean;
  email?: string;
  error?: string;
  status?: number;
}

/**
 * Server-side guard to enforce administrator privileges on API routes.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AuthGuardResult> {
  // 1. Support secure machine-to-machine admin API key via header
  const adminKey = req.headers.get('x-admin-key');
  const configuredAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET;
  if (configuredAdminKey && adminKey === configuredAdminKey) {
    return { authorized: true, email: 'system@g1mart.com' };
  }

  // 2. Support client admin session headers (x-user-email / Bearer token)
  const clientUserEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
  if (
    clientUserEmail &&
    (serverStaffStore.isAdmin(clientUserEmail) || ROOT_ADMIN_EMAILS.includes(clientUserEmail))
  ) {
    return { authorized: true, email: clientUserEmail };
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser(token);
      if (data?.user?.email) {
        const email = data.user.email.toLowerCase().trim();
        if (serverStaffStore.isAdmin(email) || ROOT_ADMIN_EMAILS.includes(email)) {
          return { authorized: true, email };
        }
      }
    } catch {}
  }

  // 3. Admin portal referer check (for calls from the authenticated admin console)
  const referer = req.headers.get('referer') || '';
  if (referer.includes('/admin')) {
    return { authorized: true, email: clientUserEmail || 'g1mart@gmail.com' };
  }

  // 4. Offline / local development fallback when Supabase is not configured
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      return { authorized: true, email: 'dev-admin@g1mart.com' };
    }
    return {
      authorized: false,
      error: 'Authentication service not configured in production.',
      status: 500,
    };
  }

  // 5. Verify user session via Supabase SSR cookies
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      if (process.env.NODE_ENV !== 'production') {
        return { authorized: true, email: 'dev-admin@g1mart.com' };
      }
      return {
        authorized: false,
        error: 'Unauthorized: Authentication required to access administrative resources.',
        status: 401,
      };
    }

    const email = (user.email || '').toLowerCase().trim();
    if (!serverStaffStore.isAdmin(email) && !ROOT_ADMIN_EMAILS.includes(email)) {
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
      error: err?.message || 'Authentication failed',
      status: 500,
    };
  }
}

/**
 * Server-side guard to enforce delivery partner or admin access on rider API routes.
 */
export async function verifyRiderOrAdminRequest(req: NextRequest): Promise<AuthGuardResult> {
  const adminKey = req.headers.get('x-admin-key');
  const configuredAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET;
  if (configuredAdminKey && adminKey === configuredAdminKey) {
    return { authorized: true, email: 'system@g1mart.com' };
  }

  // Support client user email header
  const clientUserEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
  if (
    clientUserEmail &&
    (serverStaffStore.isAdmin(clientUserEmail) ||
      serverStaffStore.isRider(clientUserEmail) ||
      ROOT_ADMIN_EMAILS.includes(clientUserEmail))
  ) {
    return { authorized: true, email: clientUserEmail };
  }

  // Admin portal referer check (orders managed from /admin)
  const referer = req.headers.get('referer') || '';
  if (referer.includes('/admin')) {
    return { authorized: true, email: clientUserEmail || 'g1mart@gmail.com' };
  }

  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      return { authorized: true, email: 'dev-rider@g1mart.com' };
    }
    return {
      authorized: false,
      error: 'Authentication service not configured in production.',
      status: 500,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      if (process.env.NODE_ENV !== 'production') {
        return { authorized: true, email: 'dev-rider@g1mart.com' };
      }
      return {
        authorized: false,
        error: 'Unauthorized: Authentication required.',
        status: 401,
      };
    }

    const email = (user.email || '').toLowerCase().trim();
    if (!serverStaffStore.isRider(email) && !serverStaffStore.isAdmin(email) && !ROOT_ADMIN_EMAILS.includes(email)) {
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
      error: err?.message || 'Authentication failed',
      status: 500,
    };
  }
}
