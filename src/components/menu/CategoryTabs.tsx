import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pizza,
  Coffee,
  Salad,
  Cake,
  Beef,
  Sandwich,
  Soup,
  IceCream,
  Apple,
  GlassWater,
} from "lucide-react";

interface CategoryTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryTabsProps {
  categories?: CategoryTab[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories = [
    { id: "pizza", name: "Pizza", icon: <Pizza className="h-5 w-5" /> },
    { id: "coffee", name: "Coffee", icon: <Coffee className="h-5 w-5" /> },
    { id: "salads", name: "Salads", icon: <Salad className="h-5 w-5" /> },
    { id: "desserts", name: "Desserts", icon: <Cake className="h-5 w-5" /> },
    { id: "meat", name: "Meat", icon: <Beef className="h-5 w-5" /> },
    {
      id: "sandwiches",
      name: "Sandwiches",
      icon: <Sandwich className="h-5 w-5" />,
    },
    { id: "soups", name: "Soups", icon: <Soup className="h-5 w-5" /> },
    {
      id: "icecream",
      name: "Ice Cream",
      icon: <IceCream className="h-5 w-5" />,
    },
    { id: "fruits", name: "Fruits", icon: <Apple className="h-5 w-5" /> },
    { id: "drinks", name: "Drinks", icon: <GlassWater className="h-5 w-5" /> },
  ],
  activeCategory = "pizza",
  onCategoryChange = () => {},
}) => {
  return (
    <div className="w-full bg-white py-4 shadow-sm">
      <ScrollArea className="w-full">
        <div className="px-4">
          <Tabs
            defaultValue={activeCategory}
            onValueChange={onCategoryChange}
            className="w-full"
          >
            <TabsList className="flex h-14 w-full space-x-2 bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex h-12 min-w-[100px] flex-col items-center justify-center rounded-md px-4 py-2 data-[state=active]:bg-primary/10"
                >
                  <div className="mb-1 text-primary">{category.icon}</div>
                  <span className="text-xs font-medium">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategoryTabs;
