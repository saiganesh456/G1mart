import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './client';

// Global stores to survive Next.js client-side route transitions
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

let storedConfirmationResult: ConfirmationResult | null = null;

export function getStoredConfirmation(): ConfirmationResult | null {
  if (storedConfirmationResult) return storedConfirmationResult;
  if (typeof window !== 'undefined' && window.confirmationResult) {
    return window.confirmationResult;
  }
  return null;
}

export function setStoredConfirmation(res: ConfirmationResult | null) {
  storedConfirmationResult = res;
  if (typeof window !== 'undefined') {
    window.confirmationResult = res || undefined;
  }
}

export function clearRecaptcha() {
  if (typeof window !== 'undefined' && window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {}
    window.recaptchaVerifier = undefined;
  }
}

export function getOrCreateRecaptcha(containerId: string): RecaptchaVerifier {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase credentials.');
  }

  if (typeof window !== 'undefined' && window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      clearRecaptcha();
    },
  });

  if (typeof window !== 'undefined') {
    window.recaptchaVerifier = verifier;
  }

  return verifier;
}

/**
 * Sends OTP to a given 10-digit Indian phone number (or full E.164 phone number)
 */
export async function sendFirebaseOtp(
  phone: string,
  recaptchaContainerId = 'recaptcha-container'
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Please add Firebase keys to .env.local.',
    };
  }

  try {
    const formattedPhone = phone.startsWith('+')
      ? phone
      : `+91${phone.replace(/\D/g, '').slice(-10)}`;

    const appVerifier = getOrCreateRecaptcha(recaptchaContainerId);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    setStoredConfirmation(confirmationResult);

    return { success: true };
  } catch (err: any) {
    clearRecaptcha();
    console.error('[Firebase Phone Auth] Send OTP Error:', err);
    let message = err?.message || 'Failed to send OTP.';
    if (err?.code === 'auth/invalid-phone-number') {
      message = 'Invalid phone number format.';
    } else if (err?.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please wait a few moments and try again.';
    } else if (err?.code === 'auth/captcha-check-failed') {
      message = 'reCAPTCHA check failed. Please refresh the page and try again.';
    }
    return { success: false, error: message };
  }
}

/**
 * Verifies the 6-digit OTP code against the active confirmation result
 */
export async function verifyFirebaseOtp(
  otp: string
): Promise<{ success: boolean; user?: UserCredential['user']; error?: string }> {
  const confirmation = getStoredConfirmation();
  if (!confirmation) {
    return {
      success: false,
      error: 'Session expired or missing. Please request a new OTP.',
    };
  }

  try {
    const result = await confirmation.confirm(otp.trim());
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('[Firebase Phone Auth] Verify OTP Error:', err);
    let message = 'Invalid or expired OTP. Please check and try again.';
    if (err?.code === 'auth/invalid-verification-code') {
      message = 'Incorrect 6-digit OTP code. Please try again.';
    } else if (err?.code === 'auth/code-expired') {
      message = 'The OTP code has expired. Please request a new one.';
    }
    return { success: false, error: message };
  }
}
