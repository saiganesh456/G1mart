export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const rawParams = await params;
    const id = decodeURIComponent(rawParams.id || '').trim();
    let order: any = null;

    // 1. If this is a slip order, ALWAYS load authoritatively from serverSlipOrders first
    if (id.startsWith('SLIP-')) {
      const slipOrder = await serverSlipOrders.getSlipOrderById(id);
      if (slipOrder) {
        order = {
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
          subtotal: slipOrder.subtotal,
          estimatedTotal: slipOrder.estimated_total,
          finalTotal: slipOrder.final_total || slipOrder.subtotal,
          grandTotal: slipOrder.final_total || slipOrder.estimated_total || slipOrder.subtotal,
          total: slipOrder.final_total || slipOrder.estimated_total || slipOrder.subtotal,
          deliveryFee: slipOrder.delivery_fee,
          codFee: slipOrder.cod_fee,
          paymentMethod: slipOrder.payment_method || 'Cash on Delivery',
          paymentStatus: slipOrder.payment_status,
          isPaid: slipOrder.payment_status === 'paid' || slipOrder.payment_status === 'completed',
          deliveryOtp: slipOrder.delivery_otp || '4821',
          delivery_otp: slipOrder.delivery_otp || '4821',
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
          orderType: slipOrder.order_type,
          customerNote: slipOrder.customer_note,
          assignedRider: slipOrder.assigned_rider_name
            ? {
                id: slipOrder.assigned_rider_id,
                name: slipOrder.assigned_rider_name,
                phone: slipOrder.assigned_rider_phone,
              }
            : undefined,
        };
      }
    }

    // 2. Standard orders lookup from serverOrderStore
    if (!order) {
      order = await serverOrderStore.getOrderAsync(id);
    }

    // 3. Fallback to slip orders for non-prefixed slip IDs
    if (!order) {
      const slipOrder = await serverSlipOrders.getSlipOrderById(id);
      if (slipOrder) {
        order = {
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
          subtotal: slipOrder.subtotal,
          estimatedTotal: slipOrder.estimated_total,
          finalTotal: slipOrder.final_total || slipOrder.subtotal,
          grandTotal: slipOrder.final_total || slipOrder.estimated_total || slipOrder.subtotal,
          total: slipOrder.final_total || slipOrder.estimated_total || slipOrder.subtotal,
          deliveryFee: slipOrder.delivery_fee,
          codFee: slipOrder.cod_fee,
          paymentMethod: slipOrder.payment_method || 'Cash on Delivery',
          paymentStatus: slipOrder.payment_status,
          isPaid: slipOrder.payment_status === 'paid' || slipOrder.payment_status === 'completed',
          deliveryOtp: slipOrder.delivery_otp || '4821',
          delivery_otp: slipOrder.delivery_otp || '4821',
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
          orderType: slipOrder.order_type,
          customerNote: slipOrder.customer_note,
          assignedRider: slipOrder.assigned_rider_name
            ? {
                id: slipOrder.assigned_rider_id,
                name: slipOrder.assigned_rider_name,
                phone: slipOrder.assigned_rider_phone,
              }
            : undefined,
        };
      }
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
