import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  totalAmount: number;
  paymentMethod: string;
  pickupTime: string;
  specialInstructions?: string;
  createdAt: string;
  items: OrderItem[];
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    checkUser();
  }, []);

  // Load orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch orders with order_items as JSONB
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        if (!ordersData) {
          setOrders([]);
          return;
        }

        // Process orders with items from the JSONB field
        const processedOrders = ordersData.map((order) => {
          // Parse order_items if it's a string
          const items = typeof order.order_items === 'string'
            ? JSON.parse(order.order_items)
            : order.order_items;
            
          return {
            id: order.id,
            orderNumber: order.order_number || order.id.substring(0, 8),
            status: order.status,
            totalAmount: order.total_amount,
            paymentMethod: order.payment_method,
            pickupTime: order.pickup_time,
            specialInstructions: order.special_instructions,
            createdAt: order.created_at,
            items: items.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              customizations: item.customizations,
              specialInstructions: item.specialInstructions,
            })),
          };
        });

        setOrders(processedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const placeOrder = async (orderData: {
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    pickupTime: string;
    specialInstructions?: string;
  }) => {
    if (!userId) {
      throw new Error("User must be logged in to place an order");
    }

    try {
      // Generate a unique order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      // Insert the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          order_number: orderNumber,
          status: "pending",
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          pickup_time: orderData.pickupTime,
          special_instructions: orderData.specialInstructions,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Failed to create order");

      // Insert order items
      const orderItems = orderData.items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations,
        special_instructions: item.specialInstructions,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear the cart after successful order
      await supabase.from("cart_items").delete().eq("user_id", userId);

      // Return the order number for confirmation
      return { orderNumber };
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  };

  return {
    orders,
    isLoading,
    placeOrder,
  };
}
