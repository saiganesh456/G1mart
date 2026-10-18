-- =============================================================================
-- G1 MART — Remove Legacy Status Check Constraints
-- Allows Orders and History to accept all workflow steps ('Confirmed', 'Packing', 'Rider Assigned', etc.)
-- Run in Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_status_check;

NOTIFY pgrst, 'reload schema';
