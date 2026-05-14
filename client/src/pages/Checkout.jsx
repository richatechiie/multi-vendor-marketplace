// Checkout.jsx  →  src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../api";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { user }                   = useAuth();
  const { cart, clearCart, total } = useCart();
  const { show, ToastContainer }   = useToast();
  const navigate                   = useNavigate();

  const [ship, setShip] = useState({
    name: user?.name || "", email: user?.email || "",
    phone: "", address: "", city: "", state: "",
    country: "India", zip: "",
  });
  const [loading, setLoading] = useState(false);
  const sf = k => e => setShip(s => ({ ...s, [k]: e.target.value }));

  const tax      = total * 0.05;
  const shipping = total >= 500 ? 0 : 50;
  const grandTotal = total + tax + shipping;

  if (!cart.length) return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
        style={{ background: "rgba(0,48,73,0.5)", border: "1px solid rgba(102,155,188,0.15)" }}>
        🛒
      </div>
      <h2 className="font-display font-bold text-3xl mb-3" style={{ color: "#FDF0D5" }}>Cart is empty</h2>
      <p className="mb-8" style={{ color: "#b8a88a" }}>Add products before checking out.</p>
      <button onClick={() => navigate("/shop")}
        className="px-8 py-3 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300"
        style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(193,18,31,0.4)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
        Browse Shop →
      </button>
    </div>
  );

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderAPI.place({
        items: cart.map(i => ({ product_uuid: i.uuid, quantity: i.qty })),
        shipping: ship,
        payment_method: "cod",
      });
      clearCart();
      show("Order placed successfully! 🎉");
      setTimeout(() => navigate("/orders"), 1500);
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to place order", "error");
    } finally { setLoading(false); }
  };

  const fields = [
    ["name","Full Name","text",true],
    ["email","Email","email",false],
    ["phone","Phone","tel",false],
    ["address","Address","text",true],
    ["city","City","text",true],
    ["state","State","text",false],
    ["country","Country","text",true],
    ["zip","ZIP Code","text",false],
  ];

  const inputStyle = {
    background: "rgba(0,48,73,0.5)",
    border: "1px solid rgba(102,155,188,0.2)",
    color: "#FDF0D5",
    borderRadius: "0.75rem",
    padding: "0.65rem 1rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const focusInput = e => { e.target.style.borderColor = "rgba(193,18,31,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(193,18,31,0.08)"; };
  const blurInput  = e => { e.target.style.borderColor = "rgba(102,155,188,0.2)"; e.target.style.boxShadow = "none"; };
  const labelStyle = { color: "#669BBC", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.5rem" };
  const cardStyle  = { background: "rgba(0,36,56,0.7)", border: "1px solid rgba(102,155,188,0.12)" };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <ToastContainer />

      <div className="mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#C1121F" }}>Marketplace</span>
        <h1 className="font-display font-bold text-4xl mt-1" style={{ color: "#FDF0D5" }}>Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Shipping form */}
        <form onSubmit={submit} className="lg:col-span-2">
          <div className="rounded-2xl p-7" style={cardStyle}>
            <h2 className="font-display font-bold text-xl mb-6" style={{ color: "#FDF0D5" }}>
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(([key, label, type, req]) => (
                <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={ship[key]} onChange={sf(key)} required={req}
                    style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-7 py-4 rounded-xl font-semibold text-[#FDF0D5] text-base transition-all duration-300 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 0 32px rgba(193,18,31,0.4)")}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#FDF0D5] animate-spin" />
                  Placing order…
                </span>
              ) : "Place Order — Cash on Delivery"}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        <div className="rounded-2xl p-6 h-fit" style={cardStyle}>
          <h2 className="font-display font-bold text-xl mb-5" style={{ color: "#FDF0D5" }}>Order Summary</h2>

          <div className="space-y-3 mb-5">
            {cart.map(i => (
              <div key={i.uuid} className="flex justify-between text-sm">
                <span className="line-clamp-1 flex-1 mr-3" style={{ color: "#b8a88a" }}>
                  {i.name} × {i.qty}
                </span>
                <span className="font-medium whitespace-nowrap" style={{ color: "#e8d9b8" }}>
                  ₹{(Number(i.price) * i.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4" style={{ borderTop: "1px solid rgba(102,155,188,0.1)" }}>
            {[
              ["Subtotal", `₹${total.toLocaleString()}`],
              ["Tax (5%)", `₹${tax.toFixed(2)}`],
              ["Shipping", total >= 500 ? "Free" : "₹50"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "#b8a88a" }}>{label}</span>
                <span style={{ color: label === "Shipping" && total >= 500 ? "#7bbfa0" : "#e8d9b8" }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-display font-black text-xl"
              style={{ borderTop: "1px solid rgba(102,155,188,0.1)" }}>
              <span style={{ color: "#FDF0D5" }}>Total</span>
              <span style={{ color: "#C1121F" }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* COD badge */}
          <div className="mt-5 flex items-center gap-2 text-xs rounded-xl p-3"
            style={{ background: "rgba(102,155,188,0.08)", border: "1px solid rgba(102,155,188,0.15)" }}>
            <span>💵</span>
            <span style={{ color: "#b8a88a" }}>Cash on Delivery — pay when your order arrives.</span>
          </div>
        </div>
      </div>
    </div>
  );
}