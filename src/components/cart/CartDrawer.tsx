import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, ShoppingCart, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useNavigate } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";
import OrderSuccess from "./OrderSuccess";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const CartDrawer = ({
  isOpen = false,
  onClose = () => {},
}: CartDrawerProps) => {
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
    clearCart,
  } = useCart();

  const handleOrderSuccess = () => {
    const newOrderId = "ORD" + Math.floor(Math.random() * 10000);
    setOrderId(newOrderId);
    setOrderComplete(true);
    clearCart();
  };

  const handleClose = () => {
    setShowCheckout(false);
    setOrderComplete(false);
    onClose();
  };

  const goToCartPage = () => {
    handleClose();
    navigate("/cart");
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white h-[85vh] overflow-y-auto">
        {orderComplete ? (
          <OrderSuccess orderId={orderId} onClose={handleClose} />
        ) : showCheckout ? (
          <CheckoutForm
            onSuccess={handleOrderSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle className="text-xl font-bold flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Your Cart
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items)
                </span>
              </DrawerTitle>
            </DrawerHeader>

            <div className="px-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add items to get started
                  </p>
                  <DrawerClose asChild>
                    <Button className="mt-6">Browse Menu</Button>
                  </DrawerClose>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${JSON.stringify(item.customizations)}`}
                      className="flex items-start space-x-4 py-3"
                    >
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <button
                            onClick={() =>
                              removeItem(
                                item.id,
                                item.customizations,
                                item.specialInstructions,
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
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
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                -1,
                                item.customizations,
                                item.specialInstructions,
                              )
                            }
                            className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted"
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
                            className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-muted"
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
              )}
            </div>

            {cartItems.length > 0 && (
              <>
                <Separator className="my-4" />

                <div className="px-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <DrawerFooter>
                  <Button
                    className="w-full py-6"
                    size="lg"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={goToCartPage}
                  >
                    View Full Cart
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="ghost" className="w-full">
                      Continue Shopping
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
