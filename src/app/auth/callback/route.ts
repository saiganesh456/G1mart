import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * OAuth Callback Handler for Supabase Auth (e.g. Google OAuth)
 * Exchanges the auth code for a session and sets cookies on the response.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[Google OAuth Provider Error]:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error('[Auth Callback Code Exchange Error]:', exchangeError.message, exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // Fallback redirect on missing code
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}
