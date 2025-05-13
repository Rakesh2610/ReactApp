-- Check if orders table is already in the realtime publication
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'orders'
    ) INTO table_exists;
    
    -- Only add if not already in the publication
    IF NOT table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
    END IF;
    
    -- Check if order_items is in the publication
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'order_items'
    ) INTO table_exists;
    
    -- Only add if not already in the publication
    IF NOT table_exists THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
    END IF;
END
$$;