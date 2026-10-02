import crypto from 'crypto';
import type { PaymentAdapter, CreatePaymentParams, CreatePaymentResult, VerifyPaymentResult } from './types';

export class PhonePePaymentAdapter implements PaymentAdapter {
  readonly name = 'phonepe';

  private merchantId: string;
  private saltKey: string;
  private saltIndex: string;
  private baseUrl: string;
  private webhookUsername?: string;
  private webhookPassword?: string;

  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    this.saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-0252-4e23-8c38-30c504a3901b';
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

    const env = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase();
    if (env === 'PRODUCTION' || env === 'PROD') {
      this.baseUrl = 'https://api.phonepe.com/apis/pg/v1';
    } else {
      this.baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1';
    }

    this.webhookUsername = process.env.PHONEPE_WEBHOOK_USERNAME;
    this.webhookPassword = process.env.PHONEPE_WEBHOOK_PASSWORD;
  }

  /**
   * 1. Create Payment Request (/pg/v1/pay)
   */
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    try {
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: params.merchantOrderId,
        merchantUserId: `MUID_${(params.customerPhone || 'GUEST').replace(/\D/g, '').slice(-10)}`,
        amount: Math.round(params.amountInPaise),
        redirectUrl: params.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: params.callbackUrl,
        mobileNumber: params.customerPhone ? params.customerPhone.replace(/\D/g, '').slice(-10) : undefined,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      const jsonString = JSON.stringify(payload);
      const base64Payload = Buffer.from(jsonString).toString('base64');
      const apiEndpoint = '/pg/v1/pay';
      const stringToHash = base64Payload + apiEndpoint + this.saltKey;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${this.saltIndex}`;

      const res = await fetch(`${this.baseUrl}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const responseData = await res.json();

      if (!responseData.success) {
        return {
          success: false,
          providerOrderId: params.merchantOrderId,
          error: responseData.message || 'Payment initiation declined by PhonePe',
          raw: responseData,
        };
      }

      const redirectUrl = responseData.data?.instrumentResponse?.redirectInfo?.url;

      return {
        success: true,
        providerOrderId: params.merchantOrderId,
        redirectUrl,
        raw: responseData,
      };
    } catch (err: any) {
      return {
        success: false,
        providerOrderId: params.merchantOrderId,
        error: err.message || 'Network error communicating with PhonePe',
      };
    }
  }

  /**
   * 2. Order Status API (/pg/v1/status/{merchantId}/{merchantTransactionId})
   */
  async verifyPayment(providerOrderId: string): Promise<VerifyPaymentResult> {
    try {
      const apiEndpoint = `/pg/v1/status/${this.merchantId}/${providerOrderId}`;
      const stringToHash = apiEndpoint + this.saltKey;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${this.saltIndex}`;

      const res = await fetch(`${this.baseUrl}/status/${this.merchantId}/${providerOrderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.merchantId,
        },
      });

      const json = await res.json();
      const data = json.data || {};
      const state = (data.state || json.code || '').toUpperCase();

      let mappedState: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (state === 'COMPLETED' || state === 'SUCCESS' || json.code === 'PAYMENT_SUCCESS') {
        mappedState = 'COMPLETED';
      } else if (
        state === 'FAILED' ||
        state === 'DECLINED' ||
        json.code === 'PAYMENT_ERROR' ||
        json.code === 'PAYMENT_DECLINED'
      ) {
        mappedState = 'FAILED';
      } else if (state === 'PENDING' || json.code === 'PAYMENT_PENDING') {
        mappedState = 'PENDING';
      }

      return {
        success: json.success && mappedState === 'COMPLETED',
        state: mappedState,
        amountInPaise: data.amount ? Number(data.amount) : undefined,
        transactionId: data.transactionId,
        providerOrderId: data.merchantTransactionId || providerOrderId,
        responseCode: data.responseCode || json.code,
        raw: json,
      };
    } catch (err: any) {
      return {
        success: false,
        state: 'PENDING',
        error: err.message || 'Error checking PhonePe order status',
      };
    }
  }

  /**
   * 3. Handle Webhook / Server-to-Server Callback
   * Validates Authorization / X-VERIFY header and extracts payload.state
   */
  async handleWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: any
  ): Promise<VerifyPaymentResult> {
    try {
      const headerObj: Record<string, string> = {};
      for (const [k, v] of Object.entries(headers)) {
        headerObj[k.toLowerCase()] = Array.isArray(v) ? v[0] : (v || '');
      }

      const receivedXVerify = headerObj['x-verify'];
      const receivedAuth = headerObj['authorization'];

      let decodedData: any = null;

      // Format A: Standard PhonePe Base64 response
      if (rawBody?.response) {
        const base64Response = rawBody.response;

        // Verify X-VERIFY checksum if provided
        if (receivedXVerify) {
          const stringToHash = base64Response + this.saltKey;
          const calculatedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
          const expectedXVerify = `${calculatedSha256}###${this.saltIndex}`;

          if (receivedXVerify !== expectedXVerify) {
            return {
              success: false,
              state: 'FAILED',
              error: 'Invalid X-VERIFY signature on webhook',
            };
          }
        }

        const decodedBuffer = Buffer.from(base64Response, 'base64');
        decodedData = JSON.parse(decodedBuffer.toString('utf8'));
      }
      // Format B: Event-based JSON payload (e.g. { event, payload })
      else if (rawBody?.payload) {
        // Validate Authorization header if Basic Auth or SHA Auth configured
        if (this.webhookUsername && this.webhookPassword && receivedAuth) {
          const expectedBasic = 'Basic ' + Buffer.from(`${this.webhookUsername}:${this.webhookPassword}`).toString('base64');
          const expectedSha = crypto.createHash('sha256').update(`${this.webhookUsername}:${this.webhookPassword}`).digest('hex');
          if (receivedAuth !== expectedBasic && !receivedAuth.includes(expectedSha)) {
            return {
              success: false,
              state: 'FAILED',
              error: 'Invalid Authorization header on webhook',
            };
          }
        }
        decodedData = rawBody;
      } else {
        decodedData = rawBody;
      }

      // Extract transaction details according to Rule 5: use payload.state
      const payload = decodedData?.payload || decodedData?.data || decodedData;
      const rawState = (payload?.state || decodedData?.code || '').toUpperCase();

      let state: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (rawState === 'COMPLETED' || rawState === 'SUCCESS' || decodedData?.code === 'PAYMENT_SUCCESS') {
        state = 'COMPLETED';
      } else if (
        rawState === 'FAILED' ||
        rawState === 'DECLINED' ||
        decodedData?.code === 'PAYMENT_ERROR' ||
        decodedData?.code === 'PAYMENT_DECLINED'
      ) {
        state = 'FAILED';
      } else {
        state = 'PENDING';
      }

      const amountInPaise = payload?.amount ? Number(payload.amount) : undefined;
      const providerOrderId = payload?.merchantTransactionId || payload?.orderId;
      const transactionId = payload?.transactionId;

      return {
        success: state === 'COMPLETED',
        state,
        amountInPaise,
        providerOrderId,
        transactionId,
        responseCode: payload?.responseCode || decodedData?.code,
        raw: decodedData,
      };
    } catch (err: any) {
      return {
        success: false,
        state: 'FAILED',
        error: `Webhook processing error: ${err.message}`,
      };
    }
  }
}

// Export singleton instance
export const phonePeAdapter = new PhonePePaymentAdapter();
