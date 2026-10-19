export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverPushService } from '@/lib/serverPushService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, userId, userEmail, userPhone } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Valid subscription object required' },
        { status: 400 }
      );
    }

    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    const isAdmin =
      body.isAdmin === true ||
      body.role === 'admin' ||
      normalizedEmail === 'sureshdega466@gmail.com' ||
      normalizedEmail === 'g1mart@gmail.com' ||
      normalizedEmail === 'lingalamahendra0@gmail.com' ||
      normalizedEmail === 'orders@g1mart.com';

    serverPushService.saveSubscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userId: userId || undefined,
      userEmail: userEmail || undefined,
      userPhone: userPhone || undefined,
      role: isAdmin ? 'admin' : (body.role || 'customer'),
      isAdmin,
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription registered for device',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
