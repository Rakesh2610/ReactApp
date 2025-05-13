-- Create cart_items table to store user cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations TEXT[] DEFAULT '{}',
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorite_items table to store user favorite items
CREATE TABLE IF NOT EXISTS favorite_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- Enable realtime for cart_items
alter publication supabase_realtime add table cart_items;

-- Enable realtime for favorite_items
alter publication supabase_realtime add table favorite_items;

-- Add RLS policies for cart_items
CREATE POLICY "Users can view their own cart items" 
ON cart_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
ON cart_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON cart_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON cart_items FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for favorite_items
CREATE POLICY "Users can view their own favorite items" 
ON favorite_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite items" 
ON favorite_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite items" 
ON favorite_items FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on both tables
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;