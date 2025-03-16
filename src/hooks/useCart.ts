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

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  let user = null;

  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // Handle case where AuthProvider is not available
    console.log("Auth context not available, proceeding with null user");
  }

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

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
  };
}
