import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface FavoriteItem {
  id: string;
  user_id: string;
  menu_item_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('menu_item_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data?.map(item => item.menu_item_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (menuItemId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorited = favorites.includes(menuItemId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('menu_item_id', menuItemId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== menuItemId));
        toast({
          title: "Removed from favorites",
          duration: 2000,
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              menu_item_id: menuItemId,
            },
          ]);

        if (error) throw error;

        setFavorites(prev => [...prev, menuItemId]);
        toast({
          title: "Added to favorites",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  // Check if an item is favorited
  const isFavorited = (menuItemId: string) => {
    return favorites.includes(menuItemId);
  };

  // Fetch favorites on mount and when user changes
  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited,
    refetchFavorites: fetchFavorites,
  };
};
