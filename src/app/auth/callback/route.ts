import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { serverStaffStore } from '@/lib/serverStaffStore';

/**
 * OAuth Callback Handler for Supabase Auth (e.g. Google OAuth)
 * Exchanges the auth code for a session and sets session cookies on the redirect response.
 * Automatically checks whether the user's email belongs to an Admin or Delivery Rider,
 * updates their role, and routes them directly to the appropriate interface!
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/account';
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
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSetOnRedirect = cookiesToSet;
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
      const assignedRole = serverStaffStore.getRoleForEmail(userEmail);

      // Upsert profile with proper role
      try {
        await supabase.from('profiles').upsert(
          {
            id: u.id,
            full_name: meta.full_name || meta.name || '',
            email: userEmail,
            avatar_url: meta.avatar_url || meta.picture || '',
            phone: u.phone || meta.phone || '',
            role: assignedRole,
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('[Auth Callback] Profile upsert warning:', profileErr);
      }

      // Determine smart destination:
      // If user came with explicit next (e.g. /admin), honor it.
      // Otherwise, if they are an admin, route to /admin. If rider, route to /rider.
      let targetPath = rawNext;
      if (rawNext === '/account' || rawNext === '/') {
        if (assignedRole === 'admin') {
          targetPath = '/admin';
        } else if (assignedRole === 'delivery_partner' || assignedRole === 'rider') {
          targetPath = '/rider';
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const redirectUrl = isLocalEnv
        ? `${origin}${targetPath}`
        : forwardedHost
        ? `https://${forwardedHost}${targetPath}`
        : `${origin}${targetPath}`;

      const response = NextResponse.redirect(redirectUrl);

      // Attach session cookies
      cookiesToSetOnRedirect.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

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
