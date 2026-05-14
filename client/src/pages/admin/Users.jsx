// Users.jsx (admin)
import { useState, useEffect } from "react";
import { adminAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

const roleColors = {
  admin:    { bg: "rgba(193,18,31,0.12)",   color: "#C1121F" },
  vendor:   { bg: "rgba(0,48,73,0.5)",      color: "#669BBC" },
  customer: { bg: "rgba(253,240,213,0.06)", color: "#b8a88a" },
};

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("");
  const { show, ToastContainer } = useToast();

  const load = async () => {
    try {
      const params = filter ? { role: filter } : {};
      const r = await adminAPI.users(params);
      setUsers(r.data.data || []);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const toggle = async id => {
    try {
      await adminAPI.toggleUser(id);
      setUsers(us => us.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
      show("User status updated ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <Spinner />;

  const cardStyle = {
    background: "rgba(0,36,56,0.7)",
    border: "1px solid rgba(102,155,188,0.12)",
  };

  const filters = ["", "admin", "vendor", "customer"];

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* Header + filter tabs */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <span className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>
            Users
          </span>
          <span className="ml-2 text-sm" style={{ color: "#b8a88a" }}>({users.length})</span>
        </div>

        <div className="ml-auto flex gap-2 flex-wrap">
          {filters.map(r => {
            const active = filter === r;
            return (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className="text-xs px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-all duration-200"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #780000, #C1121F)",
                        color: "#FDF0D5",
                        border: "1px solid transparent",
                      }
                    : {
                        background: "rgba(0,36,56,0.5)",
                        color: "#b8a88a",
                        border: "1px solid rgba(102,155,188,0.2)",
                      }
                }
              >
                {r || "All"}
              </button>
            );
          })}
        </div>
      </div>

      {users.length === 0 ? (
        <p className="text-center py-16 text-sm" style={{ color: "#b8a88a" }}>
          No users found.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                  {["Name","Email","Role","Status","Joined","Action"].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "#669BBC" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = roleColors[u.role] || roleColors.customer;
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors duration-150"
                      style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Name + Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-display shrink-0"
                            style={{ background: rc.bg, color: rc.color }}
                          >
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: "#e8d9b8" }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#b8a88a" }}>{u.email}</td>
                      <td className="px-5 py-3.5"><Badge status={u.role} /></td>
                      <td className="px-5 py-3.5">
                        <Badge status={u.is_active ? "active" : "inactive"} />
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#b8a88a" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggle(u.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                          style={
                            u.is_active
                              ? {
                                  background: "rgba(193,18,31,0.08)",
                                  border: "1px solid rgba(193,18,31,0.3)",
                                  color: "#C1121F",
                                }
                              : {
                                  background: "rgba(0,48,73,0.5)",
                                  border: "1px solid rgba(40,140,100,0.35)",
                                  color: "#7bbfa0",
                                }
                          }
                          onMouseEnter={e => {
                            if (u.is_active) {
                              e.currentTarget.style.background = "rgba(193,18,31,0.15)";
                            } else {
                              e.currentTarget.style.background = "rgba(40,140,100,0.15)";
                            }
                          }}
                          onMouseLeave={e => {
                            if (u.is_active) {
                              e.currentTarget.style.background = "rgba(193,18,31,0.08)";
                            } else {
                              e.currentTarget.style.background = "rgba(0,48,73,0.5)";
                            }
                          }}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
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