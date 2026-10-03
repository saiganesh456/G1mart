import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action = 'success', tamperedAmount } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const order = serverOrderStore.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: `Order #${orderId} not found` }, { status: 404 });
    }

    const providerOrderId = order.providerOrderId || `MT_${orderId}_sim`;

    if (action === 'success') {
      const amountInPaise = tamperedAmount ? Math.round(tamperedAmount * 100) : Math.round(order.grandTotal * 100);
      const transactionId = `T${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

      const markResult = await serverOrderStore.markOrderPaid({
        providerOrderId,
        transactionId,
        amountInPaise,
        rawResponse: {
          simulated: true,
          mode: 'PHONEPE_SANDBOX_SIMULATION',
          paymentMode: 'UPI_INTENT',
          amount: amountInPaise,
          timestamp: new Date().toISOString(),
        },
      });

      if (!markResult.success) {
        return NextResponse.json({ success: false, error: markResult.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Order #${orderId} successfully marked paid in Sandbox simulation`,
        order: markResult.order,
        transactionId,
      });
    } else if (action === 'failure' || action === 'cancel') {
      await serverOrderStore.markOrderFailed({
        providerOrderId,
        error: 'Payment cancelled or declined in UPI simulation',
        rawResponse: {
          simulated: true,
          mode: 'PHONEPE_SANDBOX_SIMULATION',
          code: 'PAYMENT_DECLINED',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order #${orderId} marked failed in Sandbox simulation`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown simulation action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
