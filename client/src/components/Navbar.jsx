import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";

export default function Navbar() {
  const { user, logout }    = useAuth();
  const { cart }            = useCart();
  const navigate            = useNavigate();
  const location            = useLocation();
  const [menuOpen, setMenu] = useState(false);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = path => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative text-sm font-medium tracking-wide transition-colors duration-200 hover-underline
        ${isActive(to)
          ? "text-[#FDF0D5]"
          : "text-[#b8a88a] hover:text-[#FDF0D5]"}`}
    >
      {label}
      {isActive(to) && (
        <span className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-[#C1121F]" />
      )}
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(0, 24, 36, 0.92)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(102, 155, 188, 0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#FDF0D5] font-display font-bold text-base transition-shadow duration-300 group-hover:glow-crimson-sm"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
          >
            B
          </div>
          <span className="font-display font-bold text-[#FDF0D5] text-xl tracking-tight">
            Bazaar
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10 hidden md:block" />

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLink("/shop", "Shop")}
          {user?.role === "vendor"   && navLink("/vendor",  "Dashboard")}
          {user?.role === "admin"    && navLink("/admin",   "Admin")}
          {user?.role === "customer" && navLink("/orders",  "My Orders")}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-4">

          {/* Cart icon */}
          {user?.role === "customer" && (
            <Link
              to="/checkout"
              className="relative p-2 rounded-lg transition-colors duration-200"
              style={{ color: "#b8a88a" }}
              onMouseEnter={e => e.currentTarget.style.color = "#FDF0D5"}
              onMouseLeave={e => e.currentTarget.style.color = "#b8a88a"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[#FDF0D5] text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: "#C1121F" }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {/* Avatar + name */}
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#FDF0D5] text-xs font-bold font-display"
                  style={{ background: "linear-gradient(135deg, #003049, #669BBC)" }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: "#e8d9b8" }}>
                  {user.name}
                </span>
              </div>

              <Link
                to="/profile"
                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200"
                style={{
                  borderColor: "rgba(102,155,188,0.25)",
                  color: "#b8a88a",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)";
                  e.currentTarget.style.color = "#FDF0D5";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(102,155,188,0.25)";
                  e.currentTarget.style.color = "#b8a88a";
                }}
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200"
                style={{
                  borderColor: "rgba(193,18,31,0.3)",
                  color: "#C1121F",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(193,18,31,0.1)";
                  e.currentTarget.style.borderColor = "rgba(193,18,31,0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(193,18,31,0.3)";
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm px-4 py-1.5 rounded-lg border font-medium transition-all duration-200"
                style={{ borderColor: "rgba(253,240,213,0.15)", color: "#b8a88a" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#FDF0D5";
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "#b8a88a";
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.15)";
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="text-sm px-5 py-1.5 rounded-lg font-semibold text-[#FDF0D5] transition-all duration-200 glow-crimson-sm"
                style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}