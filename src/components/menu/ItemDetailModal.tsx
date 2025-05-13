import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ItemDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemId?: string;
    isAuthenticated: boolean;
}

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_vegetarian: boolean;
    is_available: boolean;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
    open,
    onOpenChange,
    itemId,
    isAuthenticated,
}) => {
    const { addToCart, cartItems, removeItem } = useCart();
    const [item, setItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // Check if item is already in cart
    const existingCartItem = itemId ? 
        cartItems.find(cartItem => cartItem.id === itemId) : undefined;
    
    const isInCart = Boolean(existingCartItem);

    // Reset state when modal opens or item changes
    useEffect(() => {
        if (open && itemId) {
            if (existingCartItem) {
                // Pre-fill with existing values if item is in cart
                setQuantity(existingCartItem.quantity);
                setSpecialInstructions(existingCartItem.specialInstructions || "");
            } else {
                // Reset to defaults for new items
                setQuantity(1);
                setSpecialInstructions("");
            }
        }
    }, [open, itemId, existingCartItem]);

    const handleIncreaseQuantity = () => setQuantity((prev) => prev + 1);
    const handleDecreaseQuantity = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleAddToCart = () => {
        if (!item) return;
      
        if (!isAuthenticated) {
          setShowAuthModal(true);
          return;
        }

        // Remove existing item first (if any) to avoid duplicates
        if (existingCartItem) {
            removeItem(
                item.id, 
                existingCartItem.customizations, 
                existingCartItem.specialInstructions
            );
        }
        
        // Then add with updated quantity and instructions
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          image: item.image_url || "",
          specialInstructions: specialInstructions.trim() || undefined,
        });
        
        toast({
            title: "Added to cart",
            description: `${quantity}x ${item.name} added to your cart`,
            duration: 2000,
        });
      
        onOpenChange(false);
    };
    
    const handleViewCart = () => {
        onOpenChange(false);
        navigate("/cart");
    };

    // Memoized fetch function for better performance
    const fetchItem = useCallback(async () => {
        if (!itemId || !open) return;

        setLoading(true);
        try {
            // Use localStorage cache if available for immediate display
            const cachedItem = localStorage.getItem(`menu_item_${itemId}`);
            if (cachedItem) {
                setItem(JSON.parse(cachedItem));
                // Don't set loading to false here to avoid flicker
            }

            // Always fetch fresh data from server
            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .eq("id", itemId)
                .single();

            if (error) {
                console.error("Error fetching item:", error);
            } else if (data) {
                setItem(data);
                // Cache the item for future quick access
                localStorage.setItem(`menu_item_${itemId}`, JSON.stringify(data));
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [itemId, open]);

    useEffect(() => {
        if (open && itemId) {
            fetchItem();
        }
    }, [fetchItem, open, itemId]);

    if (!open) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    {loading && !item ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="mt-2 text-sm text-gray-500">
                                Loading item details...
                            </p>
                        </div>
                    ) : !item ? (
                        <DialogHeader>
                            <DialogTitle>Item not found</DialogTitle>
                            <DialogDescription>
                                Could not find the requested item.
                            </DialogDescription>
                        </DialogHeader>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">
                                    {item.name}
                                    {isInCart && (
                                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                            <Check className="h-3 w-3 mr-1" /> 
                                            In Cart
                                        </Badge>
                                    )}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left side - Image and Price */}
                                <div>
                                    <img
                                        src={
                                            item.image_url ||
                                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                                        }
                                        alt={item.name}
                                        className="w-full h-48 object-cover rounded-md"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
                                        }}
                                    />
                                    <div className="mt-4">
                                        <span className="text-2xl font-bold">
                                            ₹{item.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right side - Details */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-600">
                                            {item.description}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {item.is_vegetarian && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-100 text-green-800"
                                                >
                                                    Vegetarian
                                                </Badge>
                                            )}
                                            {!item.is_available && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-red-100 text-red-800"
                                                >
                                                    Unavailable
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {!isInCart && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="special-instructions">
                                                    Special Instructions
                                                </Label>
                                                <Textarea
                                                    id="special-instructions"
                                                    placeholder="Any special requests? (e.g., spice level, allergies)"
                                                    value={specialInstructions}
                                                    onChange={(e) =>
                                                        setSpecialInstructions(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="resize-none"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Quantity</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleDecreaseQuantity}
                                                        disabled={quantity <= 1}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={quantity}
                                                        onChange={(e) =>
                                                            setQuantity(
                                                                Math.max(
                                                                    1,
                                                                    parseInt(
                                                                        e.target.value,
                                                                    ) || 1,
                                                                ),
                                                            )
                                                        }
                                                        className="w-20 text-center"
                                                        min="1"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleIncreaseQuantity}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {isInCart && (
                                        <div className="bg-blue-50 p-4 rounded-md mt-4">
                                            <p className="text-sm font-medium text-blue-800">
                                                This item is already in your cart
                                            </p>
                                            <p className="text-sm text-blue-600 mt-1">
                                                Quantity: {existingCartItem?.quantity}
                                            </p>
                                            {existingCartItem?.specialInstructions && (
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Instructions: {existingCartItem.specialInstructions}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-lg font-bold">
                                        Total: ₹
                                        {(item.price * (isInCart ? existingCartItem?.quantity || 1 : quantity)).toFixed(2)}
                                    </div>
                                    {!isAuthenticated ? (
                                        <Button
                                            onClick={() =>
                                                setShowAuthModal(true)
                                            }
                                            className="min-w-[120px]"
                                        >
                                            Login to Order
                                        </Button>
                                    ) : isInCart ? (
                                        <Button
                                            onClick={handleViewCart}
                                            className="min-w-[120px] bg-green-600 hover:bg-green-700"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            View Cart
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={!item.is_available}
                                            className="min-w-[120px]"
                                        >
                                            Add to Cart
                                        </Button>
                                    )}
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultTab="signin"
            />
        </>
    );
};

export default ItemDetailModal;