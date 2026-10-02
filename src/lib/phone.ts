/**
 * Phone Number Utilities for Indian Mobile Numbers (+91)
 * Handles auto-detection, sanitization, stripping of country code / leading zeros,
 * and standard 10-digit validation.
 */

/**
 * Sanitizes input into a clean 10-digit Indian mobile number.
 * Correctly strips:
 * - "+91", "91" (when user pastes full E.164 number like +919876543210)
 * - Leading "0" (when user inputs 09876543210)
 * - All spaces, dashes, brackets, and non-numeric characters
 *
 * Prevents the truncation bug where pasting "+91 98765 43210" previously turned into "9198765432"
 */
export function sanitizeIndianPhone(raw: string | null | undefined): string {
  if (!raw) return '';

  // 1. Remove all non-digits
  let digits = String(raw).replace(/\D/g, '');

  // 2. If it starts with 91 and has 12 digits, strip the leading country code 91
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // 3. If it starts with 0 and has 11 digits, strip the trunk prefix 0
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // 4. Return at most 10 digits
  return digits.slice(0, 10);
}

/**
 * Validates whether the given string is a valid 10-digit Indian mobile number.
 * Valid Indian mobile numbers are 10 digits and start with 6, 7, 8, or 9.
 */
export function isValidIndianPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const cleaned = sanitizeIndianPhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Formats a 10-digit number for display: "+91 98765 43210"
 */
export function formatIndianPhoneDisplay(phone: string | null | undefined): string {
  const cleaned = sanitizeIndianPhone(phone);
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return cleaned ? `+91 ${cleaned}` : '';
}
