/**
 * Generic Payment Adapter Interfaces (Phase 5)
 * Allows plugging PhonePe, Razorpay, Cashfree, or mock sandbox adapters.
 */

export interface CreatePaymentParams {
  orderId: string;
  merchantOrderId: string;
  amountInPaise: number; // Exact amount in paise (e.g. ₹100.50 = 10050)
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  redirectUrl: string;
  callbackUrl: string;
}

export interface CreatePaymentResult {
  success: boolean;
  providerOrderId: string;
  redirectUrl?: string;
  error?: string;
  raw?: any;
}

export interface VerifyPaymentResult {
  success: boolean;
  state: 'COMPLETED' | 'FAILED' | 'PENDING';
  amountInPaise?: number;
  transactionId?: string;
  providerOrderId?: string;
  responseCode?: string;
  error?: string;
  raw?: any;
}

export interface PaymentAdapter {
  readonly name: string;

  /**
   * Initializes a payment checkout session with the provider.
   */
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;

  /**
   * Server-side polling / check of provider Order Status API.
   */
  verifyPayment(providerOrderId: string): Promise<VerifyPaymentResult>;

  /**
   * Validates and parses provider Server-to-Server webhook callback.
   */
  handleWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: any
  ): Promise<VerifyPaymentResult>;
}
