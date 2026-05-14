import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";

export default function Profile() {
  const { user, setUser }        = useAuth();
  const { show, ToastContainer } = useToast();
  const [loading, setLoading]    = useState(false);
  const [form, setForm] = useState({
    name:  user?.name  || "",
    phone: user?.phone || "",
  });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.me();
      show("Profile updated ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background: "rgba(0,48,73,0.5)",
    border: "1px solid rgba(102,155,188,0.2)",
    color: "#FDF0D5",
    borderRadius: "0.75rem",
    padding: "0.65rem 1rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const focusInput = e => { e.target.style.borderColor = "rgba(193,18,31,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)"; };
  const blurInput  = e => { e.target.style.borderColor = "rgba(102,155,188,0.2)"; e.target.style.boxShadow = "none"; };
  const labelStyle = { color: "#669BBC", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.5rem" };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <ToastContainer />

      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#669BBC" }}>Account</span>
        <h1 className="font-display font-bold text-4xl mt-1" style={{ color: "#FDF0D5" }}>My Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" }}>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-black"
            style={{ background: "linear-gradient(135deg, #003049, #669BBC)", color: "#FDF0D5", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>{user?.name}</h2>
            <p className="text-sm mb-2" style={{ color: "#b8a88a" }}>{user?.email}</p>
            <Badge status={user?.role} />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label style={labelStyle}>Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Your phone number" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </div>
          <div>
            <label style={labelStyle}>Email (read-only)</label>
            <input value={user?.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
          </div>
          <button type="submit" disabled={loading}
            className="px-8 py-3 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
            onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 0 24px rgba(193,18,31,0.4)")}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

