-- Insert categories
INSERT INTO categories (id, name, description, image)
VALUES 
  ('pizza', 'Pizza', 'Delicious pizzas with various toppings', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80'),
  ('coffee', 'Coffee', 'Hot and cold coffee beverages', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80'),
  ('salads', 'Salads', 'Fresh and healthy salads', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80'),
  ('desserts', 'Desserts', 'Sweet treats and desserts', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80'),
  ('meat', 'Meat', 'Premium meat dishes', 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80'),
  ('sandwiches', 'Sandwiches', 'Freshly made sandwiches', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80'),
  ('soups', 'Soups', 'Hearty and warming soups', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80'),
  ('icecream', 'Ice Cream', 'Delicious frozen treats', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80'),
  ('fruits', 'Fruits', 'Fresh seasonal fruits', 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=500&q=80'),
  ('drinks', 'Drinks', 'Refreshing beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80')
ON CONFLICT (id) DO NOTHING;

-- Insert menu items
INSERT INTO menu_items (id, name, description, price, image, category_id, is_vegetarian, is_vegan, is_gluten_free, is_spicy)
VALUES 
  ('pizza-1', 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80', 'pizza', true, false, false, false),
  ('pizza-2', 'Pepperoni Pizza', 'Traditional pizza topped with pepperoni slices', 14.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', 'pizza', false, false, false, true),
  ('pizza-3', 'Vegetable Pizza', 'Fresh vegetables on a crispy crust', 13.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', 'pizza', true, true, false, false),
  ('coffee-1', 'Cappuccino', 'Espresso with steamed milk and foam', 4.50, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80', 'coffee', true, false, true, false),
  ('coffee-2', 'Latte', 'Espresso with steamed milk', 4.00, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80', 'coffee', true, false, true, false),
  ('coffee-3', 'Espresso', 'Strong black coffee', 3.00, 'https://images.unsplash.com/photo-1596952954288-16862d37405b?w=500&q=80', 'coffee', true, true, true, false),
  ('salad-1', 'Caesar Salad', 'Romaine lettuce, croutons, parmesan cheese with Caesar dressing', 8.99, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80', 'salads', true, false, false, false),
  ('salad-2', 'Greek Salad', 'Tomatoes, cucumbers, olives, feta cheese with olive oil', 9.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80', 'salads', true, false, true, false),
  ('salad-3', 'Fruit Salad', 'Fresh seasonal fruits', 7.99, 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=500&q=80', 'salads', true, true, true, false),
  ('dessert-1', 'Chocolate Cake', 'Rich chocolate cake with ganache', 6.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', 'desserts', true, false, false, false),
  ('dessert-2', 'Cheesecake', 'Creamy New York style cheesecake', 7.99, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80', 'desserts', true, false, false, false),
  ('dessert-3', 'Ice Cream', 'Vanilla ice cream with chocolate sauce', 5.99, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80', 'icecream', true, false, false, false),
  ('meat-1', 'Grilled Steak', 'Juicy grilled steak with herbs', 18.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80', 'meat', false, false, true, false),
  ('soup-1', 'Tomato Soup', 'Creamy tomato soup with basil', 6.99, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80', 'soups', true, true, true, false),
  ('sandwich-1', 'Club Sandwich', 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato', 10.99, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80', 'sandwiches', false, false, false, false),
  ('fruit-1', 'Fresh Fruit Platter', 'Assortment of seasonal fruits', 8.99, 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=500&q=80', 'fruits', true, true, true, false),
  ('drink-1', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80', 'drinks', true, true, true, false)
ON CONFLICT (id) DO NOTHING;
