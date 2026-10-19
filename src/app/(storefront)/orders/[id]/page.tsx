import { formatToIST } from '@/lib/dateUtils';
import { Suspense } from 'react';
import OrderDetailClient from './OrderDetailClient';
import { serverOrderStore } from '@/lib/serverOrderStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const rawParams = await params;
  const id = decodeURIComponent(rawParams.id || '').trim();
  let initialOrder: any = await serverOrderStore.getOrderAsync(id);

  if (!initialOrder) {
    try {
      const slipOrder = await serverSlipOrders.getSlipOrderById(id);
      if (slipOrder) {
        initialOrder = {
          id: slipOrder.id,
          orderNumber: slipOrder.id,
          date: formatToIST(slipOrder.created_at),
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
          })),
          images: (slipOrder.images && slipOrder.images.length > 0)
            ? slipOrder.images
            : (slipOrder as any).image_url
            ? [{ id: 'img_1', image_url: (slipOrder as any).image_url }]
            : Array.isArray((slipOrder as any).image_urls)
            ? (slipOrder as any).image_urls.map((u: string, idx: number) => ({ id: `img_${idx}`, image_url: u }))
            : [],
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
        };
      }
    } catch (err) {
      console.warn('Error fetching server slip order for initial props:', err);
    }
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading order details...</div>}>
      <OrderDetailClient orderId={id} initialOrder={initialOrder} />
    </Suspense>
  );
}
