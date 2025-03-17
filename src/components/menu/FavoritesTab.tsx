import React, { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useMenuItems } from "@/hooks/useMenuItems";
import FoodItemCard from "./FoodItemCard";
import { useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";

interface FavoritesTabProps {
  onItemClick: (itemId: string) => void;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ onItemClick }) => {
  const { user } = useAuth();
  const { favoriteItems, isLoadingFavorites } = useCart();
  const { menuItems, isLoading: isLoadingMenu } = useMenuItems();
  const [favoriteMenuItems, setFavoriteMenuItems] = useState<any[]>([]);

  useEffect(() => {
    if (menuItems && favoriteItems) {
      const favorites = menuItems.filter((item) =>
        favoriteItems.includes(item.id),
      );
      setFavoriteMenuItems(favorites);
    }
  }, [menuItems, favoriteItems]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">
          Please log in to view your favorites
        </p>
      </div>
    );
  }

  if (isLoadingFavorites || isLoadingMenu) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (favoriteMenuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No favorites yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add items to your favorites to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {favoriteMenuItems.map((item) => (
        <FoodItemCard
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description || ""}
          price={item.price}
          image={
            item.image ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
          }
          isVegetarian={item.is_vegetarian}
          isVegan={item.is_vegan}
          isGlutenFree={item.is_gluten_free}
          isSpicy={item.is_spicy}
          onClick={() => onItemClick(item.id)}
        />
      ))}
    </div>
  );
};

export default FavoritesTab;
