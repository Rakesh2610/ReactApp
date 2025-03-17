import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    checkUser();
  }, []);

  // Load favorites from database or localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        if (userId) {
          // Load from database if user is logged in
          const { data, error } = await supabase
            .from("favorite_items")
            .select("menu_item_id")
            .eq("user_id", userId);

          if (error) throw error;

          if (data) {
            setFavorites(data.map((item) => item.menu_item_id));
          }
        } else {
          // Load from localStorage if user is not logged in
          const savedFavorites = localStorage.getItem("favorites");
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
          }
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        // Fallback to localStorage if database fails
        const savedFavorites = localStorage.getItem("favorites");
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [userId]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (!isLoading && !userId) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, userId, isLoading]);

  const addFavorite = async (menuItemId: string) => {
    if (favorites.includes(menuItemId)) return;

    try {
      if (userId) {
        // Save to database if user is logged in
        const { error } = await supabase.from("favorite_items").insert({
          user_id: userId,
          menu_item_id: menuItemId,
        });

        if (error) throw error;
      }

      // Update local state
      setFavorites((prev) => [...prev, menuItemId]);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const removeFavorite = async (menuItemId: string) => {
    try {
      if (userId) {
        // Remove from database if user is logged in
        const { error } = await supabase
          .from("favorite_items")
          .delete()
          .eq("user_id", userId)
          .eq("menu_item_id", menuItemId);

        if (error) throw error;
      }

      // Update local state
      setFavorites((prev) => prev.filter((id) => id !== menuItemId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const toggleFavorite = (menuItemId: string) => {
    if (favorites.includes(menuItemId)) {
      removeFavorite(menuItemId);
    } else {
      addFavorite(menuItemId);
    }
  };

  const isFavorite = (menuItemId: string) => {
    return favorites.includes(menuItemId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
