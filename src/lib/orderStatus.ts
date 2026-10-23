import type { OrderStatus } from '@/types';

export const STATUS_RANK: Record<string, number> = {
  'Order Placed': 1,
  'New': 1,
  'Confirmed': 2,
  'Packing': 3,
  'Packed': 4,
  'Ready for Pickup': 4,
  'Rider Assigned': 5,
  'Order Dispatched': 6,
  'Out for Delivery': 6,
  'Delivered': 7,
  'Picked Up': 7,
  'Cancelled': 8,
};

/**
 * Resolves the authoritative order status between the top-level database column `status`
 * and the nested JSON `address._status` metadata.
 *
 * In Supabase PostgreSQL, the `status` column is governed by an ENUM ('Order Placed', 'Packed',
 * 'Out for Delivery', 'Delivered', 'Cancelled'). Fine-grained workflow sub-states like 'Packing'
 * are stored in `address._status` while the database column falls back to 'Order Placed'.
 *
 * When an order advances to 'Packed', 'Out for Delivery', or 'Delivered', the higher status rank
 * MUST take precedence so stale 'Packing' tags cannot shadow completed deliveries.
 */
export function resolveAuthoritativeStatus(
  dbStatus?: string | null,
  addrStatus?: string | null
): OrderStatus {
  const normDb = (dbStatus || '').trim();
  const normAddr = (addrStatus || '').trim();
  const rankDb = STATUS_RANK[normDb] || 0;
  const rankAddr = STATUS_RANK[normAddr] || 0;

  if (rankDb >= rankAddr && rankDb > 0) {
    return normDb as OrderStatus;
  }
  if (rankAddr > 0) {
    return normAddr as OrderStatus;
  }
  return (normDb || normAddr || 'Order Placed') as OrderStatus;
}
