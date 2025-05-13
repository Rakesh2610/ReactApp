import React, { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FoodItemCard from "./FoodItemCard";
import { useToast } from "@/components/ui/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_available: boolean;
}

interface FavoritesTabProps {
  onAddToCart?: (itemId: string) => void;
  onViewDetails?: (itemId: string) => void;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ 
  onAddToCart, 
  onViewDetails 
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [favoriteItems, setFavoriteItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          menu_items:menu_item_id (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      const items = data?.map(item => item.menu_items) ?? [];
      setFavoriteItems(items);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleAddToCart = (itemId: string) => {
    const item = favoriteItems.find(item => item.id === itemId);
    if (item) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image_url || "",
      });
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
    }
    onAddToCart?.(itemId);
  };

  const handleViewDetails = (itemId: string) => {
    onViewDetails?.(itemId);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-lg font-medium">Please log in to view favorites</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-lg font-medium">No favorites yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Items you favorite will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {favoriteItems.map((item) => (
        <FoodItemCard
          key={item.id}
          {...item}
          image={item.image_url}
          available={item.is_available}
          onAddToCart={() => handleAddToCart(item.id)}
          onViewDetails={() => handleViewDetails(item.id)}
          requiresAuth={false}
        />
      ))}
    </div>
  );
};

export default FavoritesTab;