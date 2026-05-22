import { useState, useEffect } from "react";
import { vendorAPI } from "../../api";
import Badge from "../../components/Badge";
import { DashboardSkeleton } from "../../components/Skeleton";

function StatCard({ label, value, color = "text-white", sub }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Low Stock Alert ───────────────────────────────────────────────────────────
function LowStockAlert({ products }) {
  const lowStock = products.filter(
    p => p.status === "active" && Number(p.stock_quantity) <= Number(p.low_stock_alert || 5)
  );
  if (!lowStock.length) return null;

  return (
    <div className="bg-orange-950/40 border border-orange-500/30 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚠️</span>
        <h3 className="font-semibold text-orange-300 text-sm">
          Low Stock Alert — {lowStock.length} product{lowStock.length > 1 ? "s" : ""} running low
        </h3>
      </div>
      <div className="space-y-2">
        {lowStock.map(p => (
          <div key={p.uuid}
            className="flex items-center justify-between bg-orange-900/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
              <span className="text-sm text-orange-200 font-medium">{p.name}</span>
              {p.category_name && (
                <span className="text-xs text-orange-400/60">— {p.category_name}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`text-sm font-bold ${
                  Number(p.stock_quantity) === 0
                    ? "text-red-400"
                    : Number(p.stock_quantity) <= 3
                    ? "text-orange-400"
                    : "text-yellow-400"
                }`}>
                  {Number(p.stock_quantity) === 0 ? "Out of stock" : `${p.stock_quantity} left`}
                </span>
              </div>
              {Number(p.stock_quantity) === 0 ? (
                <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-400 border border-red-500/30 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-orange-900/50 text-orange-400 border border-orange-500/30 rounded-full">
                  Low Stock
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-orange-400/60 mt-3">
        Go to Products tab to update stock quantities.
      </p>
    </div>
  );
}

export default function Overview() {
  const [data, setData]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const pr = await vendorAPI.profile();
        const p  = pr.data.data;
        setProfile(p);

        if (p.status === "approved") {
          const [dash, prods] = await Promise.allSettled([
            vendorAPI.dashboard(),
            vendorAPI.orders({ limit: 100 }),
          ]);

          if (dash.status === "fulfilled") {
            setData(dash.value.data.data);
          }

          // Load products for low stock check
          const { default: { productAPI } } = await import("../../api");
          try {
            const prodRes = await productAPI.myProducts({ limit: 100 });
            setProducts(prodRes.data.data || []);
          } catch {}
        }
      } catch (ex) {
        setError(ex.response?.data?.message || "Failed to load dashboard");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (profile?.status !== "approved") return (
    <div className={`border rounded-2xl p-6
      ${profile?.status === "pending"  ? "bg-yellow-900/20 border-yellow-800" :
        profile?.status === "rejected" ? "bg-red-900/20 border-red-800" :
        "bg-orange-900/20 border-orange-800"}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">
          {profile?.status === "pending" ? "⏳" : profile?.status === "rejected" ? "❌" : "🚫"}
        </span>
        <h2 className="font-semibold capitalize">{profile?.status} — Vendor Account</h2>
      </div>
      <p className="text-gray-400 text-sm">
        {profile?.status === "pending"
          ? "Your vendor application is under review. Fill your shop profile while you wait."
          : profile?.status === "rejected"
          ? "Your application was rejected. Please contact support."
          : "Your account has been suspended. Please contact admin."}
      </p>
    </div>
  );

  if (error) return (
    <div className="bg-red-900/30 border border-red-800 rounded-2xl p-4 text-red-300 text-sm">{error}</div>
  );

  const s = data?.summary;

  return (
    <div>
      {/* Low Stock Alert */}
      <LowStockAlert products={products} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue"   value={`₹${Number(s?.total_revenue  || 0).toLocaleString()}`} color="text-violet-400" />
        <StatCard label="My Earnings"     value={`₹${Number(s?.total_earnings || 0).toLocaleString()}`} color="text-emerald-400" />
        <StatCard label="Total Orders"    value={s?.total_orders    || 0} />
        <StatCard label="Active Products" value={s?.active_products || 0} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <h2 className="font-semibold mb-4 text-sm">Recent Orders</h2>
        {!data?.recentOrders?.length ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">No orders yet. Create active products to start selling!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentOrders.map((o, i) => (
              <div key={i}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 text-sm">
                <div>
                  <code className="text-violet-400 text-xs">{o.order_number}</code>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {o.product_name} × {o.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">₹{Number(o.total_price).toLocaleString()}</span>
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