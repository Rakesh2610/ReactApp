import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { supabase } from "@/lib/supabase";
import {
  RefreshCw,
  Search,
  Filter,
  Calendar,
  PartyPopper,
  X,
  ChevronsUpDown,
  CalendarClock,
  User,
  Receipt,
  Clock,
  CreditCard,
  Check,
  MessageCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpecialOrder {
  id: string;
  order_id: string;
  event_name: string;
  created_at: string;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "preparing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ready":
      return "bg-green-100 text-green-800 border-green-200";
    case "delivering":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Enhanced Order Details View - Receipt Style with reduced height
const OrderDetails = ({ order, isEventOrder = false, eventName = "" }: { 
  order: any;
  isEventOrder?: boolean;
  eventName?: string;
}) => {
  if (!order) return null;
  
  return (
    <div className="receipt-container bg-white p-3 md:p-4 rounded-lg max-w-full mx-auto">
      {/* Receipt Header - more compact */}
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h2 className="text-xl font-bold">Order Receipt</h2>
        </div>
        
        {isEventOrder && (
          <div className="bg-purple-50 rounded-lg p-2 inline-flex items-center gap-2">
            <PartyPopper className="h-4 w-4 text-purple-700" />
            <span className="font-medium text-purple-800">{eventName}</span>
          </div>
        )}
      </div>
      
      {/* Order Info + Items in side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left column: Customer + Order info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1 pb-1 border-b">Order Information</h3>
            <div className="space-y-0.5 text-sm">
              <p className="flex justify-between">
                <span className="font-medium">Order #:</span>
                <span>{order.order_number}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(order.created_at), "MMM dd, yyyy")}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{format(new Date(order.created_at), "hh:mm a")}</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusBadgeColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </p>
            </div>
          </div>
        
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1 pb-1 border-b">Customer Details</h3>
            <div className="space-y-0.5 text-sm">
              {order.user ? (
                <>
                  <p className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{order.user.name || "N/A"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-sm">{order.user.email}</span>
                  </p>
                  {order.user.phone && (
                    <p className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{order.user.phone}</span>
                    </p>
                  )}
                </>
              ) : (
                <p>Guest Order</p>
              )}
            </div>
          </div>
          
          {/* Payment and additional info in left column for better layout */}
          <div className="space-y-2 text-sm">
            {order.payment_method && (
              <div className="bg-gray-50 rounded-md p-2">
                <div className="flex items-center">
                  <CreditCard className="h-3 w-3 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-800 mr-2">Payment:</span>
                  <span className="capitalize">{order.payment_method}</span>
                </div>
              </div>
            )}
            
            {order.pickup_time && (
              <div className="bg-gray-50 rounded-md p-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-800 mr-2">Pickup:</span>
                  <span>{format(new Date(order.pickup_time), "MMM d, h:mm a")}</span>
                </div>
              </div>
            )}
            
            {order.special_instructions && (
              <div className="bg-amber-50 rounded-md p-2">
                <div className="flex items-start">
                  <MessageCircle className="h-3 w-3 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <span className="font-medium text-amber-800 block text-xs">Instructions</span>
                    <p className="text-amber-700 text-xs">{order.special_instructions}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column: Order Items */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2 pb-1 border-b">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item: any, index: number) => (
              <div 
                key={index} 
                className={cn(
                  "p-2 rounded-md", 
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs font-medium">
                          {item.quantity}x
                        </span>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                      </div>
                      <div className="font-bold text-gray-800 text-right min-w-[70px] text-sm">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="mt-0.5 text-xs text-gray-500 pl-7">
                      <span>₹{item.price.toFixed(2)}/item</span>
                    </div>
                    
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mt-1 pl-7">
                        <div className="flex flex-wrap gap-1">
                          {item.customizations.map((custom: string, idx: number) => (
                            <span 
                              key={idx}
                              className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded-full"
                            >
                              {custom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.special_instructions && (
                      <p className="text-xs italic mt-0.5 text-gray-500 pl-7">
                        "{item.special_instructions}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Totals Section - right aligned and more compact */}
          <div className="border-t border-dashed pt-3 mt-3">
            <div className="space-y-1 text-right">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t mt-1">
                <span>Total</span>
                <span className="text-green-700">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-3 text-center text-xs text-gray-500 pt-2">
            <p>Thank you for your order! | Order ID: {order.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersList = () => {
  const {
    activeOrders,
    completedOrders,
    isLoading,
    updateOrderStatus,
    refreshOrders,
  } = useAdminOrders();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [specialOrders, setSpecialOrders] = useState<Record<string, SpecialOrder>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  // Main tab state with EVENT ORDERS as highest priority
  const [activeTab, setActiveTab] = useState("events");
  
  // Advanced filters
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [orderTypeFilter, setOrderTypeFilter] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch special orders for admin view
  useEffect(() => {
    const fetchSpecialOrders = async () => {
      if (activeOrders.length === 0 && completedOrders.length === 0) return;
      
      const orderIds = [
        ...activeOrders.map((o) => o.id),
        ...completedOrders.map((o) => o.id),
      ];
      
      const { data, error } = await supabase
        .from("special_orders")
        .select("*")
        .in("order_id", orderIds);
        
      if (!error && data) {
        const specialOrdersMap = data.reduce((acc: any, order: SpecialOrder) => {
          acc[order.order_id] = order;
          return acc;
        }, {});
        setSpecialOrders(specialOrdersMap);
      }
    };
    
    fetchSpecialOrders();
  }, [activeOrders, completedOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);

    // Update the status locally for immediate UI change
    const updatedOrder = [...activeOrders, ...completedOrders].find(o => o.id === orderId);
    if (updatedOrder) {
      updatedOrder.status = newStatus;

      if (newStatus === "completed" || newStatus === "cancelled") {
        // Switch tabs if necessary
        setActiveTab(prevTab => {
          if (
            prevTab === "active" &&
            filteredActiveOrders.length === 1 &&
            filteredActiveOrders[0].id === orderId
          ) {
            return hasActiveEventOrders() ? "events" : "completed";
          }
          return prevTab;
        });
      } else if (["pending", "preparing", "ready", "delivering"].includes(newStatus)) {
        // Refresh only the orders table instead of the entire page
        await refreshOrders();
      }
    }
  };

const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    await refreshOrders(); // trigger the refresh (assuming refreshOrders is designed to update orders)
  } catch (error) {
    console.error("Failed to refresh orders:", error);
  } finally {
    setIsRefreshing(false);
  }
};
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("date-desc");
    setStatusFilter([]);
    setDateRange({ start: "", end: "" });
    setPriceRange({ min: "", max: "" });
    setOrderTypeFilter([]);
  };

  // Filter and sort orders
  const filterOrders = (orders: any[]) => {
    return orders.filter(order => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm || 
        order.order_number.toLowerCase().includes(searchLower) ||
        (order.user?.name || "").toLowerCase().includes(searchLower) ||
        (order.user?.email || "").toLowerCase().includes(searchLower) ||
        (specialOrders[order.id]?.event_name || "").toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = 
        statusFilter.length === 0 || 
        statusFilter.includes(order.status);
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const orderDate = new Date(order.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        matchesDateRange = orderDate >= startDate && orderDate <= endDate;
      }
      
      // Price range filter
      let matchesPriceRange = true;
      if (priceRange.min || priceRange.max) {
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        
        matchesPriceRange = order.total_amount >= min && order.total_amount <= max;
      }
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesPriceRange;
    }).sort((a, b) => {
      // Sort orders
      switch (sortBy) {
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "price-asc":
          return a.total_amount - b.total_amount;
        case "price-desc":
          return b.total_amount - a.total_amount;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  // Get event orders for the dedicated tab
  const eventOrders = [...activeOrders, ...completedOrders].filter(
    order => !!specialOrders[order.id]
  );
  
  // Recalculate filtered lists when orders or filters change
  const filteredActiveOrders = useMemo(() => {
    return filterOrders(
      activeOrders.filter(order => !specialOrders[order.id])
    );
  }, [activeOrders, specialOrders, searchTerm, sortBy, statusFilter, dateRange, priceRange, orderTypeFilter]);
  
  const filteredCompletedOrders = useMemo(() => {
    return filterOrders(
      completedOrders.filter(order => !specialOrders[order.id])
    );
  }, [completedOrders, specialOrders, searchTerm, sortBy, statusFilter, dateRange, priceRange, orderTypeFilter]);
  
  const filteredEventOrders = useMemo(() => {
    return filterOrders(eventOrders);
  }, [eventOrders, searchTerm, sortBy, statusFilter, dateRange, priceRange, orderTypeFilter]);

  const renderTable = (orders: any[]) => {
    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <Calendar className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
          {(searchTerm || statusFilter.length > 0 || dateRange.start || dateRange.end || priceRange.min || priceRange.max) && (
            <Button 
              variant="outline"
              onClick={resetFilters}
              className="mt-4"
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Order #</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              {activeTab === "events" && (
                <TableHead className="font-semibold">Event Name</TableHead>
              )}
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => {
              const isEventOrder = Boolean(specialOrders[order.id]);
              const eventName = isEventOrder ? specialOrders[order.id].event_name : '';
              
              return (
                <TableRow 
                  key={order.id}
                  className={cn(
                    isEventOrder ? "bg-purple-50/30" : ""
                  )}
                >
                  <TableCell className="font-medium">
                    {order.order_number}
                    {isEventOrder && activeTab !== "events" && (
                      <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                        <PartyPopper className="h-3 w-3 mr-1" />
                        Event
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.user ? (order.user.name || order.user.email) : "Guest"}</span>
                      {order.user?.role && (
                        <span className="text-xs text-muted-foreground">
                          {order.user.role}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {activeTab === "events" && (
                    <TableCell>
                      <span className="text-purple-700 font-medium">{eventName}</span>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(order.created_at), "MMM dd, yyyy")}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "hh:mm a")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-[98vw] p-1 sm:p-4">
                          <DialogHeader className="sr-only">
                            <DialogTitle>Order Receipt</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <ScrollArea className="max-h-[85vh]">
                              <OrderDetails 
                                order={selectedOrder}
                                isEventOrder={isEventOrder}
                                eventName={eventName}
                              />
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {/* Only show status change options for non-completed orders */}
                      {order.status !== "completed" && order.status !== "cancelled" ? (
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-9 bg-white">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="h-9 px-3 flex items-center">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Function to check for any active event orders
  const hasActiveEventOrders = useCallback(() => {
    return eventOrders.some(order => 
      order.status !== "completed" && order.status !== "cancelled"
    );
  }, [eventOrders]);

  // Count badges - moved to useMemo to prevent unnecessary calculations
  const activeEventOrdersCount = useMemo(() => {
    return eventOrders.filter(
      order => order.status !== "completed" && order.status !== "cancelled"
    ).length;
  }, [eventOrders]);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Orders</h1>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center"
                disabled={isRefreshing}
              >
                <RefreshCw className={cn(
                  "h-4 w-4 mr-2",
                  isRefreshing && "animate-spin"
                )} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            
            {/* Search & Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 items-center">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest first</SelectItem>
                    <SelectItem value="date-asc">Oldest first</SelectItem>
                    <SelectItem value="price-desc">Highest amount</SelectItem>
                    <SelectItem value="price-asc">Lowest amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      className={cn(
                        "flex items-center gap-2",
                        (statusFilter.length > 0 || 
                         dateRange.start || dateRange.end || priceRange.min || priceRange.max) &&
                         "border-primary text-primary"
                      )}
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                      {(statusFilter.length > 0 || 
                         dateRange.start || dateRange.end || priceRange.min || priceRange.max) && (
                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                          {statusFilter.length + 
                            (dateRange.start && dateRange.end ? 1 : 0) + 
                            ((priceRange.min || priceRange.max) ? 1 : 0)
                          }
                        </Badge>
                      )}
                    </Button>
                    </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {["pending", "preparing", "ready", "completed", "cancelled"].map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`status-${status}`}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={(checked) => {
                                  setStatusFilter(prev => 
                                    checked 
                                      ? [...prev, status]
                                      : prev.filter(s => s !== status)
                                  );
                                }}
                              />
                              <Label htmlFor={`status-${status}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Date Range</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="start-date" className="text-xs">From</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={dateRange.start}
                              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date" className="text-xs">To</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={dateRange.end}
                              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Price Range</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="min-price" className="text-xs">Min (₹)</Label>
                            <Input
                              id="min-price"
                              type="number"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="max-price" className="text-xs">Max (₹)</Label>
                            <Input
                              id="max-price"
                              type="number"
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                        <Button size="sm">Apply Filters</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {(searchTerm || statusFilter.length > 0 || dateRange.start || dateRange.end || priceRange.min || priceRange.max) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Tabs with Event Orders Tab First */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger 
                value="events" 
                className={cn(
                  "text-base",
                  hasActiveEventOrders() ? "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900" : ""
                )}
              >
                Event Orders
                {activeEventOrdersCount > 0 && (
                  <Badge className="ml-2 bg-purple-200 text-purple-900">{activeEventOrdersCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="text-base">
                Active Orders
                {filteredActiveOrders.length > 0 && (
                  <Badge className="ml-2 bg-primary">{filteredActiveOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-base">
                Completed Orders
                {filteredCompletedOrders.length > 0 && (
                  <Badge className="ml-2">{filteredCompletedOrders.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Event Orders Tab Content */}
            <TabsContent value="events" className="pt-2">
              {filteredEventOrders.length > 0 ? (
                <div className="space-y-4">
                  {/* Event Orders Table */}
                  {renderTable(filteredEventOrders)}
                </div>
              ) : (
                renderTable(filteredEventOrders)
              )}
            </TabsContent>
            
            {/* Active Orders Tab Content */}
            <TabsContent value="active" className="pt-2">
              {renderTable(filteredActiveOrders)}
            </TabsContent>
            
            {/* Completed Orders Tab Content */}
            <TabsContent value="completed" className="pt-2">
              {renderTable(filteredCompletedOrders)}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersList;