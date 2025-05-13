import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Users,
  DollarSign,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import OrdersList from "./OrdersList";
import StatsOverview from "./StatsOverview"; // Import the complete StatsOverview component
import MenuManagerComponent from "./MenuManager";
import { useAuth } from "@/hooks/useAuth";

const MenuManager = () => {
  return <MenuManagerComponent />;
};

const AdminDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    menuItemCount: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Get total orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, total_amount");

      if (ordersError) throw ordersError;

      // Get menu items count
      const { count: menuCount, error: menuError } = await supabase
        .from("menu_items")
        .select("id", { count: "exact" });

      if (menuError) throw menuError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue =
        orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalOrders,
        totalRevenue,
        menuItemCount: menuCount || 0,
        conversionRate: totalOrders > 0 ? 75 : 0, // Placeholder conversion rate
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/admin/login');
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchDashboardStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Store
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Orders placed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.menuItemCount}</div>
              <p className="text-xs text-muted-foreground">Active items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                From cart to checkout
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
          </TabsList>

          {/* Use the complete StatsOverview component */}
          <TabsContent value="overview" className="space-y-4">
            <StatsOverview />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrdersList />
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <MenuManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;