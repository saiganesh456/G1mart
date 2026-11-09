import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run Supabase session refresh on authenticated backend consoles:
     * - Admin console (/admin)
     * - Rider console (/rider)
     *
     * Storefront & login routes (/, /login, /checkout, /orders, /account, /categories, /product/*)
     * are served directly with zero Edge middleware overhead. Auth session is
     * handled purely on the client via createBrowserClient, preventing cookie
     * header duplication (x-middleware-request-cookie) that causes HTTP 494
     * REQUEST_HEADER_TOO_LARGE at the edge proxy.
     */
    '/admin/:path*',
    '/rider/:path*',
  ],
};
