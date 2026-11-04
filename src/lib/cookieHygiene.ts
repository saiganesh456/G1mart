/**
 * Client-side Cookie Hygiene Utility
 * 
 * Purges obsolete Supabase cookies from older projects
 * to prevent HTTP 494 REQUEST_HEADER_TOO_LARGE on Android devices and Chrome browsers.
 * 
 * Never deletes active PKCE verifiers (-code-verifier / -flows-) so OAuth flows complete reliably.
 */

const TARGET_PROJECT_ID = 'pzrigfczxwscpzxkykvf';

export function isStaleAuthCookie(name: string): boolean {
  const trimmed = name.trim();
  // Only purge legacy project cookies or cookies from decommissioned projects
  if (trimmed.startsWith('sb-') && !trimmed.includes(TARGET_PROJECT_ID)) {
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
        if (isStaleAuthCookie(cookie.name)) {
          const deleteOptions: any = { name: cookie.name };
          if (cookie.path) deleteOptions.path = cookie.path;
          if (cookie.domain) deleteOptions.domain = cookie.domain;

          await (window as any).cookieStore.delete(deleteOptions).catch(() => {});
          await (window as any).cookieStore.delete({ name: cookie.name, path: '/' }).catch(() => {});
        }
      }
    } catch {
      // Fallback to document.cookie
    }
  }

  // 2. Standard document.cookie API (clean direct deletion without permutations)
  if (typeof document !== 'undefined' && document.cookie) {
    try {
      const cookies = document.cookie.split(';');

      for (const rawCookie of cookies) {
        const name = rawCookie.trim().split('=')[0];
        if (!name || !isStaleAuthCookie(name)) continue;

        // Clean host-only default cookie
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax${secureStr}`;

        // If on production domain, also clear any domain-level cookie that was previously registered
        if (isProd) {
          document.cookie = `${name}=; path=/; domain=.g1mart.in; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax; Secure`;
          document.cookie = `${name}=; path=/; domain=g1mart.in; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax; Secure`;
        }
      }
    } catch {
      // Non-blocking
    }
  }
}
