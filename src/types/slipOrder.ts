export type SlipOrderStatus =
  | 'SLIP_RECEIVED'
  | 'BILLING'
  | 'AWAITING_CUSTOMER_CONFIRMATION'
  | 'CONFIRMED'
  | 'PACKING'
  | 'PACKED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'COD_PENDING'
  | 'RIDER_ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface SlipImage {
  id: string;
  slip_order_id: string;
  storage_path: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface SlipItem {
  id: string;
  slip_order_id: string;
  product_id?: string | null;
  name: string;
  requested_qty: number;
  packed_qty: number;
  unit: string;
  price: number;
  available: boolean;
  substitute_note?: string | null;
  created_at?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: string;
  notes?: string | null;
  changed_by: string;
  created_at: string;
}

export interface SlipOrder {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_note?: string | null;

  // Saved location attributes
  address: string;
  lat?: number | null;
  lng?: number | null;
  pincode?: string | null;
  distance_km: number;
  eta_min: number;
  zone_id?: string | null;
  zone_min_order: number;
  order_type: 'delivery' | 'pickup';

  status: SlipOrderStatus;
  estimated_total: number;
  final_total: number;
  subtotal: number;
  delivery_fee: number;
  cod_fee: number;

  payment_method?: string | null;
  payment_status: 'pending' | 'completed' | 'paid' | 'COD_PENDING' | 'failed';
  transaction_id?: string | null;

  billed_by?: string | null;
  packed_by?: string | null;
  assigned_rider_id?: string | null;
  assigned_rider_name?: string | null;
  assigned_rider_phone?: string | null;

  admin_notes?: string | null;
  cancel_reason?: string | null;

  images?: SlipImage[];
  items?: SlipItem[];
  status_history?: OrderStatusHistoryItem[];

  created_at: string;
  updated_at: string;
}
