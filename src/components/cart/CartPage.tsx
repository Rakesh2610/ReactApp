import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import {
  Minus,
  Plus,
  ShoppingCart,
  X,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CheckoutForm from "./CheckoutForm";
import OrderSuccess from "./OrderSuccess";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

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
  } = useCart();

  const handleOrderSuccess = () => {
    const newOrderId = "ORD" + Math.floor(Math.random() * 10000);
    setOrderId(newOrderId);
    setOrderComplete(true);
    clearCart();
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
          <div className="flex items-center mb-6">
            <ShoppingCart className="mr-3 h-6 w-6" />
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({itemCount} items)
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
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
                <h2 className="text-lg font-medium mb-4">Cart Items</h2>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${JSON.stringify(item.customizations)}-${item.specialInstructions}`}
                      className="flex items-start space-x-4 py-4 border-b last:border-0"
                    >
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
                          <button
                            onClick={() =>
                              removeItem(
                                item.id,
                                item.customizations,
                                item.specialInstructions,
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Remove item"
                          >
                            <X className="h-5 w-5" />
                          </button>
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
                  ))}
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
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
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
      )}
    </div>
  );
};

export default CartPage;
