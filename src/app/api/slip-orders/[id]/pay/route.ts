import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { razorpayAdapter } from '@/lib/payment/razorpayAdapter';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paymentMethod, razorpayPaymentId, razorpaySignature, razorpayOrderId } = body;

    const order = await serverSlipOrders.getSlipOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: `Slip order #${id} not found` }, { status: 404 });
    }

    const isPickup = order.order_type === 'pickup';

    // Phase 6 Rule 5: Run zone-minimum check on final subtotal (skip for pickup)
    if (!isPickup && order.subtotal < order.zone_min_order) {
      const shortfall = order.zone_min_order - order.subtotal;
      return NextResponse.json(
        {
          success: false,
          error: `Final subtotal (₹${order.subtotal}) is below the ₹${order.zone_min_order} zone minimum. Please add ₹${shortfall} more items to proceed with delivery.`,
          shortfall,
          minOrder: order.zone_min_order,
        },
        { status: 400 }
      );
    }

    // 1. Pay on Delivery
    if (paymentMethod === 'cod') {
      const payResult = await serverSlipOrders.processCustomerPayment({
        slipId: id,
        paymentMethod: 'cod',
      });

      if (!payResult.success) {
        return NextResponse.json({ success: false, error: payResult.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        order: payResult.order,
        paymentStatus: 'COD_PENDING',
        status: 'COD_PENDING',
      });
    }

    // 2. Pay Online (Razorpay)
    // If signature provided for verification:
    if (razorpayPaymentId && razorpaySignature && razorpayOrderId) {
      const isValid = razorpayAdapter.verifySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Payment signature verification failed' },
          { status: 400 }
        );
      }

      const payResult = await serverSlipOrders.processCustomerPayment({
        slipId: id,
        paymentMethod: 'online',
        transactionId: razorpayPaymentId,
      });

      if (!payResult.success) {
        return NextResponse.json({ success: false, error: payResult.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        order: payResult.order,
        paymentStatus: 'paid',
        status: 'PAID',
      });
    }

    // Else: Initiate Razorpay Order for Slip
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const rzpResult = await razorpayAdapter.createPayment({
      orderId: order.id,
      merchantOrderId: `MT_${order.id}`,
      amountInPaise: Math.round(order.final_total * 100),
      customerPhone: order.customer_phone,
      customerName: order.customer_name,
      redirectUrl: `${baseUrl}/orders/${order.id}?paid=true`,
      callbackUrl: `${baseUrl}/api/payment/webhook`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      providerOrderId: rzpResult.providerOrderId,
      amountInPaise: Math.round(order.final_total * 100),
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_g1mart_dev',
      grandTotal: order.final_total,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Payment processing error' },
      { status: 500 }
    );
  }
}
