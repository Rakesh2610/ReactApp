-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  special_instructions TEXT,
  pickup_time TIMESTAMP WITH TIME ZONE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  customizations JSONB,
  special_instructions TEXT
);

-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category_id UUID,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0
);

-- Add foreign key to menu_items
ALTER TABLE menu_items
ADD CONSTRAINT fk_menu_items_category
FOREIGN KEY (category_id)
REFERENCES categories(id);

-- Create users table if it doesn't exist (for user profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own orders";
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders";
CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own order items";
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own order items";
CREATE POLICY "Users can insert their own order items"
ON order_items FOR INSERT
WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own profile";
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile";
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Admin policies
DROP POLICY IF EXISTS "Admins can view all orders";
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders";
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all order items";
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Insert sample categories if they don't exist
INSERT INTO categories (id, name, description, display_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Main Course', 'Delicious main dishes', 1),
  ('22222222-2222-2222-2222-222222222222', 'Starters', 'Appetizers and snacks', 2),
  ('33333333-3333-3333-3333-333333333333', 'Desserts', 'Sweet treats', 3),
  ('44444444-4444-4444-4444-444444444444', 'Beverages', 'Refreshing drinks', 4),
  ('55555555-5555-5555-5555-555555555555', 'Breads', 'Freshly baked breads', 5)
ON CONFLICT (id) DO NOTHING;