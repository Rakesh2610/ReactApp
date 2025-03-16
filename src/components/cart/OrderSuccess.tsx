import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface OrderSuccessProps {
  orderId?: string;
  onClose?: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({
  orderId = "ORD" + Math.floor(Math.random() * 10000),
  onClose = () => {},
}) => {
  // Generate a random pickup time between 15-30 minutes from now
  const pickupMinutes = Math.floor(Math.random() * 16) + 15;
  const pickupTime = new Date(Date.now() + pickupMinutes * 60000);
  const formattedTime = pickupTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 mb-4">
        Your order has been placed successfully.
      </p>

      <div className="bg-gray-50 w-full max-w-md rounded-lg p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-medium">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Pickup:</span>
          <span className="font-medium">
            {formattedTime} (in {pickupMinutes} mins)
          </span>
        </div>
      </div>

      <div className="space-y-3 w-full max-w-md">
        <Button className="w-full" onClick={onClose}>
          Back to Menu
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;
