import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run Supabase session refresh on authenticated and protected routes:
     * - Admin console (/admin)
     * - Rider console (/rider)
     * - Account & Profile (/account)
     * - Checkout & Orders (/checkout, /orders)
     * Public storefront browsing (/, /categories, /category/*, /product/*, /search)
     * is served directly from CDN with zero Edge middleware overhead.
     *
     * CRITICAL: Do NOT match '/auth/:path*'. The OAuth callback handler (/auth/callback)
     * exchanges the auth code directly and sets session cookies on its redirect.
     * Intercepting it in edge middleware duplicates incoming cookie headers into
     * internal transit headers (x-middleware-request-cookie), inflating header size
     * past Vercel's 32KB edge limit and triggering HTTP 494 REQUEST_HEADER_TOO_LARGE.
     */
    '/admin/:path*',
    '/rider/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/orders/:path*',
  ],
};
