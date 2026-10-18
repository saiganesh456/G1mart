export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { serverPushService } from '@/lib/serverPushService';
import { sanitizeIndianPhone } from '@/lib/phone';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

    // Enforce data isolation: Never dump all store orders on public customer endpoints
    if (!userId && !cleanPhone) {
      return NextResponse.json({
        success: true,
        orders: [],
        count: 0,
        message: 'Please provide userId or phone number to retrieve personal orders.',
      });
    }

    const standardOrders = await serverOrderStore.getUserOrdersAsync(userId, cleanPhone);

    let slipOrdersFormatted: any[] = [];
    try {
      const allSlips = await serverSlipOrders.getSlipOrders();
      const matchedSlips = allSlips.filter((s) => {
        if (cleanPhone) {
          const sPhone = (s.customer_phone || '').replace(/\D/g, '').slice(-10);
          if (sPhone === cleanPhone) return true;
        }
        if (userId && (s.customer_id === userId || (s as any).userId === userId)) {
          return true;
        }
        return false;
      });

      slipOrdersFormatted = matchedSlips.map((slipOrder) => ({
        id: slipOrder.id,
        orderNumber: slipOrder.id,
        date: new Date(slipOrder.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: slipOrder.status,
        type: 'slip',
        orderType: slipOrder.order_type,
        subtotal: slipOrder.subtotal,
        estimatedTotal: slipOrder.estimated_total,
        finalTotal: slipOrder.final_total,
        grandTotal: slipOrder.final_total || slipOrder.estimated_total,
        total: slipOrder.final_total || slipOrder.estimated_total,
        deliveryFee: slipOrder.delivery_fee,
        codFee: slipOrder.cod_fee,
        paymentMethod: slipOrder.payment_method || 'Cash on Delivery',
        paymentStatus: slipOrder.payment_status,
        isPaid: slipOrder.payment_status === 'paid' || slipOrder.payment_status === 'completed',
        items: (slipOrder.items || []).map((it) => ({
          id: it.id,
          productId: it.product_id,
          productName: it.name,
          unit: it.unit,
          price: it.price,
          quantity: it.packed_qty || it.requested_qty,
          requestedQty: it.requested_qty,
          packedQty: it.packed_qty,
          available: it.available,
          substituteNote: it.substitute_note,
          image: '/products/placeholder.svg',
        })),
        images: slipOrder.images,
        address: {
          fullName: slipOrder.customer_name,
          phone: slipOrder.customer_phone,
          mobileNumber: slipOrder.customer_phone,
          streetArea: slipOrder.address,
          city: 'Nellore',
        },
        distance_km: slipOrder.distance_km,
        eta_min: slipOrder.eta_min,
        zone_min_order: slipOrder.zone_min_order,
        customerNote: slipOrder.customer_note,
        assignedRider: slipOrder.assigned_rider_name
          ? {
              id: slipOrder.assigned_rider_id,
              name: slipOrder.assigned_rider_name,
              phone: slipOrder.assigned_rider_phone,
            }
          : undefined,
      }));
    } catch (slipErr) {
      console.warn('[api/orders] Slip orders fetch error:', slipErr);
    }

    const mergedMap = new Map<string, any>();
    for (const order of standardOrders) {
      if (order?.id) mergedMap.set(order.id, order);
    }
    for (const slip of slipOrdersFormatted) {
      if (slip?.id && !mergedMap.has(slip.id)) {
        mergedMap.set(slip.id, slip);
      }
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        orders: merged,
        count: merged.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
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

    const registered = await serverOrderStore.registerOrderAsync(body);

    // Asynchronously notify all registered store managers / admins via Web Push
    // (Strict guard: NEVER notify for background sync, test replays, or historical orders)
    const isHistorical =
      body.isSync === true ||
      (body.date &&
        !isNaN(new Date(body.date).getTime()) &&
        Date.now() - new Date(body.date).getTime() > 5 * 60 * 1000);

    if (!isHistorical) {
      try {
        serverPushService.notifyAdminsNewOrder(registered).catch((pushErr) => {
          console.warn('[api/orders] Admin push notify notice:', pushErr);
        });
        serverPushService.sendOrderPushNotification(registered, 'Order Placed').catch(() => {});
      } catch {}
    }

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

export async function DELETE() {
  try {
    serverOrderStore.clearAllOrders();
    const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
    serverSlipOrders.clearAllSlips();

    try {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase/client');
      if (isSupabaseConfigured()) {
        await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('order_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('payments').delete().neq('id', '');
        await supabase.from('orders').delete().neq('id', '');
        await supabase.from('slip_items').delete().neq('id', '');
        await supabase.from('slip_images').delete().neq('id', '');
        await supabase.from('slip_orders').delete().neq('id', '');
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'All test orders successfully cleared',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear orders' },
      { status: 500 }
    );
  }
}

