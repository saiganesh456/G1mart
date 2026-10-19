-- =============================================================================
-- G1 MART — Enable Supabase Realtime for Instant (0.1s) Admin Order Alerts
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

-- 1. Enable Full Replica Identity so WebSocket gets all changed row fields
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.slip_orders REPLICA IDENTITY FULL;

-- 2. Add tables to supabase_realtime publication safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'slip_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.slip_orders;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
