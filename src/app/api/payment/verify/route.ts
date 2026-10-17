export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { razorpayAdapter } from '@/lib/payment/razorpayAdapter';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId || body.order_id || body.internalOrderId;
    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id || body.order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id || body.payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature || body.signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required Razorpay verification parameters (razorpayOrderId, razorpayPaymentId, razorpaySignature)',
        },
        { status: 400 }
      );
    }

    // Step 3: Server-side HMAC-SHA256 signature verification
    const isValidSignature = razorpayAdapter.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      console.warn(`[Payment/Verify] Invalid signature received for order ${orderId || razorpayOrderId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment signature verification failed. Untrusted or tampered signature.',
        },
        { status: 400 }
      );
    }

    // Signature verified on server! Mark order as paid in server store & Supabase
    if (orderId) {
      const markResult = await serverOrderStore.markOrderPaid({
        orderId,
        providerOrderId: razorpayOrderId,
        transactionId: razorpayPaymentId,
        rawResponse: {
          gateway: 'razorpay',
          razorpayOrderId,
          razorpayPaymentId,
          verifiedAt: new Date().toISOString(),
        },
      });

      if (!markResult.success && !markResult.order) {
        return NextResponse.json(
          {
            success: false,
            error: markResult.error || 'Failed to update order status to paid',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderId || razorpayOrderId,
      paymentStatus: 'paid',
      status: 'Order Placed',
      transactionId: razorpayPaymentId,
      redirectUrl: orderId ? `/orders/${orderId}?paid=true` : undefined,
    });
  } catch (err: any) {
    console.error('[Payment/Verify] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error verifying payment' },
      { status: 500 }
    );
  }
}
