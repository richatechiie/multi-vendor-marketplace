// Commissions.jsx (admin)
import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

export default function Commissions() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    adminAPI.commissions()
      .then(r => setList(r.data.data || []))
      .catch(() => show("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, []);

  const markPaid = async id => {
    try {
      await adminAPI.markPaid(id);
      setList(cs => cs.map(c => c.id === id ? { ...c, status: "paid" } : c));
      show("Marked as paid ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  const total   = list.reduce((s, c) => s + Number(c.commission_amount), 0);
  const pending = list.filter(c => c.status !== "paid").reduce((s, c) => s + Number(c.commission_amount), 0);

  if (loading) return <Spinner />;

  const cardStyle = {
    background: "rgba(0,36,56,0.7)",
    border: "1px solid rgba(102,155,188,0.12)",
  };

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Commission", value: `₹${total.toLocaleString()}`,          accent: "#C1121F" },
          { label: "Pending Payout",   value: `₹${pending.toLocaleString()}`,        accent: "#e8c87c" },
          { label: "Total Records",    value: list.length,                             accent: "#669BBC" },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-5 card-hover" style={cardStyle}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#669BBC" }}>
              {card.label}
            </p>
            <p className="font-display font-bold text-2xl" style={{ color: card.accent }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-center py-16 text-sm" style={{ color: "#b8a88a" }}>
          No commissions yet.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                  {["Vendor","Order","Gross","Commission","Vendor Earns","Status","Action"].map(h => (
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
                {list.map(c => (
                  <tr
                    key={c.id}
                    className="transition-colors duration-150"
                    style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-5 py-3.5 font-semibold" style={{ color: "#e8d9b8" }}>
                      {c.shop_name || `#${c.vendor_id}`}
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(193,18,31,0.12)", color: "#e07080" }}>
                        {c.order_number}
                      </code>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "#e8d9b8" }}>
                      ₹{Number(c.gross_amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ color: "#C1121F" }}>
                        ₹{Number(c.commission_amount).toLocaleString()}
                      </span>
                      <span className="text-xs ml-1" style={{ color: "#b8a88a" }}>
                        ({c.commission_rate}%)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: "#7bbfa0" }}>
                      ₹{Number(c.vendor_earnings).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {c.status !== "paid" && (
                        <button
                          onClick={() => markPaid(c.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                          style={{
                            background: "rgba(0,48,73,0.5)",
                            border: "1px solid rgba(40,140,100,0.35)",
                            color: "#7bbfa0",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(40,140,100,0.15)";
                            e.currentTarget.style.borderColor = "rgba(40,140,100,0.5)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(0,48,73,0.5)";
                            e.currentTarget.style.borderColor = "rgba(40,140,100,0.35)";
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
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