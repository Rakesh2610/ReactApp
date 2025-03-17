import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface AdminOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  total_amount: number;
  pickup_time: string;
  special_instructions?: string;
  created_at: string;
  items: AdminOrderItem[];
  user?: {
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<AdminOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          id, 
          user_id,
          order_number, 
          status, 
          total_amount, 
          pickup_time, 
          special_instructions, 
          created_at,
          profiles:user_id(email, full_name, phone)
        `,
        )
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setActiveOrders([]);
        setCompletedOrders([]);
        return;
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("order_items")
            .select(
              `
              id, 
              name, 
              price, 
              quantity, 
              special_instructions
            `,
            )
            .eq("order_id", order.id);

          if (itemsError) throw itemsError;

          return {
            ...order,
            items: itemsData || [],
            user: order.profiles
              ? {
                  email: order.profiles.email,
                  full_name: order.profiles.full_name,
                  phone: order.profiles.phone,
                }
              : undefined,
          };
        }),
      );

      setOrders(ordersWithItems);

      // Split orders into active and completed/cancelled
      setActiveOrders(
        ordersWithItems.filter((order) =>
          ["pending", "preparing", "ready"].includes(order.status),
        ),
      );

      setCompletedOrders(
        ordersWithItems.filter((order) =>
          ["completed", "cancelled"].includes(order.status),
        ),
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for order updates
    const subscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Refresh orders after update
      await fetchOrders();

      return { success: true };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error };
    }
  };

  return {
    orders,
    activeOrders,
    completedOrders,
    isLoading,
    fetchOrders,
    updateOrderStatus,
  };
}
