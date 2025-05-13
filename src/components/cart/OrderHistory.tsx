import React, { useState, useEffect } from "react";
import { OrderHistoryItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  IndianRupee,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Calendar,
  PartyPopper, // still used in expanded details (optional)
  School,
  GraduationCap,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface SpecialOrder {
  id: string;
  order_id: string;
  event_name: string;
  created_at: string;
}

interface OrderHistoryProps {
  orderHistory: OrderHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

type OrderType = "all" | "regular" | "event";
type OrderStatus = "all" | "pending" | "preparing" | "ready" | "completed" | "cancelled";

const ORDER_STATUSES: OrderStatus[] = ["all", "pending", "preparing", "ready", "completed", "cancelled"];

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orderHistory,
  isLoading,
  onRefresh,
}) => {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [specialOrders, setSpecialOrders] = useState<Record<string, SpecialOrder>>({});

  // Filtering state
  const [orderType, setOrderType] = useState<OrderType>("all");
  const [status, setStatus] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch special orders data from DB
  useEffect(() => {
    const fetchSpecialOrders = async () => {
      const { data, error } = await supabase
        .from("special_orders")
        .select("*")
        .in("order_id", orderHistory.map(order => order.id));
      if (!error && data) {
        const specialOrdersMap = data.reduce((acc, order) => ({
          ...acc,
          [order.order_id]: order
        }), {});
        setSpecialOrders(specialOrdersMap);
      }
    };

    if (orderHistory.length > 0) {
      fetchSpecialOrders();
    }
  }, [orderHistory]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard className="h-4 w-4 mr-1" />;
      case "upi":
        return <IndianRupee className="h-4 w-4 mr-1" />;
      case "cash":
        return <IndianRupee className="h-4 w-4 mr-1" />;
      default:
        return <CreditCard className="h-4 w-4 mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available";
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  // Render only the status badge (event badge removed)
  const renderOrderBadges = (order: OrderHistoryItem) => {
    return (
      <Badge
        key="status"
        variant="outline"
        className={getStatusColor(order.status)}
      >
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </Badge>
    );
  };

  const filteredOrders = orderHistory.filter(order => {
    const isEventOrder = specialOrders[order.id];
    const matchesType =
      orderType === "all" ||
      (orderType === "event" && isEventOrder) ||
      (orderType === "regular" && !isEventOrder);
    const matchesStatus = status === "all" || order.status === status;
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (specialOrders[order.id]?.event_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Order History</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="regular">Regular Orders</SelectItem>
                <SelectItem value="event">Event Orders</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value: OrderStatus) => setStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map(stat => (
                  <SelectItem key={stat} value={stat}>
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders[order.id] || false;
              const specialOrder = specialOrders[order.id];
              
              return (
                <div
                  key={order.id}
                  className={cn(
                    "border-2 rounded-lg transition-all duration-200",
                    isExpanded ? "bg-gray-50" : "",
                    specialOrder ? "border-purple-500 bg-purple-50/10" : "border-gray-200",
                    "hover:shadow-lg"
                  )}
                >
                  <div className="p-4">
                    <div
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 cursor-pointer"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            Order #{order.id.slice(-6)}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {renderOrderBadges(order)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="font-medium text-lg">
                          ₹{order.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        {/* If event order, display detailed event info with refined styling */}
                        {specialOrder && (
                          <div className="mb-4 bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-purple-700">
                              <School className="h-5 w-5" />
                              <div>
                                <h4 className="font-medium text-base">Event Order</h4>
                                <p className="text-sm">{specialOrder.event_name}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Pickup: {formatDate(order.pickup_time || "")}</span>
                            </div>
                            {order.payment_method && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                {getPaymentMethodIcon(order.payment_method)}
                                <span>
                                  Payment: {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {order.special_instructions && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Special Instructions:</span>
                                <p className="italic mt-1">{order.special_instructions}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-md border p-3 mb-3">
                          <h4 className="font-medium mb-2 text-sm">Order Items</h4>
                          <div className="divide-y">
                            {order.items.map((item, index) => (
                              <div
                                key={`${order.id}-item-${index}`}
                                className="flex justify-between items-center py-2"
                              >
                                <div className="flex items-center">
                                  <span className="font-medium">{item.quantity}x</span>
                                  <span className="ml-2">{item.name}</span>
                                </div>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center text-sm">
                            <CalendarClock className="h-4 w-4 mr-1 text-gray-500" />
                            <span>Order placed: {formatDate(order.created_at)}</span>
                          </div>
                          <div className="font-medium text-lg">
                            Total: ₹{order.total.toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-4 bg-blue-50 rounded-md p-3">
                          <p className="text-xs text-blue-700">
                            {order.status === "pending" && "Your order has been received and will be prepared shortly."}
                            {order.status === "preparing" && "Your order is currently being prepared in the kitchen."}
                            {order.status === "ready" && "Your order is ready for pickup!"}
                            {order.status === "completed" && "This order has been completed. Thank you!"}
                            {order.status === "cancelled" && "This order was cancelled."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;