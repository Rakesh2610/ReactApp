import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
  customizations?: string[];
}

export interface OrderHistoryItem {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { user } = useAuth();

  // Calculate totals whenever cart items change
  useEffect(() => {
    const newSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newTax = newSubtotal * 0.08; // 8% tax
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newSubtotal + newTax);
  }, [cartItems]);

  // Load cart when component mounts or user changes
  useEffect(() => {
    loadCart();
  }, [user?.id]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    
    try {
      // First check for local cart
      const storedCart = localStorage.getItem("cart");
      let localCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
      
      // If user is logged in, get cart from database
      if (user) {
        // Check if cart_items table exists - basic error handling
        try {
          const { data, error } = await supabase
            .from("cart_items")
            .select(`
              id,
              menu_item_id,
              quantity,
              special_instructions,
              menu_items:menu_item_id (
                id,
                name,
                price,
                image_url
              )
            `)
            .eq("user_id", user.id);

          if (!error && data) {
            // Transform the data structure to match our CartItem interface
            const dbCart: CartItem[] = data.map((item: any) => ({
              id: item.menu_items.id,
              name: item.menu_items.name,
              price: item.menu_items.price,
              quantity: item.quantity,
              image: item.menu_items.image_url || "",
              specialInstructions: item.special_instructions || undefined
            }));
            
            // If we have items in both local and DB cart, merge them
            if (localCart.length > 0) {
              await mergeCarts(localCart);
              localStorage.removeItem("cart"); // Clear local cart after merge
              return loadCart(); // Reload cart after merge
            }
            
            setCartItems(dbCart);
            return;
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Fall back to local storage if there's a database error
        }
      }
      
      // If not logged in or DB fetch failed, use local cart
      setCartItems(localCart);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Merge local cart into database cart
  const mergeCarts = async (localCart: CartItem[]) => {
    if (!user) return;
    
    // For each local item, add it to the database
    for (const item of localCart) {
      try {
        // Check if item already exists in database
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("menu_item_id", item.id)
          .eq("special_instructions", item.specialInstructions || null)
          .maybeSingle();
          
        if (existingItem) {
          // Update quantity of existing item
          await supabase
            .from("cart_items")
            .update({ 
              quantity: existingItem.quantity + item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingItem.id);
        } else {
          // Insert new item
          await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              menu_item_id: item.id,
              quantity: item.quantity,
              special_instructions: item.specialInstructions || null
            });
        }
      } catch (error) {
        console.error("Error merging cart item:", error);
      }
    }
  };

  const addToCart = async (item: CartItem) => {
    // Store in local state first for immediate UI update
    setCartItems(prev => {
      // Check if item already exists with the same customizations and special instructions
      const existingItemIndex = prev.findIndex(i => 
        i.id === item.id && 
        i.specialInstructions === item.specialInstructions &&
        JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
      );
      
      let updatedCart: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity
        };
      } else {
        // Add new item
        updatedCart = [...prev, item];
      }
      
      // Store in localStorage if user is not logged in
      if (!user) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
      
      return updatedCart;
    });
    
    // If user is logged in, sync with database
    if (user) {
      try {
        // Check if item already exists in database
        const { data: existingItem } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("menu_item_id", item.id)
          .eq("special_instructions", item.specialInstructions || null)
          .maybeSingle();
          
        if (existingItem) {
          // Update quantity of existing item
          await supabase
            .from("cart_items")
            .update({ 
              quantity: existingItem.quantity + item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingItem.id);
        } else {
          // Insert new item
          await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              menu_item_id: item.id,
              quantity: item.quantity,
              special_instructions: item.specialInstructions || null
            });
        }
      } catch (error) {
        console.error("Error adding item to cart in database:", error);
      }
    }
  };

  const updateQuantity = async (
    id: string, 
    quantityChange: number, 
    customizations?: string[],
    specialInstructions?: string
  ) => {
    // Find the item in the cart
    const itemIndex = cartItems.findIndex(item => 
      item.id === id && 
      JSON.stringify(item.customizations) === JSON.stringify(customizations) &&
      item.specialInstructions === specialInstructions
    );
    
    if (itemIndex === -1) return;
    
    const item = cartItems[itemIndex];
    const newQuantity = item.quantity + quantityChange;
    
    // Remove item if quantity becomes 0 or less
    if (newQuantity <= 0) {
      return removeItem(id, customizations, specialInstructions);
    }
    
    // Update local state
    setCartItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = { ...item, quantity: newQuantity };
      
      // Update localStorage if user is not logged in
      if (!user) {
        localStorage.setItem("cart", JSON.stringify(updated));
      }
      
      return updated;
    });
    
    // Update in database if user is logged in
    if (user) {
      try {
        const { data: items } = await supabase
          .from("cart_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("menu_item_id", id)
          .eq("special_instructions", specialInstructions || null);
          
        if (items && items.length > 0) {
          await supabase
            .from("cart_items")
            .update({ 
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq("id", items[0].id);
        }
      } catch (error) {
        console.error("Error updating cart quantity:", error);
      }
    }
  };

  const removeItem = async (
    id: string, 
    customizations?: string[],
    specialInstructions?: string
  ) => {
    // Update local state
    setCartItems(prev => {
      const updated = prev.filter(item => 
        !(item.id === id && 
          JSON.stringify(item.customizations) === JSON.stringify(customizations) &&
          item.specialInstructions === specialInstructions)
      );
      
      // Update localStorage if user is not logged in
      if (!user) {
        localStorage.setItem("cart", JSON.stringify(updated));
      }
      
      return updated;
    });
    
    // Remove from database if user is logged in
    if (user) {
      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("menu_item_id", id)
          .eq("special_instructions", specialInstructions || null);
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    }
  };

  const clearCart = async () => {
    // Clear local state
    setCartItems([]);
    
    // Clear localStorage
    localStorage.removeItem("cart");
    
    // Clear database cart if user is logged in
    if (user) {
      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error clearing cart from database:", error);
      }
    }
  };

  const submitOrder = async (
    address: string, 
    paymentMethod: string, 
    paymentDetails: any
  ) => {
    if (!user) {
      throw new Error("You must be logged in to place an order");
    }
    
    setIsLoading(true);
    
    try {
      // Create order in database with order items included directly
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: total,
          shipping_address: address,
          payment_method: paymentMethod,
          payment_details: paymentDetails.payment_details || null,
          pickup_time: paymentDetails.pickup_time || null,
          special_instructions: paymentDetails.special_instructions || null,
          order_items: paymentDetails.order_items || []
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Clear cart after successful order
      await clearCart();
      
      return order.id;
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadOrderHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    
    try {
      // Get orders with the order_items JSONB field directly
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items,
          pickup_time,
          special_instructions
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Transform to expected format - parsing the JSONB order_items field
      const history: OrderHistoryItem[] = orders.map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total: order.total_amount,
        // Parse the order_items from JSONB if it's a string
        items: typeof order.order_items === 'string' 
          ? JSON.parse(order.order_items)
          : order.order_items
      }));
      
      setOrderHistory(history);
    } catch (error) {
      console.error("Error loading order history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    total,
    isLoading,
    itemCount,
    submitOrder,
    orderHistory,
    isLoadingHistory,
    loadOrderHistory
  };
};