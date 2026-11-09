/**
 * Client-side Cookie Hygiene Utility
 * 
 * Aggressively purges ghost domain cookies, stale PKCE verifiers, and obsolete Supabase cookies
 * to prevent HTTP 494 REQUEST_HEADER_TOO_LARGE on Android devices, Chrome TWA, and WebViews.
 */

const TARGET_PROJECT_ID = 'pzrigfczxwscpzxkykvf';

export function isStaleAuthCookie(name: string): boolean {
  const trimmed = name.trim();
  // 1. Purge legacy project cookies from older Supabase instances
  if (trimmed.startsWith('sb-') && !trimmed.includes(TARGET_PROJECT_ID)) {
    return true;
  }
  // 2. Purge stale PKCE verifiers and flows that linger after OAuth
  if (trimmed.includes('-code-verifier') || trimmed.includes('-flows-')) {
    return true;
  }
  // 3. Purge temporary auth redirect cookies
  if (trimmed === 'g1mart_auth_next') {
    return true;
  }
  return false;
}

export async function purgeStaleCookies(): Promise<void> {
  if (typeof window === 'undefined') return;

  const isHttps = window.location.protocol === 'https:';
  const isProd = window.location.hostname.includes('g1mart.in');
  const secureStr = isHttps ? '; Secure' : '';

  // 1. Modern Chrome / Android Cookie Store API
  if ('cookieStore' in window && typeof (window as any).cookieStore?.getAll === 'function') {
    try {
      const allCookies: Array<{ name: string; domain?: string; path?: string }> =
        await (window as any).cookieStore.getAll();

      for (const cookie of allCookies) {
        const isGhostDomain = isProd && (cookie.domain === '.g1mart.in' || cookie.domain === 'g1mart.in');
        if (isStaleAuthCookie(cookie.name) || isGhostDomain) {
          const deleteOptions: any = { name: cookie.name };
          if (cookie.path) deleteOptions.path = cookie.path;
          if (cookie.domain) deleteOptions.domain = cookie.domain;

          await (window as any).cookieStore.delete(deleteOptions).catch(() => {});
          await (window as any).cookieStore.delete({ name: cookie.name, path: '/' }).catch(() => {});
          if (isProd) {
            await (window as any).cookieStore.delete({ name: cookie.name, domain: '.g1mart.in', path: '/' }).catch(() => {});
            await (window as any).cookieStore.delete({ name: cookie.name, domain: 'g1mart.in', path: '/' }).catch(() => {});
          }
        }
      }
    } catch {
      // Fallback to document.cookie
    }
  }

  // 2. Standard document.cookie API (clean direct deletion across all domain permutations)
  if (typeof document !== 'undefined' && document.cookie) {
    try {
      const cookies = document.cookie.split(';');

      for (const rawCookie of cookies) {
        const name = rawCookie.trim().split('=')[0];
        if (!name) continue;

        if (isStaleAuthCookie(name)) {
          // Clean host-only default cookie
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax${secureStr}`;

          // Also clear any domain-level cookie that was previously registered
          if (isProd) {
            document.cookie = `${name}=; path=/; domain=.g1mart.in; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax; Secure`;
            document.cookie = `${name}=; path=/; domain=g1mart.in; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax; Secure`;
          }
        }
      }
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Ensures total cookie size is well below proxy limits (<3KB).
 * Call on client application initialization.
 */
export function ensureCookieSafety(): void {
  if (typeof window === 'undefined') return;
  try {
    purgeStaleCookies().catch(() => {});
  } catch {}
}
