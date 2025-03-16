import React, { useState, useEffect } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Search, SlidersHorizontal } from "lucide-react";
import CategoryTabs from "./CategoryTabs";
import FoodItemCard from "./FoodItemCard";
import { useCart } from "@/hooks/useCart";

interface FoodItem {
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

interface MenuGridProps {
  items?: FoodItem[];
  onAddToCart?: (itemId: string) => void;
  onViewDetails?: (itemId: string) => void;
}

const MenuGrid: React.FC<MenuGridProps> = ({
  onAddToCart = () => {},
  onViewDetails = () => {},
}) => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const { items: fetchedItems, loading } = useMenuItems(
    activeCategory === "all" ? undefined : activeCategory,
  );
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    if (fetchedItems.length > 0) {
      setItems(fetchedItems);
    } else if (!loading) {
      // Fallback to mock data if no items are fetched and not loading
      setItems([
        {
          id: "pizza-1",
          name: "Margherita Pizza",
          description: "Classic pizza with tomato sauce, mozzarella, and basil",
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
          dietaryInfo: { vegetarian: true },
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
    }
  }, [fetchedItems, loading]);
  // activeCategory is now defined in the component function
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on active category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.categoryId === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (itemId: string) => {
    console.log("Adding to cart from MenuGrid:", itemId);
    const item = items.find((item) => item.id === itemId);
    if (item) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
      });
    }
    // Also call the passed onAddToCart if provided
    onAddToCart(itemId);
  };

  return (
    <div className="w-full bg-gray-50 min-h-[800px]">
      {/* Search and filter bar */}
      <div className="sticky top-0 z-10 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              className="pl-9 bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Menu items grid */}
      <div className="p-4 max-w-7xl mx-auto">
        <Tabs value={activeCategory} className="w-full">
          {[
            "pizza",
            "coffee",
            "salads",
            "desserts",
            "meat",
            "sandwiches",
            "soups",
            "icecream",
            "fruits",
            "drinks",
          ].map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {filteredItems.map((item) => (
                    <FoodItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      image={item.image}
                      dietaryInfo={item.dietaryInfo}
                      onAddToCart={handleAddToCart}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-gray-500 mb-2">No items found</p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default MenuGrid;
