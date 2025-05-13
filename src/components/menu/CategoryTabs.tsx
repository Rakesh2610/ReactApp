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

// Predefined categories - same IDs as in MenuManager.tsx
const predefinedCategories: CategoryTab[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Coffee", icon: <Coffee className="h-5 w-5" /> },
  { id: "22222222-2222-2222-2222-222222222222", name: "Salads", icon: <Salad className="h-5 w-5" /> },
  { id: "33333333-3333-3333-3333-333333333333", name: "Desserts", icon: <Cake className="h-5 w-5" /> },
  { id: "44444444-4444-4444-4444-444444444444", name: "Pizza", icon: <Pizza className="h-5 w-5" /> },
  { id: "55555555-5555-5555-5555-555555555555", name: "Meat", icon: <Beef className="h-5 w-5" /> },
  { id: "66666666-6666-6666-6666-666666666666", name: "Sandwiches", icon: <Sandwich className="h-5 w-5" /> },
  { id: "77777777-7777-7777-7777-777777777777", name: "Soups", icon: <Soup className="h-5 w-5" /> },
  { id: "88888888-8888-8888-8888-888888888888", name: "Ice Cream", icon: <IceCream className="h-5 w-5" /> },
  { id: "99999999-9999-9999-9999-999999999999", name: "Fruits", icon: <Apple className="h-5 w-5" /> },
  { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", name: "Drinks", icon: <GlassWater className="h-5 w-5" /> },
];

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories = predefinedCategories,
  activeCategory = "all",
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
              <TabsTrigger
                key="all"
                value="all"
                className="flex h-12 min-w-[100px] flex-col items-center justify-center rounded-md px-4 py-2 data-[state=active]:bg-primary/10"
              >
                <div className="mb-1 text-primary">
                  <Pizza className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">All Items</span>
              </TabsTrigger>
              
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