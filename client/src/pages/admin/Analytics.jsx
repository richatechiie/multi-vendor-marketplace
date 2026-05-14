// Analytics.jsx (admin)
import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import Spinner from "../../components/Spinner";

function StatCard({ label, value, accent }) {
  return (
    <div
      className="card-hover rounded-2xl p-5"
      style={{
        background: "rgba(0,36,56,0.7)",
        border: "1px solid rgba(102,155,188,0.12)",
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "#669BBC" }}
      >
        {label}
      </p>
      <p
        className="font-display font-bold text-2xl"
        style={{ color: accent || "#FDF0D5" }}
      >
        {value}
      </p>
    </div>
  );
}

export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.analytics()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data)   return (
    <p className="text-center py-10 text-sm" style={{ color: "#b8a88a" }}>
      No analytics data available.
    </p>
  );

  const ov = data.overview || {};

  return (
    <div className="space-y-6">

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"    value={`₹${Number(ov.total_revenue    || 0).toLocaleString()}`} accent="#C1121F" />
        <StatCard label="Total Commission" value={`₹${Number(ov.total_commission || 0).toLocaleString()}`} accent="#e8c87c" />
        <StatCard label="Total Orders"     value={ov.total_orders    || 0} />
        <StatCard label="Total Customers"  value={ov.total_customers || 0} />
        <StatCard label="Active Vendors"   value={ov.total_vendors   || 0} accent="#7bbfa0" />
        <StatCard label="Pending Vendors"  value={ov.pending_vendors || 0} accent="#e8c87c" />
        <StatCard label="Total Products"   value={ov.total_products  || 0} accent="#669BBC" />
      </div>

      {/* Revenue by Month */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(0,36,56,0.7)",
          border: "1px solid rgba(102,155,188,0.12)",
        }}
      >
        <h3
          className="font-display font-bold text-lg mb-6"
          style={{ color: "#FDF0D5" }}
        >
          Monthly Revenue
        </h3>

        {!data.revenueByMonth?.length ? (
          <p className="text-sm text-center py-6" style={{ color: "#b8a88a" }}>
            No revenue data yet.
          </p>
        ) : (
          <div className="space-y-3">
            {data.revenueByMonth.map((m, i) => {
              const max = Math.max(...data.revenueByMonth.map(x => x.revenue));
              const pct = max > 0 ? (m.revenue / max) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span
                    className="text-xs font-medium w-16 shrink-0"
                    style={{ color: "#b8a88a" }}
                  >
                    {m.month}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(253,240,213,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(to right, #780000, #C1121F)",
                      }}
                    />
                  </div>
                  <span
                    className="font-display font-bold w-28 text-right"
                    style={{ color: "#FDF0D5" }}
                  >
                    ₹{Number(m.revenue).toLocaleString()}
                  </span>
                  <span
                    className="text-xs w-16 text-right"
                    style={{ color: "#669BBC" }}
                  >
                    {m.orders} orders
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Vendors */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(0,36,56,0.7)",
          border: "1px solid rgba(102,155,188,0.12)",
        }}
      >
        <div className="p-6 pb-0">
          <h3 className="font-display font-bold text-lg" style={{ color: "#FDF0D5" }}>
            Top Vendors by Sales
          </h3>
        </div>

        {!data.topVendors?.length ? (
          <p className="text-sm text-center py-8" style={{ color: "#b8a88a" }}>
            No vendor data yet.
          </p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                  {["#", "Shop", "Total Sales", "Earnings", "Products"].map(h => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "#669BBC" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topVendors.map((v, i) => (
                  <tr
                    key={i}
                    className="transition-colors duration-150"
                    style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-6 py-4 font-display font-bold" style={{ color: "#b8a88a" }}>
                      {i + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{ color: "#e8d9b8" }}>
                      {v.shop_name}
                    </td>
                    <td className="px-6 py-4 font-display font-bold" style={{ color: "#C1121F" }}>
                      ₹{Number(v.total_sales).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: "#7bbfa0" }}>
                      ₹{Number(v.total_earnings).toLocaleString()}
                    </td>
                    <td className="px-6 py-4" style={{ color: "#669BBC" }}>
                      {v.products}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}