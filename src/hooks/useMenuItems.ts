import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  dietaryInfo: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    spicy?: boolean;
  };
}

export function useMenuItems(categoryId?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);

        // Check if we have valid Supabase credentials
        if (
          import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          let query = supabase.from("menu_items").select("*, categories(name)");

          if (categoryId && categoryId !== "all") {
            query = query.eq("category_id", categoryId);
          }

          const { data, error } = await query;

          if (error) throw error;

          if (data) {
            const formattedItems: MenuItem[] = data.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || "",
              price: item.price,
              image:
                item.image ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
              categoryId: item.category_id,
              dietaryInfo: {
                vegetarian: item.is_vegetarian,
                vegan: item.is_vegan,
                glutenFree: item.is_gluten_free,
                spicy: item.is_spicy,
              },
            }));

            setItems(formattedItems);
          }
        } else {
          // Skip database query if credentials are missing
          throw new Error("Supabase credentials not configured");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
        console.error("Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, [categoryId]);

  return { items, loading, error };
}
