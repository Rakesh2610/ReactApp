-- Add order_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_number TEXT;
        
        -- Update existing orders with a generated order number
        UPDATE orders 
        SET order_number = 'ORD-' || SUBSTRING(EXTRACT(EPOCH FROM created_at)::TEXT, LENGTH(EXTRACT(EPOCH FROM created_at)::TEXT)-5) || '-' || id::TEXT
        WHERE order_number IS NULL;
        
        -- Make order_number NOT NULL
        ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
    END IF;
END
$$;

-- Ensure status has the correct enum values
DO $$
BEGIN
    ALTER TABLE orders 
    DROP CONSTRAINT IF EXISTS orders_status_check;
    
    ALTER TABLE orders
    ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled'));
END
$$;

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Create a function to notify clients when order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status <> NEW.status THEN
        PERFORM pg_notify(
            'order_status_change',
            json_build_object(
                'order_id', NEW.id,
                'user_id', NEW.user_id,
                'status', NEW.status,
                'order_number', NEW.order_number
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for the function
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_status_change();
