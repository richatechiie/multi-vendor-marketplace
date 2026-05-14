import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, categoryAPI } from "../api";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { useToast } from "../hooks/useToast";

export default function Shop() {
  const { user }               = useAuth();
  const { addToCart }          = useCart();
  const { show, ToastContainer } = useToast();
  const navigate               = useNavigate();

  const [products, setProducts] = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort]         = useState("created_at");
  const [order, setOrder]       = useState("DESC");
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (sort)     params.sort     = sort;
      if (order)    params.order    = order;
      const res = await productAPI.list(params);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to load products", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    categoryAPI.list().then(r => setCats(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [page, category, sort, order]);

  const handleSearch = e => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = product => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "customer") { show("Only customers can add to cart", "warning"); return; }
    addToCart(product, 1);
    show(`${product.name} added to cart ✓`);
  };

  /* ─── shared select style ─────────────────────────────── */
  const selectStyle = {
    background: "rgba(0,48,73,0.6)",
    border: "1px solid rgba(102,155,188,0.2)",
    color: "#e8d9b8",
    borderRadius: "0.75rem",
    padding: "0.55rem 0.85rem",
    fontSize: "0.82rem",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <ToastContainer />

      {/* ── Page header ────────────────────────────────── */}
      <div className="mb-10">
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#C1121F" }}
        >
          Marketplace
        </span>
        <h1 className="font-display font-bold text-4xl mt-1 mb-1" style={{ color: "#FDF0D5" }}>
          Browse Shop
        </h1>
        {pagination && (
          <p className="text-sm" style={{ color: "#b8a88a" }}>
            {pagination.total} products available
          </p>
        )}
      </div>

      {/* ── Filters bar ────────────────────────────────── */}
      <div
        className="flex flex-wrap gap-3 mb-8 items-center p-4 rounded-2xl"
        style={{
          background: "rgba(0,36,56,0.6)",
          border: "1px solid rgba(102,155,188,0.12)",
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#669BBC" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                background: "rgba(0,48,73,0.5)",
                border: "1px solid rgba(102,155,188,0.2)",
                color: "#FDF0D5",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(193,18,31,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.06)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(102,155,188,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[#FDF0D5] transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 16px rgba(193,18,31,0.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            Search
          </button>
        </form>

        {/* Category */}
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          <option value="created_at">Newest</option>
          <option value="price">Price</option>
          <option value="rating_avg">Rating</option>
          <option value="total_sold">Popular</option>
        </select>

        {/* Order */}
        <select
          value={order}
          onChange={e => { setOrder(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          <option value="DESC">High → Low</option>
          <option value="ASC">Low → High</option>
        </select>
      </div>

      {/* ── Products grid ──────────────────────────────── */}
      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="text-center py-28">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
            style={{ background: "rgba(0,48,73,0.5)", border: "1px solid rgba(102,155,188,0.15)" }}
          >
            📭
          </div>
          <p className="font-display text-xl mb-2" style={{ color: "#FDF0D5" }}>No products found</p>
          <p className="text-sm" style={{ color: "#b8a88a" }}>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => {
            const outOfStock = Number(p.stock_quantity) === 0;
            return (
              <div
                key={p.uuid}
                className="card-hover rounded-2xl overflow-hidden flex flex-col group"
                style={{
                  background: "rgba(0,36,56,0.7)",
                  border: "1px solid rgba(102,155,188,0.12)",
                }}
              >
                {/* Image */}
                <div
                  onClick={() => navigate(`/shop/${p.slug}`)}
                  className="h-44 flex items-center justify-center text-5xl cursor-pointer overflow-hidden relative"
                  style={{ background: "rgba(0,48,73,0.5)" }}
                >
                  {p.primary_image ? (
                    <img
                      src={p.primary_image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="transition-transform duration-300 group-hover:scale-110">🛍️</span>
                  )}
                  {outOfStock && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      <span
                        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: "rgba(193,18,31,0.8)", color: "#FDF0D5" }}
                      >
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  {p.category_name && (
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase mb-2"
                      style={{ color: "#669BBC" }}
                    >
                      {p.category_name}
                    </span>
                  )}

                  <h3
                    onClick={() => navigate(`/shop/${p.slug}`)}
                    className="font-medium text-sm mb-1 leading-snug cursor-pointer line-clamp-2 transition-colors duration-200"
                    style={{ color: "#e8d9b8" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#FDF0D5"}
                    onMouseLeave={e => e.currentTarget.style.color = "#e8d9b8"}
                  >
                    {p.name}
                  </h3>

                  {p.shop_name && (
                    <p className="text-xs mb-3" style={{ color: "#b8a88a" }}>by {p.shop_name}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div>
                      <span className="font-display font-bold text-lg" style={{ color: "#FDF0D5" }}>
                        ₹{Number(p.price).toLocaleString()}
                      </span>
                      {p.compare_price && (
                        <span className="text-xs line-through ml-2" style={{ color: "#b8a88a" }}>
                          ₹{Number(p.compare_price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {!outOfStock && (
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold text-[#FDF0D5] transition-all duration-200 shrink-0"
                        style={{ background: "rgba(193,18,31,0.7)", border: "1px solid rgba(193,18,31,0.5)" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "#C1121F";
                          e.currentTarget.style.boxShadow = "0 0 12px rgba(193,18,31,0.4)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(193,18,31,0.7)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        + Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────── */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-12 flex-wrap">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30"
            style={{
              border: "1px solid rgba(102,155,188,0.2)",
              color: "#b8a88a",
              background: "rgba(0,36,56,0.5)",
            }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)")}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(102,155,188,0.2)"}
          >
            ← Prev
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className="w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                page === n
                  ? {
                      background: "linear-gradient(135deg, #780000, #C1121F)",
                      color: "#FDF0D5",
                      border: "1px solid transparent",
                      boxShadow: "0 4px 12px rgba(193,18,31,0.35)",
                    }
                  : {
                      background: "rgba(0,36,56,0.5)",
                      border: "1px solid rgba(102,155,188,0.2)",
                      color: "#b8a88a",
                    }
              }
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-30"
            style={{
              border: "1px solid rgba(102,155,188,0.2)",
              color: "#b8a88a",
              background: "rgba(0,36,56,0.5)",
            }}
            onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = "rgba(253,240,213,0.3)")}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(102,155,188,0.2)"}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}