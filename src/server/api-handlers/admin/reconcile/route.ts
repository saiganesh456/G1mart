export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { verifyAdminRequest } from '@/lib/authGuard';
import { formatToIST } from '@/lib/dateUtils';

function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes('g1mart_dev')) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const autoRun = searchParams.get('run') !== 'false';

    let reconciledCount = 0;
    const reconciledOrders: string[] = [];
    let rzpFetchError: string | null = null;

    if (autoRun) {
      try {
        const rzp = getRazorpayClient();
        if (rzp) {
          // Fetch last 100 payments from Razorpay
          const res = await rzp.payments.all({ count: 100 });
          const items = Array.isArray(res?.items) ? res.items : [];

          for (const p of items) {
            if (p.status === 'captured') {
              const paymentAmount = Number(p.amount || 0) / 100;
              const providerOrderId = p.order_id;
              const transactionId = p.id;
              const internalOrderId = p.notes?.orderId || p.notes?.internalOrderId || p.notes?.merchantOrderId;

              // Check if order exists
              let order = internalOrderId ? serverOrderStore.getOrder(internalOrderId) : undefined;
              if (!order && providerOrderId) {
                order = serverOrderStore.getOrderByProviderOrderId(providerOrderId);
              }
              if (!order && transactionId) {
                order = serverOrderStore.getOrderByProviderOrderId(transactionId);
              }
              if (!order && providerOrderId) {
                order = await serverOrderStore.getOrderByProviderOrderIdAsync(providerOrderId);
              }

              if (order) {
                // If order exists and is not paid, reconcile it now!
                if (!order.isPaid || order.paymentStatus !== 'completed') {
                  const markRes = await serverOrderStore.markOrderPaid({
                    orderId: order.id,
                    providerOrderId,
                    transactionId,
                    amountInPaise: Number(p.amount || 0),
                    source: 'recovery_job',
                    rawResponse: p,
                  });
                  if (markRes.success) {
                    reconciledCount++;
                    reconciledOrders.push(order.id);
                  }
                } else {
                  // Resolve any orphan payment that was previously recorded for this transaction
                  await serverOrderStore.resolveOrphanPayment(
                    transactionId,
                    'LINKED',
                    order.id,
                    'Matched to paid order during reconciliation scan'
                  );
                }
              } else {
                // Payment was captured, but NO order exists in the DB!
                // Record into Orphan Payments store so staff can inspect & link
                await serverOrderStore.addOrphanPayment({
                  paymentId: transactionId,
                  amount: paymentAmount,
                  currency: p.currency || 'INR',
                  customerPhone: String(p.contact || ''),
                  customerEmail: p.email || '',
                  bankRrn: (p as any).acquirer_data?.rrn || (p as any).acquirer_data?.bank_transaction_id || '',
                  capturedAt: new Date(p.created_at * 1000).toISOString(),
                  orderId: providerOrderId || undefined,
                  status: 'UNLINKED',
                  notes: `Auto-discovered captured payment of ₹${paymentAmount} with no matching order in DB`,
                });

                await serverOrderStore.logPaymentEvent({
                  source: 'recovery_job',
                  payloadId: transactionId,
                  eventType: 'reconciliation.orphan_detected',
                  paymentId: transactionId,
                  orderId: providerOrderId,
                  amount: paymentAmount,
                  result: 'ORPHAN_PAYMENT_RECORDED',
                  details: { contact: p.contact, email: p.email, amount: paymentAmount },
                });
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('[Admin Reconcile] Razorpay API scan error:', err);
        rzpFetchError = err?.message || 'Could not connect to Razorpay API';
      }
    }

    const orphanPayments = serverOrderStore.getOrphanPayments();
    const paymentEvents = serverOrderStore.getPaymentEvents();

    return NextResponse.json({
      success: true,
      reconciledCount,
      reconciledOrders,
      orphanPayments,
      unlinkedOrphansCount: orphanPayments.filter((o) => o.status === 'UNLINKED').length,
      recentEventsCount: paymentEvents.length,
      rzpFetchError,
      scannedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Reconciliation failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, paymentId, orderId, notes } = body;

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'paymentId is required' }, { status: 400 });
    }

    // Staff Action 1: Link orphan payment to existing order
    if (action === 'link_order') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'orderId is required to link' }, { status: 400 });
      }

      const order = await serverOrderStore.getOrderAsync(orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: `Order #${orderId} not found` }, { status: 404 });
      }

      await serverOrderStore.markOrderPaid({
        orderId,
        transactionId: paymentId,
        source: 'manual_staff',
        rawResponse: { linkedBy: auth.email, notes: notes || 'Manually linked by staff' },
      });

      await serverOrderStore.resolveOrphanPayment(
        paymentId,
        'LINKED',
        orderId,
        notes || `Manually linked by admin (${auth.email})`,
        auth.email
      );

      await serverOrderStore.logPaymentEvent({
        source: 'manual_staff',
        payloadId: paymentId,
        eventType: 'staff.linked_payment',
        paymentId,
        orderId,
        result: 'ORDER_PAID',
        details: { adminEmail: auth.email, notes },
      });

      return NextResponse.json({
        success: true,
        message: `Payment ${paymentId} successfully linked to order #${orderId}`,
      });
    }

    // Staff Action 2: Create a new order from an orphan payment
    if (action === 'create_order') {
      const orphans = serverOrderStore.getOrphanPayments();
      const orphan = orphans.find((o) => o.paymentId === paymentId);
      if (!orphan) {
        return NextResponse.json({ success: false, error: `Orphan payment ${paymentId} not found` }, { status: 404 });
      }

      const newOrderId = `G1-${Math.floor(100000 + Math.random() * 900000)}`;
      const customerPhone = body.customerPhone || orphan.customerPhone || '9876543210';
      const customerName = body.customerName || orphan.customerName || 'G1 Mart Customer';
      const finalAmount = Number(orphan.amount || 0);

      const items = Array.isArray(body.items) && body.items.length > 0
        ? body.items
        : [
            {
              productId: 'recovered-order-item',
              productName: `Order items (recovered from payment ${paymentId})`,
              unit: '1 order',
              price: finalAmount,
              quantity: 1,
              image: '/products/placeholder.svg',
            },
          ];

      const createdOrder = await serverOrderStore.createPendingOrder({
        orderId: newOrderId,
        merchantOrderId: `MT_${newOrderId}_${Date.now()}`,
        items,
        subtotal: finalAmount,
        deliveryFee: 0,
        taxes: 0,
        grandTotal: finalAmount,
        address: {
          fullName: customerName,
          phone: customerPhone,
          mobileNumber: customerPhone,
          streetArea: body.address || 'In-store collection / Customer address',
          city: 'Nellore',
          state: 'Andhra Pradesh',
          pincode: '524004',
          orderType: 'standard',
        },
        slot: 'Standard Delivery',
        paymentMethod: 'UPI',
      });

      await serverOrderStore.markOrderPaid({
        orderId: newOrderId,
        transactionId: paymentId,
        source: 'manual_staff',
        rawResponse: { createdFromPayment: paymentId, adminEmail: auth.email },
      });

      await serverOrderStore.resolveOrphanPayment(
        paymentId,
        'LINKED',
        newOrderId,
        `Order #${newOrderId} created from payment by ${auth.email}`,
        auth.email
      );

      await serverOrderStore.logPaymentEvent({
        source: 'manual_staff',
        payloadId: paymentId,
        eventType: 'staff.created_order_from_payment',
        paymentId,
        orderId: newOrderId,
        amount: finalAmount,
        result: 'ORDER_PAID',
        details: { adminEmail: auth.email, newOrderId },
      });

      return NextResponse.json({
        success: true,
        message: `Created order #${newOrderId} from payment ${paymentId}`,
        order: createdOrder,
      });
    }

    // Staff Action 3: Dismiss orphan payment notice
    if (action === 'dismiss') {
      await serverOrderStore.resolveOrphanPayment(
        paymentId,
        'DISMISSED',
        undefined,
        notes || `Dismissed by ${auth.email}`,
        auth.email
      );

      await serverOrderStore.logPaymentEvent({
        source: 'manual_staff',
        payloadId: paymentId,
        eventType: 'staff.dismissed_payment',
        paymentId,
        result: 'ORPHAN_PAYMENT_RECORDED',
        details: { adminEmail: auth.email, notes },
      });

      return NextResponse.json({
        success: true,
        message: `Orphan payment ${paymentId} dismissed`,
      });
    }

    // Staff Action 4: Refund payment via Razorpay
    if (action === 'refund') {
      try {
        const rzp = getRazorpayClient();
        if (!rzp) {
          throw new Error('Razorpay API keys not configured for refund');
        }

        const refundRes: any = await (rzp.payments as any).refund(paymentId, {
          notes: { refundedBy: String(auth.email || 'admin'), reason: String(notes || 'Staff requested refund for unlinked payment') },
        });

        await serverOrderStore.resolveOrphanPayment(
          paymentId,
          'REFUNDED',
          undefined,
          `Refunded via Razorpay (${refundRes?.id}) by ${auth.email || 'admin'}`,
          auth.email
        );

        await serverOrderStore.logPaymentEvent({
          source: 'manual_staff',
          payloadId: paymentId,
          eventType: 'staff.refunded_payment',
          paymentId,
          result: 'ORDER_FAILED',
          details: { refundId: refundRes?.id, adminEmail: auth.email },
        });

        return NextResponse.json({
          success: true,
          message: `Refund of ₹${((Number(refundRes?.amount || 0)) / 100)} initiated for payment ${paymentId}`,
          refund: refundRes,
        });
      } catch (refundErr: any) {
        return NextResponse.json(
          { success: false, error: refundErr?.message || 'Refund failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Staff action failed' },
      { status: 500 }
    );
  }
}
