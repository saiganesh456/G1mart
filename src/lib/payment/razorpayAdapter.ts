import crypto from 'crypto';
import Razorpay from 'razorpay';
import type {
  PaymentAdapter,
  CreatePaymentParams,
  CreatePaymentResult,
  VerifyPaymentResult,
} from './types';

export interface RazorpayOrderDetails {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
}

export class RazorpayAdapter implements PaymentAdapter {
  readonly name = 'razorpay';

  private getKeyId(): string {
    return (
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      ''
    );
  }

  private getKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || '';
  }

  private getWebhookSecret(): string {
    return process.env.RAZORPAY_WEBHOOK_SECRET || this.getKeySecret();
  }

  private getClient(): Razorpay | null {
    const key_id = this.getKeyId();
    const key_secret = this.getKeySecret();
    if (!key_id || !key_secret) return null;
    return new Razorpay({ key_id, key_secret });
  }

  private isConfigured(): boolean {
    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();
    return Boolean(keyId && keySecret && !keyId.includes('g1mart_dev'));
  }

  /**
   * Initializes a Razorpay order session
   */
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    try {
      const client = this.getClient();

      // If valid Razorpay API keys are configured, use official SDK to create the order
      if (client && this.isConfigured()) {
        const order = await client.orders.create({
          amount: params.amountInPaise,
          currency: 'INR',
          receipt: params.orderId.slice(0, 40),
          notes: {
            merchantOrderId: params.merchantOrderId,
            customerPhone: params.customerPhone || '',
            customerName: params.customerName || '',
          },
        });

        return {
          success: true,
          providerOrderId: order.id,
          redirectUrl: `${params.redirectUrl}&providerOrderId=${encodeURIComponent(order.id)}`,
          raw: order,
        };
      }

      // Fallback for offline development / sandbox when credentials are not yet set
      const cleanId = params.orderId.replace(/[^a-zA-Z0-9]/g, '');
      const testRazorpayOrderId = `order_test_${cleanId}_${Date.now().toString().slice(-6)}`;

      return {
        success: true,
        providerOrderId: testRazorpayOrderId,
        redirectUrl: `${params.redirectUrl}&providerOrderId=${encodeURIComponent(testRazorpayOrderId)}`,
        raw: {
          id: testRazorpayOrderId,
          amount: params.amountInPaise,
          currency: 'INR',
          receipt: params.orderId,
          status: 'created',
          testMode: true,
        },
      };
    } catch (err: any) {
      console.error('[RazorpayAdapter] Error creating order:', err);
      return {
        success: false,
        providerOrderId: '',
        error: err?.error?.description || err?.message || 'Razorpay order creation failed',
      };
    }
  }

  /**
   * Verify server-side payment signature:
   * Razorpay Formula: HMAC SHA256 of `${order_id}|${payment_id}` using Key Secret
   */
  verifySignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const keySecret = this.getKeySecret();
    if (!keySecret) {
      console.error('[RazorpayAdapter] RAZORPAY_KEY_SECRET is not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature.length !== razorpaySignature.length) {
        return false;
      }

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpaySignature, 'utf-8')
      );
    } catch (err) {
      console.error('[RazorpayAdapter] Signature verification error:', err);
      return false;
    }
  }

  /**
   * Server-side check of Razorpay payment / order status
   */
  async verifyPayment(providerOrderId: string): Promise<VerifyPaymentResult> {
    try {
      const client = this.getClient();
      if (client && this.isConfigured()) {
        const order = (await client.orders.fetch(providerOrderId)) as any;
        const state =
          order.status === 'paid'
            ? 'COMPLETED'
            : order.status === 'attempted'
            ? 'PENDING'
            : 'FAILED';

        return {
          success: state === 'COMPLETED',
          state,
          amountInPaise: typeof order.amount === 'number' ? order.amount : Number(order.amount),
          providerOrderId: order.id,
          raw: order,
        };
      }

      // Test sandbox fallback
      return {
        success: true,
        state: 'COMPLETED',
        providerOrderId,
        raw: { testMode: true },
      };
    } catch (err: any) {
      return {
        success: false,
        state: 'FAILED',
        error: err?.error?.description || err?.message || 'Razorpay status verification failed',
      };
    }
  }

  /**
   * Validates and parses Razorpay Webhook callback
   */
  async handleWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: any
  ): Promise<VerifyPaymentResult> {
    try {
      const signatureHeader = headers['x-razorpay-signature'];
      const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
      const webhookSecret = this.getWebhookSecret();

      if (signature && webhookSecret) {
        const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
        const expected = crypto
          .createHmac('sha256', webhookSecret)
          .update(bodyString)
          .digest('hex');

        if (
          expected.length !== signature.length ||
          !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
        ) {
          return {
            success: false,
            state: 'FAILED',
            error: 'Invalid Razorpay webhook signature',
          };
        }
      }

      const event = rawBody?.event;
      const paymentEntity = rawBody?.payload?.payment?.entity;
      const orderEntity = rawBody?.payload?.order?.entity;

      const providerOrderId = orderEntity?.id || paymentEntity?.order_id;
      const transactionId = paymentEntity?.id;
      const amountInPaise = paymentEntity?.amount || orderEntity?.amount;

      if (event === 'order.paid' || event === 'payment.captured') {
        return {
          success: true,
          state: 'COMPLETED',
          providerOrderId,
          transactionId,
          amountInPaise,
          raw: rawBody,
        };
      } else if (event === 'payment.failed') {
        return {
          success: false,
          state: 'FAILED',
          providerOrderId,
          transactionId,
          error: paymentEntity?.error_description || 'Payment failed',
          raw: rawBody,
        };
      }

      return {
        success: true,
        state: 'PENDING',
        providerOrderId,
        transactionId,
        raw: rawBody,
      };
    } catch (err: any) {
      return {
        success: false,
        state: 'FAILED',
        error: err.message || 'Error processing Razorpay webhook',
      };
    }
  }
}

export const razorpayAdapter = new RazorpayAdapter();
