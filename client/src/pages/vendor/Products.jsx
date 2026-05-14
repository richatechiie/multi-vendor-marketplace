// Products.jsx (vendor)
import { useState, useEffect, useCallback } from "react";
import { productAPI, categoryAPI } from "../../api";
import { useToast } from "../../hooks/useToast";
import Badge from "../../components/Badge";
import Spinner from "../../components/Spinner";

const emptyForm = {
  name: "", description: "", short_description: "",
  price: "", compare_price: "", sku: "",
  stock_quantity: 0, category_id: "", status: "active",
};

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200";
const inputStyle = {
  background: "rgba(0,48,73,0.5)",
  border: "1px solid rgba(102,155,188,0.2)",
  color: "#FDF0D5",
};
const focusInput  = e => { e.target.style.borderColor = "rgba(193,18,31,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)"; };
const blurInput   = e => { e.target.style.borderColor = "rgba(102,155,188,0.2)"; e.target.style.boxShadow = "none"; };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const { show, ToastContainer } = useToast();

  const f = k => e => setForm(x => ({ ...x, [k]: e.target.value }));

  const load = useCallback(async () => {
    try {
      const [pr, cr] = await Promise.all([productAPI.myProducts(), categoryAPI.list()]);
      setProducts(pr.data.data || []);
      setCats(cr.data.data || []);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to load", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setModal({}); };
  const openEdit   = p  => { setForm({ ...p, category_id: p.category_id || "" }); setModal(p); };

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal?.uuid) await productAPI.update(modal.uuid, form);
      else             await productAPI.create(form);
      await load();
      setModal(null);
      show(modal?.uuid ? "Product updated ✓" : "Product created ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    } finally { setSaving(false); }
  };

  const del = async uuid => {
    if (!confirm("Delete this product?")) return;
    try {
      await productAPI.delete(uuid);
      setProducts(ps => ps.filter(p => p.uuid !== uuid));
      show("Product deleted");
    } catch (ex) { show(ex.response?.data?.message || "Failed", "error"); }
  };

  const cardStyle = { background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" };
  const labelStyle = { color: "#669BBC", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.5rem" };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>My Products</span>
          <span className="ml-2 text-sm" style={{ color: "#b8a88a" }}>({products.length})</span>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[#FDF0D5] transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 16px rgba(193,18,31,0.4)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
        >
          + New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: "rgba(0,48,73,0.5)", border: "1px solid rgba(102,155,188,0.15)" }}>
            📦
          </div>
          <p className="font-display text-lg mb-1" style={{ color: "#FDF0D5" }}>No products yet</p>
          <p className="text-sm mb-4" style={{ color: "#b8a88a" }}>Create your first product to start selling.</p>
          <button onClick={openCreate} className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[#FDF0D5] transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}>
            + Create Product
          </button>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(102,155,188,0.1)" }}>
                {["Name","Price","Stock","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#669BBC" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.uuid} className="transition-colors duration-150"
                  style={{ borderBottom: "1px solid rgba(102,155,188,0.06)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "#e8d9b8" }}>{p.name}</div>
                    {p.category_name && <div className="text-xs mt-0.5" style={{ color: "#b8a88a" }}>{p.category_name}</div>}
                  </td>
                  <td className="px-5 py-3.5 font-display font-bold" style={{ color: "#FDF0D5" }}>
                    ₹{Number(p.price).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span style={{ color: p.stock_quantity <= 5 ? "#C1121F" : "#e8d9b8" }}>
                      {p.stock_quantity}
                    </span>
                    {p.stock_quantity <= 5 && <span className="text-xs ml-1" style={{ color: "#C1121F" }}>Low</span>}
                  </td>
                  <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                        style={{ background: "rgba(102,155,188,0.1)", border: "1px solid rgba(102,155,188,0.25)", color: "#669BBC" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(102,155,188,0.18)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(102,155,188,0.1)"; }}>
                        Edit
                      </button>
                      <button onClick={() => del(p.uuid)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
                        style={{ background: "rgba(193,18,31,0.08)", border: "1px solid rgba(193,18,31,0.25)", color: "#C1121F" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(193,18,31,0.16)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(193,18,31,0.08)"; }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-7 animate-fade-up"
            style={{ background: "rgba(0,28,44,0.97)", border: "1px solid rgba(102,155,188,0.2)" }}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: "#FDF0D5" }}>
                {modal?.uuid ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={() => setModal(null)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{ border: "1px solid rgba(102,155,188,0.2)", color: "#b8a88a" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)"; e.currentTarget.style.color = "#FDF0D5"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(102,155,188,0.2)"; e.currentTarget.style.color = "#b8a88a"; }}>
                ✕
              </button>
            </div>

            <form onSubmit={save} className="space-y-4">
              {[
                ["name","Product Name *","text",true],
                ["short_description","Short Description","text",false],
                ["sku","SKU","text",false],
              ].map(([key,label,type,req]) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={form[key]} onChange={f(key)} required={req}
                    className={inputCls} style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={f("description")} rows={3}
                  className={inputCls} style={{ ...inputStyle, resize: "none" }} onFocus={focusInput} onBlur={blurInput} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["price","Price (₹) *","number",true],
                  ["compare_price","Compare Price","number",false],
                  ["stock_quantity","Stock Qty","number",false],
                ].map(([key,label,type,req]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={form[key]} onChange={f(key)} required={req}
                      className={inputCls} style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category_id} onChange={f("category_id")}
                    className={inputCls} style={inputStyle} onFocus={focusInput} onBlur={blurInput}>
                    <option value="">No category</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={f("status")}
                    className={inputCls} style={inputStyle} onFocus={focusInput} onBlur={blurInput}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3" style={{ borderTop: "1px solid rgba(102,155,188,0.08)" }}>
                <button type="button" onClick={() => setModal(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ border: "1px solid rgba(102,155,188,0.2)", color: "#b8a88a" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)"; e.currentTarget.style.color = "#FDF0D5"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(102,155,188,0.2)"; e.currentTarget.style.color = "#b8a88a"; }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[#FDF0D5] transition-all duration-300 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
                  onMouseEnter={e => !saving && (e.currentTarget.style.boxShadow = "0 0 20px rgba(193,18,31,0.4)")}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  {saving ? "Saving…" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}