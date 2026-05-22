import { useState, useEffect } from "react";
import { vendorAPI } from "../../api";
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
} from "recharts";

const COLORS = ["#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

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
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    setLoading(true);
    vendorAPI
      .analytics({ period })
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <AnalyticsSkeleton />;
  const commission = data?.commission || {};
  const dailyEarnings = (data?.dailyEarnings || []).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    earnings: Number(d.earnings),
    orders: Number(d.orders),
  }));

  const topProducts = (data?.topProducts || []).map((p) => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
    units: Number(p.units_sold),
    earnings: Number(p.earnings),
  }));

  const pieData = [
    { name: "Your Earnings", value: Number(commission.total_earnings || 0) },
    { name: "Commission", value: Number(commission.total_commission || 0) },
  ];

  return (
    <div>
      {/* Period selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg">Analytics</h2>
        <div className="flex gap-2">
          {[
            ["7", "7 Days"],
            ["30", "30 Days"],
            ["90", "90 Days"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setPeriod(v)}
              className={`text-xs px-4 py-2 rounded-xl border transition font-medium
                ${
                  period === v
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          [
            "Total Earnings",
            `₹${Number(commission.total_earnings || 0).toLocaleString()}`,
            "text-violet-400",
          ],
          [
            "Commission Paid",
            `₹${Number(commission.total_commission || 0).toLocaleString()}`,
            "text-orange-400",
          ],
          [
            "Pending Clearance",
            commission.pending_clearance || 0,
            "text-yellow-400",
          ],
          ["Paid Out", commission.paid || 0, "text-emerald-400"],
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

      {/* Daily Earnings Area Chart */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-5">Daily Earnings</h3>
        {dailyEarnings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No earnings data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={dailyEarnings}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="earnings"
                name="Earnings"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#earningsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders Bar Chart */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-5">Daily Orders</h3>
        {dailyEarnings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No order data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={dailyEarnings}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="date"
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
              <Bar
                dataKey="orders"
                name="Orders"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Products Bar Chart */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-5">
            Top Products — Units Sold
          </h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No product data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip prefix="" />} />
                <Bar dataKey="units" name="Units Sold" radius={[0, 4, 4, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Earnings vs Commission Pie Chart */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-5">Earnings Breakdown</h3>
          {pieData[0].value === 0 && pieData[1].value === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No earnings data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#7c3aed" />
                  <Cell fill="#f97316" />
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString()}`}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">
            Top Products — Earnings
          </h3>
          <div className="space-y-3">
            {data.topProducts.map((p, i) => {
              const maxEarnings = Math.max(
                ...data.topProducts.map((x) => x.earnings),
              );
              const pct =
                maxEarnings > 0 ? (p.earnings / maxEarnings) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-gray-600 text-xs w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300 w-40 truncate shrink-0">
                    {p.name}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-violet-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-emerald-400 text-sm font-medium w-24 text-right shrink-0">
                    ₹{Number(p.earnings).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xs w-16 text-right shrink-0">
                    {p.units_sold} sold
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
