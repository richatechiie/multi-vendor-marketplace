// Overview.jsx (vendor)
import { useState, useEffect } from "react";
import { vendorAPI } from "../../api";
import Spinner from "../../components/Spinner";
import Badge from "../../components/Badge";

function StatCard({ label, value, accent, sub }) {
  return (
    <div
      className="card-hover rounded-2xl p-5"
      style={{ background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#669BBC" }}>
        {label}
      </p>
      <p className="font-display font-bold text-2xl" style={{ color: accent || "#FDF0D5" }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "#b8a88a" }}>{sub}</p>}
    </div>
  );
}

const statusBanner = {
  pending: {
    bg: "rgba(193,18,31,0.06)",
    border: "rgba(193,18,31,0.2)",
    icon: "⏳",
    title: "Pending Review",
    msg: "Your vendor application is under review. Fill your shop profile while you wait.",
  },
  rejected: {
    bg: "rgba(193,18,31,0.1)",
    border: "rgba(193,18,31,0.3)",
    icon: "❌",
    title: "Application Rejected",
    msg: "Your application was rejected. Please contact support for assistance.",
  },
  suspended: {
    bg: "rgba(120,0,0,0.1)",
    border: "rgba(180,80,0,0.25)",
    icon: "🚫",
    title: "Account Suspended",
    msg: "Your account has been suspended. Please contact the admin team.",
  },
};

export default function Overview() {
  const [data, setData]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const pr = await vendorAPI.profile();
        const p  = pr.data.data;
        setProfile(p);
        if (p.status === "approved") {
          const dash = await vendorAPI.dashboard();
          setData(dash.data.data);
        }
      } catch (ex) {
        setError(ex.response?.data?.message || "Failed to load dashboard");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  if (profile?.status !== "approved") {
    const b = statusBanner[profile?.status] || statusBanner.pending;
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: b.bg, border: `1px solid ${b.border}` }}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl mt-0.5">{b.icon}</span>
          <div>
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: "#FDF0D5" }}>
              {b.title}
            </h2>
            <p className="text-sm" style={{ color: "#b8a88a" }}>{b.msg}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(193,18,31,0.1)", border: "1px solid rgba(193,18,31,0.25)", color: "#e07080" }}>
      {error}
    </div>
  );

  const s = data?.summary;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"   value={`₹${Number(s?.total_revenue  || 0).toLocaleString()}`} accent="#C1121F" />
        <StatCard label="My Earnings"     value={`₹${Number(s?.total_earnings || 0).toLocaleString()}`} accent="#7bbfa0" />
        <StatCard label="Total Orders"    value={s?.total_orders    || 0} accent="#669BBC" />
        <StatCard label="Active Products" value={s?.active_products || 0} />
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" }}
      >
        <div className="p-6 pb-0">
          <h2 className="font-display font-bold text-lg" style={{ color: "#FDF0D5" }}>
            Recent Orders
          </h2>
        </div>

        {!data?.recentOrders?.length ? (
          <p className="text-sm text-center py-10" style={{ color: "#b8a88a" }}>No orders yet.</p>
        ) : (
          <div className="mt-4">
            {data.recentOrders.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 text-sm transition-colors duration-150"
                style={{ borderTop: "1px solid rgba(102,155,188,0.07)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(193,18,31,0.12)", color: "#e07080" }}>
                    {o.order_number}
                  </code>
                  <p className="text-xs mt-1" style={{ color: "#b8a88a" }}>
                    {o.product_name} × {o.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold" style={{ color: "#FDF0D5" }}>
                    ₹{Number(o.total_price).toLocaleString()}
                  </span>
                  <Badge status={o.item_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}