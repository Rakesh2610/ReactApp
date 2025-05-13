import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, Ban, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import FavoriteButton from "./FavoriteButton";
import { useNavigate } from "react-router-dom";

interface DietaryInfo {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

interface FoodItemCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  dietaryInfo?: DietaryInfo;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  available: boolean;
  onAddToCart: (id: string) => void;
  onViewDetails: (id: string) => void;
  requiresAuth: boolean;
  onRequireAuth?: () => void; // new callback prop for login
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({
  id,
  name,
  description = "",
  price,
  image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  dietaryInfo = {},
  isVegetarian,
  isVegan,
  isGlutenFree,
  available,
  onAddToCart,
  onViewDetails,
  requiresAuth,
  onRequireAuth,
}) => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [itemAdded, setItemAdded] = useState(false);
  
  // Check if this item is already in the cart
  const isInCart = cartItems.some(item => item.id === id);

  const handleAddToCart = () => {
    // Add item to cart with default quantity of 1
    addToCart({
      id,
      name,
      price,
      quantity: 1,
      image: typeof image === 'string' ? image : "",
    });
    
    // Don't call onAddToCart since we've already added to cart
    // Instead, just notify the parent component
    onAddToCart(id);
    setItemAdded(true);
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-all hover:shadow-lg",
        !available && "opacity-75"
      )}
    >
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
          }}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isVegetarian && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              Vegetarian
            </Badge>
          )}
          {isVegan && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200"
            >
              Vegan
            </Badge>
          )}
          {isGlutenFree && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              Gluten-Free
            </Badge>
          )}
          {!available && (
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-800 border-red-200"
            >
              Unavailable
            </Badge>
          )}
        </div>
        <div className="absolute top-2 left-2">
          <FavoriteButton menuItemId={id} />
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>
          <div className="font-bold text-primary">₹{price.toFixed(2)}</div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {description}
        </p>

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

          {requiresAuth ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (onRequireAuth) onRequireAuth();
              }}
            >
              Login to Order
            </Button>
          ) : isInCart || itemAdded ? (
            <Button
              onClick={handleViewCart}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              View Cart
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className={cn("bg-primary hover:bg-primary/90 text-white")}
              size="sm"
              disabled={!available}
            >
              {available ? (
                <>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-1" />
                  Unavailable
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;