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

        // Fallback to mock data if there's an error
        setItems([
          {
            id: "pizza-1",
            name: "Margherita Pizza",
            description:
              "Classic pizza with tomato sauce, mozzarella, and basil",
            price: 12.99,
            image:
              "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80",
            categoryId: "pizza",
            dietaryInfo: { vegetarian: true },
          },
          {
            id: "pizza-2",
            name: "Pepperoni Pizza",
            description: "Traditional pizza topped with pepperoni slices",
            price: 14.99,
            image:
              "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
            categoryId: "pizza",
            dietaryInfo: { spicy: true },
          },
          {
            id: "coffee-1",
            name: "Cappuccino",
            description: "Espresso with steamed milk and foam",
            price: 4.5,
            image:
              "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80",
            categoryId: "coffee",
            dietaryInfo: { vegetarian: true, glutenFree: true },
          },
          {
            id: "salad-1",
            name: "Caesar Salad",
            description:
              "Romaine lettuce, croutons, parmesan cheese with Caesar dressing",
            price: 8.99,
            image:
              "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80",
            categoryId: "salads",
            dietaryInfo: { vegetarian: true },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
  }, [categoryId]);

  return { items, loading, error };
}
