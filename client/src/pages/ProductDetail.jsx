
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../api";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";

export default function ProductDetail() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { addToCart } = useCart();
  const { show, ToastContainer } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]         = useState(1);

  useEffect(() => {
    productAPI.detail(slug)
      .then(r => setProduct(r.data.data))
      .catch(() => navigate("/shop"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "customer") { show("Only customers can add to cart", "warning"); return; }
    addToCart(product, qty);
    show(`Added ${qty}× ${product.name} to cart ✓`);
  };

  if (loading) return <Spinner />;
  if (!product) return null;

  const stock    = Number(product.stock_quantity) || 0;
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const cardStyle = { background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <ToastContainer />

      <button
        onClick={() => navigate("/shop")}
        className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors duration-200"
        style={{ color: "#b8a88a" }}
        onMouseEnter={e => e.currentTarget.style.color = "#FDF0D5"}
        onMouseLeave={e => e.currentTarget.style.color = "#b8a88a"}
      >
        ← Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Image */}
        <div className="rounded-2xl h-72 md:h-[420px] flex items-center justify-center text-8xl overflow-hidden relative"
          style={cardStyle}>
          {product.images?.[0]?.image_url ? (
            <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span>🛍️</span>
          )}
          {discount > 0 && (
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #780000, #C1121F)", color: "#FDF0D5" }}>
              -{discount}%
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.category_name && (
            <span className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#669BBC" }}>
              {product.category_name}
            </span>
          )}

          <h1 className="font-display font-black text-3xl md:text-4xl leading-tight mb-3" style={{ color: "#FDF0D5" }}>
            {product.name}
          </h1>

          {product.shop_name && (
            <p className="text-sm mb-4" style={{ color: "#b8a88a" }}>
              Sold by <span style={{ color: "#669BBC", fontWeight: 600 }}>{product.shop_name}</span>
            </p>
          )}

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{ color: i < Math.round(product.rating_avg) ? "#C1121F" : "rgba(253,240,213,0.15)", fontSize: "14px" }}>★</span>
                ))}
              </div>
              <span className="text-sm" style={{ color: "#b8a88a" }}>
                {product.rating_avg} ({product.rating_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-display font-black text-4xl" style={{ color: "#FDF0D5" }}>
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.compare_price && (
              <span className="line-through text-lg" style={{ color: "#b8a88a" }}>
                ₹{Number(product.compare_price).toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "#b8a88a" }}>
            {product.description || product.short_description || "No description available."}
          </p>

          {/* Stock */}
          <div className="flex items-center gap-3 mb-6">
            <Badge status={stock > 0 ? "active" : "inactive"} />
            <span className="text-sm" style={{ color: "#b8a88a" }}>
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Qty + Add to Cart */}
          {stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(102,155,188,0.2)", background: "rgba(0,48,73,0.4)" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-lg transition-colors duration-150"
                  style={{ color: "#669BBC" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  −
                </button>
                <span className="px-5 py-3 text-sm font-bold" style={{ color: "#FDF0D5" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock, q + 1))}
                  className="px-4 py-3 text-lg transition-colors duration-150"
                  style={{ color: "#669BBC" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(102,155,188,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  +
                </button>
              </div>

              <button onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 28px rgba(193,18,31,0.45)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                Add to Cart
              </button>
            </div>
          )}

          {product.sku && (
            <p className="text-xs mt-5" style={{ color: "rgba(184,168,138,0.5)" }}>SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "#FDF0D5" }}>
            Customer Reviews
          </h2>
          <div className="space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold" style={{ color: "#e8d9b8" }}>{r.customer_name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, j) => (
                      <span key={j} style={{ color: j < r.rating ? "#C1121F" : "rgba(253,240,213,0.15)", fontSize: "13px" }}>★</span>
                    ))}
                  </div>
                </div>
                {r.title && <p className="font-medium text-sm mb-1" style={{ color: "#FDF0D5" }}>{r.title}</p>}
                <p className="text-sm leading-relaxed" style={{ color: "#b8a88a" }}>{r.body}</p>
                <p className="text-xs mt-3" style={{ color: "rgba(184,168,138,0.4)" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}