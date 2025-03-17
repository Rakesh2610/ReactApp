import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);

        // Check if we have valid Supabase credentials
        if (
          import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

          if (error) throw error;

          if (data) {
            setCategories(data);
          }
        } else {
          // Skip database query if credentials are missing
          throw new Error("Supabase credentials not configured");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
        console.error("Error fetching categories:", err);

        // Fallback to mock data if there's an error
        setCategories([
          { id: "pizza", name: "Pizza" },
          { id: "coffee", name: "Coffee" },
          { id: "salads", name: "Salads" },
          { id: "desserts", name: "Desserts" },
          { id: "meat", name: "Meat" },
          { id: "sandwiches", name: "Sandwiches" },
          { id: "soups", name: "Soups" },
          { id: "icecream", name: "Ice Cream" },
          { id: "fruits", name: "Fruits" },
          { id: "drinks", name: "Drinks" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
