import React from "react";
import { OrderHistoryItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

interface OrderHistoryProps {
  orderHistory: OrderHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orderHistory,
  isLoading,
  onRefresh,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Order History</h2>
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : orderHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderHistory.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                <div>
                  <h3 className="font-medium">Order #{order.id.slice(-6)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.id}-item-${index}`}
                    className="flex justify-between items-center py-1"
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{item.quantity}x</span>
                      <span className="ml-2">{item.name}</span>
                    </div>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {order.pickup_time
                    ? `Pickup: ${formatDate(order.pickup_time)}`
                    : "Pickup time not set"}
                </div>
                <div className="font-medium">
                  Total: ₹{order.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
