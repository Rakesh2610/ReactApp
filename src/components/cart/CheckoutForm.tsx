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
  MapPin,
  Truck,
  Home,
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

interface CheckoutFormProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess = () => {},
  onCancel = () => {},
}) => {
  const { toast } = useToast();
  const { cartItems, total, submitOrder } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cash">(
    "upi",
  );
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupTime, setPickupTime] = useState("15");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [activeTab, setActiveTab] = useState<"order" | "payment">("order");
  const [estimatedTime, setEstimatedTime] = useState("");

  useEffect(() => {
    // Calculate and format the estimated pickup/delivery time
    const now = new Date();
    const estimatedDate = addMinutes(now, parseInt(pickupTime));
    setEstimatedTime(format(estimatedDate, "h:mm a"));
  }, [pickupTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate delivery information if delivery is selected
    if (deliveryMethod === "delivery") {
      if (!address.trim()) {
        toast({
          title: "Error",
          description: "Please enter your delivery address",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
        toast({
          title: "Error",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    // Validate payment information
    if (paymentMethod === "upi" && !upiId) {
      toast({
        title: "Error",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.length < 16) {
        toast({
          title: "Error",
          description: "Please enter a valid card number",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!cardName) {
        toast({
          title: "Error",
          description: "Please enter the cardholder name",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!cardExpiry || !cardExpiry.includes("/")) {
        toast({
          title: "Error",
          description: "Please enter a valid expiry date (MM/YY)",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!cardCvv || cardCvv.length < 3) {
        toast({
          title: "Error",
          description: "Please enter a valid CVV",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    try {
      // Calculate pickup time
      const now = new Date();
      now.setMinutes(now.getMinutes() + parseInt(pickupTime));
      const formattedPickupTime = now.toISOString();

      // Prepare additional order details
      const orderDetails = {
        deliveryMethod,
        paymentMethod,
        address: deliveryMethod === "delivery" ? address : "",
        phone: deliveryMethod === "delivery" ? phone : "",
      };

      // Submit order to database
      const { orderId } = await submitOrder(
        formattedPickupTime,
        specialInstructions,
        orderDetails,
      );

      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "Payment Successful",
          description: `Your payment of ₹${total.toFixed(2)} has been processed successfully.`,
        });
        onSuccess(orderId);
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process order",
        variant: "destructive",
      });
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
              <h3 className="text-lg font-medium">Delivery Method</h3>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) =>
                  setDeliveryMethod(value as "pickup" | "delivery")
                }
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-2">
                    <Store className="h-4 w-4" /> Pickup
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {deliveryMethod === "pickup" ? (
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
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500">
                  Estimated pickup time: {estimatedTime}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Delivery Address
                  </Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Home className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special instructions for your order?"
              />
            </div>

            <Button
              type="button"
              onClick={() => setActiveTab("payment")}
              className="w-full"
            >
              Continue to Payment
            </Button>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Method</h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "upi" | "card" | "cash")
                }
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
                  <Label htmlFor="cash">Cash on Delivery/Pickup</Label>
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
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default CheckoutForm;
