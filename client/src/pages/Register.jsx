import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [err, setErr]   = useState("");
  const [ok, setOk]     = useState(false);
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(x => ({ ...x, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await authAPI.register(form);
      setOk(true);
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || "Registration failed");
    } finally { setLoading(false); }
  };

  // Success state
  if (ok) return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div
        className="rounded-2xl p-10 w-full max-w-md text-center animate-fade-up"
        style={{
          background: "rgba(0,36,56,0.8)",
          border: "1px solid rgba(102,155,188,0.15)",
        }}
      >
        {/* Animated checkmark */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
          style={{ background: "rgba(102,155,188,0.12)", border: "2px solid rgba(102,155,188,0.3)" }}
        >
          ✓
        </div>
        <h2 className="font-display font-bold text-3xl mb-3" style={{ color: "#FDF0D5" }}>
          Account Created!
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#b8a88a" }}>
          {form.role === "vendor"
            ? "Your vendor application is pending admin approval. We'll notify you once reviewed."
            : "You can now sign in and start shopping on Bazaar."}
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300"
          style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 28px rgba(193,18,31,0.4)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
        >
          Go to Login →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-[90vh] px-4 py-12 relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(120,0,0,0.1) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(102,155,188,0.08) 0%, transparent 70%)", transform: "translate(30%, 30%)" }}
        />
      </div>

      <div className="w-full max-w-md relative">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#FDF0D5] font-display font-black text-2xl mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)", boxShadow: "0 8px 32px rgba(193,18,31,0.35)" }}
          >
            B
          </div>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "#FDF0D5" }}>
            Create account
          </h1>
          <p className="text-sm" style={{ color: "#b8a88a" }}>Join the Bazaar marketplace</p>
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

            {/* Name */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2" style={{ color: "#669BBC" }}>
                Full Name
              </label>
              <input
                value={form.name}
                onChange={e => f("name")(e.target.value)}
                placeholder="Your name"
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

            {/* Email */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2" style={{ color: "#669BBC" }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => f("email")(e.target.value)}
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
              <label className="text-xs font-semibold tracking-wider uppercase block mb-2" style={{ color: "#669BBC" }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => f("password")(e.target.value)}
                placeholder="Min 6 characters"
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

            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold tracking-wider uppercase block mb-3" style={{ color: "#669BBC" }}>
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "customer", emoji: "🛒", label: "Customer", desc: "Shop & order" },
                  { val: "vendor",   emoji: "🏪", label: "Vendor",   desc: "Sell products" },
                ].map(r => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => f("role")(r.val)}
                    className="py-4 px-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: form.role === r.val
                        ? "rgba(193,18,31,0.12)"
                        : "rgba(0,48,73,0.4)",
                      border: form.role === r.val
                        ? "1px solid rgba(193,18,31,0.45)"
                        : "1px solid rgba(102,155,188,0.15)",
                    }}
                  >
                    <div className="text-xl mb-1">{r.emoji}</div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: form.role === r.val ? "#FDF0D5" : "#e8d9b8" }}
                    >
                      {r.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#b8a88a" }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 0 28px rgba(193,18,31,0.4)")}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#FDF0D5] animate-spin" />
                  Creating…
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6 animate-fade-up animate-delay-200" style={{ color: "#b8a88a" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold transition-colors duration-200"
            style={{ color: "#669BBC" }}
            onMouseEnter={e => e.currentTarget.style.color = "#FDF0D5"}
            onMouseLeave={e => e.currentTarget.style.color = "#669BBC"}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}