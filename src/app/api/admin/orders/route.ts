import { NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';

export async function GET() {
  try {
    const orders = serverOrderStore.getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch admin orders' },
      { status: 500 }
    );
  }
}
