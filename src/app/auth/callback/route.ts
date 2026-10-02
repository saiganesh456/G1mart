import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * OAuth Callback Handler for Supabase Auth (e.g. Google OAuth)
 * Exchanges the auth code for a session and sets session cookies on the redirect response.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[Google OAuth Provider Error]:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    const redirectUrl = isLocalEnv
      ? `${origin}${next}`
      : forwardedHost
      ? `https://${forwardedHost}${next}`
      : `${origin}${next}`;

    // Create the redirect response upfront so cookies set by Supabase are attached to it
    const response = NextResponse.redirect(redirectUrl);

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
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      // Sync user profile info if present
      if (data?.session?.user) {
        try {
          const u = data.session.user;
          const meta = u.user_metadata || {};
          await supabase.from('profiles').upsert(
            {
              id: u.id,
              full_name: meta.full_name || meta.name || '',
              email: u.email || '',
              avatar_url: meta.avatar_url || meta.picture || '',
              phone: u.phone || meta.phone || '',
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('[Auth Callback] Profile upsert non-critical warning:', profileErr);
        }
      }

      return response;
    }

    console.error('[Auth Callback Code Exchange Error]:', exchangeError.message, exchangeError);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  // Fallback redirect on missing code
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}
