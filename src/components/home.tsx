import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Coffee, User, Search, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Add this import
import AuthModal from "./auth/AuthModal";
import MenuGrid from "./menu/MenuGrid";
import ItemDetailModal from "./menu/ItemDetailModal";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, History } from "lucide-react";

interface HomeProps {
  isLoggedIn?: boolean;
}

const Home: React.FC<HomeProps> = () => {
  const { user, signOut } = useAuth(); // Add signOut to the destructured values
  const { toast } = useToast();
  const { addToCart, cartItems } = useCart();
  const isLoggedIn = !!user;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddToCart = (itemId: string) => {
    // In a real app, you would fetch the item details and add to cart
    console.log("Adding to cart from Home:", itemId);
    // We'll get actual item details from the API or elsewhere in a real app
    addToCart({
      id: itemId,
      name: "Item " + itemId,
      price: 9.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
    });
  };

  const handleViewDetails = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const handleLogout = async () => {
    try {
      await signOut(); // Use the signOut function from context
      
      // Clear any stored tokens/data
      localStorage.removeItem('sb-token');
      
      // Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        duration: 2000,
      });
      
      // Refresh the page to reset the application state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-primary p-2 mr-2">
              <Coffee className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">CanteenEats</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            )}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} 
                        alt={user?.email || "User avatar"} 
                      />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col p-2">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium">
                          {user?.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs font-medium text-primary">
                          {user?.user_metadata?.role || "Student"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const event = new Event('switchToHistoryTab');
                    document.dispatchEvent(event);
                    navigate('/cart');
                  }}>
                    <History className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Hero Section */}
          <section className="mb-8">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
                alt="Delicious food"
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Order Ahead, Skip the Line
                </h2>
                <p className="text-white/90 max-w-md mb-6">
                  Browse our menu, place your order, and pick up your food
                  without waiting in long queues.
                </p>
                <Button className="w-fit">Order Now</Button>
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Today's Menu</h2>
              <div className="md:hidden">
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <MenuGrid
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © 2023 CanteenEats. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {selectedItem && (
        <ItemDetailModal
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          itemId={selectedItem}
          isAuthenticated={!!user}
        />
      )}
    </div>
  );
};

export default Home;