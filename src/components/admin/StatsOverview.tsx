import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, PieChartIcon, BarChart3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type OrderStats = {
  date: string;
  formattedDate: string;
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
  const [timeRange, setTimeRange] = useState("week"); // Changed default from "today" to "week"
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
      // Calculate date ranges
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setDate(startDate.getDate() - 30);
      } else if (timeRange === "year") {
        startDate.setDate(startDate.getDate() - 365);
      }
      
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Fetch orders data for the period, including updated_at field
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, updated_at, total_amount, order_items, status")
        .gte("created_at", startDateStr)
        .lte("created_at", endDateStr)
        .order("created_at", { ascending: true });
        
      if (ordersError) throw ordersError;

      // If no orders (or for testing) use dummy sample data:
      if (!ordersData || ordersData.length === 0) {
        console.log("No orders data found, using sample data for visualization");
        const sampleOrderStats: OrderStats[] = [];
        const baseDate = new Date();
        
        if (timeRange === "today") {
          // Generate hourly data for today
          for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            sampleOrderStats.push({
              date: `${hour}:00`,
              formattedDate: `${hour}:00`,
              count: Math.floor(Math.random() * 3) + (i > 8 && i < 20 ? 2 : 0), // More orders during day hours
              revenue: parseFloat((Math.random() * 500 + 100).toFixed(2)),
            });
          }
        } else if (timeRange === "week") {
          // Your existing weekly data generation
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(baseDate.getDate() - i);
            sampleOrderStats.push({
              date: date.toISOString().split("T")[0],
              formattedDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              count: Math.floor(Math.random() * 10) + 1,
              revenue: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
            });
          }
        } else if (timeRange === "month") {
          // Your existing monthly data generation
          for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(baseDate.getDate() - i);
            sampleOrderStats.push({
              date: date.toISOString().split("T")[0],
              formattedDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              count: Math.floor(Math.random() * 10) + 1,
              revenue: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
            });
          }
        } else {
          // Your existing yearly data generation
          for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(baseDate.getMonth() - i);
            sampleOrderStats.push({
              date: new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0],
              formattedDate: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
              count: Math.floor(Math.random() * 50) + 10,
              revenue: parseFloat((Math.random() * 5000 + 2000).toFixed(2)),
            });
          }
        }
        setOrderStats(sampleOrderStats);
        
        // Sample data using real category IDs from MenuManager
        setCategorySales([
          { category_id: "44444444-4444-4444-4444-444444444444", category_name: "Pizza", count: 45, revenue: 5625 },
          { category_id: "11111111-1111-1111-1111-111111111111", category_name: "Coffee", count: 38, revenue: 4750 },
          { category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", category_name: "Drinks", count: 62, revenue: 3100 },
          { category_id: "33333333-3333-3333-3333-333333333333", category_name: "Desserts", count: 35, revenue: 2625 },
          { category_id: "55555555-5555-5555-5555-555555555555", category_name: "Meat", count: 28, revenue: 2100 },
        ]);
        
        setPopularItems([
          { item_id: "1", item_name: "Margherita Pizza", count: 32 },
          { item_id: "2", item_name: "Cappuccino", count: 28 },
          { item_id: "3", item_name: "Chicken Steak", count: 21 },
          { item_id: "4", item_name: "Iced Coffee", count: 18 },
          { item_id: "5", item_name: "Chocolate Cake", count: 15 },
        ]);
        
        setLoading(false);
        return;
      }

      // Process real data - removed the "today" condition
      const ordersByDate = processOrdersByDate(ordersData, timeRange);
      setOrderStats(ordersByDate);

      // Process items and categories
      await processItemsAndCategories(ordersData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new function to process today's orders by hour
  const processOrdersByHour = (orders: any[]): OrderStats[] => {
    // Create a map for all 24 hours of the day
    const hourlyMap: Record<number, { count: number; revenue: number }> = {};
    
    // Initialize all hours with zero counts
    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = { count: 0, revenue: 0 };
    }
    
    // Count orders by hour - use updated_at for completed orders
    orders.forEach(order => {
      // Use the timestamp which is in format: 2025-03-18 18:42:43.803394+00
      const timestamp = order.updated_at || order.created_at;
      
      // Parse the timestamp
      const orderDate = new Date(timestamp);
      const hour = orderDate.getHours();
      
      hourlyMap[hour].count += 1;
      hourlyMap[hour].revenue += parseFloat(order.total_amount || 0);
    });
    
    // Convert to array format with better hour formatting
    return Object.keys(hourlyMap).map(hourKey => {
      const hour = parseInt(hourKey);
      // Format the hour in 12-hour format with AM/PM
      const hourFormatted = hour === 0 ? "12 AM" :
                           hour < 12 ? `${hour} AM` :
                           hour === 12 ? "12 PM" :
                           `${hour - 12} PM`;
                           
      return {
        date: `${hour}`,  // Keep the raw hour for sorting
        formattedDate: hourFormatted,  // Nicer display
        count: hourlyMap[hour].count,
        revenue: hourlyMap[hour].revenue,
      };
    }).sort((a, b) => parseInt(a.date) - parseInt(b.date));  // Sort by hour numerically
  };

  const processItemsAndCategories = async (ordersData: any[]) => {
    try {
      const itemCounts: Record<string, { name: string; count: number }> = {};
      const catSales: Record<string, { name: string; count: number; revenue: number }> = {};

      // Fetch menu items from your table
      const { data: menuItems, error: menuError } = await supabase
        .from("menu_items")
        .select("id, name, category_id, price");
      if (menuError) throw menuError;
      
      // Use all predefined categories from MenuManager component
      const staticCategoryMap: Record<string, string> = {
        "11111111-1111-1111-1111-111111111111": "Coffee",
        "22222222-2222-2222-2222-222222222222": "Salads",
        "33333333-3333-3333-3333-333333333333": "Desserts",
        "44444444-4444-4444-4444-444444444444": "Pizza",
        "55555555-5555-5555-5555-555555555555": "Meat",
        "66666666-6666-6666-6666-666666666666": "Sandwiches",
        "77777777-7777-7777-7777-777777777777": "Soups",
        "88888888-8888-8888-8888-888888888888": "Ice Cream",
        "99999999-9999-9999-9999-999999999999": "Fruits",
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa": "Drinks",
      };

      // Initialize all categories with zero values to ensure they're all displayed
      Object.keys(staticCategoryMap).forEach(catId => {
        catSales[catId] = { 
          name: staticCategoryMap[catId], 
          count: 0, 
          revenue: 0 
        };
      });

      // Build a map for menu item details
      const menuItemMap: Record<string, { category_id: string; name: string; price: number }> = {};
      menuItems?.forEach((item: any) => {
        menuItemMap[item.id] = {
          category_id: item.category_id,
          name: item.name,
          price: parseFloat(item.price),
        };
      });

      // Process each order's items (order_items is stored in JSONB)
      ordersData.forEach(order => {
        let items: any[] = [];
        try {
          items =
            typeof order.order_items === "string"
              ? JSON.parse(order.order_items)
              : order.order_items || [];
        } catch (err) {
          console.error("Error parsing order items", err);
        }
        items.forEach(item => {
          // Aggregate top selling items
          if (!itemCounts[item.id]) {
            itemCounts[item.id] = {
              name: item.name || menuItemMap[item.id]?.name || "Unknown Item",
              count: 0,
            };
          }
          const quantity = item.quantity || 1;
          itemCounts[item.id].count += quantity;

          // Aggregate by category
          const menuItemInfo = menuItemMap[item.id];
          if (menuItemInfo?.category_id) {
            const catId = menuItemInfo.category_id;
            const catName = staticCategoryMap[catId] || `Category: ${catId.substring(0, 8)}`;
            if (!catSales[catId]) {
              catSales[catId] = { name: catName, count: 0, revenue: 0 };
            }
            catSales[catId].count += quantity;
            catSales[catId].revenue += menuItemInfo.price * quantity;
          }
        });
      });

      const popularItemsArray = Object.keys(itemCounts)
        .map(id => ({
          item_id: id,
          item_name: itemCounts[id].name,
          count: itemCounts[id].count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
      const categorySalesArray = Object.keys(catSales)
        .map(id => ({
          category_id: id,
          category_name: catSales[id].name,
          count: catSales[id].count,
          revenue: catSales[id].revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setPopularItems(popularItemsArray);
      setCategorySales(categorySalesArray);
    } catch (error) {
      console.error("Error processing items and categories:", error);
    }
  };

  const processOrdersByDate = (orders: any[], range: string): OrderStats[] => {
    const dateMap: Record<string, { count: number; revenue: number }> = {};
    const endDate = new Date();
    const startDate = new Date();
    let dateFormat: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (range === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "month") {
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === "year") {
      startDate.setDate(startDate.getDate() - 365);
      dateFormat = { month: "short", year: "numeric" };
    }
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey =
        range === "year"
          ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0]
          : currentDate.toISOString().split("T")[0];
      if (!dateMap[dateKey]) dateMap[dateKey] = { count: 0, revenue: 0 };
      if (range === "year") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    const completedOrders = orders.filter(order => order.status === "completed");
    completedOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      let dateKey = orderDate.toISOString().split("T")[0];
      if (range === "year") {
        dateKey = new Date(orderDate.getFullYear(), orderDate.getMonth(), 1).toISOString().split("T")[0];
      }
      if (dateMap[dateKey]) {
        dateMap[dateKey].count += 1;
        dateMap[dateKey].revenue += order.total_amount;
      }
    });
    return Object.keys(dateMap)
      .map(dateKey => {
        const date = new Date(dateKey);
        return {
          date: dateKey,
          formattedDate: date.toLocaleDateString("en-US", dateFormat),
          count: dateMap[dateKey].count,
          revenue: dateMap[dateKey].revenue,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-md rounded p-3 border border-gray-100">
          <p className="font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-sm">{`Orders: ${payload[0].value}`}</p>
          <p className="text-sm">{`Revenue: ₹${payload[1]?.value?.toFixed(2) || 0}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderOrdersChart = () => {
    return (
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={orderStats} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "#E2E8F0" }}
              interval={timeRange === "today" ? 3 : 0} // Show fewer ticks for hourly data
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Area type="monotone" dataKey="count" stroke="#4f46e5" fillOpacity={1} fill="url(#colorOrders)" name="Orders" strokeWidth={2} />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCategoryChart = () => {
    // Premium color scheme with gradients
    const COLORS = [
      "#4f46e5", "#3730a3", "#10b981", "#059669", 
      "#f59e0b", "#d97706", "#ef4444", "#dc2626", 
      "#8b5cf6", "#7c3aed"
    ];
    
    // Filter out categories with zero revenue for both chart and table
    const activeCategories = categorySales
      .filter(cat => cat.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
      
    // Calculate total for percentages
    const totalRevenue = activeCategories.reduce((sum, cat) => sum + cat.revenue, 0);
    
    return (
      <div className="space-y-4">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeCategories.length > 0 ? activeCategories : [{ category_id: "none", category_name: "No Data", count: 1, revenue: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={3}
                dataKey="revenue"
                nameKey="category_name"
                labelLine={false}
                label={false}
              >
                {(activeCategories.length > 0 ? activeCategories : [{ category_id: "none", category_name: "No Data", count: 1, revenue: 1 }])
                  .map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#ffffff" 
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `₹${value.toFixed(2)} (${totalRevenue > 0 ? ((value / totalRevenue) * 100).toFixed(1) : "0"}%)`,
                  props.payload.category_name
                ]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "0.375rem",
                  padding: "0.75rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e5e7eb"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category list with stats - show ONLY categories with orders > 0 */}
        <div className="overflow-auto max-h-52 pr-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-xs">
                <th className="pb-2 text-left font-medium">Category</th>
                <th className="pb-2 text-right font-medium">Orders</th>
                <th className="pb-2 text-right font-medium">Revenue</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {activeCategories.length > 0 ? (
                activeCategories.map((cat, idx) => (
                  <tr key={cat.category_id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-800">{cat.category_name}</span>
                    </td>
                    <td className="py-2 text-right">{cat.count}</td>
                    <td className="py-2 text-right font-medium">₹{cat.revenue.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-600">
                      {totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No active categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPopularItemsChart = () => {
    const COLORS = [
      "#4f46e5", "#3730a3", "#10b981", "#059669", "#f59e0b"
    ];
    
    // Ensure we only show top 5
    const topItems = popularItems
      .slice(0, 5)
      .map((item, i) => ({
        ...item,
        position: i + 1,
        color: COLORS[i % COLORS.length],
      }));
      
    const totalOrders = topItems.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="space-y-4">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={topItems} 
              layout="vertical" 
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} opacity={0.1} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                dataKey="item_name" 
                type="category" 
                tick={false}
                tickLine={false}
                axisLine={false}
                width={0}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} orders`, "Orders"]} 
                cursor={{ fill: "rgba(229, 231, 235, 0.3)" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "0.375rem",
                  padding: "0.75rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e5e7eb"
                }}
              />
              <Bar 
                dataKey="count" 
                name="Orders"
                radius={[0, 4, 4, 0]}
                barSize={28}
              >
                {topItems.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Items list with stats */}
        <div className="overflow-auto max-h-52 pr-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-xs">
                <th className="pb-2 text-left font-medium">Item Name</th>
                <th className="pb-2 text-right font-medium">Orders</th>
                <th className="pb-2 text-right font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, idx) => (
                <tr key={item.item_id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 flex items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white text-xs font-medium" style={{ backgroundColor: item.color }}>
                      {item.position}
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[180px]" title={item.item_name}>
                      {item.item_name}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium">{item.count}</td>
                  <td className="py-2 text-right text-gray-600">
                    {((item.count / totalOrders) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Business Analytics
          <span className="text-sm font-normal text-gray-500 ml-3 align-middle">
            {timeRange === "week" ? "Past week" : 
             timeRange === "month" ? "Past month" : "Past year"}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="flex items-center">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-semibold text-gray-900">Orders & Revenue Trend</CardTitle>
              <CardDescription>Orders and revenue over time</CardDescription>
            </div>
            
            <Badge variant="outline">
              {timeRange === "week" ? "Daily" : 
               timeRange === "month" ? "Daily" : "Monthly"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                <p>Loading chart data...</p>
              </div>
            </div>
          ) : orderStats.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-gray-500">No order data available</p>
            </div>
          ) : (
            renderOrdersChart()
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout for Category Distribution & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 z-0 opacity-40" />
          <CardHeader className="pb-0 relative z-10">
            <CardTitle className="font-semibold text-gray-900 flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Category Revenue Distribution
            </CardTitle>
            <CardDescription>Revenue by food category</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 relative z-10">
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-gray-400 animate-spin" />
              </div>
            ) : categorySales.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-gray-500">No category data available</p>
              </div>
            ) : (
              renderCategoryChart()
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50 rounded-full -ml-20 -mb-20 z-0 opacity-40" />
          <CardHeader className="pb-0 relative z-10">
            <CardTitle className="font-semibold text-gray-900 flex items-center">
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Top Selling Items
            </CardTitle>
            <CardDescription>Most ordered items by quantity</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 relative z-10">
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-gray-400 animate-spin" />
              </div>
            ) : popularItems.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-gray-500">No item data available</p>
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