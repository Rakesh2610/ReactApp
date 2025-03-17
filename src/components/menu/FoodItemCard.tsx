import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import FavoriteButton from "./FavoriteButton";

interface DietaryInfo {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  spicy?: boolean;
}

interface FoodItemCardProps {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  dietaryInfo?: DietaryInfo;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  onAddToCart?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const FoodItemCard = ({
  id = "item-1",
  name = "Chicken Burger",
  description = "Juicy chicken patty with lettuce, tomato, and special sauce on a brioche bun",
  price = 8.99,
  image = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
  dietaryInfo = { spicy: true },
  isVegetarian = false,
  isVegan = false,
  isGlutenFree = false,
  isSpicy = false,
  onAddToCart = () => {},
  onViewDetails = () => {},
}: FoodItemCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    console.log("Adding to cart from FoodItemCard:", {
      id,
      name,
      price,
      image,
    });
    // Add item to cart with default quantity of 1
    addToCart({
      id,
      name,
      price,
      quantity: 1,
      image,
    });

    // Also call the passed onAddToCart if provided
    onAddToCart(id);

    // Show feedback to user
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-100 text-green-800 p-3 rounded-md shadow-md z-50 animate-in fade-in slide-in-from-top-5";
    notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${name} added to cart</div>`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add(
        "animate-out",
        "fade-out",
        "slide-out-to-top-5",
      );
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="relative">
        <img src={image} alt={name} className="w-full h-40 object-cover" />
        <div className="absolute top-2 right-2 flex gap-1">
          {(dietaryInfo?.vegetarian || isVegetarian) && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              Veg
            </Badge>
          )}
          {(dietaryInfo?.vegan || isVegan) && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              Vegan
            </Badge>
          )}
          {(dietaryInfo?.glutenFree || isGlutenFree) && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              GF
            </Badge>
          )}
          {(dietaryInfo?.spicy || isSpicy) && (
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-800 border-red-200"
            >
              Spicy
            </Badge>
          )}
        </div>
        <div className="absolute top-2 left-2">
          <FavoriteButton menuItemId={id} />
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <span className="font-bold text-lg">₹{price.toFixed(2)}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>

        <div className="mt-auto flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => onViewDetails(id)}
          >
            <Info className="h-4 w-4 mr-1" />
            Details
          </Button>

          <Button
            onClick={handleAddToCart}
            className={cn("bg-primary hover:bg-primary/90 text-white")}
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;
