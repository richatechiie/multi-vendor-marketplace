import { useState, useEffect, useCallback, useRef } from "react";
import { productAPI, categoryAPI } from "../../api";
import { useToast } from "../../hooks/useToast.jsx";
import Badge from "../../components/Badge";
import { TableRowSkeleton } from "../../components/Skeleton";

const emptyForm = {
  name: "",
  description: "",
  short_description: "",
  price: "",
  compare_price: "",
  sku: "",
  stock_quantity: 0,
  category_id: "",
  status: "active",
};

// ── Low Stock Badge inline in table ──────────────────────────────────────────
function StockCell({ qty, alertThreshold = 5 }) {
  const quantity = Number(qty);
  const threshold = Number(alertThreshold);

  if (quantity === 0)
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400 font-medium text-sm">0</span>
        <span className="text-xs px-1.5 py-0.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded-md">
          Out
        </span>
      </div>
    );

  if (quantity <= threshold)
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
        <span className="text-orange-400 font-medium text-sm">{quantity}</span>
        <span className="text-xs px-1.5 py-0.5 bg-orange-900/40 text-orange-400 border border-orange-500/30 rounded-md">
          Low
        </span>
      </div>
    );

  return <span className="text-sm text-gray-300">{quantity}</span>;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { show, ToastContainer } = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const f = (k) => (e) => setForm((x) => ({ ...x, [k]: e.target.value }));

  const load = useCallback(async () => {
    try {
      const [pr, cr] = await Promise.all([
        productAPI.myProducts(),
        categoryAPI.list(),
      ]);
      setProducts(pr.data.data || []);
      setCats(cr.data.data || []);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({});
    setImageFile(null);
    setImagePreview(null);
  };

  const openEdit = (p) => {
    setForm({ ...p, category_id: p.category_id || "" });
    setModal(p);
    setImageFile(null);
    setImagePreview(null);
  };

  // Replace the existing save function with:
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalForm = { ...form };

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await productAPI.uploadImage(fd);
        // Fixed: was split across two lines as "finalFo;" and "rm.images = ..."
        finalForm.images = [
          { url: uploadRes.data.data.imageUrl, alt: form.name },
        ];
      }

      if (modal?.uuid) {
        await productAPI.update(modal.uuid, finalForm);
      } else {
        await productAPI.create(finalForm);
      }

      await load();
      setModal(null);
      setImageFile(null);
      setImagePreview(null);
      show(modal?.uuid ? "Product updated ✓" : "Product created ✓");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (uuid) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productAPI.delete(uuid);
      setProducts((ps) => ps.filter((p) => p.uuid !== uuid));
      show("Product deleted");
    } catch (ex) {
      show(ex.response?.data?.message || "Failed", "error");
    }
  };

  // Low stock summary
  const lowStockCount = products.filter(
    (p) =>
      p.status === "active" &&
      Number(p.stock_quantity) <= Number(p.low_stock_alert || 5),
  ).length;

  const outOfStockCount = products.filter(
    (p) => p.status === "active" && Number(p.stock_quantity) === 0,
  ).length;

  return (
    <div>
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold">My Products ({products.length})</h2>
          {(lowStockCount > 0 || outOfStockCount > 0) && !loading && (
            <div className="flex gap-3 mt-1">
              {outOfStockCount > 0 && (
                <span className="text-xs text-red-400">
                  🔴 {outOfStockCount} out of stock
                </span>
              )}
              {lowStockCount > 0 && (
                <span className="text-xs text-orange-400">
                  🟡 {lowStockCount} low stock
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition"
        >
          + New Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">📦</div>
          <p>No products yet. Create your first product!</p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {["Name", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.uuid}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{p.name}</div>
                    {p.category_name && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.category_name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    ₹{Number(p.price).toLocaleString()}
                    {p.compare_price && (
                      <span className="text-xs text-gray-500 line-through ml-1">
                        ₹{Number(p.compare_price).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StockCell
                      qty={p.stock_quantity}
                      alertThreshold={p.low_stock_alert}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs px-3 py-1 border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition text-gray-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(p.uuid)}
                        className="text-xs px-3 py-1 border border-red-800/50 text-red-400 rounded-lg hover:bg-red-900/20 transition"
                      >
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

      {/* Product Modal */}
      {modal !== null && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-white">
                {modal?.uuid ? "Edit Product" : "New Product"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white transition text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={save} className="space-y-3">
              {[
                ["name", "Product Name *", "text", true],
                ["short_description", "Short Description", "text", false],
                ["sku", "SKU", "text", false],
              ].map(([key, label, type, req]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={f(key)}
                    required={req}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={f("description")}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition resize-none"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">
                  Product Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-4 cursor-pointer transition text-center"
                >
                  {imagePreview || modal?.primary_image ? (
                    <div className="relative">
                      <img
                        src={imagePreview || modal?.primary_image}
                        alt="Preview"
                        className="w-full h-36 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition">
                        <span className="text-white text-sm font-medium">
                          Click to change
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-sm text-gray-400">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        JPG, PNG, WEBP · Max 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imageFile && (
                  <p className="text-xs text-violet-400 mt-1">
                    ✓ {imageFile.name} selected
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["price", "Price (₹) *", "number", true],
                  ["compare_price", "Compare Price", "number", false],
                  ["stock_quantity", "Stock Qty", "number", false],
                  ["low_stock_alert", "Low Stock Alert", "number", false],
                ].map(([key, label, type, req]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={f(key)}
                      required={req}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-white-40 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={form.category_id}
                    onChange={f("category_id")}
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition"
                  >
                    <option value="">No category</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white-40 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={f("status")}
                    className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
                >
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
