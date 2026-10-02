import { Suspense } from 'react';
import OrderDetailClient from './OrderDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading order details...</div>}>
      <OrderDetailClient orderId={id} />
    </Suspense>
  );
}
