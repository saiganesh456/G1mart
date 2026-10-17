/**
 * G1 Mart Secure Doorstep Delivery OTP Service
 * Generates 4-digit numeric handover codes for quick-commerce parcel delivery verification.
 */

export function generate4DigitOtp(): string {
  // Guaranteed 4 digits between 1000 and 9999 (avoids confusing leading zeros)
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Verify delivery OTP provided by customer at doorstep.
 * Strict cryptographic/exact match required — backdoor bypass pins are completely eliminated.
 */
export function verifyDeliveryOtp(providedOtp: string, expectedOtp?: string | null): boolean {
  if (!providedOtp || !expectedOtp) return false;
  const cleanProvided = providedOtp.trim();
  const cleanExpected = expectedOtp.trim();

  if (cleanProvided.length !== 4 || cleanExpected.length !== 4) {
    return false;
  }

  return cleanProvided === cleanExpected;
}
