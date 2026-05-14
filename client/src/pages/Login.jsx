import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email, setEmail]     = useState("");
  const [pass,  setPass]      = useState("");
  const [err,   setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const user = await login(email, pass);
      if (user.role === "admin")       navigate("/admin");
      else if (user.role === "vendor") navigate("/vendor");
      else                             navigate("/shop");
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || "Login failed");
    } finally { setLoading(false); }
  };

  const demos = [
    { label: "Admin",    email: "admin@marketplace.com",    pass: "Admin@123",    accent: "#C1121F", bg: "rgba(193,18,31,0.12)" },
    { label: "Vendor",   email: "vendor@marketplace.com",   pass: "Vendor@123",   accent: "#669BBC", bg: "rgba(102,155,188,0.12)" },
    { label: "Customer", email: "customer@marketplace.com", pass: "Customer@123", accent: "#e8d9b8", bg: "rgba(253,240,213,0.08)" },
  ];

  return (
    <div
      className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(193,18,31,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(102,155,188,0.08) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />
      </div>

      <div className="w-full max-w-md relative">

        {/* Logo mark */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="relative inline-block mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#FDF0D5] font-display font-black text-2xl mx-auto"
              style={{ background: "linear-gradient(135deg, #780000, #C1121F)", boxShadow: "0 8px 32px rgba(193,18,31,0.35)" }}
            >
              B
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "#FDF0D5" }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "#b8a88a" }}>Sign in to your Bazaar account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 animate-fade-up animate-delay-100"
          style={{
            background: "rgba(0,36,56,0.8)",
            border: "1px solid rgba(102,155,188,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Error */}
          {err && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(193,18,31,0.1)",
                border: "1px solid rgba(193,18,31,0.3)",
                color: "#e07080",
              }}
            >
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="text-xs font-semibold tracking-wider uppercase block mb-2"
                style={{ color: "#669BBC" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: "rgba(0,48,73,0.5)",
                  border: "1px solid rgba(102,155,188,0.2)",
                  color: "#FDF0D5",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(193,18,31,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(102,155,188,0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="text-xs font-semibold tracking-wider uppercase block mb-2"
                style={{ color: "#669BBC" }}
              >
                Password
              </label>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: "rgba(0,48,73,0.5)",
                  border: "1px solid rgba(102,155,188,0.2)",
                  color: "#FDF0D5",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(193,18,31,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(102,155,188,0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300 disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 0 28px rgba(193,18,31,0.4)")}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#FDF0D5] animate-spin"
                  />
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(253,240,213,0.06)" }}>
            <p className="text-xs text-center uppercase tracking-wider mb-4" style={{ color: "#b8a88a" }}>
              Quick demo login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demos.map(d => (
                <button
                  key={d.label}
                  onClick={() => { setEmail(d.email); setPass(d.pass); }}
                  className="py-2.5 px-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
                  style={{
                    background: d.bg,
                    border: `1px solid ${d.accent}30`,
                    color: d.accent,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = d.bg.replace("0.12", "0.2").replace("0.08", "0.14");
                    e.currentTarget.style.borderColor = d.accent + "60";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = d.bg;
                    e.currentTarget.style.borderColor = d.accent + "30";
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-6 animate-fade-up animate-delay-200" style={{ color: "#b8a88a" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors duration-200 hover-underline"
            style={{ color: "#669BBC" }}
            onMouseEnter={e => e.currentTarget.style.color = "#FDF0D5"}
            onMouseLeave={e => e.currentTarget.style.color = "#669BBC"}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}