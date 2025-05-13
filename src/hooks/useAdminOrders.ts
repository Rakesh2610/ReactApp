import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export interface AdminOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  customizations?: string[];
}

export interface AdminOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  pickup_time?: string;
  special_instructions?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
  };
  items: AdminOrderItem[];
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<AdminOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (ordersError) throw ordersError;
      if (!ordersData) {
        setOrders([]);
        setActiveOrders([]);
        setCompletedOrders([]);
        return;
      }

      // Collect unique user ids from orders
      const userIds = Array.from(
        new Set(ordersData.filter((order: any) => order.user_id).map((order: any) => order.user_id))
      );

      // Batch fetch profiles for all needed user ids
      let profilesMap: { [key: string]: any } = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, email, role, gender")
          .in("id", userIds);
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        } else if (profilesData) {
          profilesData.forEach((profile: any) => {
            profilesMap[profile.id] = profile;
          });
        }
      }

      // Process orders and attach profile from our batched fetch
      const processedOrders = ordersData.map((order: any) => {
        let items: AdminOrderItem[] = [];
        try {
          items =
            typeof order.order_items === "string"
              ? JSON.parse(order.order_items)
              : order.order_items || [];
        } catch (err) {
          console.error("Error parsing order items for order", order.id, err);
        }

        return {
          id: order.id,
          order_number: order.id.slice(0, 8),
          created_at: order.created_at,
          status: order.status,
          total_amount: order.total_amount,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          pickup_time: order.pickup_time,
          special_instructions: order.special_instructions,
          user: order.user_id ? profilesMap[order.user_id] : null,
          items: items,
        };
      });

      setOrders(processedOrders);
      setActiveOrders(
        processedOrders.filter((order) =>
          ["pending", "preparing", "ready", "delivering"].includes(order.status)
        )
      );
      setCompletedOrders(
        processedOrders.filter((order) =>
          ["completed", "cancelled"].includes(order.status)
        )
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // New refreshOrders function to re-fetch the orders
  const refreshOrders = async () => {
    setIsLoading(true);
    await fetchOrders();
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const subscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Attempting to update order ${orderId} to status ${newStatus}`);
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select(); // Select the updated record

      if (error) {
        console.error("Error updating order status:", error);
        toast({
          title: "Error",
          description: `Failed to update order status: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }

      if (data && data.length > 0) {
        // Optimistically update the local state with the updated data
        const updatedOrder = data[0];
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: updatedOrder.status } : order
          )
        );
        setActiveOrders((prevActiveOrders) =>
          prevActiveOrders.map((order) =>
            order.id === orderId ? { ...order, status: updatedOrder.status } : order
          )
        );
        setCompletedOrders((prevCompletedOrders) =>
          prevCompletedOrders.map((order) =>
            order.id === orderId ? { ...order, status: updatedOrder.status } : order
          )
        );

        toast({
          title: "Success",
          description: "Order status updated successfully.",
        });

        return { success: true, data: updatedOrder };
      } else {
        console.error(`Order with id ${orderId} not found or update failed`);
        toast({
          title: "Error",
          description: `Order with id ${orderId} not found or update failed.`,
          variant: "destructive",
        });
        return { success: false, error: "Order not found or update failed" };
      }
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
    refreshOrders,
  };
};