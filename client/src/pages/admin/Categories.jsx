// Categories.jsx (admin)
import { useState, useEffect } from "react";
import { categoryAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Spinner from "../../components/Spinner";

export default function Categories() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName]       = useState("");
  const [adding, setAdding]   = useState(false);
  const { show, ToastContainer } = useToast();

  const load = async () => {
    try {
      const r = await categoryAPI.list();
      setCats(r.data.data || []);
    } catch {
      show("Failed to load", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const add = async e => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await categoryAPI.create({ name: name.trim() });
      setName("");
      show("Category created ✓");
      load();
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    } finally { setAdding(false); }
  };

  const remove = async id => {
    if (!confirm("Remove this category?")) return;
    try {
      await categoryAPI.delete(id);
      setCats(cs => cs.filter(c => c.id !== id));
      show("Category removed ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <Spinner />;

  const cardStyle = {
    background: "rgba(0,36,56,0.7)",
    border: "1px solid rgba(102,155,188,0.12)",
  };

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* Add form card */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="font-display font-bold text-lg mb-5" style={{ color: "#FDF0D5" }}>
          Add Category
        </h2>
        <form onSubmit={add} className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Category name…"
            required
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
            style={{
              background: "rgba(0,48,73,0.5)",
              border: "1px solid rgba(102,155,188,0.2)",
              color: "#FDF0D5",
            }}
            onFocus={e => {
              e.target.style.borderColor = "rgba(193,18,31,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgba(102,155,188,0.2)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[#FDF0D5] transition-all duration-200 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
            onMouseEnter={e => !adding && (e.currentTarget.style.boxShadow = "0 0 16px rgba(193,18,31,0.4)")}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      {/* List */}
      {cats.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "#b8a88a" }}>
          No categories yet.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                {["Name","Slug","Action"].map(h => (
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
              {cats.map(c => (
                <tr
                  key={c.id}
                  className="transition-colors duration-150"
                  style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td className="px-5 py-3.5 font-medium" style={{ color: "#e8d9b8" }}>
                    {c.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <code
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: "rgba(102,155,188,0.1)", color: "#669BBC" }}
                    >
                      {c.slug}
                    </code>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => remove(c.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                      style={{
                        background: "rgba(193,18,31,0.08)",
                        border: "1px solid rgba(193,18,31,0.25)",
                        color: "#C1121F",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(193,18,31,0.16)";
                        e.currentTarget.style.borderColor = "rgba(193,18,31,0.45)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(193,18,31,0.08)";
                        e.currentTarget.style.borderColor = "rgba(193,18,31,0.25)";
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}