import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import {
  Minus,
  Plus,
  ShoppingCart,
  ChevronRight,
  ArrowLeft,
  History,
  Trash2,
  ShoppingBag,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckoutForm from "./CheckoutForm";
import OrderSuccess from "./OrderSuccess";
import OrderHistory from "./OrderHistory";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CartPage: React.FC = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [activeTab, setActiveTab] = useState("cart");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    cartItems,
    updateQuantity,
    removeItem,
    subtotal,
    tax,
    total,
    isLoading,
    itemCount,
    clearCart,
    submitOrder,
    orderHistory,
    isLoadingHistory,
    loadOrderHistory,
  } = useCart();

  useEffect(() => {
    // Load order history when component mounts if user is logged in
    if (user) {
      loadOrderHistory();
    }
  }, [user]);

  // Update selectAll when all items are selected or deselected
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.length === cartItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, cartItems]);

  // Update selected items when selectAll changes
  useEffect(() => {
    if (selectAll) {
      const allItemIds = cartItems.map(
        item => `${item.id}-${JSON.stringify(item.customizations)}-${item.specialInstructions}`
      );
      setSelectedItems(allItemIds);
    }
  }, [selectAll, cartItems]);
// Add this effect in the CartPage component
useEffect(() => {
  const handleSwitchToHistoryTab = () => setActiveTab("history");
  document.addEventListener("switchToHistoryTab", handleSwitchToHistoryTab);
  return () => document.removeEventListener("switchToHistoryTab", handleSwitchToHistoryTab);
}, []);
  const handleOrderSuccess = (newOrderId: string) => {
    setOrderId(newOrderId);
    setOrderComplete(true);
    toast({
      title: "Order Placed Successfully",
      description: `Your order #${newOrderId.substring(0, 8)} has been placed successfully.`,
    });
  };

  const toggleItemSelection = (itemKey: string) => {
    setSelectedItems(prev => 
      prev.includes(itemKey)
        ? prev.filter(key => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const handleSelectAllToggle = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allItemIds = cartItems.map(
        item => `${item.id}-${JSON.stringify(item.customizations)}-${item.specialInstructions}`
      );
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const performRemoveAction = () => {
    if (selectedItems.length === 0) return;

    // If all items are selected, use clearCart for efficiency
    if (selectedItems.length === cartItems.length) {
      clearCart();
    } else {
      // Remove individual selected items
      selectedItems.forEach(itemKey => {
        const [id, customizationsStr, specialInstructions] = itemKey.split('-');
        let customizations;
        try {
          customizations = customizationsStr ? JSON.parse(customizationsStr) : undefined;
        } catch (e) {
          customizations = undefined;
        }
        
        removeItem(
          id,
          customizations,
          specialInstructions === "undefined" ? undefined : specialInstructions
        );
      });
    }
    
    toast({
      title: "Items Removed",
      description: `${selectedItems.length} item(s) removed from your cart.`,
      duration: 2000,
    });
    
    setSelectedItems([]);
    setShowRemoveDialog(false);
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      // If no items selected, select all first
      handleSelectAllToggle();
      setTimeout(() => setShowRemoveDialog(true), 100);
    } else {
      setShowRemoveDialog(true);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4 -ml-2 flex items-center text-muted-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Menu
      </Button>

      {orderComplete ? (
        <OrderSuccess orderId={orderId} onClose={() => navigate("/")} />
      ) : showCheckout ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <CheckoutForm
            onSuccess={handleOrderSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      ) : (
        <>
          {user && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="cart" className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Your Cart ({itemCount})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  Order History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cart">{renderCartContent()}</TabsContent>

              <TabsContent value="history">
                <OrderHistory
                  orderHistory={orderHistory}
                  isLoading={isLoadingHistory}
                  onRefresh={loadOrderHistory}
                />
              </TabsContent>
            </Tabs>
          )}

          {!user && renderCartContent()}
        </>
      )}

      <AlertDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedItems.length === cartItems.length 
                ? "Remove All Items" 
                : `Remove ${selectedItems.length} Selected Items`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedItems.length === cartItems.length 
                ? "all items from your cart" 
                : "the selected items"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performRemoveAction}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  function renderCartContent() {
    return (
      <>
        {!user && (
          <div className="flex items-center mb-6">
            <ShoppingCart className="mr-3 h-6 w-6" />
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({itemCount} items)
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <p>Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add items to get started
            </p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all" 
                      checked={selectAll} 
                      onCheckedChange={handleSelectAllToggle}
                    />
                    <label 
                      htmlFor="select-all" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select All
                    </label>
                  </div>
                  <h2 className="text-lg font-medium">Cart Items</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={handleRemoveSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {selectedItems.length > 0 
                      ? `Remove Selected (${selectedItems.length})` 
                      : "Remove All"}
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const itemKey = `${item.id}-${JSON.stringify(item.customizations)}-${item.specialInstructions}`;
                  const isSelected = selectedItems.includes(itemKey);
                  
                  return (
                    <div
                      key={itemKey}
                      className={`flex items-start space-x-4 py-4 border-b last:border-0 ${
                        isSelected ? "bg-blue-50 -mx-4 px-4 rounded" : ""
                      }`}
                    >
                      <div className="flex items-start mt-1">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleItemSelection(itemKey)}
                          className="mt-2"
                        />
                      </div>
                      <div className="h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          {isSelected && (
                            <Check className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{item.price.toFixed(2)}
                        </p>
                        {item.customizations &&
                          item.customizations.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-muted-foreground">
                                {item.customizations.join(", ")}
                              </p>
                            </div>
                          )}
                        {item.specialInstructions && (
                          <div className="mt-1">
                            <p className="text-xs italic text-muted-foreground">
                              Note: {item.specialInstructions}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center mt-3">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                -1,
                                item.customizations,
                                item.specialInstructions,
                              )
                            }
                            className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="mx-3 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                1,
                                item.customizations,
                                item.specialInstructions,
                              )
                            }
                            className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <div className="ml-auto font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => {
                  if (!user) {
                    // Redirect to login if not logged in
                    navigate("/login?redirect=/cart");
                  } else {
                    setShowCheckout(true);
                  }
                }}
                disabled={cartItems.length === 0}
              >
                {!user ? "Login to Checkout" : selectedItems.length > 0 
                  ? `Checkout Selected (${selectedItems.length})`
                  : "Checkout All Items"
                }
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default CartPage;