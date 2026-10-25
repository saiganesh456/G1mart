/**
 * Client-side Cookie Hygiene Utility
 * 
 * Aggressively purges stale PKCE verifiers, flow indices, and obsolete Supabase cookies
 * to prevent HTTP 494 REQUEST_HEADER_TOO_LARGE on Android devices and Chrome browsers.
 * 
 * Supports both standard document.cookie (with explicit Secure/Domain/Path variations)
 * and the modern asynchronous window.cookieStore API available in Chrome / Android WebView.
 */

const TARGET_PROJECT_ID = 'pzrigfczxwscpzxkykvf';

export function isStaleAuthCookie(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.includes('-code-verifier') || trimmed.includes('-flows-')) {
    return true;
  }
  if (trimmed === 'g1mart_auth_next') {
    return true;
  }
  if (trimmed.startsWith('sb-') && !trimmed.includes(TARGET_PROJECT_ID)) {
    return true;
  }
  return false;
}

export async function purgeStaleCookies(): Promise<void> {
  if (typeof window === 'undefined') return;

  const isHttps = window.location.protocol === 'https:';
  const hostname = window.location.hostname;
  const isProd = hostname.includes('g1mart.in');

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
          // Also attempt generic deletion
          await (window as any).cookieStore.delete({ name: cookie.name, path: '/' }).catch(() => {});
        }
      }
    } catch {
      // CookieStore fallback to document.cookie
    }
  }

  // 2. Standard document.cookie API (sweeping all path and domain permutations)
  if (typeof document !== 'undefined' && document.cookie) {
    try {
      const cookies = document.cookie.split(';');
      const paths = ['/', '/auth', ''];
      const domains = isProd ? ['.g1mart.in', 'g1mart.in', ''] : [''];

      for (const rawCookie of cookies) {
        const name = rawCookie.trim().split('=')[0];
        if (!name || !isStaleAuthCookie(name)) continue;

        for (const p of paths) {
          for (const d of domains) {
            const pathStr = p ? `; path=${p}` : '; path=/';
            const domainStr = d ? `; domain=${d}` : '';
            const secureStr = isHttps ? '; Secure' : '';

            // Expire with SameSite=Lax
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathStr}${domainStr}; SameSite=Lax${secureStr}`;

            // Expire with SameSite=None (for any cookies originally written with SameSite=None)
            if (isHttps) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathStr}${domainStr}; SameSite=None; Secure`;
            }

            // Expire without SameSite
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathStr}${domainStr}${secureStr}`;
          }
        }
      }
    } catch {
      // Non-blocking
    }
  }
}
