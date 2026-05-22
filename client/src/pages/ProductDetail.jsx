import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../api";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast.jsx";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";
import { ProductDetailSkeleton } from "../components/Skeleton";

// ── Star Rating Component ─────────────────────────────────────────────────────
function StarRating({ value = 0, max = 5, size = "text-base", interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = interactive ? (hover || value) > i : value > i;
        return (
          <span key={i}
            className={`${size} transition cursor-${interactive ? "pointer" : "default"}
              ${filled ? "text-yellow-400" : "text-white/15"}`}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange && onChange(i + 1)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images = [], productName }) {
  const [active, setActive] = useState(0);

  const all = images.length > 0
    ? images
    : [{ image_url: null, alt_text: productName }];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden h-80 md:h-[420px] flex items-center justify-center relative group">
        {all[active]?.image_url ? (
          <img
            src={all[active].image_url}
            alt={all[active].alt_text || productName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-8xl opacity-30">🛍️</span>
        )}
        {/* Image count badge */}
        {all.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
            {active + 1} / {all.length}
          </div>
        )}
        {/* Navigation arrows */}
        {all.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => Math.max(0, i - 1))}
              disabled={active === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-xl flex items-center justify-center transition disabled:opacity-30 backdrop-blur-sm"
            >
              ←
            </button>
            <button
              onClick={() => setActive(i => Math.min(all.length - 1, i + 1))}
              disabled={active === all.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-xl flex items-center justify-center transition disabled:opacity-30 backdrop-blur-sm"
            >
              →
            </button>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition
                ${active === i ? "border-violet-500" : "border-white/10 hover:border-white/20"}`}
            >
              {img.image_url
                ? <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/5 flex items-center justify-center text-2xl">🛍️</div>
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Share Button ──────────────────────────────────────────────────────────────
function ShareButton({ product }) {
  const { show, ToastContainer } = useToast();
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      show("Link copied to clipboard ✓");
    }
  };
  return (
    <>
      <ToastContainer />
      <button onClick={share}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>
    </>
  );
}

// ── Write Review Modal ────────────────────────────────────────────────────────
function WriteReviewModal({ productId, onClose, onSubmit }) {
  const [rating, setRating]   = useState(0);
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  const submit = async e => {
    e.preventDefault();
    if (rating === 0) { setErr("Please select a star rating"); return; }
    setSaving(true);
    try {
      await onSubmit({ rating, title, body });
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.message || "Failed to submit review");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-white">Write a Review</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white transition text-sm">
            ✕
          </button>
        </div>

        {err && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Your Rating</label>
            <StarRating value={rating} interactive onChange={setRating} size="text-2xl" />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Review Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition" />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Review</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Share your experience with this product…" rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || rating === 0}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50">
              {saving ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Related Products ──────────────────────────────────────────────────────────
function RelatedProducts({ categorySlug, currentSlug, onNavigate }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!categorySlug) return;
    productAPI.list({ category: categorySlug, limit: 4 })
      .then(r => {
        const filtered = (r.data.data || []).filter(p => p.slug !== currentSlug);
        setRelated(filtered.slice(0, 3));
      })
      .catch(() => {});
  }, [categorySlug, currentSlug]);

  if (!related.length) return null;

  return (
    <div className="mt-12 pt-10 border-t border-white/5">
      <h2 className="text-lg font-semibold text-white mb-5">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map(p => (
          <div key={p.uuid}
            onClick={() => onNavigate(p.slug)}
            className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/30 hover:bg-white/[0.05] transition group">
            <div className="h-36 bg-white/5 flex items-center justify-center text-4xl overflow-hidden">
              {p.primary_image
                ? <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : "🛍️"
              }
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-white line-clamp-2 mb-1">{p.name}</p>
              <p className="text-sm font-bold text-violet-400">₹{Number(p.price).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Product Detail Page ──────────────────────────────────────────────────
export default function ProductDetail() {
  const { slug }               = useParams();
  const navigate               = useNavigate();
  const { user }               = useAuth();
  const { addToCart, cart }    = useCart();
  const { show, ToastContainer } = useToast();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [qty, setQty]               = useState(1);
  const [activeTab, setActiveTab]   = useState("description");
  const [showReview, setShowReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const inCart = cart.find(i => i.uuid === product?.uuid);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await productAPI.detail(slug);
      setProduct(r.data.data);
    } catch { navigate("/shop"); }
    finally { setLoading(false); }
  }, [slug, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleAddToCart = async () => {
    if (!user)                    { navigate("/login"); return; }
    if (user.role !== "customer") { show("Only customers can add to cart", "warning"); return; }
    setAddingToCart(true);
    addToCart(product, qty);
    show(`Added ${qty}× ${product.name} to cart ✓`);
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleBuyNow = () => {
    if (!user)                    { navigate("/login"); return; }
    if (user.role !== "customer") { show("Only customers can purchase", "warning"); return; }
    addToCart(product, qty);
    navigate("/checkout");
  };

  const handleReviewSubmit = async (reviewData) => {
    // In production — call API to submit review
    // await reviewAPI.submit({ product_id: product.id, ...reviewData });
    show("Review submitted! It will appear after approval ✓");
    setShowReview(false);
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return null;

  const stock    = Number(product.stock_quantity) || 0;
  const discount = product.compare_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : 0;

  const avgRating = Number(product.rating_avg) || 0;
  const ratingCount = Number(product.rating_count) || 0;

  const tabs = [
    { key: "description", label: "Description" },
    { key: "specs",       label: "Specifications" },
    { key: "reviews",     label: `Reviews (${ratingCount})` },
    { key: "shipping",    label: "Shipping" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ToastContainer />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-white transition">Shop</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category_slug}`}
              className="hover:text-white transition">{product.category_name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* LEFT — Image Gallery */}
        <ImageGallery images={product.images || []} productName={product.name} />

        {/* RIGHT — Product Info */}
        <div className="flex flex-col">

          {/* Category + badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.category_name && (
              <span className="text-xs text-violet-400 uppercase tracking-wider font-semibold">
                {product.category_name}
              </span>
            )}
            {product.is_featured && (
              <span className="text-xs px-2 py-0.5 bg-yellow-400/15 text-yellow-400 border border-yellow-400/20 rounded-full font-medium">
                ⭐ Featured
              </span>
            )}
            {discount >= 10 && (
              <span className="text-xs px-2 py-0.5 bg-green-500/15 text-green-400 border border-green-500/20 rounded-full font-medium">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Product name */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
            {product.name}
          </h1>

          {/* Seller + share */}
          <div className="flex items-center justify-between mb-4">
            {product.shop_name && (
              <p className="text-sm text-gray-400">
                Sold by{" "}
                <span className="text-white font-medium">{product.shop_name}</span>
              </p>
            )}
            <ShareButton product={product} />
          </div>

          {/* Rating summary */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</div>
                <div className="text-xs text-gray-500 mt-0.5">out of 5</div>
              </div>
              <div className="flex-1">
                <StarRating value={avgRating} size="text-base" />
                <p className="text-xs text-gray-500 mt-1">
                  Based on {ratingCount} review{ratingCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-white">
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.compare_price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ₹{Number(product.compare_price).toLocaleString()}
                </span>
                <span className="text-sm text-green-400 font-semibold">
                  Save ₹{(Number(product.compare_price) - Number(product.price)).toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Tax note */}
          <p className="text-xs text-gray-500 mb-4">Inclusive of all taxes · 5% GST applied at checkout</p>

          {/* Stock status */}
          <div className="flex items-center gap-3 mb-5">
            {stock === 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-400 font-medium">Out of stock</span>
              </div>
            ) : stock <= 5 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-sm text-orange-400 font-medium">Only {stock} left!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">In stock</span>
                <span className="text-xs text-gray-500">({stock} available)</span>
              </div>
            )}
            {product.sku && (
              <span className="text-xs text-gray-600 ml-auto">SKU: {product.sku}</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {stock > 0 && user?.role !== "vendor" && user?.role !== "admin" && (
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400">Quantity</label>
                <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/5">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition font-medium">
                    −
                  </button>
                  <span className="px-4 py-2.5 text-white font-semibold min-w-[40px] text-center">
                    {qty}
                  </span>
                  <button onClick={() => setQty(q => Math.min(stock, q + 1))}
                    className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition font-medium">
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">Max {stock}</span>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={addingToCart}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition
                    ${inCart
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "border border-violet-500/50 text-violet-400 hover:bg-violet-500/10"}`}>
                  {addingToCart ? "Adding…" : inCart ? `✓ In cart (${inCart.qty})` : "Add to Cart"}
                </button>
                <button onClick={handleBuyNow}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-violet-500/20">
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Features / quick info */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: "🚚", label: "Free Delivery", sub: "On orders above ₹500" },
              { icon: "↩️", label: "Easy Returns",  sub: "7-day return policy" },
              { icon: "🔒", label: "Secure Payment", sub: "100% safe checkout" },
              { icon: "✅", label: "Verified Seller", sub: "Admin approved vendor" },
            ].map(f => (
              <div key={f.label}
                className="flex items-start gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-base shrink-0">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total sold */}
          {Number(product.total_sold) > 0 && (
            <p className="text-xs text-gray-500">
              🔥 {Number(product.total_sold).toLocaleString()} sold
            </p>
          )}
        </div>
      </div>

      {/* Tabs — Description / Specs / Reviews / Shipping */}
      <div className="border border-white/8 rounded-2xl overflow-hidden mb-8">
        {/* Tab headers */}
        <div className="flex border-b border-white/8 bg-white/[0.02] overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition
                ${activeTab === t.key
                  ? "text-violet-400 border-b-2 border-violet-500 bg-white/[0.03]"
                  : "text-gray-500 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">

          {activeTab === "description" && (
            <div>
              {product.short_description && (
                <p className="text-base text-gray-300 leading-relaxed mb-4 font-medium">
                  {product.short_description}
                </p>
              )}
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided for this product."}
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="space-y-3">
              {[
                ["Product Name",   product.name],
                ["SKU",            product.sku || "—"],
                ["Category",       product.category_name || "—"],
                ["Weight",         product.weight ? `${product.weight} kg` : "—"],
                ["Stock",          `${stock} units`],
                ["Sold",           `${Number(product.total_sold).toLocaleString()} units`],
                ["Vendor",         product.shop_name || "—"],
              ].map(([label, value]) => (
                <div key={label}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm text-white font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {/* Write review button */}
              {user?.role === "customer" && (
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-gray-400">
                    {ratingCount > 0
                      ? `${ratingCount} customer review${ratingCount !== 1 ? "s" : ""}`
                      : "No reviews yet. Be the first!"}
                  </p>
                  <button onClick={() => setShowReview(true)}
                    className="text-sm px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition">
                    Write a Review
                  </button>
                </div>
              )}

              {/* Reviews list */}
              {(product.reviews || []).length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm">No reviews yet for this product.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((r, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400 text-sm font-semibold">
                            {r.customer_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{r.customer_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(r.created_at).toLocaleDateString("en-IN", {
                                year: "numeric", month: "short", day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>
                        <StarRating value={r.rating} size="text-sm" />
                      </div>
                      {r.title && (
                        <p className="text-sm font-semibold text-white mb-1">{r.title}</p>
                      )}
                      <p className="text-sm text-gray-400 leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4">
              {[
                { icon: "🚀", title: "Standard Delivery",   desc: "3-5 business days · Free on orders above ₹500" },
                { icon: "⚡", title: "Express Delivery",    desc: "1-2 business days · ₹99 flat" },
                { icon: "↩️", title: "Easy Returns",        desc: "7-day hassle-free return policy" },
                { icon: "📦", title: "Packaging",           desc: "Products are securely packed by the vendor" },
                { icon: "🔍", title: "Order Tracking",      desc: "Real-time tracking via your orders page" },
              ].map(s => (
                <div key={s.title} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-2xl shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{s.title}</p>
                    <p className="text-sm text-gray-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        categorySlug={product.category_slug}
        currentSlug={slug}
        onNavigate={slug => navigate(`/shop/${slug}`)}
      />

      {/* Write Review Modal */}
      {showReview && (
        <WriteReviewModal
          productId={product.id}
          onClose={() => setShowReview(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}