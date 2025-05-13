import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  IndianRupee,
  Clock,
  Store,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { format, addMinutes } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase"; // Add this import near the top

interface CheckoutFormProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

const PICKUP_TIMES = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
];

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess = () => {}, onCancel = () => {} }) => {
  const { toast } = useToast();
  const { cartItems, total, submitOrder } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cash">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupTime, setPickupTime] = useState("15");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [activeTab, setActiveTab] = useState<"order" | "payment">("order");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [isEventOrder, setIsEventOrder] = useState(false);
  const [eventName, setEventName] = useState("");
  
  // Instead of relying solely on user.user_metadata, fetch the role from the DB.
  const [isTeacher, setIsTeacher] = useState(false);
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Error fetching role:", error);
        } else if (data) {
          setIsTeacher(data.role === "teacher");
        }
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const estimatedDate = addMinutes(now, parseInt(pickupTime));
    setEstimatedTime(format(estimatedDate, "h:mm a"));
  }, [pickupTime]);

  const showToast = (title: string, description: string, variant?: "default" | "destructive") => {
    toast({
      title,
      description,
      variant,
    });
  };

  const validateCardDetails = () => {
    if (!cardNumber || cardNumber.length < 16) {
      showToast("Error", "Please enter a valid card number", "destructive");
      return false;
    }
    if (!cardName) {
      showToast("Error", "Please enter the cardholder name", "destructive");
      return false;
    }
    if (!cardExpiry || !cardExpiry.includes("/")) {
      showToast("Error", "Please enter a valid expiry date (MM/YY)", "destructive");
      return false;
    }
    if (!cardCvv || cardCvv.length < 3) {
      showToast("Error", "Please enter a valid CVV", "destructive");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === "upi" && !upiId) {
      showToast("Error", "Please enter a valid UPI ID", "destructive");
      setIsProcessing(false);
      return;
    }

    if (paymentMethod === "card" && !validateCardDetails()) {
      setIsProcessing(false);
      return;
    }

    try {
      const now = new Date();
      now.setMinutes(now.getMinutes() + parseInt(pickupTime));
      const formattedPickupTime = now.toISOString();

      let paymentDetails: Record<string, any> = {};
      if (paymentMethod === "upi") {
        paymentDetails = { upi_id: upiId };
      } else if (paymentMethod === "card") {
        const maskedCardNumber = cardNumber.slice(-4).padStart(cardNumber.length, "*");
        paymentDetails = {
          card_holder: cardName,
          card_number_masked: maskedCardNumber,
          expiry: cardExpiry,
        };
      }

      const orderPayload = {
        pickup_time: formattedPickupTime,
        paymentDetails,
        special_instructions: specialInstructions,
        order_items: cartItems || [],
        is_event_order: isEventOrder,
        event_name: isEventOrder ? eventName : null,
      };

      const orderId = await submitOrder(
        isEventOrder ? "Event Order" : "Store Pickup",
        paymentMethod,
        orderPayload
      );

      // If teacher and it's an event order, store the event details in the special orders table
      if (isEventOrder) {
        const { error } = await supabase
          .from("special_orders")
          .insert([{ order_id: orderId, event_name: eventName }]);
        if (error) {
          throw new Error("Failed to store special order details: " + error.message);
        }
      }

      setTimeout(() => {
        setIsProcessing(false);
        showToast(
          "Order Placed Successfully",
          `Your ${paymentMethod === "cash" ? "order" : "payment"} of ₹${total.toFixed(2)} has been ${
            paymentMethod === "cash" ? "confirmed" : "processed"
          } successfully.`
        );
        onSuccess(orderId);
      }, 2000);
    } catch (error: any) {
      setIsProcessing(false);
      showToast("Error", error instanceof Error ? error.message : "Failed to process order", "destructive");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "order" | "payment")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="order">Order Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pickup Information</h3>
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
                <Store className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700">Your order will be available for pickup at our restaurant</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pickup Time</h3>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Ready in approximately:</span>
              </div>
              <Select value={pickupTime} onValueChange={setPickupTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pickup time" />
                </SelectTrigger>
                <SelectContent>
                  {PICKUP_TIMES.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500">Estimated pickup time: {estimatedTime}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special instructions for your order?"
              />
            </div>

            {isTeacher && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Type</h3>
                <RadioGroup
                  value={isEventOrder ? "event" : "regular"}
                  onValueChange={(value) => setIsEventOrder(value === "event")}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular">Regular Order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="event" id="event" />
                    <Label htmlFor="event">Event Order</Label>
                  </div>
                </RadioGroup>
                {isEventOrder && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                      id="eventName"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Enter event name"
                      required={isEventOrder}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            <Button type="button" onClick={() => setActiveTab("payment")} className="w-full">
              Continue to Payment
            </Button>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Method</h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "upi" | "card" | "cash")}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" /> UPI
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash on Pickup</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@upi"
                />
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="123"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Separator />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("order")}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing
                  ? "Processing..."
                  : paymentMethod === "cash"
                  ? "Confirm Order"
                  : "Place Order"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default CheckoutForm;