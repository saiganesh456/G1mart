'use client';

import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

export interface RazorpayCheckoutButtonProps {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  orderName?: string;
  orderDescription?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (paymentResult: {
    paymentId: string;
    orderId: string;
    signature: string;
  }) => void;
  onError?: (errorMessage: string) => void;
  onDismiss?: () => void;
}

/**
 * Helper to dynamically load the official Razorpay Checkout.js script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckoutButton({
  amountInPaise,
  currency = 'INR',
  receipt,
  orderName = 'G1mart Supermarket',
  orderDescription,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  buttonText,
  className,
  disabled = false,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1. Ensure Razorpay checkout.js script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // 2. Validate amount (minimum 100 paise)
      if (amountInPaise < 100) {
        throw new Error('Minimum payment amount is 100 paise (₹1).');
      }

      // 3. Step 1: Call backend to create Razorpay Order (POST /api/create-order)
      const createOrderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: {
            customerName,
            customerPhone,
          },
        }),
      });

      const orderData = await createOrderRes.json();
      if (!createOrderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create Razorpay order');
      }

      const { order_id, key_id } = orderData;
      const razorpayKey =
        key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        '';

      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is missing');
      }

      // 4. Step 2: Open Razorpay Standard Checkout Modal
      const callbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/payment/callback?orderId=${encodeURIComponent(order_id)}`;

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: orderName,
        description: orderDescription || `Order Payment #${order_id}`,
        order_id: order_id,
        callback_url: callbackUrl,
        redirect: true,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#2E7D32',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (onDismiss) {
              onDismiss();
            } else if (onError) {
              onError('Payment modal was closed by user.');
            }
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Send payment_id, order_id, and signature to backend verification endpoint
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed');
            }

            // Success callback
            onSuccess?.({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
          } catch (verifyError: any) {
            console.error('[Razorpay] Verification Error:', verifyError);
            onError?.(verifyError.message || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      // Handle payment.failed event
      razorpayInstance.on('payment.failed', (failureResponse: any) => {
        setLoading(false);
        const errorDesc =
          failureResponse?.error?.description ||
          failureResponse?.error?.reason ||
          'Payment failed during transaction.';
        console.error('[Razorpay] Transaction failed:', failureResponse);
        onError?.(`Payment failed: ${errorDesc}`);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setLoading(false);
      console.error('[RazorpayCheckoutButton] Error:', err);
      onError?.(err?.message || 'Failed to initiate Razorpay checkout');
    }
  };

  const displayAmount = (amountInPaise / 100).toFixed(2);

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={
        className ||
        'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer'
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{buttonText || `Pay ₹${displayAmount} via Razorpay`}</span>
        </>
      )}
    </button>
  );
}
