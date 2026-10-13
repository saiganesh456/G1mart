import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './client';

// Global stores to survive Next.js client-side route transitions
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
    grecaptcha?: any;
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
  if (typeof window !== 'undefined') {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = undefined;
    }
  }
}

export function initRecaptchaVerifier(containerId = 'recaptcha-container'): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;

  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;

  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  const el = document.getElementById(containerId);
  if (!el) {
    console.warn(`[Firebase Phone Auth] Container #${containerId} not found in DOM yet.`);
    return null;
  }

  try {
    const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        clearRecaptcha();
      },
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.warn('[Firebase Phone Auth] Failed to initialize RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Sends OTP to a given 10-digit Indian phone number with a 20s safety timeout
 */
export async function sendFirebaseOtp(
  phone: string,
  recaptchaContainerId = 'recaptcha-container'
): Promise<{ success: boolean; error?: string }> {
  const firebaseAuth = getFirebaseAuth();
  if (!isFirebaseConfigured() || !firebaseAuth) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Please check your credentials.',
    };
  }

  try {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length !== 10) {
      return {
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number.',
      };
    }

    const formattedPhone = `+91${cleanDigits}`;

    // Get or initialize verifier
    let appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      appVerifier = initRecaptchaVerifier(recaptchaContainerId) || undefined;
    }

    if (!appVerifier) {
      // Fallback: create fresh verifier directly on container
      appVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
        size: 'invisible',
      });
      window.recaptchaVerifier = appVerifier;
    }

    // Safety timeout to prevent hanging on network or reCAPTCHA blockage
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('OTP request timed out. Please check your internet connection or disable ad blockers and try again.')),
        25000
      )
    );

    const confirmationResult = await Promise.race([
      signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier),
      timeoutPromise,
    ]);

    setStoredConfirmation(confirmationResult);
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase Phone Auth] Send OTP Error:', err);

    // Reset reCAPTCHA on failure so subsequent attempts succeed
    clearRecaptcha();

    let message = err?.message || 'Failed to send OTP.';
    if (err?.code === 'auth/invalid-phone-number') {
      message = 'Invalid phone number format.';
    } else if (err?.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please wait a few moments and try again.';
    } else if (err?.code === 'auth/captcha-check-failed') {
      message = 'reCAPTCHA verification failed. Please refresh the page and try again.';
    } else if (err?.code === 'auth/unauthorized-domain') {
      message = 'This domain is not authorized in Firebase Console. Please add localhost and your domain in Firebase Authentication Settings.';
    } else if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.message?.includes('region enabled') ||
      err?.message?.includes('OPERATION_NOT_ALLOWED')
    ) {
      message = 'SMS Region Restriction: Please enable India (+91) in Firebase Console -> Authentication -> Settings -> SMS region policy.';
    } else if (err?.code === 'auth/quota-exceeded') {
      message = 'SMS quota exceeded for today. Please try again tomorrow or use testing numbers.';
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
      error: 'Session expired or missing. Please go back and enter your mobile number again.',
    };
  }

  try {
    const result = await confirmation.confirm(otp.trim());
    return { success: true, user: result.user };
  } catch (err: any) {
    console.error('[Firebase Phone Auth] Verify OTP Error:', err);
    let message = 'Invalid or expired OTP. Please check and try again.';
    if (err?.code === 'auth/invalid-verification-code') {
      message = 'Incorrect 6-digit OTP code. Please enter the correct code.';
    } else if (err?.code === 'auth/code-expired') {
      message = 'The OTP code has expired. Please request a new code.';
    }
    return { success: false, error: message };
  }
}
