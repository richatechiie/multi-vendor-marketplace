// VendorLayout.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Overview     from "./Overview";
import Products     from "./Products";
import VendorOrders from "./VendorOrders";
import Analytics    from "./Analytics";
import Profile      from "./Profile";

const links = [
  { to: "",          label: "Overview",  icon: "📊" },
  { to: "products",  label: "Products",  icon: "📦" },
  { to: "orders",    label: "Orders",    icon: "🛒" },
  { to: "analytics", label: "Analytics", icon: "📈" },
  { to: "profile",   label: "Profile",   icon: "🏪" },
];

export default function VendorLayout() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <div className="mb-8 animate-fade-up">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#669BBC" }}>
          Vendor Portal
        </span>
        <h1 className="font-display font-bold text-4xl mt-1 mb-1" style={{ color: "#FDF0D5" }}>
          Vendor Dashboard
        </h1>
        <p className="text-sm" style={{ color: "#b8a88a" }}>
          Welcome back,{" "}
          <span style={{ color: "#FDF0D5", fontWeight: 600 }}>{user?.name}</span>
        </p>
      </div>

      <div
        className="flex gap-1 mb-8 overflow-x-auto animate-fade-up animate-delay-100"
        style={{ borderBottom: "1px solid rgba(102,155,188,0.12)" }}
      >
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to === "" ? "/vendor" : `/vendor/${l.to}`}
            end={l.to === ""}
            className="shrink-0"
          >
            {({ isActive }) => (
              <span
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={{
                  color: isActive ? "#FDF0D5" : "#b8a88a",
                  borderBottom: isActive ? "2px solid #669BBC" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                <span className="text-base">{l.icon}</span>
                {l.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="animate-fade-up animate-delay-200">
        <Routes>
          <Route index            element={<Overview />} />
          <Route path="products"  element={<Products />} />
          <Route path="orders"    element={<VendorOrders />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile"   element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}