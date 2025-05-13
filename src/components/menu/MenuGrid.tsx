import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodItemCard from "./FoodItemCard";
import CategoryTabs from "./CategoryTabs";
import FavoritesTab from "./FavoritesTab";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ItemDetailModal from "./ItemDetailModal";
import AuthModal from "@/components/auth/AuthModal";
import { toast } from "@/components/ui/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_vegetarian: boolean;
  is_available: boolean;
}

const MenuGrid: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from("menu_items")
          .select("*")
          .order("name");
        
        if (activeCategory !== "all") {
          query = query.eq("category_id", activeCategory);
        }

        const { data, error: supabaseError } = await query;
        if (supabaseError) {
          throw supabaseError;
        }
        setMenuItems(data || []);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items");
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [activeCategory]);

  const filteredItems = menuItems.filter((item) => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerms) ||
      (item.description && item.description.toLowerCase().includes(searchTerms))
    );
  });

  const handleAddToCart = (itemId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Instead of adding to cart again, just show the toast notification
    const item = menuItems.find((item) => item.id === itemId);
    if (item) {
      // Don't call addToCart here again
      // addToCart is already called in the FoodItemCard component
      
      toast({
        title: "Item added to cart",
        description: `${item.name} has been added to your cart.`,
        duration: 2000,
      });
    }
  };

  const handleViewDetails = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full bg-gray-50 min-h-[600px]">
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> Favorites
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="menu" className="mt-0">
          {/* Search Bar */}
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
            </div>
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Menu Items Grid */}
          <div className="p-4 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <p className="text-gray-400 text-sm">Please try again later</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500 mb-2">No items found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {filteredItems.map((item) => (
                  <FoodItemCard
                    isVegetarian={false} isVegan={false} isGlutenFree={false} key={item.id}
                    {...item}
                    image={item.image_url}
                    onAddToCart={handleAddToCart}
                    onViewDetails={() => handleViewDetails(item.id)}
                    available={item.is_available}
                    requiresAuth={!user}
                    onRequireAuth={() => setShowAuthModal(true)}                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          <FavoritesTab 
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Item Detail Modal */}
      <ItemDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        itemId={selectedItemId}
        isAuthenticated={!!user}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="signin"
      />
    </div>
  );
};

export default MenuGrid;