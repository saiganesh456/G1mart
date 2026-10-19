export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay secret key not configured on server',
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Accept both standard Razorpay parameter names and camelCase aliases
    const orderId = body.order_id || body.razorpay_order_id || body.orderId;
    const paymentId = body.payment_id || body.razorpay_payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;

    // Validate presence of all three required verification fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: order_id, payment_id, and razorpay_signature are all required',
        },
        { status: 400 }
      );
    }

    // Step 3 Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Secure timing-safe signature comparison
    let signaturesMatch = false;
    if (typeof signature === 'string' && expectedSignature.length === signature.length) {
      signaturesMatch = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );
    }

    // Signature mismatch: return 400, do NOT mark as paid
    if (!signaturesMatch) {
      console.warn(`[Verify Payment] Signature mismatch for order ${orderId} and payment ${paymentId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment signature verification failed. Untrusted or tampered signature.',
        },
        { status: 400 }
      );
    }

    // Signatures match! If internal app order ID is present, update server store
    const internalOrderId = body.internalOrderId || body.merchantOrderId || body.appOrderId;
    if (internalOrderId) {
      try {
        await serverOrderStore.markOrderPaid({
          orderId: internalOrderId,
          providerOrderId: orderId,
          transactionId: paymentId,
          rawResponse: {
            gateway: 'razorpay',
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            verifiedAt: new Date().toISOString(),
          },
        });
      } catch (markErr) {
        console.warn('[Verify Payment] Could not update internal order store:', markErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (err: any) {
    console.error('[Verify Payment] Unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal server error verifying Razorpay payment signature',
      },
      { status: 500 }
    );
  }
}
