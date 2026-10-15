import { NextRequest, NextResponse } from 'next/server';
import { razorpayAdapter } from '@/lib/payment/razorpayAdapter';
import { serverOrderStore } from '@/lib/serverOrderStore';

export const dynamic = 'force-dynamic';

async function handleRazorpayCallback(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const host = req.headers.get('host') || 'jivanmart.in';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // 1. Parse body (form-urlencoded / multipart from Razorpay POST, or JSON)
    const bodyData: Record<string, string> = {};
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await req.formData().catch(() => null);
        if (formData) {
          formData.forEach((value, key) => {
            bodyData[key] = String(value);
          });
        }
      } else if (contentType.includes('application/json')) {
        const json = await req.json().catch(() => ({}));
        Object.assign(bodyData, json);
      }
    }

    // 2. Extract verification fields from body or query params
    const queryOrderId = searchParams.get('orderId');
    const razorpayOrderId =
      bodyData.razorpay_order_id ||
      bodyData.order_id ||
      searchParams.get('razorpay_order_id') ||
      searchParams.get('order_id') ||
      '';
    const razorpayPaymentId =
      bodyData.razorpay_payment_id ||
      bodyData.payment_id ||
      searchParams.get('razorpay_payment_id') ||
      searchParams.get('payment_id') ||
      '';
    const razorpaySignature =
      bodyData.razorpay_signature ||
      bodyData.signature ||
      searchParams.get('razorpay_signature') ||
      searchParams.get('signature') ||
      '';

    const orderIdParam = bodyData.orderId || bodyData.internalOrderId || queryOrderId || '';

    // 3. Check for payment errors from Razorpay (e.g. UPI app cancelled by user)
    const errorCode =
      bodyData['error[code]'] ||
      bodyData.error_code ||
      searchParams.get('error[code]') ||
      searchParams.get('error_code');
    const errorDescription =
      bodyData['error[description]'] ||
      bodyData.error_description ||
      searchParams.get('error[description]') ||
      searchParams.get('error_description');

    // 4. Resolve the internal order ID in server store
    let order = orderIdParam ? serverOrderStore.getOrder(orderIdParam) : undefined;
    if (!order && razorpayOrderId) {
      order = serverOrderStore.getOrderByProviderOrderId(razorpayOrderId);
    }
    const resolvedOrderId = order?.id || orderIdParam;

    // Handle cancellation or payment failure
    if (errorCode || errorDescription) {
      console.warn(`[Razorpay Callback] Payment failed/cancelled: ${errorCode} - ${errorDescription} for order #${resolvedOrderId}`);
      if (resolvedOrderId) {
        await serverOrderStore.markOrderFailed({
          orderId: resolvedOrderId,
          providerOrderId: razorpayOrderId,
          transactionId: razorpayPaymentId,
          error: (errorDescription || errorCode) ?? undefined,
        });
      }

      const redirectUrl = resolvedOrderId
        ? `${baseUrl}/orders/${resolvedOrderId}?payment_failed=true&error=${encodeURIComponent(errorDescription || 'Payment was not completed')}`
        : `${baseUrl}/payment?error=${encodeURIComponent(errorDescription || 'Payment was cancelled or failed')}`;

      return NextResponse.redirect(redirectUrl, 303);
    }

    // If required verification parameters are missing
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      console.warn('[Razorpay Callback] Missing verification params:', {
        hasOrderId: Boolean(razorpayOrderId),
        hasPaymentId: Boolean(razorpayPaymentId),
        hasSignature: Boolean(razorpaySignature),
      });

      const redirectUrl = resolvedOrderId
        ? `${baseUrl}/orders/${resolvedOrderId}`
        : `${baseUrl}/payment?error=Missing+payment+verification+parameters`;

      return NextResponse.redirect(redirectUrl, 303);
    }

    // 5. Verify HMAC-SHA256 signature using razorpayAdapter
    const isValidSignature = razorpayAdapter.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      console.error(`[Razorpay Callback] Signature mismatch for order #${resolvedOrderId || razorpayOrderId}`);
      const redirectUrl = resolvedOrderId
        ? `${baseUrl}/orders/${resolvedOrderId}?error=signature_failed`
        : `${baseUrl}/payment?error=Payment+verification+signature+mismatch`;

      return NextResponse.redirect(redirectUrl, 303);
    }

    // 6. Signature verified! Mark order as PAID in server store and Supabase
    if (resolvedOrderId) {
      await serverOrderStore.markOrderPaid({
        orderId: resolvedOrderId,
        providerOrderId: razorpayOrderId,
        transactionId: razorpayPaymentId,
        rawResponse: {
          gateway: 'razorpay',
          razorpayOrderId,
          razorpayPaymentId,
          callbackVerified: true,
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // 7. Clean redirect to Order Confirmation page showing all ordered items
    const destination = resolvedOrderId
      ? `${baseUrl}/orders/${resolvedOrderId}?paid=true`
      : `${baseUrl}/orders?paid=true`;

    const response = NextResponse.redirect(destination, 303);

    // Set cookie so client knows to immediately clear the cart
    response.cookies.set('g1mart_order_just_paid', resolvedOrderId || razorpayOrderId, {
      path: '/',
      maxAge: 300,
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('[Razorpay Callback] Unexpected error:', err);
    const host = req.headers.get('host') || 'jivanmart.in';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    return NextResponse.redirect(`${baseUrl}/orders?error=callback_error`, 303);
  }
}

export async function POST(req: NextRequest) {
  return handleRazorpayCallback(req);
}

export async function GET(req: NextRequest) {
  return handleRazorpayCallback(req);
}
