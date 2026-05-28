import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, categoryAPI } from "../api";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast.jsx";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import Spinner from "../components/Spinner";

// ── Skeleton card shown while loading ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-white/5 rounded w-1/3" />
        <div className="h-3 bg-white/5 rounded w-4/5" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-white/5 rounded w-1/4" />
          <div className="h-7 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ── Single product card ───────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onNavigate }) {
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden flex flex-col hover:border-violet-500/30 hover:bg-white/[0.05] transition-all duration-200 group">
      {/* Image */}
      <div
        onClick={() => onNavigate(product.slug)}
        className="h-44 bg-white/5 flex items-center justify-center text-5xl cursor-pointer relative overflow-hidden"
      >
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="group-hover:scale-110 transition-transform duration-200">🛍️</span>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-bold bg-violet-600 text-white">
            -{discount}%
          </div>
        )}
        {Number(product.stock_quantity) === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400 border border-gray-600 rounded-lg px-3 py-1">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.category_name && (
          <span className="text-xs text-violet-400 uppercase tracking-wider font-medium mb-1">
            {product.category_name}
          </span>
        )}
        <h3
          onClick={() => onNavigate(product.slug)}
          className="font-medium text-sm mb-1 leading-snug cursor-pointer hover:text-violet-400 transition line-clamp-2 flex-1"
        >
          {product.name}
        </h3>
        {product.shop_name && (
          <p className="text-xs text-gray-500 mb-3">by {product.shop_name}</p>
        )}

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`text-xs ${i < Math.round(product.rating_avg) ? "text-yellow-400" : "text-white/10"}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.rating_count})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-base">
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="text-xs text-gray-500 line-through ml-1.5">
                ₹{Number(product.compare_price).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={Number(product.stock_quantity) === 0}
            className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Shop Page ────────────────────────────────────────────────────────────
export default function Shop() {
  const { user }                 = useAuth();
  const { addToCart }            = useCart();
  const { show, ToastContainer } = useToast();
  const navigate                 = useNavigate();

  const [products, setProducts]     = useState([]);
  const [cats, setCats]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [sort, setSort]             = useState("created_at");
  const [order, setOrder]           = useState("DESC");
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Debounced search value ─────────────────────────────────────────────────
  const debouncedSearch = useDebounce(search, 500);

  // ── Fetch categories once ──────────────────────────────────────────────────
  useEffect(() => {
    categoryAPI.list()
      .then(r => setCats(r.data.data || []))
      .catch(() => {});
  }, []);

  // ── Fetch products when debounced search or filters change ─────────────────
  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = { page: pageNum, limit: 12, sort, order };
      if (debouncedSearch) params.search   = debouncedSearch;
      if (category)         params.category = category;

      const res = await productAPI.list(params);
      const newProducts = res.data.data || [];

      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      setPagination(res.data.pagination || null);
      setPage(pageNum);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, category, sort, order]);

  // Re-fetch when any filter changes — reset to page 1
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // ── Search suggestions from already-loaded products ────────────────────────
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = search.toLowerCase();
    const matches = products
      .filter(p => p.name.toLowerCase().includes(lower))
      .slice(0, 5)
      .map(p => p.name);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [search, products]);

  const handleAddToCart = (product) => {
    if (!user)                    { navigate("/login"); return; }
    if (user.role !== "customer") { show("Only customers can add to cart", "warning"); return; }
    addToCart(product, 1);
    show(`${product.name} added to cart ✓`);
  };

  const handleSuggestionClick = (name) => {
    setSearch(name);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const loadMore = () => {
    if (pagination && page < pagination.pages) {
      fetchProducts(page + 1, true);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Shop</h1>
        <p className="text-gray-500 text-sm">
          {pagination ? `${pagination.total} products available` : "Browse all products"}
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-start">

        {/* Search with debounce indicator + suggestions */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <div className="relative">
            {/* Search icon */}
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search products…"
              className="w-full bg-gray-950 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500/50 transition"
            />
            {/* Debounce loading indicator */}
            {search && search !== debouncedSearch && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {/* Clear button */}
            {search && search === debouncedSearch && (
              <button onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                ✕
              </button>
            )}
          </div>

          {/* Search suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
              {suggestions.map((s, i) => (
                <button key={i}
                  onMouseDown={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {/* Highlight matching part */}
                  {s.toLowerCase().includes(search.toLowerCase()) ? (
                    <>
                      {s.slice(0, s.toLowerCase().indexOf(search.toLowerCase()))}
                      <span className="text-violet-400 font-medium">
                        {s.slice(
                          s.toLowerCase().indexOf(search.toLowerCase()),
                          s.toLowerCase().indexOf(search.toLowerCase()) + search.length
                        )}
                      </span>
                      {s.slice(s.toLowerCase().indexOf(search.toLowerCase()) + search.length)}
                    </>
                  ) : s}
                </button>
              ))}
              <div className="px-4 py-2 text-xs text-gray-600 border-t border-white/5">
                Press Enter or click to search
              </div>
            </div>
          )}
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); }}
          className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-violet-500/50 transition cursor-pointer"
        >
          <option value="">All Categories</option>
          {cats.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-violet-500/50 transition cursor-pointer"
        >
          <option value="created_at">Newest</option>
          <option value="price">Price</option>
          <option value="rating_avg">Top Rated</option>
          <option value="total_sold">Best Selling</option>
        </select>

        {/* Order */}
        <select
          value={order}
          onChange={e => setOrder(e.target.value)}
          className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-violet-500/50 transition cursor-pointer"
        >
          <option value="DESC">High → Low</option>
          <option value="ASC">Low → High</option>
        </select>

        {/* Active filters summary */}
        {(search || category) && (
          <div className="flex items-center gap-2 ml-auto">
            {search && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-full">
                🔍 {debouncedSearch}
                <button onClick={clearSearch} className="hover:text-white transition">✕</button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-full">
                🗂️ {cats.find(c => c.slug === category)?.name || category}
                <button onClick={() => setCategory("")} className="hover:text-white transition">✕</button>
              </span>
            )}
            <button onClick={() => { clearSearch(); setCategory(""); }}
              className="text-xs text-gray-500 hover:text-white transition px-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Debounce status message */}
      {search && search !== debouncedSearch && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <div className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Searching for <span className="text-violet-400">"{search}"</span>…
        </div>
      )}

      {/* Results count */}
      {!loading && debouncedSearch && (
        <p className="text-sm text-gray-500 mb-4">
          {pagination?.total || 0} results for{" "}
          <span className="text-violet-400 font-medium">"{debouncedSearch}"</span>
        </p>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-500 text-sm mb-6">
            {debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different search term.`
              : "No products available in this category."}
          </p>
          <button onClick={() => { clearSearch(); setCategory(""); }}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard
                key={p.uuid}
                product={p}
                onAddToCart={handleAddToCart}
                onNavigate={(slug) => navigate(`/shop/${slug}`)}
              />
            ))}
          </div>

          {/* Load More */}
          {pagination && page < pagination.pages && (
            <div className="text-center mt-10">
              <button onClick={loadMore} disabled={loadingMore}
                className="px-8 py-3 border border-white/10 hover:border-violet-500/50 text-gray-300 hover:text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center gap-2 mx-auto">
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    Loading more…
                  </>
                ) : (
                  <>
                    Load More
                    <span className="text-gray-500 text-xs">
                      ({products.length} of {pagination.total})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}