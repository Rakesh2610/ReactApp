import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, IndianRupee } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface CheckoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess = () => {},
  onCancel = () => {},
}) => {
  const { toast } = useToast();
  const { total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate form based on payment method
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

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful",
        description: `Your payment of ₹${total.toFixed(2)} has been processed successfully.`,
      });
      clearCart();
      onSuccess();
    }, 2000);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Total Amount:</span>
          <span className="font-bold">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label className="text-base font-medium">Select Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "upi" | "card")}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center cursor-pointer">
                <IndianRupee className="h-4 w-4 mr-2" />
                UPI Payment
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="card" id="card" />
              <Label
                htmlFor="card"
                className="flex items-center cursor-pointer"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Credit/Debit Card
              </Label>
            </div>
          </RadioGroup>
        </div>

        {paymentMethod === "upi" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="username@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
              />
            </div>

            <div>
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-expiry">Expiry Date</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  id="card-cvv"
                  type="password"
                  placeholder="123"
                  value={cardCvv}
                  onChange={(e) =>
                    setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
