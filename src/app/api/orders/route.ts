import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { sanitizeIndianPhone } from '@/lib/phone';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const phone = searchParams.get('phone') || undefined;

    let orders = [];
    if (userId || phone) {
      orders = serverOrderStore.getUserOrders(userId, phone);
    } else {
      orders = serverOrderStore.getAllOrders();
    }

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, error: 'Valid order data with id required' },
        { status: 400 }
      );
    }

    const registered = serverOrderStore.registerOrder(body);
    return NextResponse.json({
      success: true,
      order: registered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to register order' },
      { status: 500 }
    );
  }
}
