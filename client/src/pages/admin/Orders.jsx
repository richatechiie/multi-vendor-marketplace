// Orders.jsx (admin)
import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    adminAPI.orders()
      .then(r => setOrders(r.data.data || []))
      .catch(() => show("Failed to load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (uuid, status) => {
    try {
      await adminAPI.updateOrder(uuid, { status });
      setOrders(os => os.map(o => o.uuid === uuid ? { ...o, status } : o));
      show("Status updated ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <Spinner />;

  const cardStyle = {
    background: "rgba(0,36,56,0.7)",
    border: "1px solid rgba(102,155,188,0.12)",
  };

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

  return (
    <div className="space-y-5">
      <ToastContainer />

      <div>
        <span className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>
          All Orders
        </span>
        <span className="ml-2 text-sm" style={{ color: "#b8a88a" }}>({orders.length})</span>
      </div>

      {orders.length === 0 ? (
        <p className="text-center py-16 text-sm" style={{ color: "#b8a88a" }}>
          No orders yet.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                  {["Order #","Customer","Total","Status","Payment","Date","Update"].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                      style={{ color: "#669BBC" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr
                    key={o.uuid}
                    className="transition-colors duration-150"
                    style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-3.5">
                      <code
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ background: "rgba(193,18,31,0.12)", color: "#e07080" }}
                      >
                        {o.order_number}
                      </code>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "#e8d9b8" }}>
                      {o.customer_name || "—"}
                    </td>
                    <td className="px-5 py-3.5 font-display font-bold" style={{ color: "#FDF0D5" }}>
                      ₹{Number(o.total_amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><Badge status={o.status} /></td>
                    <td className="px-5 py-3.5"><Badge status={o.payment_status} /></td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#b8a88a" }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={o.status}
                        onChange={e => updateStatus(o.uuid, e.target.value)}
                        style={selectStyle}
                        onFocus={e => {
                          e.target.style.borderColor = "rgba(193,18,31,0.5)";
                          e.target.style.boxShadow = "0 0 0 2px rgba(193,18,31,0.08)";
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = "rgba(102,155,188,0.2)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}