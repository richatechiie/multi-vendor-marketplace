// ════════════════════════════════════════════════════════
// MyOrders.jsx  →  src/pages/customer/MyOrders.jsx
// ════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { orderAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

export function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail]   = useState(null);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    orderAPI.myOrders()
      .then(r => setOrders(r.data.data || []))
      .catch(() => show("Failed to load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async uuid => {
    if (!confirm("Cancel this order?")) return;
    try {
      await orderAPI.cancel(uuid);
      setOrders(o => o.map(x => x.uuid === uuid ? { ...x, status: "cancelled" } : x));
      show("Order cancelled");
    } catch (ex) { show(ex.response?.data?.message || "Failed", "error"); }
  };

  const openDetail = async o => {
    try {
      const r = await orderAPI.detail(o.uuid);
      setDetail(r.data.data);
    } catch { setDetail(o); }
  };

  const cardStyle = { background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <ToastContainer />

      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#669BBC" }}>
          Customer
        </span>
        <h1 className="font-display font-bold text-4xl mt-1" style={{ color: "#FDF0D5" }}>My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: "rgba(0,48,73,0.5)", border: "1px solid rgba(102,155,188,0.15)" }}>
            📦
          </div>
          <p className="font-display text-xl mb-2" style={{ color: "#FDF0D5" }}>No orders yet</p>
          <p className="text-sm" style={{ color: "#b8a88a" }}>Start shopping to see your orders here.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                  {["Order #","Date","Total","Status","Payment","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#669BBC" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.uuid} className="transition-colors duration-150"
                    style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(193,18,31,0.12)", color: "#e07080" }}>
                        {o.order_number}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#b8a88a" }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-display font-bold" style={{ color: "#FDF0D5" }}>
                      ₹{Number(o.total_amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><Badge status={o.status} /></td>
                    <td className="px-5 py-3.5"><Badge status={o.payment_status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(o)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                          style={{ background: "rgba(102,155,188,0.1)", border: "1px solid rgba(102,155,188,0.25)", color: "#669BBC" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.18)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(102,155,188,0.1)"}>
                          Details
                        </button>
                        {o.status === "pending" && (
                          <button onClick={() => cancel(o.uuid)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                            style={{ background: "rgba(193,18,31,0.08)", border: "1px solid rgba(193,18,31,0.25)", color: "#C1121F" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(193,18,31,0.16)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(193,18,31,0.08)"}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detail && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-7 animate-fade-up"
            style={{ background: "rgba(0,28,44,0.97)", border: "1px solid rgba(102,155,188,0.2)" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>
                Order {detail.order_number}
              </h2>
              <button onClick={() => setDetail(null)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{ border: "1px solid rgba(102,155,188,0.2)", color: "#b8a88a" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#FDF0D5"; e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#b8a88a"; e.currentTarget.style.borderColor = "rgba(102,155,188,0.2)"; }}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ["Status", <Badge status={detail.status} />],
                ["Payment", <Badge status={detail.payment_status} />],
                ["Total", `₹${Number(detail.total_amount).toLocaleString()}`],
                ["City", detail.shipping_city || "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl p-3" style={{ background: "rgba(0,48,73,0.5)", border: "1px solid rgba(102,155,188,0.1)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#669BBC" }}>{label}</p>
                  <div className="font-medium text-sm" style={{ color: "#e8d9b8" }}>{value}</div>
                </div>
              ))}
            </div>

            {detail.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 text-sm"
                style={{ borderTop: "1px solid rgba(102,155,188,0.07)" }}>
                <span style={{ color: "#b8a88a" }}>{item.product_name} × {item.quantity}</span>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold" style={{ color: "#FDF0D5" }}>₹{Number(item.total_price).toLocaleString()}</span>
                  <Badge status={item.item_status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;