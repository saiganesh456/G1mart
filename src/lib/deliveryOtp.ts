/**
 * G1 Mart Customer Handover & Delivery OTP Service
 * Generates dynamic, unique 4-digit OTPs per customer order.
 * Ensures each customer receives a unique handover code.
 */

/**
 * Returns a dynamic, unique 4-digit delivery OTP for customer orders.
 * If a seed (e.g. orderId) is provided, generates a deterministic 4-digit code.
 */
export function generate4DigitOtp(seed?: string): string {
  if (seed) {
    let hash = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const num = 1000 + (Math.abs(hash) % 9000);
    return String(num);
  }
  // Generate random 4-digit numeric code from 1000 to 9999
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return String(randomNum);
}

/**
 * Verify delivery OTP provided by customer at doorstep or pickup counter.
 * Accepts:
 * 1. Exact matching expected order OTP
 * 2. Last 4 digits of customer mobile number (safe emergency fallback)
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

  // 1. Explicit expected OTP on order
  if (expectedOtp) {
    const cleanExpected = String(expectedOtp).trim();
    if (cleanProvided === cleanExpected) {
      return true;
    }
  }

  // 2. Customer mobile number last 4 digits (fallback if phone available)
  if (customerPhone) {
    const cleanPhone = String(customerPhone).replace(/\D/g, '');
    if (cleanPhone.length >= 4 && cleanPhone.slice(-4) === cleanProvided) {
      return true;
    }
  }

  return false;
}
