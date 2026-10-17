export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { serverPushService } from '@/lib/serverPushService';
import type { Order } from '@/types';

export async function POST() {
  try {
    const testOrder: Order = {
      id: `G1-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      slot: 'Standard Delivery',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'pending',
      status: 'Order Placed',
      subtotal: 360,
      discount: 0,
      deliveryFee: 0,
      taxes: 0,
      grandTotal: 360,
      items: [
        {
          productId: 'p-test',
          productName: 'Verusenaga Pappu (Peanuts)',
          unit: '1 kg',
          price: 180,
          quantity: 2,
          image: '/products/placeholder.svg',
        },
      ],
      address: {
        id: 'addr-test',
        fullName: 'Test Customer',
        mobileNumber: '9999999999',
        houseFlat: 'Plot 12',
        streetArea: 'Padarupalli',
        landmark: 'Govt Hospital',
        city: 'Nellore',
        state: 'Andhra Pradesh',
        pincode: '524004',
        type: 'Home',
        isDefault: true,
      },
      timeline: [{ status: 'Order Placed', time: 'Just now', completed: true }],
    };

    const sentCount = await serverPushService.notifyAdminsNewOrder(testOrder);

    return NextResponse.json({
      success: true,
      sentCount,
      message:
        sentCount > 0
          ? `Dispatched test alert to ${sentCount} registered admin device(s).`
          : 'No admin devices currently registered. Please tap "Enable Background Alerts" on your phone first!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch test notification' },
      { status: 500 }
    );
  }
}
