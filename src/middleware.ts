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
     * - Login route (/login)
     *
     * Storefront routes (/, /checkout, /orders, /account, /categories, /product/*)
     * are served directly with zero Edge middleware overhead. Auth session is
     * handled purely on the client via createBrowserClient, preventing cookie
     * header duplication (x-middleware-request-cookie) that causes HTTP 494
     * REQUEST_HEADER_TOO_LARGE at the edge proxy.
     */
    '/login',
    '/admin/:path*',
    '/rider/:path*',
  ],
};
