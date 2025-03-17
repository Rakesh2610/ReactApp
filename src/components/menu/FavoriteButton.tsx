import React from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoriteButtonProps {
  menuItemId: string;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  menuItemId,
  className = "",
}) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite, isLoadingFavorites } = useCart();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    toggleFavorite(menuItemId);
  };

  if (!user) return null;

  const isFav = isFavorite(menuItemId);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${className}`}
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorites}
          >
            <Heart
              className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFav ? "Remove from favorites" : "Add to favorites"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteButton;
