export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { serverStaffStore } from '@/lib/serverStaffStore';

/**
 * OAuth Callback Handler for Supabase Auth (e.g. Google OAuth)
 * 
 * 1. Exchanges auth code for session tokens.
 * 2. Writes session cookies to the response.
 * 3. Bridges the session into localStorage immediately so client components (Checkout, Account)
 *    instantly recognize the authenticated user with zero race conditions or re-login prompts.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const cookieNext = request.cookies.get('g1mart_auth_next')?.value;
  const rawNext = searchParams.get('next') || cookieNext || '/checkout';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[Google OAuth Provider Error]:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://pzrigfczxwscpzxkykvf.supabase.co';

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

    let cookiesToSetOnRedirect: Array<{ name: string; value: string; options?: any }> = [];

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
            // Merge properly preserving updates
            cookiesToSet.forEach((cookie) => {
              const idx = cookiesToSetOnRedirect.findIndex((c) => c.name === cookie.name);
              if (idx >= 0) {
                cookiesToSetOnRedirect[idx] = cookie;
              } else {
                cookiesToSetOnRedirect.push(cookie);
              }
            });
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError && data?.session?.user) {
      const u = data.session.user;
      const meta = u.user_metadata || {};
      const userEmail = (u.email || '').toLowerCase().trim();

      // Check role assignment from staff directory
      let assignedRole = await serverStaffStore.getRoleForEmailAsync(userEmail);

      // Check existing profile in Supabase to preserve any existing staff role
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .maybeSingle();

        if (existingProfile?.role && existingProfile.role !== 'customer') {
          if (assignedRole === 'customer') {
            assignedRole = existingProfile.role as any;
          }
        }
      } catch (checkErr) {
        console.warn('[Auth Callback] Existing role check note:', checkErr);
      }

      // Upsert profile in Supabase database
      const profileName = meta.full_name || meta.name || userEmail.split('@')[0] || 'Customer';
      const profilePhone = u.phone || meta.phone || '';
      try {
        await supabase.from('profiles').upsert(
          {
            id: u.id,
            full_name: profileName,
            email: userEmail,
            avatar_url: meta.avatar_url || meta.picture || '',
            phone: profilePhone,
            role: assignedRole,
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('[Auth Callback] Profile upsert warning:', profileErr);
      }

      // Determine smart destination:
      let targetPath = rawNext;
      if (assignedRole === 'admin') {
        if (rawNext === '/account' || rawNext === '/' || rawNext === '/checkout') {
          targetPath = '/admin';
        }
      } else if (assignedRole === 'delivery_partner' || assignedRole === 'rider') {
        if (rawNext === '/account' || rawNext === '/' || rawNext === '/checkout') {
          targetPath = '/rider';
        }
      }

      // Security: Sanitize targetPath to prevent open redirect vulnerabilities
      if (!targetPath.startsWith('/') || targetPath.startsWith('//')) {
        targetPath = '/checkout';
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const allowedHostPattern = /^((www\.)?g1mart\.in|[a-zA-Z0-9-]+\.vercel\.app|localhost(:\d+)?)$/i;
      const rawHost = forwardedHost ? forwardedHost.split(':')[0] : null;
      const isSafeHost = rawHost && allowedHostPattern.test(rawHost);

      const redirectUrl = isLocalEnv
        ? `${origin}${targetPath}`
        : (forwardedHost && isSafeHost)
        ? `https://${forwardedHost}${targetPath}`
        : `${origin}${targetPath}`;

      const userProfile = {
        id: u.id,
        name: profileName,
        phone: profilePhone,
        email: userEmail,
        avatar: meta.avatar_url || meta.picture || '',
        memberSince: new Date(u.created_at || Date.now()).toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
        role: assignedRole,
      };

      // HTML Bridge: Synchronizes session to browser localStorage and cookie jar simultaneously
      // This guarantees instant, persistent authentication on the checkout page with ZERO login prompt loops!
      const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="3;url=${redirectUrl}">
  <title>Signing in to G1mart...</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #212121;
    }
    .card {
      text-align: center;
      padding: 32px 24px;
      max-width: 320px;
    }
    .spinner {
      width: 38px;
      height: 38px;
      margin: 0 auto 16px;
      border: 3px solid #E0E0E0;
      border-top-color: #2E7D32;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 {
      font-size: 16px;
      font-weight: 800;
      margin: 0 0 6px;
      color: #1B5E20;
    }
    p {
      font-size: 12px;
      color: #757575;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Verified &amp; Signed In!</h2>
    <p>Loading your order details...</p>
  </div>
  <script>
    try {
      localStorage.setItem('g1mart_user_session', ${JSON.stringify(JSON.stringify(userProfile))});
      localStorage.setItem('g1mart_customer_name', ${JSON.stringify(userProfile.name)});
      if (${JSON.stringify(userProfile.phone)}) {
        localStorage.setItem('g1mart_customer_phone', ${JSON.stringify(userProfile.phone)});
      }
      localStorage.removeItem('g1mart_auth_next');
    } catch (e) {
      console.warn('Storage sync note:', e);
    }
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</body>
</html>`;

      const response = new NextResponse(htmlBody, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      });

      const isProd = process.env.NODE_ENV === 'production';
      const hostIsProdDomain = rawHost?.includes('g1mart.in');

      // Attach fresh session cookies with secure, explicit attributes
      cookiesToSetOnRedirect.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          path: '/',
          sameSite: 'lax',
          secure: isProd,
        });

        // If in production domain, also share across all subdomains (e.g. www.g1mart.in and g1mart.in)
        if (hostIsProdDomain) {
          response.cookies.set(name, value, {
            ...options,
            path: '/',
            domain: '.g1mart.in',
            sameSite: 'lax',
            secure: true,
          });
        }
      });

      // Clear the temporary redirect cookie
      response.cookies.delete('g1mart_auth_next');
      response.cookies.set('g1mart_auth_next', '', { path: '/', maxAge: 0 });

      return response;
    }

    if (exchangeError) {
      console.error('[Auth Callback Code Exchange Error]:', exchangeError.message, exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // Fallback redirect on missing code
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}
