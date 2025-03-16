import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart } from "lucide-react";

type OrderStats = {
  date: string;
  count: number;
  revenue: number;
};

type PopularItem = {
  item_id: string;
  item_name: string;
  count: number;
};

type CategorySales = {
  category_id: string;
  category_name: string;
  count: number;
  revenue: number;
};

const StatsOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [orderStats, setOrderStats] = useState<OrderStats[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Simulate fetching order stats
      // In a real app, you would fetch this from your database
      const mockOrderStats = generateMockOrderStats(timeRange);
      setOrderStats(mockOrderStats);

      // Simulate fetching popular items
      const mockPopularItems = [
        { item_id: "1", item_name: "Butter Chicken", count: 42 },
        { item_id: "2", item_name: "Paneer Tikka", count: 38 },
        { item_id: "3", item_name: "Masala Dosa", count: 35 },
        { item_id: "4", item_name: "Chicken Biryani", count: 30 },
        { item_id: "5", item_name: "Veg Pulao", count: 25 },
      ];
      setPopularItems(mockPopularItems);

      // Simulate fetching category sales
      const mockCategorySales = [
        {
          category_id: "1",
          category_name: "Main Course",
          count: 120,
          revenue: 12000,
        },
        {
          category_id: "2",
          category_name: "Starters",
          count: 85,
          revenue: 6800,
        },
        {
          category_id: "3",
          category_name: "Desserts",
          count: 65,
          revenue: 3900,
        },
        {
          category_id: "4",
          category_name: "Beverages",
          count: 95,
          revenue: 2850,
        },
        { category_id: "5", category_name: "Breads", count: 70, revenue: 2100 },
      ];
      setCategorySales(mockCategorySales);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate mock order stats based on time range
  const generateMockOrderStats = (range: string): OrderStats[] => {
    const stats: OrderStats[] = [];
    const now = new Date();
    let days = 7;

    if (range === "month") days = 30;
    else if (range === "year") days = 365;

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate random data
      const count = Math.floor(Math.random() * 20) + 5;
      const revenue = count * (Math.floor(Math.random() * 200) + 100);

      stats.push({
        date: date.toISOString().split("T")[0],
        count,
        revenue,
      });
    }

    // Sort by date ascending
    return stats.sort((a, b) => a.date.localeCompare(b.date));
  };

  // Render bar chart for orders over time
  const renderOrdersChart = () => {
    const maxCount = Math.max(...orderStats.map((stat) => stat.count));

    return (
      <div className="h-80 mt-4">
        <div className="flex h-full items-end space-x-2">
          {orderStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary rounded-t"
                style={{ height: `${(stat.count / maxCount) * 100}%` }}
              ></div>
              <div className="text-xs mt-1 text-muted-foreground">
                {new Date(stat.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render pie chart for category distribution
  const renderCategoryChart = () => {
    const totalRevenue = categorySales.reduce(
      (sum, cat) => sum + cat.revenue,
      0,
    );
    const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

    return (
      <div className="h-80 mt-4 flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {categorySales.map((category, index) => {
              const percentage = (category.revenue / totalRevenue) * 100;
              const startAngle =
                index === 0
                  ? 0
                  : categorySales
                      .slice(0, index)
                      .reduce(
                        (sum, cat) => sum + (cat.revenue / totalRevenue) * 360,
                        0,
                      );
              const endAngle = startAngle + percentage * 3.6;

              // Convert angles to radians and calculate x,y coordinates
              const startRad = ((startAngle - 90) * Math.PI) / 180;
              const endRad = ((endAngle - 90) * Math.PI) / 180;

              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);

              // Determine if the arc should be drawn as a large arc
              const largeArcFlag = percentage > 50 ? 1 : 0;

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Render bar chart for popular items
  const renderPopularItemsChart = () => {
    const maxCount = Math.max(...popularItems.map((item) => item.count));

    return (
      <div className="mt-4 space-y-4">
        {popularItems.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.item_name}</span>
              <span>{item.count} orders</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Overview</h2>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md font-medium">
                Orders Over Time
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Number of orders placed per day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading chart...</p>
              </div>
            ) : (
              renderOrdersChart()
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md font-medium">
                Category Distribution
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Revenue by food category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading chart...</p>
              </div>
            ) : (
              renderCategoryChart()
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md font-medium">
                Popular Items
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Most ordered items</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading chart...</p>
              </div>
            ) : (
              renderPopularItemsChart()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsOverview;
