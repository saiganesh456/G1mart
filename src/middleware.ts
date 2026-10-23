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
     * - Auth callbacks (/auth)
     * Public storefront browsing (/, /categories, /category/*, /product/*, /search)
     * is served directly from CDN with zero Edge middleware overhead.
     */
    '/admin/:path*',
    '/rider/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/auth/:path*',
  ],
};
