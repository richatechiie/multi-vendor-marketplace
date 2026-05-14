// VendorOrders.jsx
import { useState, useEffect } from "react";
import { vendorAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

export default function VendorOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { show, ToastContainer } = useToast();

  const load = async () => {
    try {
      const r = await vendorAPI.orders();
      setOrders(r.data.data || []);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to load", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await vendorAPI.updateOrder(id, { status });
      setOrders(os => os.map(o => (o.item_id || o.id) === id ? { ...o, item_status: status } : o));
      show("Status updated ✓");
    } catch (ex) { show(ex.response?.data?.message || "Failed", "error"); }
  };

  const cardStyle = { background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" };

  const selectStyle = {
    background: "rgba(0,48,73,0.6)",
    border: "1px solid rgba(102,155,188,0.2)",
    color: "#e8d9b8",
    borderRadius: "0.5rem",
    padding: "0.3rem 0.6rem",
    fontSize: "0.75rem",
    outline: "none",
    cursor: "pointer",
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <ToastContainer />

      <div>
        <span className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>Orders</span>
        <span className="ml-2 text-sm" style={{ color: "#b8a88a" }}>({orders.length})</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: "rgba(0,48,73,0.5)", border: "1px solid rgba(102,155,188,0.15)" }}>
            📭
          </div>
          <p className="font-display text-lg mb-1" style={{ color: "#FDF0D5" }}>No orders yet</p>
          <p className="text-sm" style={{ color: "#b8a88a" }}>Orders from customers will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                  {["Order #","Product","Customer","Qty","Total","Status","Update"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "#669BBC" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(item => {
                  const id = item.item_id || item.id;
                  return (
                    <tr key={id} className="transition-colors duration-150"
                      style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="px-5 py-3.5">
                        <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(193,18,31,0.12)", color: "#e07080" }}>
                          {item.order_number}
                        </code>
                        <p className="text-xs mt-1" style={{ color: "#b8a88a" }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 max-w-[140px]">
                        <div className="truncate" style={{ color: "#e8d9b8" }}>{item.product_name}</div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "#b8a88a" }}>{item.customer_name || "—"}</td>
                      <td className="px-5 py-3.5 text-center" style={{ color: "#e8d9b8" }}>{item.quantity}</td>
                      <td className="px-5 py-3.5 font-display font-bold" style={{ color: "#FDF0D5" }}>
                        ₹{Number(item.total_price).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5"><Badge status={item.item_status} /></td>
                      <td className="px-5 py-3.5">
                        <select value={item.item_status} onChange={e => updateStatus(id, e.target.value)} style={selectStyle}
                          onFocus={e => { e.target.style.borderColor = "rgba(193,18,31,0.5)"; }}
                          onBlur={e  => { e.target.style.borderColor = "rgba(102,155,188,0.2)"; }}>
                          {["pending","confirmed","shipped","delivered"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}