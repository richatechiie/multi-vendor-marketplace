// ─── App.jsx ─────────────────────────────────────────────────────────────────
// Replace your existing App.jsx with this.
// Only change: bg-gray-950 → our navy-dark background (handled via index.css body)
 
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
 
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
 
import MyOrders from "./pages/customer/MyOrders";
import CustomerProfile from "./pages/customer/Profile";
 
import VendorLayout from "./pages/vendor/VendorLayout";
import AdminLayout from "./pages/admin/AdminLayout";
 
function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return (
      <div
        className="p-10 text-center text-sm font-medium"
        style={{ color: "#C1121F" }}
      >
        Access Denied — requires <strong>{role}</strong> role.
      </div>
    );
  return children;
}
 
export default function App() {
  return (
    // background is set in index.css body { background: var(--navy-dark) }
    <div className="min-h-screen text-[#FDF0D5]">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/shop"        element={<Shop />} />
        <Route path="/shop/:slug"  element={<ProductDetail />} />
 
        {/* Customer */}
        <Route path="/checkout" element={<Protected role="customer"><Checkout /></Protected>} />
        <Route path="/orders"   element={<Protected role="customer"><MyOrders /></Protected>} />
        <Route path="/profile"  element={<Protected><CustomerProfile /></Protected>} />
 
        {/* Vendor */}
        <Route path="/vendor/*" element={<Protected role="vendor"><VendorLayout /></Protected>} />
 
        {/* Admin */}
        <Route path="/admin/*"  element={<Protected role="admin"><AdminLayout /></Protected>} />
 
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
 