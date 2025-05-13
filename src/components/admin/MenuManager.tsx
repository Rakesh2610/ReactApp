import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/getCroppedImg"; // Create this helper as shown below
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  ImageIcon,
  CheckCircle,
  XCircle,
  RefreshCw,
  FilterIcon,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_vegetarian: boolean;
  is_available: boolean;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
};

// Predefined categories
const predefinedCategories: Category[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Coffee" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Salads" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Desserts" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Pizza" },
  { id: "55555555-5555-5555-5555-555555555555", name: "Meat" },
  { id: "66666666-6666-6666-6666-666666666666", name: "Sandwiches" },
  { id: "77777777-7777-7777-7777-777777777777", name: "Soups" },
  { id: "88888888-8888-8888-8888-888888888888", name: "Ice Cream" },
  { id: "99999999-9999-9999-9999-999999999999", name: "Fruits" },
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "Drinks" },
];

const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories] = useState<Category[]>(predefinedCategories);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Cropper state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    is_vegetarian: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Apply filtering
    let results = [...menuItems];
    
    if (searchQuery) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterCategory && filterCategory !== "all") {
      results = results.filter(item => item.category_id === filterCategory);
    }
    
    if (filterStatus === "available") {
      results = results.filter(item => item.is_available);
    } else if (filterStatus === "unavailable") {
      results = results.filter(item => !item.is_available);
    }
    
    setFilteredItems(results);
  }, [menuItems, searchQuery, filterCategory, filterStatus]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("name");
      if (error) throw error;
      if (data) {
        setMenuItems(data);
        setFilteredItems(data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      is_vegetarian: e.target.value === "veg",
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Called when user clicks on the preview image to crop
  const handlePreviewClick = () => {
    if (filePreview) setIsCropModalOpen(true);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(filePreview!, croppedAreaPixels);
      setFilePreview(croppedImage);
      setIsCropModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      is_vegetarian: false,
    });
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleAddItem = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category_id) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = "";
      if (selectedFile || filePreview) {
        const fileExt = selectedFile ? selectedFile.name.split(".").pop() : "png";
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = fileName;
        // If using a cropped image, convert dataURL to blob
        let fileToUpload: File | Blob;
        if (filePreview && filePreview.startsWith("data:")) {
          const res = await fetch(filePreview);
          fileToUpload = await res.blob();
        } else {
          fileToUpload = selectedFile!;
        }
        
        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, fileToUpload);
          
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Upload failed",
            description: "Failed to upload image",
            variant: "destructive",
          });
          return;
        }
        
        const {
          data: { publicUrl },
        } = supabase.storage.from("menu-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      } else {
        imageUrl =
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
      }

      const newItem = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: imageUrl,
        category_id: formData.category_id,
        is_vegetarian: formData.is_vegetarian,
        is_available: true,
      };

      const { error } = await supabase.from("menu_items").insert(newItem);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item added successfully",
      });
      
      resetForm();
      setIsAddDialogOpen(false);
      fetchMenuItems();
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
      
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !item.is_available })
        .eq("id", item.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Menu item marked as ${!item.is_available ? "Available" : "Unavailable"}`,
      });
      
      fetchMenuItems();
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterStatus("all");
  };

  return (
    <Card className="min-h-[600px] max-h-[85vh] flex flex-col">
      <CardHeader className="bg-card border-b shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">Menu Management</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>

        {/* Search and Filters - Fixed at top */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <FilterIcon className="h-4 w-4 mr-2" />
                {filterCategory !== "all" 
                  ? categories.find(c => c.id === filterCategory)?.name 
                  : "All Categories"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <FilterIcon className="h-4 w-4 mr-2" />
                {filterStatus === "available" ? "Available" : 
                 filterStatus === "unavailable" ? "Unavailable" : "All Status"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 overflow-y-auto">
  {loading ? (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      <p>Loading menu items...</p>
    </div>
  ) : filteredItems.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
      {menuItems.length === 0 ? (
        <>
          <ImageIcon className="h-16 w-16" />
          <p className="text-lg font-medium">No menu items found</p>
          <p>Add your first menu item to get started</p>
        </>
      ) : (
        <>
          <Search className="h-16 w-16" />
          <p className="text-lg font-medium">No results found</p>
          <p>Try adjusting your search or filters</p>
          <Button variant="link" onClick={resetFilters}>
            Reset all filters
          </Button>
        </>
      )}
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {filteredItems.map((item) => (
    <Card key={item.id} className="overflow-hidden border border-muted/50 bg-card rounded-xl transition-all duration-300 hover:shadow-lg group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-40" />
        
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <Badge className={`${
            item.is_vegetarian 
              ? 'bg-green-100 text-green-700 border-green-200 shadow-green-100/30' 
              : 'bg-red-100 text-red-700 border-red-200 shadow-red-100/30'
          } shadow-sm backdrop-blur-sm px-2.5 py-1 font-medium`}>
            {item.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
          </Badge>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-bold text-lg text-white line-clamp-1 drop-shadow-md">
              {item.name}
            </h3>
            <div className="font-bold text-lg text-white shrink-0 bg-primary/90 px-3 py-1 rounded-full shadow-lg">
              ₹{item.price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`${item.is_available ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'} px-3 py-1`}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </Badge>
            
            <Badge variant="outline" className="px-3 py-1 text-xs font-medium bg-muted/30">
              {categories.find((cat) => cat.id === item.category_id)?.name || "Uncategorized"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {item.description || "No description available for this item."}
          </p>
          
          <Separator className="my-1" />
          
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${
                item.is_available 
                  ? 'hover:text-red-600 hover:bg-red-50' 
                  : 'hover:text-green-600 hover:bg-green-50'
              } rounded-lg h-10`}
              onClick={() => handleToggleAvailability(item)}
            >
              {item.is_available ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark Unavailable
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Available
                </>
              )}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[425px] p-0">
                <div className="bg-red-50 p-6 rounded-t-lg flex items-start gap-4">
                  <div className="p-2 rounded-full bg-red-100 text-red-600">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-red-700">
                      Delete Item
                    </DialogTitle>
                    <DialogDescription className="text-red-600">
                      Are you sure you want to delete this menu item? This action cannot be undone.
                    </DialogDescription>
                  </div>
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-16 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
                      }}
                    />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {categories.find((cat) => cat.id === item.category_id)?.name || "Uncategorized"} • ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="p-4 border-t bg-muted/10">
                  <div className="flex gap-2 w-full justify-end">
                    <DialogClose asChild>
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                      Delete Item
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
  )}
</CardContent>

{/* Add Item Dialog */}
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogContent className="sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-0">
    <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
      <DialogTitle className="text-xl sm:text-2xl font-semibold">Create Menu Item</DialogTitle>
      <DialogDescription className="text-sm sm:text-base text-muted-foreground">
        Add a new dish or beverage to your menu with details and image.
      </DialogDescription>
    </DialogHeader>
    
    <div className="flex-1 overflow-y-auto">
      <div className="grid md:grid-cols-[280px,1fr] h-full">
        {/* Left Panel - Image Upload */}
        <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r bg-muted/10">
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm font-medium">Item Image</Label>
            {filePreview ? (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden group max-w-[400px] mx-auto">
                <img 
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewClick}
                    className="bg-white/90 hover:bg-white w-32"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Edit Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilePreview(null);
                      setSelectedFile(null);
                    }}
                    className="text-white hover:text-red-400 hover:bg-white/10 w-32"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-[210px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors max-w-[400px] mx-auto">
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <ImageIcon className="h-8 w-8 mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    SVG, PNG, JPG or GIF
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (max. 5MB)
                  </p>
                </div>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Recommended: 400x300px
            </p>
          </div>
        </div>

        {/* Right Panel - Item Details */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label htmlFor="name">Item Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter item name"
                className="h-10 sm:h-11"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="price">Price*</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="pl-7 h-10 sm:h-11"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
                  <SelectTrigger id="category" className="h-10 sm:h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Item Type</Label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant={formData.is_vegetarian ? "default" : "outline"}
                  className={`h-10 sm:h-11 ${formData.is_vegetarian ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_vegetarian: true }))}
                >
                  <div className="h-2 w-2 rounded-full bg-green-200 mr-2" />
                  Vegetarian
                </Button>
                <Button
                  type="button"
                  variant={!formData.is_vegetarian ? "default" : "outline"}
                  className={`h-10 sm:h-11 ${!formData.is_vegetarian ? "bg-red-600 hover:bg-red-700" : ""}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_vegetarian: false }))}
                >
                  <div className="h-2 w-2 rounded-full bg-red-200 mr-2" />
                  Non-Vegetarian
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter item description (optional)"
                className="min-h-[80px] sm:min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t">
      <div className="flex items-center justify-end gap-2 sm:gap-3 w-full">
        <Button 
          variant="outline" 
          onClick={() => setIsAddDialogOpen(false)}
          className="min-w-[90px] sm:min-w-[100px]"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleAddItem}
          className="min-w-[100px] sm:min-w-[120px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>

<Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
  <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] flex flex-col p-0">
    <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/20">
      <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        Adjust Image
      </DialogTitle>
      <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
        Move and resize the crop area to fit your image
      </DialogDescription>
    </DialogHeader>

    {/* Main Cropper Container */}
    <div className="relative flex-1 min-h-0 bg-white">
      <div className="relative h-[200px] sm:h-[300px]">
        <Cropper
          image={filePreview!}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          objectFit="contain"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          classes={{
            containerClassName: "h-full",
            mediaClassName: "h-full",
            cropAreaClassName: "!border-2 !border-black !rounded-lg",
          }}
        />

        {/* Zoom controls overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm p-2 sm:p-3 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <Label className="text-xs sm:text-sm font-medium text-white">Zoom</Label>
            <div className="flex-1 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 sm:h-8 sm:w-8 bg-white/10 hover:bg-white/20 border-white/20"
                onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
              >
                <span className="text-white text-xs sm:text-sm">-</span>
              </Button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-white cursor-pointer"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 sm:h-8 sm:w-8 bg-white/10 hover:bg-white/20 border-white/20"
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
              >
                <span className="text-white text-xs sm:text-sm">+</span>
              </Button>
              <span className="text-xs sm:text-sm text-white w-10 text-end">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter className="p-3 sm:p-4 border-t border-white/20">
      <div className="flex flex-col-reverse sm:flex-row justify-between w-full gap-2 sm:gap-3">
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
          Recommended size: 400x300 pixels
        </p>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setIsCropModalOpen(false)}
            className="h-8 sm:h-9 min-w-[80px] sm:min-w-[90px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropConfirm}
            className="h-8 sm:h-9 min-w-[90px] sm:min-w-[100px]"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </Card>
  );
};

export default MenuManager;