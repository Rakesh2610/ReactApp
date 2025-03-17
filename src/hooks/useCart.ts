import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: string[];
  specialInstructions?: string;
}

export interface OrderHistoryItem {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  pickup_time: string | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    special_instructions?: string;
  }[];
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  let user = null;

  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // Handle case where AuthProvider is not available
    console.log("Auth context not available, proceeding with null user");
  }

  // Load cart from database if user is logged in, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);

      if (user) {
        try {
          // Fetch cart items from database
          const { data: cartData, error } = await supabase
            .from("cart_items")
            .select(
              `
              id,
              menu_item_id,
              quantity,
              customizations,
              special_instructions,
              menu_items(id, name, price, image)
            `,
            )
            .eq("user_id", user.id);

          if (error) throw error;

          if (cartData && cartData.length > 0) {
            // Transform data to match CartItem interface
            const items: CartItem[] = cartData.map((item: any) => ({
              id: item.menu_item_id,
              name: item.menu_items.name,
              price: item.menu_items.price,
              quantity: item.quantity,
              image: item.menu_items.image,
              customizations: item.customizations,
              specialInstructions: item.special_instructions,
            }));

            setCartItems(items);
          } else {
            // If no items in database, check localStorage
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
              try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);

                // Save localStorage cart to database
                if (parsedCart.length > 0) {
                  await syncCartToDatabase(parsedCart);
                }
              } catch (error) {
                console.error("Failed to parse cart from localStorage:", error);
              }
            }
          }
        } catch (error) {
          console.error("Error loading cart from database:", error);
          // Fallback to localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (error) {
              console.error("Failed to parse cart from localStorage:", error);
            }
          }
        }
      } else {
        // User not logged in, use localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (error) {
            console.error("Failed to parse cart from localStorage:", error);
          }
        }
      }

      setIsLoading(false);
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage and database whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));

    // Save to database if user is logged in
    if (user && cartItems.length > 0) {
      syncCartToDatabase(cartItems);
    }
  }, [cartItems, user]);

  // Load order history when user changes
  useEffect(() => {
    if (user) {
      loadOrderHistory();
      loadFavoriteItems();
    }
  }, [user]);

  const syncCartToDatabase = async (items: CartItem[]) => {
    if (!user) return;

    try {
      // First delete all existing cart items
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      // Then insert new cart items
      if (items.length > 0) {
        const cartItemsToInsert = items.map((item) => ({
          user_id: user.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          customizations: item.customizations || [],
          special_instructions: item.specialInstructions,
        }));

        const { error } = await supabase
          .from("cart_items")
          .insert(cartItemsToInsert);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error syncing cart to database:", error);
    }
  };

  const loadOrderHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, status, total_amount, pickup_time")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (orders && orders.length > 0) {
        // For each order, fetch its items
        const ordersWithItems = await Promise.all(
          orders.map(async (order) => {
            const { data: orderItems, error: itemsError } = await supabase
              .from("order_items")
              .select(
                `
              id, quantity, price, special_instructions,
              menu_items(id, name, image)
            `,
              )
              .eq("order_id", order.id);

            if (itemsError) throw itemsError;

            return {
              ...order,
              items:
                orderItems?.map((item: any) => ({
                  id: item.id,
                  name: item.menu_items.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.menu_items.image,
                  special_instructions: item.special_instructions,
                })) || [],
            };
          }),
        );

        setOrderHistory(ordersWithItems);
      }
    } catch (error) {
      console.error("Error loading order history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadFavoriteItems = async () => {
    if (!user) return;

    setIsLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from("favorite_items")
        .select("menu_item_id")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data) {
        setFavoriteItems(data.map((item) => item.menu_item_id));
      }
    } catch (error) {
      console.error("Error loading favorite items:", error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const addToCart = (item: CartItem) => {
    console.log("Adding item to cart:", item);
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (i) =>
          i.id === item.id &&
          JSON.stringify(i.customizations || []) ===
            JSON.stringify(item.customizations || []) &&
          i.specialInstructions === item.specialInstructions,
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        console.log("Updated cart:", updatedItems);
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        const newItems = [...prevItems, item];
        console.log("New cart:", newItems);
        return newItems;
      }
    });
  };

  const updateQuantity = (
    id: string,
    change: number,
    customizations?: string[],
    specialInstructions?: string,
  ) => {
    console.log("Updating quantity for item:", id, "change:", change);
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const matchesItem = item.id === id;
        const matchesCustomizations =
          JSON.stringify(item.customizations || []) ===
          JSON.stringify(customizations || []);
        const matchesInstructions =
          item.specialInstructions === specialInstructions;

        if (matchesItem && matchesCustomizations && matchesInstructions) {
          return { ...item, quantity: Math.max(1, item.quantity + change) };
        }
        return item;
      });
      console.log("Updated cart after quantity change:", updatedItems);
      return updatedItems;
    });
  };

  const removeItem = (
    id: string,
    customizations?: string[],
    specialInstructions?: string,
  ) => {
    console.log("Removing item from cart:", id);
    setCartItems((prevItems) => {
      const filteredItems = prevItems.filter((item) => {
        const matchesItem = item.id === id;
        const matchesCustomizations =
          JSON.stringify(item.customizations || []) ===
          JSON.stringify(customizations || []);
        const matchesInstructions =
          item.specialInstructions === specialInstructions;

        return !(matchesItem && matchesCustomizations && matchesInstructions);
      });
      console.log("Cart after removal:", filteredItems);
      return filteredItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      // Clear cart in database
      supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Error clearing cart in database:", error);
        });
    }
  };

  const toggleFavorite = async (menuItemId: string) => {
    if (!user) {
      throw new Error("You must be logged in to save favorites");
    }

    setIsLoadingFavorites(true);
    try {
      const isFavorite = favoriteItems.includes(menuItemId);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorite_items")
          .delete()
          .eq("user_id", user.id)
          .eq("menu_item_id", menuItemId);

        if (error) throw error;

        setFavoriteItems((prev) => prev.filter((id) => id !== menuItemId));
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorite_items").insert({
          user_id: user.id,
          menu_item_id: menuItemId,
        });

        if (error) throw error;

        setFavoriteItems((prev) => [...prev, menuItemId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const submitOrder = async (
    pickupTime: string,
    specialInstructions?: string,
  ) => {
    if (!user) {
      throw new Error("You must be logged in to place an order");
    }

    if (cartItems.length === 0) {
      throw new Error("Your cart is empty");
    }

    setIsLoading(true);

    try {
      // Calculate total amount
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: totalAmount,
          pickup_time: pickupTime,
          special_instructions: specialInstructions,
        })
        .select();

      if (orderError) throw orderError;
      if (!orderData || orderData.length === 0)
        throw new Error("Failed to create order");

      const orderId = orderData[0].id;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        special_instructions: item.specialInstructions,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      clearCart();

      // Refresh order history
      loadOrderHistory();

      return { orderId };
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    submitOrder,
    isLoading,
    subtotal,
    tax,
    total,
    itemCount,
    orderHistory,
    isLoadingHistory,
    loadOrderHistory,
    favoriteItems,
    isLoadingFavorites,
    toggleFavorite,
    isFavorite: (id: string) => favoriteItems.includes(id),
  };
}
