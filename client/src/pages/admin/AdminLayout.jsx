// AdminLayout.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import Analytics   from "./Analytics";
import Vendors     from "./Vendors";
import Orders      from "./Orders";
import Commissions from "./Commissions";
import Users       from "./Users";
import Categories  from "./Categories";

const links = [
  { to: "",            label: "Analytics",   icon: "📊" },
  { to: "vendors",     label: "Vendors",     icon: "🏪" },
  { to: "orders",      label: "Orders",      icon: "📦" },
  { to: "commissions", label: "Commissions", icon: "💰" },
  { to: "users",       label: "Users",       icon: "👥" },
  { to: "categories",  label: "Categories",  icon: "🗂️" },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#C1121F" }}
        >
          Control Panel
        </span>
        <h1 className="font-display font-bold text-4xl mt-1 mb-1" style={{ color: "#FDF0D5" }}>
          Admin Panel
        </h1>
        <p className="text-sm" style={{ color: "#b8a88a" }}>
          Manage the entire marketplace from one place.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 mb-8 overflow-x-auto pb-0 relative animate-fade-up animate-delay-100"
        style={{ borderBottom: "1px solid rgba(102,155,188,0.12)" }}
      >
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to === "" ? "/admin" : `/admin/${l.to}`}
            end={l.to === ""}
            className="shrink-0"
          >
            {({ isActive }) => (
              <span
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative"
                style={{
                  color: isActive ? "#FDF0D5" : "#b8a88a",
                  borderBottom: isActive
                    ? "2px solid #C1121F"
                    : "2px solid transparent",
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

      {/* Routed content */}
      <div className="animate-fade-up animate-delay-200">
        <Routes>
          <Route index              element={<Analytics />} />
          <Route path="vendors"     element={<Vendors />} />
          <Route path="orders"      element={<Orders />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="users"       element={<Users />} />
          <Route path="categories"  element={<Categories />} />
        </Routes>
      </div>
    </div>
  );
}