// Analytics.jsx (vendor)
import { useState, useEffect } from "react";
import { vendorAPI } from "../../api";
import Spinner from "../../components/Spinner";

export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState("30");

  useEffect(() => {
    setLoading(true);
    vendorAPI.analytics({ period })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const cardStyle = {
    background: "rgba(0,36,56,0.7)",
    border: "1px solid rgba(102,155,188,0.12)",
  };

  const selectStyle = {
    background: "rgba(0,48,73,0.6)",
    border: "1px solid rgba(102,155,188,0.2)",
    color: "#e8d9b8",
    borderRadius: "0.75rem",
    padding: "0.4rem 0.8rem",
    fontSize: "0.8rem",
    outline: "none",
    cursor: "pointer",
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">

      {/* Header + period picker */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>Analytics</h2>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Commission summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings",    value: `₹${Number(data?.commission?.total_earnings   || 0).toLocaleString()}`, accent: "#7bbfa0" },
          { label: "Total Commission",  value: `₹${Number(data?.commission?.total_commission || 0).toLocaleString()}`, accent: "#C1121F" },
          { label: "Pending Clearance", value: data?.commission?.pending_clearance || 0,                                accent: "#e8c87c" },
          { label: "Paid Out",          value: data?.commission?.paid || 0,                                             accent: "#669BBC" },
        ].map(c => (
          <div key={c.label} className="card-hover rounded-2xl p-5" style={cardStyle}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#669BBC" }}>
              {c.label}
            </p>
            <p className="font-display font-bold text-2xl" style={{ color: c.accent }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="p-6 pb-0">
          <h3 className="font-display font-bold text-lg" style={{ color: "#FDF0D5" }}>Top Products</h3>
        </div>
        {!data?.topProducts?.length ? (
          <p className="text-sm text-center py-10" style={{ color: "#b8a88a" }}>No data yet.</p>
        ) : (
          <div className="mt-4">
            {data.topProducts.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 text-sm transition-colors duration-150"
                style={{ borderTop: "1px solid rgba(102,155,188,0.07)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold text-lg w-6 text-center" style={{ color: "#b8a88a" }}>
                    {i + 1}
                  </span>
                  <span className="font-medium" style={{ color: "#e8d9b8" }}>{p.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs" style={{ color: "#b8a88a" }}>{p.units_sold} sold</span>
                  <span className="font-display font-bold" style={{ color: "#7bbfa0" }}>
                    ₹{Number(p.earnings).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Earnings chart */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <h3 className="font-display font-bold text-lg mb-6" style={{ color: "#FDF0D5" }}>Daily Earnings</h3>
        {!data?.dailyEarnings?.length ? (
          <p className="text-sm text-center py-4" style={{ color: "#b8a88a" }}>No data for this period.</p>
        ) : (
          <div className="space-y-3">
            {data.dailyEarnings.map((d, i) => {
              const max = Math.max(...data.dailyEarnings.map(x => x.earnings));
              const pct = max > 0 ? (d.earnings / max) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span className="text-xs w-20 shrink-0" style={{ color: "#b8a88a" }}>
                    {new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(253,240,213,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(to right, #003049, #669BBC)",
                      }}
                    />
                  </div>
                  <span className="w-24 text-right font-display font-bold" style={{ color: "#7bbfa0" }}>
                    ₹{Number(d.earnings).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}