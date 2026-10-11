import { NextRequest, NextResponse } from 'next/server';
import { razorpayAdapter } from '@/lib/payment/razorpayAdapter';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required Razorpay verification parameters (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature)',
        },
        { status: 400 }
      );
    }

    // Rule 1: The order becomes PAID only after server-side verification of payment signature/webhook
    const isValidSignature = razorpayAdapter.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      console.warn(`[Payment/Verify] Invalid signature received for order ${orderId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment signature verification failed. Untrusted or tampered signature.',
        },
        { status: 400 }
      );
    }

    // Signature verified on server! Mark order as paid in server store & Supabase
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

    return NextResponse.json({
      success: true,
      orderId,
      paymentStatus: 'paid',
      status: 'Order Placed',
      transactionId: razorpayPaymentId,
      redirectUrl: `/orders/${orderId}?paid=true`,
    });
  } catch (err: any) {
    console.error('[Payment/Verify] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error verifying payment' },
      { status: 500 }
    );
  }
}
