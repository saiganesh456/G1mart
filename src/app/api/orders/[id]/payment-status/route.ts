import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { phonePeAdapter } from '@/lib/payment/phonepeAdapter';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id: orderId } = await params;

    const order = serverOrderStore.getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order ${orderId} not found` },
        { status: 404 }
      );
    }

    // If order is already completed or failed, return immediately
    if (order.paymentStatus === 'completed' || order.paymentStatus === 'failed' || order.paymentStatus === 'manual_verified' || order.paymentStatus === 'cash_on_delivery') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        isPaid: !!order.isPaid,
        paidAmount: order.paidAmount,
        paidAt: order.paidAt,
        grandTotal: order.grandTotal,
        paymentMethod: order.paymentMethod,
        transactionId: order.transactionId,
      });
    }

    // Rule 6: If the webhook has not arrived, server check uses the Order Status API
    if (order.paymentStatus === 'pending' && order.providerOrderId) {
      const verifyResult = await phonePeAdapter.verifyPayment(order.providerOrderId);

      if (verifyResult.state === 'COMPLETED') {
        const markResult = await serverOrderStore.markOrderPaid({
          providerOrderId: order.providerOrderId,
          transactionId: verifyResult.transactionId,
          amountInPaise: verifyResult.amountInPaise,
          rawResponse: verifyResult.raw,
        });

        if (markResult.success && markResult.order) {
          return NextResponse.json({
            success: true,
            orderId: markResult.order.id,
            paymentStatus: markResult.order.paymentStatus,
            isPaid: !!markResult.order.isPaid,
            paidAmount: markResult.order.paidAmount,
            paidAt: markResult.order.paidAt,
            grandTotal: markResult.order.grandTotal,
            transactionId: markResult.order.transactionId,
          });
        }
      } else if (verifyResult.state === 'FAILED') {
        await serverOrderStore.markOrderFailed({
          providerOrderId: order.providerOrderId,
          transactionId: verifyResult.transactionId,
          error: verifyResult.error,
          rawResponse: verifyResult.raw,
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          paymentStatus: 'failed',
          isPaid: false,
          error: verifyResult.error || 'Payment failed/declined on UPI',
          grandTotal: order.grandTotal,
        });
      }
    }

    // Still pending
    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentStatus: 'pending',
      isPaid: false,
      paidAmount: order.paidAmount || 0,
      grandTotal: order.grandTotal,
      providerOrderId: order.providerOrderId,
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking payment status' },
      { status: 500 }
    );
  }
}
