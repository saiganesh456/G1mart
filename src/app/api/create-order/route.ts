import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Validate authentication credentials presence
    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.',
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount: must be numeric and at least 100 paise (₹1)
    const numericAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numericAmount) || numericAmount < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount is required and must be at least 100 paise (₹1)',
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderPayload = {
      amount: Math.round(numericAmount),
      currency: currency || 'INR',
      receipt: receipt ? String(receipt).slice(0, 40) : `rcpt_${Date.now()}`,
      ...(notes && typeof notes === 'object' ? { notes } : {}),
    };

    try {
      const order = await razorpay.orders.create(orderPayload);

      return NextResponse.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId, // Safe to send public Key ID to frontend, NEVER secret
      });
    } catch (apiError: any) {
      console.error('[Create Order] Razorpay API Error:', apiError);

      const status = apiError?.statusCode === 401 ? 401 : 500;
      const message =
        apiError?.error?.description ||
        apiError?.message ||
        'Razorpay API order creation failed';

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status }
      );
    }
  } catch (err: any) {
    console.error('[Create Order] Internal Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal server error while creating Razorpay order',
      },
      { status: 500 }
    );
  }
}
