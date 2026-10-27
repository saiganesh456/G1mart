import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes auth tokens on every server request so user sessions remain active
 * and cookies are synchronized across Next.js Server Components, Pages, and Browser.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://pzrigfczxwscpzxkykvf.supabase.co';

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookieOptions: {
          name: 'sb-pzrigfczxwscpzxkykvf-auth-token',
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            );
          },
        },
      }
    );

    // IMPORTANT: Do not remove getUser() as this refreshes the token when expired.
    // It checks cookies and writes any refreshed token back onto supabaseResponse.
    await supabase.auth.getUser();

    // Clean up any stale OAuth verifiers or legacy project cookies cleanly
    const incomingCookies = request.cookies.getAll();
    const isProd = process.env.NODE_ENV === 'production';
    for (const { name } of incomingCookies) {
      if (
        name.includes('-code-verifier') ||
        name.includes('-flows-') ||
        name === 'g1mart_auth_next' ||
        (name.startsWith('sb-') && !name.includes('pzrigfczxwscpzxkykvf'))
      ) {
        supabaseResponse.cookies.set(name, '', {
          path: '/',
          maxAge: 0,
          sameSite: 'lax',
          secure: isProd,
        });
      }
    }
  } catch (err) {
    console.warn('[Middleware] Supabase auth session check non-blocking fallback:', err);
  }

  return supabaseResponse;
}
