/**
 * G1 Mart Constant Doorstep Delivery OTP Service
 * Provides a constant, reliable 4-digit handover code for customer parcel delivery verification.
 * Prevents OTPs from fluctuating upon customer screen refresh.
 */

export const CONSTANT_DELIVERY_OTP = '1234';
export const ACCEPTED_FALLBACK_OTPS = ['1234', '4821'];

/**
 * Returns the constant 4-digit delivery OTP for customer orders.
 * Guaranteed constant across page reloads and device refreshes.
 */
export function generate4DigitOtp(): string {
  return CONSTANT_DELIVERY_OTP;
}

/**
 * Verify delivery OTP provided by customer at doorstep.
 * Accepts:
 * 1. Universal constant OTP ('1234' or '4821')
 * 2. Last 4 digits of customer mobile number
 * 3. Exact matching expected order OTP
 */
export function verifyDeliveryOtp(
  providedOtp: string,
  expectedOtp?: string | null,
  customerPhone?: string | null
): boolean {
  if (!providedOtp) return false;
  const cleanProvided = String(providedOtp).trim();

  if (cleanProvided.length !== 4) {
    return false;
  }

  // 1. Universal constant OTPs always work for every customer & rider
  if (ACCEPTED_FALLBACK_OTPS.includes(cleanProvided)) {
    return true;
  }

  // 2. Customer mobile number last 4 digits
  if (customerPhone) {
    const cleanPhone = String(customerPhone).replace(/\D/g, '');
    if (cleanPhone.length >= 4 && cleanPhone.slice(-4) === cleanProvided) {
      return true;
    }
  }

  // 3. Explicit expected OTP on order
  if (expectedOtp) {
    const cleanExpected = String(expectedOtp).trim();
    if (cleanProvided === cleanExpected) {
      return true;
    }
  }

  return false;
}
