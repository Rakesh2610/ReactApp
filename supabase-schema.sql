-- Create tables for the Canteen Order System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table to store user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id) NOT NULL,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_spicy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items" 
  ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items" 
  ON order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create RLS policies for menu_items and categories (public read access)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu items are viewable by everyone" 
  ON menu_items FOR SELECT 
  USING (true);

CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('pizza'),
  ('coffee'),
  ('salads'),
  ('desserts'),
  ('meat'),
  ('sandwiches'),
  ('soups'),
  ('icecream'),
  ('fruits'),
  ('drinks');

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, image, category_id, is_vegetarian, is_vegan, is_gluten_free, is_spicy)
VALUES 
  ('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80', (SELECT id FROM categories WHERE name = 'pizza'), true, false, false, false),
  ('Pepperoni Pizza', 'Traditional pizza topped with pepperoni slices', 14.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', (SELECT id FROM categories WHERE name = 'pizza'), false, false, false, true),
  ('Cappuccino', 'Espresso with steamed milk and foam', 4.50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80', (SELECT id FROM categories WHERE name = 'coffee'), true, false, true, false),
  ('Caesar Salad', 'Romaine lettuce, croutons, parmesan cheese with Caesar dressing', 8.99, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80', (SELECT id FROM categories WHERE name = 'salads'), true, false, false, false),
  ('Chocolate Cake', 'Rich chocolate cake with ganache frosting', 6.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', (SELECT id FROM categories WHERE name = 'desserts'), true, false, false, false),
  ('Grilled Steak', 'Juicy grilled steak with herb butter', 18.99, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80', (SELECT id FROM categories WHERE name = 'meat'), false, false, true, false),
  ('Club Sandwich', 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato', 10.99, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80', (SELECT id FROM categories WHERE name = 'sandwiches'), false, false, false, false),
  ('Tomato Soup', 'Creamy tomato soup with basil', 5.99, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80', (SELECT id FROM categories WHERE name = 'soups'), true, true, true, false);
