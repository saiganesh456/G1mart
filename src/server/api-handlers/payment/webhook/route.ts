export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { razorpayAdapter } from '@/lib/payment/razorpayAdapter';
import { phonePeAdapter } from '@/lib/payment/phonepeAdapter';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    // 1. Read RAW request body as text BEFORE any parsing (Phase 2 Rule 2)
    const rawBodyText = await req.text();

    const headersRecord: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headersRecord[key.toLowerCase()] = val;
    });

    let rawBodyJson: any = {};
    try {
      rawBodyJson = JSON.parse(rawBodyText);
    } catch {}

    // Detect gateway provider (Razorpay vs PhonePe) and validate signature
    const isRazorpay = Boolean(
      headersRecord['x-razorpay-signature'] ||
      (rawBodyJson && typeof rawBodyJson.event === 'string' && (rawBodyJson.event.startsWith('payment.') || rawBodyJson.event.startsWith('order.')))
    );

    const adapter = isRazorpay ? razorpayAdapter : phonePeAdapter;
    const webhookResult = await adapter.handleWebhook(headersRecord, rawBodyText);

    if (!webhookResult.providerOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing providerOrderId in webhook payload' },
        { status: 400 }
      );
    }

    const { providerOrderId, state, amountInPaise, transactionId } = webhookResult;

    // 2. Rule 5: Idempotency Check by transactionId (razorpay_payment_id)
    const idempotencyKey = `${providerOrderId}_${transactionId || 'notxn'}_${state}`;
    if (serverOrderStore.isWebhookProcessed(idempotencyKey)) {
      return NextResponse.json({
        success: true,
        message: 'Webhook event already processed (idempotent)',
      });
    }

    // 3. Process according to payload.state
    if (state === 'COMPLETED') {
      const paymentEntity = rawBodyJson?.payload?.payment?.entity;
      const orderEntity = rawBodyJson?.payload?.order?.entity;
      const internalOrderId =
        orderEntity?.receipt ||
        paymentEntity?.notes?.orderId ||
        paymentEntity?.notes?.internalOrderId ||
        paymentEntity?.notes?.merchantOrderId;

      const markResult = await serverOrderStore.markOrderPaid({
        orderId: internalOrderId,
        providerOrderId,
        transactionId,
        amountInPaise,
        rawResponse: rawBodyJson,
        source: 'webhook',
      });

      if (!markResult.success) {
        // Phase 2 Fix: If order not found in DB, DO NOT drop payment! Record as ORPHAN PAYMENT!
        await serverOrderStore.addOrphanPayment({
          paymentId: transactionId || `pay_${Date.now()}`,
          amount: (amountInPaise || 0) / 100,
          currency: paymentEntity?.currency || 'INR',
          customerPhone: paymentEntity?.contact || '',
          customerEmail: paymentEntity?.email || '',
          bankRrn: paymentEntity?.acquirer_data?.rrn || paymentEntity?.acquirer_data?.bank_transaction_id || '',
          capturedAt: new Date().toISOString(),
          status: 'UNLINKED',
          notes: `Captured via Razorpay webhook (${rawBodyJson?.event || 'payment.captured'}) for Razorpay Order #${providerOrderId}`,
        });

        await serverOrderStore.logPaymentEvent({
          source: 'webhook',
          payloadId: transactionId || providerOrderId || 'unknown',
          eventType: rawBodyJson?.event || 'payment.captured',
          paymentId: transactionId,
          orderId: providerOrderId,
          amount: (amountInPaise || 0) / 100,
          result: 'ORPHAN_PAYMENT_RECORDED',
          details: { error: markResult.error, providerOrderId, amountInPaise },
        });

        serverOrderStore.markWebhookProcessed(idempotencyKey);
        return NextResponse.json({ success: true, status: 'ORPHAN_PAYMENT_RECORDED' });
      }

      serverOrderStore.markWebhookProcessed(idempotencyKey);
      await serverOrderStore.logPaymentEvent({
        source: 'webhook',
        payloadId: transactionId || providerOrderId,
        eventType: rawBodyJson?.event || 'payment.captured',
        paymentId: transactionId,
        orderId: markResult.order?.id,
        amount: markResult.order?.grandTotal,
        result: 'ORDER_PAID',
        details: { providerOrderId, amountInPaise },
      });

      return NextResponse.json({ success: true, status: 'ORDER_PAID', orderId: markResult.order?.id });
    } else if (state === 'FAILED') {
      await serverOrderStore.markOrderFailed({
        providerOrderId,
        transactionId,
        error: webhookResult.error || 'Payment failed/declined on UPI',
        rawResponse: rawBodyJson,
      });

      await serverOrderStore.logPaymentEvent({
        source: 'webhook',
        payloadId: transactionId || providerOrderId,
        eventType: rawBodyJson?.event || 'payment.failed',
        paymentId: transactionId,
        orderId: providerOrderId,
        result: 'ORDER_FAILED',
        details: { error: webhookResult.error },
      });

      serverOrderStore.markWebhookProcessed(idempotencyKey);
      return NextResponse.json({ success: true, status: 'ORDER_FAILED' });
    }

    // PENDING state
    return NextResponse.json({ success: true, status: 'ORDER_PENDING' });
  } catch (err: any) {
    console.error('[Payment Webhook] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
