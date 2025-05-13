import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, createBrowserRouter } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import CartPage from "./components/cart/CartPage";
import { AdminRoute } from '@/components/admin/AdminRoute';

// Lazy load admin components
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));

const router = createBrowserRouter([
  {
    path: "/admin/dashboard",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Toaster />
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
