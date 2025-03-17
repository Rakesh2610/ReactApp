import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  useAdminOrders,
  AdminOrder,
  AdminOrderItem,
} from "@/hooks/useAdminOrders";

const OrderDetails = ({ order }: { order: AdminOrder }) => {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Order ID
          </h3>
          <p className="font-mono">{order.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
          <p>{format(new Date(order.created_at), "PPpp")}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Customer
          </h3>
          <p>{order.user?.email || "Guest"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <Badge className={getStatusBadgeColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Pickup Time
          </h3>
          <p>
            {order.pickup_time
              ? format(new Date(order.pickup_time), "PPp")
              : "Not specified"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Amount
          </h3>
          <p className="font-semibold">₹{order.total_amount.toFixed(2)}</p>
        </div>
      </div>

      {order.special_instructions && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Special Instructions
          </h3>
          <p className="p-3 bg-muted rounded-md mt-1">
            {order.special_instructions}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-base font-medium mb-3">Order Items</h3>
        {loading ? (
          <p>Loading items...</p>
        ) : (
          <div className="space-y-4">
            {order.items?.map((item) => {
              return (
                <div key={item.id} className="flex items-start border-b pb-4">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {item.name || "Unknown Item"}
                      </h4>
                      <p className="font-medium">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <p>Quantity: {item.quantity}</p>
                      <p>
                        Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {item.special_instructions && (
                      <p className="text-xs italic mt-1">
                        {item.special_instructions}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between pt-4 font-medium">
              <span>Total</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "preparing":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "ready":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "delivering":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "completed":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "preparing":
      return <Clock className="h-4 w-4" />;
    case "ready":
      return <CheckCircle className="h-4 w-4" />;
    case "delivering":
      return <Truck className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

const OrdersList: React.FC = () => {
  const {
    activeOrders,
    completedOrders,
    isLoading,
    fetchOrders,
    updateOrderStatus,
  } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Order status changed to ${newStatus}`,
        });

        // If we're updating the currently selected order, update it too
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Orders</h2>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivering">Delivering</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading orders...</p>
            </div>
          ) : activeOrders.length === 0 && completedOrders.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusFilter === "all" ||
                  statusFilter === "pending" ||
                  statusFilter === "preparing" ||
                  statusFilter === "ready" ||
                  statusFilter === "delivering"
                    ? activeOrders
                        .filter(
                          (order) =>
                            statusFilter === "all" ||
                            order.status === statusFilter,
                        )
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.order_number}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(order.created_at),
                                "MMM d, yyyy h:mm a",
                              )}
                            </TableCell>
                            <TableCell>
                              {order.user?.email || "Guest"}
                            </TableCell>
                            <TableCell>{order.items?.length || 0}</TableCell>
                            <TableCell>
                              ₹{order.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(order.status)}
                              >
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => viewOrderDetails(order)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>

                                <Select
                                  defaultValue={order.status}
                                  onValueChange={(value) =>
                                    handleUpdateStatus(order.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Update status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="preparing">
                                      Preparing
                                    </SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="delivering">
                                      Delivering
                                    </SelectItem>
                                    <SelectItem value="completed">
                                      Completed
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    : completedOrders
                        .filter((order) => order.status === statusFilter)
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.order_number}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(order.created_at),
                                "MMM d, yyyy h:mm a",
                              )}
                            </TableCell>
                            <TableCell>
                              {order.user?.email || "Guest"}
                            </TableCell>
                            <TableCell>{order.items?.length || 0}</TableCell>
                            <TableCell>
                              ₹{order.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(order.status)}
                              >
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewOrderDetails(order)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            {selectedOrder && (
              <div className="flex gap-2">
                {selectedOrder.status === "pending" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "preparing")
                    }
                  >
                    Start Preparing
                  </Button>
                )}
                {selectedOrder.status === "preparing" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "ready")
                    }
                  >
                    Mark as Ready
                  </Button>
                )}
                {selectedOrder.status === "ready" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "delivering")
                    }
                  >
                    Start Delivery
                  </Button>
                )}
                {selectedOrder.status === "delivering" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "completed")
                    }
                  >
                    Complete Order
                  </Button>
                )}
                {(selectedOrder.status === "pending" ||
                  selectedOrder.status === "preparing") && (
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "cancelled")
                    }
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersList;
