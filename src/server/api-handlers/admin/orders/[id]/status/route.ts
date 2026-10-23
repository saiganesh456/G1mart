export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { verifyRiderOrAdminRequest } from '@/lib/authGuard';
import type { OrderStatus } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyRiderOrAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Authorization required' },
        { status: auth.status || 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, staffIdentifier, assignedRider, otp } = body;

    const validStatuses: OrderStatus[] = [
      'Order Placed',
      'Confirmed',
      'Packing',
      'Packed',
      'Rider Assigned',
      'Order Dispatched',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // =========================================================================
    // 1. DIRECT HANDLER FOR SLIP ORDERS (SLIP-XXXXXX)
    // =========================================================================
    if (id.startsWith('SLIP-')) {
      const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
      let slip = await serverSlipOrders.getSlipOrderById(id);

      if (!slip && body.orderFallback) {
        slip = body.orderFallback;
      }

      if (!slip) {
        return NextResponse.json(
          { success: false, error: `Slip order #${id} not found` },
          { status: 404 }
        );
      }

      // Check OTP if marking Delivered (Exempt Store Pickup)
      if (status === 'Delivered') {
        const isPickup = slip.order_type === 'pickup';
        if (!isPickup) {
          if (!otp || typeof otp !== 'string' || !otp.trim()) {
            return NextResponse.json(
              {
                success: false,
                error: 'Customer Delivery OTP is required to mark this order as Delivered.',
              },
              { status: 400 }
            );
          }
          const { verifyDeliveryOtp } = await import('@/lib/deliveryOtp');
          const isValid = verifyDeliveryOtp(otp, slip.delivery_otp, slip.customer_phone);
          if (!isValid) {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid Customer Delivery OTP. Delivery can only be confirmed with the matching 4-digit OTP.',
              },
              { status: 400 }
            );
          }
        }
      }

      // 1. Assign rider if payload provided
      if (assignedRider) {
        await serverSlipOrders.assignRider({
          slipId: id,
          riderId: assignedRider.id || 'rider-1',
          riderName: assignedRider.name || 'Express Rider',
          riderPhone: assignedRider.phone || '',
          staffName: staffIdentifier || 'Dispatcher',
        });
      }

      // 2. Perform status transition
      if (status === 'Out for Delivery' || status === 'Order Dispatched') {
        await serverSlipOrders.updateDeliveryStatus(id, 'OUT_FOR_DELIVERY', staffIdentifier || 'Rider');
      } else if (status === 'Delivered') {
        await serverSlipOrders.updateDeliveryStatus(id, 'DELIVERED', staffIdentifier || 'Rider');
        if (body.cashCollected || slip.payment_status === 'COD_PENDING') {
          slip.payment_status = 'completed';
        }
      } else if (status === 'Confirmed') {
        slip.status = 'CONFIRMED';
        slip.updated_at = new Date().toISOString();
        serverSlipOrders.addStatusHistory(slip, 'CONFIRMED', 'Order confirmed by store admin', staffIdentifier || 'Admin');
        await serverSlipOrders.saveOrder(slip);
      } else if (status === 'Packing') {
        slip.status = 'PACKING';
        slip.updated_at = new Date().toISOString();
        serverSlipOrders.addStatusHistory(slip, 'PACKING', 'Packing started at store', staffIdentifier || 'Packer');
        await serverSlipOrders.saveOrder(slip);
      } else if (status === 'Packed') {
        slip.status = 'PACKED';
        slip.updated_at = new Date().toISOString();
        serverSlipOrders.addStatusHistory(slip, 'PACKED', 'Order packed and ready for dispatch', staffIdentifier || 'Packer');
        await serverSlipOrders.saveOrder(slip);
      } else if (status === 'Cancelled') {
        await serverSlipOrders.cancelSlipOrder(id, body.cancelReason || 'Cancelled by admin', staffIdentifier || 'Admin');
      }

      const updatedSlip = (await serverSlipOrders.getSlipOrderById(id)) || slip;
      const finalOrder = serverSlipOrders.convertToStandardOrder(updatedSlip, status);
      serverOrderStore.registerOrder(finalOrder);

      // Trigger Web Push notification if configured
      try {
        const { serverPushService } = await import('@/lib/serverPushService');
        await serverPushService.sendOrderPushNotification(finalOrder, status as OrderStatus);
      } catch (pushErr) {
        console.warn('[Admin Order Status] Push dispatch notice:', pushErr);
      }

      return NextResponse.json({
        success: true,
        order: finalOrder,
        message: `Order status updated to "${status}"`,
      });
    }

    // =========================================================================
    // 2. HANDLER FOR STANDARD ORDERS (G1-XXXXXX)
    // =========================================================================
    let order = serverOrderStore.getOrder(id);
    if (!order) {
      serverOrderStore.loadFromDisk();
      order = serverOrderStore.getOrder(id);
    }
    if (!order && body.orderFallback) {
      serverOrderStore.cacheOrder(body.orderFallback);
      order = serverOrderStore.getOrder(id);
    }

    const isStorePickup = Boolean(
      order?.slot?.toLowerCase().includes('pickup') ||
      order?.address?.streetArea?.toLowerCase().includes('pickup') ||
      order?.address?.fullName?.toLowerCase().includes('pickup') ||
      (order as any)?.orderType === 'pickup'
    );

    // Marking as Delivered requires OTP confirmation (exempt store pickups)
    if (status === 'Delivered' && !isStorePickup) {
      if (!otp || typeof otp !== 'string' || !otp.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Customer Delivery OTP is required to mark this order as Delivered. Please enter the 4-digit OTP provided by the customer.',
          },
          { status: 400 }
        );
      }

      let expectedOtp: string | undefined | null = null;
      let customerPhone: string | undefined | null = order?.address?.mobileNumber || order?.address?.phone;
      if (id.startsWith('SLIP-')) {
        const { serverSlipOrders } = await import('@/lib/serverSlipOrders');
        const slip = await serverSlipOrders.getSlipOrderById(id);
        expectedOtp = slip?.delivery_otp;
        if (!customerPhone) customerPhone = slip?.customer_phone;
      } else {
        if (!order) {
          serverOrderStore.loadFromDisk();
          order = serverOrderStore.getOrder(id);
        }
        if (!order) {
          order = await serverOrderStore.getOrderAsync(id);
        }
        if (!order && body.orderFallback) {
          expectedOtp = body.orderFallback.deliveryOtp || body.orderFallback.address?._deliveryOtp;
          if (!customerPhone) customerPhone = body.orderFallback.address?.mobileNumber || body.orderFallback.address?.phone;
        } else {
          expectedOtp = order?.deliveryOtp || (order?.address as any)?._deliveryOtp;
          if (!customerPhone) customerPhone = order?.address?.mobileNumber || order?.address?.phone;
        }
        if (!expectedOtp && (order?.id || id)) {
          const { generate4DigitOtp } = await import('@/lib/deliveryOtp');
          expectedOtp = generate4DigitOtp(order?.id || id);
        }
      }
      const { verifyDeliveryOtp } = await import('@/lib/deliveryOtp');

      if (!verifyDeliveryOtp(otp, expectedOtp, customerPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid Customer Delivery OTP. Delivery can only be confirmed with the matching 4-digit OTP from the customer.',
          },
          { status: 400 }
        );
      }
    }

    const effectiveRider = assignedRider || body.orderFallback?.assignedRider;

    let result = await serverOrderStore.updateOrderStatus(
      id,
      status as OrderStatus,
      staffIdentifier || 'Store Admin',
      effectiveRider
    );

    // If order was missing from server cache but client sent orderFallback, hydrate and retry
    if ((!result.success || !result.order) && body.orderFallback) {
      try {
        serverOrderStore.cacheOrder(body.orderFallback);
        result = await serverOrderStore.updateOrderStatus(
          id,
          status as OrderStatus,
          staffIdentifier || 'Store Admin',
          effectiveRider
        );
      } catch {}
    }

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (status === 'Delivered' && result.order) {
      result.order.deliveredAt = new Date().toISOString();
      if (!result.order.isPaid && (result.order.paymentMethod === 'Cash on Delivery' || body.cashCollected)) {
        result.order.isPaid = true;
        result.order.paymentStatus = 'completed';
        result.order.paidAmount = result.order.grandTotal;
        result.order.paidAt = new Date().toISOString();
      }
      serverOrderStore.cacheOrder(result.order);
      await serverOrderStore.registerOrderAsync(result.order);
    }

    // Trigger targeted background Web Push notification directly to the customer
    try {
      const { serverPushService } = await import('@/lib/serverPushService');
      await serverPushService.sendOrderPushNotification(result.order, status as OrderStatus);
    } catch (pushErr) {
      console.warn('[Admin Order Status] Push dispatch notice:', pushErr);
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: `Order status updated to "${status}"`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
