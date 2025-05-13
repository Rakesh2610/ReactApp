import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  menuItemId: string;
  onRequireAuth?: () => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  menuItemId,
  onRequireAuth
}) => {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const isFavorite = isFavorited(menuItemId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user && onRequireAuth) {
      onRequireAuth();
      return;
    }

    toggleFavorite(menuItemId);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full bg-white/90 backdrop-blur-sm hover:bg-white",
        isFavorite && "text-red-500 hover:text-red-600"
      )}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          "h-5 w-5",
          isFavorite && "fill-current"
        )}
      />
    </Button>
  );
};

export default FavoriteButton;