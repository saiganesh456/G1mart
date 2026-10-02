import { NextRequest, NextResponse } from 'next/server';
import { phonePeAdapter } from '@/lib/payment/phonepeAdapter';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const headersRecord: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headersRecord[key.toLowerCase()] = val;
    });

    // 1. Validate incoming Authorization / X-VERIFY signature
    const webhookResult = await phonePeAdapter.handleWebhook(headersRecord, rawBody);

    if (!webhookResult.providerOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing merchantTransactionId in webhook payload' },
        { status: 400 }
      );
    }

    const { providerOrderId, state, amountInPaise, transactionId } = webhookResult;

    // 2. Rule 5: Idempotency Check
    // Prevent duplicate webhooks from double-updating an order or creating duplicate payments
    const idempotencyKey = `${providerOrderId}_${transactionId || 'notxn'}_${state}`;
    if (serverOrderStore.isWebhookProcessed(idempotencyKey)) {
      return NextResponse.json({
        success: true,
        message: 'Webhook event already processed (idempotent)',
      });
    }

    // 3. Process according to payload.state
    if (state === 'COMPLETED') {
      const markResult = await serverOrderStore.markOrderPaid({
        providerOrderId,
        transactionId,
        amountInPaise,
        rawResponse: rawBody,
      });

      if (!markResult.success) {
        // Tampered amount or order not found
        return NextResponse.json(
          { success: false, error: markResult.error },
          { status: 400 }
        );
      }

      serverOrderStore.markWebhookProcessed(idempotencyKey);
      return NextResponse.json({ success: true, status: 'ORDER_PAID' });
    } else if (state === 'FAILED') {
      await serverOrderStore.markOrderFailed({
        providerOrderId,
        transactionId,
        error: webhookResult.error || 'Payment failed/declined on UPI',
        rawResponse: rawBody,
      });

      serverOrderStore.markWebhookProcessed(idempotencyKey);
      return NextResponse.json({ success: true, status: 'ORDER_FAILED' });
    }

    // PENDING state
    return NextResponse.json({ success: true, status: 'ORDER_PENDING' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
