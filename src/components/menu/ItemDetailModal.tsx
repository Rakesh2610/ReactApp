import React, { useState } from "react";
import { PlusIcon, MinusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";

interface ItemDetailModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  item?: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    dietaryInfo: string[];
  };
  onAddToCart?: (
    item: any,
    quantity: number,
    specialInstructions: string,
  ) => void;
}

const ItemDetailModal = ({
  open = true,
  onOpenChange,
  item = {
    id: "1",
    name: "Vegetable Stir Fry",
    description:
      "Fresh vegetables stir-fried in a savory sauce with your choice of rice or noodles.",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    category: "Main Course",
    dietaryInfo: ["Vegetarian", "Gluten-Free Option"],
  },
  onAddToCart = () => {},
}: ItemDetailModalProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSide, setSelectedSide] = useState("rice");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    console.log("Adding to cart from ItemDetailModal:", {
      ...item,
      quantity,
      side: selectedSide,
      specialInstructions,
    });

    // Add to cart using the hook
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image,
      customizations: [
        selectedSide !== "rice" ? `Side: ${selectedSide}` : "",
      ].filter(Boolean),
      specialInstructions: specialInstructions.trim() || undefined,
    });

    // Also call the passed onAddToCart if provided
    onAddToCart(
      {
        ...item,
        side: selectedSide,
      },
      quantity,
      specialInstructions,
    );

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-64 object-cover rounded-md"
            />
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold">
              ${item.price.toFixed(2)}
            </div>
          </div>

          <div className="flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {item.name}
              </DialogTitle>
              <DialogDescription className="text-sm mt-2">
                {item.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {item.dietaryInfo.map((info, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  >
                    {info}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="side">Choose your side</Label>
                  <Select value={selectedSide} onValueChange={setSelectedSide}>
                    <SelectTrigger id="side" className="w-full">
                      <SelectValue placeholder="Select a side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rice">Steamed Rice</SelectItem>
                      <SelectItem value="noodles">Noodles</SelectItem>
                      <SelectItem value="quinoa">Quinoa (+$1.50)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="special-instructions">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Any special requests or allergies?"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <div className="flex items-center mt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="w-16 mx-2 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleIncreaseQuantity}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <div className="flex items-center justify-between w-full">
            <div className="text-lg font-bold">
              Total: ${(item.price * quantity).toFixed(2)}
            </div>
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailModal;
