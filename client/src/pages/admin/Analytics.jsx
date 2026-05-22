import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { AnalyticsSkeleton } from "../../components/Skeleton";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#7c3aed",
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#06b6d4",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#f59e0b",
  "#84cc16",
];

function CustomTooltip({ active, payload, label, prefix = "₹" }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p
            key={i}
            className="text-sm font-semibold"
            style={{ color: p.color }}
          >
            {p.name}: {prefix}
            {Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .analytics()
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AnalyticsSkeleton />;

  if (!data)
    return (
      <p className="text-gray-500 text-center py-10">No analytics data.</p>
    );

  const ov = data.overview || {};

  const monthlyData = (data.revenueByMonth || []).map((m) => ({
    month: m.month,
    revenue: Number(m.revenue),
    orders: Number(m.orders),
  }));

  const topVendors = (data.topVendors || []).map((v) => ({
    name:
      v.shop_name.length > 14 ? v.shop_name.slice(0, 14) + "…" : v.shop_name,
    sales: Number(v.total_sales),
    earnings: Number(v.total_earnings),
  }));

  const platformPie = [
    { name: "Total Revenue", value: Number(ov.total_revenue || 0) },
    { name: "Total Commission", value: Number(ov.total_commission || 0) },
  ];

  const usersPie = [
    { name: "Customers", value: Number(ov.total_customers || 0) },
    { name: "Vendors", value: Number(ov.total_vendors || 0) },
  ];

  return (
    <div>
      <h2 className="font-semibold text-lg mb-6">Platform Analytics</h2>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          [
            "Total Revenue",
            `₹${Number(ov.total_revenue || 0).toLocaleString()}`,
            "text-violet-400",
          ],
          [
            "Total Commission",
            `₹${Number(ov.total_commission || 0).toLocaleString()}`,
            "text-orange-400",
          ],
          ["Total Orders", ov.total_orders || 0, "text-blue-400"],
          ["Total Customers", ov.total_customers || 0, "text-emerald-400"],
          ["Active Vendors", ov.total_vendors || 0, "text-pink-400"],
          ["Pending Vendors", ov.pending_vendors || 0, "text-yellow-400"],
          ["Total Products", ov.total_products || 0, "text-cyan-400"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="bg-white/[0.03] border border-white/8 rounded-2xl p-5"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Area Chart */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-5">Monthly Revenue</h3>
        {monthlyData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No revenue data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={monthlyData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Orders Line Chart */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-5">Monthly Orders</h3>
        {monthlyData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No order data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip prefix="" />} />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6, fill: "#818cf8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Platform Revenue vs Commission Pie */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-5">Revenue Breakdown</h3>
          {platformPie[0].value === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No revenue data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={platformPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#7c3aed" />
                  <Cell fill="#f97316" />
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users Breakdown Pie */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-5">User Distribution</h3>
          {usersPie[0].value === 0 && usersPie[1].value === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No user data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={usersPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#06b6d4" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip formatter={(v) => `${v} users`} />
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Vendors Bar Chart */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-5">Top Vendors by Sales</h3>
        {topVendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No vendor data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={topVendors}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="Total Sales" radius={[6, 6, 0, 0]}>
                {topVendors.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Vendors Table */}
      {data.topVendors?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">
            Top Vendors — Leaderboard
          </h3>
          <div className="space-y-3">
            {data.topVendors.map((v, i) => {
              const max = Math.max(
                ...data.topVendors.map((x) => x.total_sales),
              );
              const pct = max > 0 ? (v.total_sales / max) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-gray-600 text-xs w-4 shrink-0 text-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300 w-36 truncate shrink-0">
                    {v.shop_name}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-violet-400 text-sm font-medium w-28 text-right shrink-0">
                    ₹{Number(v.total_sales).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xs w-20 text-right shrink-0">
                    {v.products} products
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
