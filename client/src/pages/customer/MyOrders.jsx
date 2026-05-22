import { useState, useEffect } from "react";
import { orderAPI } from "../../api";
import { useToast } from "../../hooks/useToast.jsx";
import Badge from "../../components/Badge";
import { OrderCardSkeleton } from "../../components/Skeleton";

// ── Order status steps ────────────────────────────────────────────────────────
const ORDER_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: "🛒",
    desc: "Your order has been placed successfully.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "✅",
    desc: "Seller has confirmed your order.",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "⚙️",
    desc: "Your order is being prepared.",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "🚚",
    desc: "Your order is on the way.",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "📦",
    desc: "Order delivered successfully.",
  },
];

const CANCELLED_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: "🛒",
    desc: "Order was placed.",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: "❌",
    desc: "This order was cancelled.",
  },
];

// ── Get step index for current status ─────────────────────────────────────────
function getStepIndex(status) {
  const order = ["pending", "confirmed", "processing", "shipped", "delivered"];
  return order.indexOf(status);
}

// ── Timeline Component ────────────────────────────────────────────────────────
function OrderTimeline({ status, createdAt, items }) {
  const isCancelled = status === "cancelled" || status === "refunded";
  const steps = isCancelled ? CANCELLED_STEPS : ORDER_STEPS;
  const currentStep = isCancelled ? 1 : getStepIndex(status);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-white mb-5">Order Timeline</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-white/5" />

        <div className="space-y-6">
          {steps.map((step, i) => {
            const isDone =
              i < currentStep || (i === currentStep && status !== "pending");
            const isActive = i === currentStep;
            const isFuture = i > currentStep;
            const isCancelStep = step.key === "cancelled";

            return (
              <div key={step.key} className="relative flex gap-4">
                {/* Step circle */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 border-2 transition-all
                  ${
                    isCancelStep
                      ? "bg-red-900/40 border-red-500/50 text-red-400"
                      : isDone || isActive
                        ? "bg-violet-900/40 border-violet-500/60 text-violet-300"
                        : "bg-white/[0.03] border-white/10 text-gray-600"
                  }`}
                >
                  {isDone && !isActive && !isCancelStep ? (
                    <span className="text-emerald-400 text-sm font-bold">
                      ✓
                    </span>
                  ) : (
                    step.icon
                  )}
                  {/* Pulse animation for active step */}
                  {isActive && !isCancelled && (
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/40 animate-ping" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold
                      ${
                        isCancelStep
                          ? "text-red-400"
                          : isDone || isActive
                            ? "text-white"
                            : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </p>
                    {/* Show timestamp for completed steps */}
                    {(isDone || isActive) && i === 0 && (
                      <span className="text-xs text-gray-500">
                        {new Date(createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 leading-relaxed
                    ${isDone || isActive ? "text-gray-400" : "text-gray-700"}`}
                  >
                    {step.desc}
                  </p>

                  {/* Tracking numbers for shipped items */}
                  {step.key === "shipped" && (isActive || isDone) && items && (
                    <div className="mt-2 space-y-1">
                      {items
                        .filter((item) => item.tracking_number)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs bg-white/[0.03] border border-white/8 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-gray-500">Tracking:</span>
                            <code className="text-violet-400 font-medium">
                              {item.tracking_number}
                            </code>
                            <span className="text-gray-600">
                              — {item.product_name}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Item Status List ──────────────────────────────────────────────────────────
function ItemStatusList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-white mb-3">Items</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 px-4 bg-white/[0.02] border border-white/5 rounded-xl text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  "🛍️"
                )}
              </div>
              <div>
                <p className="text-gray-200 font-medium line-clamp-1">
                  {item.product_name}
                </p>
                <p className="text-gray-500 text-xs">
                  Qty: {item.quantity} · by {item.shop_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-semibold text-white">
                ₹{Number(item.total_price).toLocaleString()}
              </span>
              <Badge status={item.item_status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const subtotal = Number(order.subtotal || 0);
  const tax = Number(order.tax_amount || 0);
  const shipping = Number(order.shipping_cost || 0);
  const total = Number(order.total_amount || 0);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Order Details</h2>
            <code className="text-xs text-violet-400">
              {order.order_number}
            </code>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Status badges */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Badge status={order.status} />
            <Badge status={order.payment_status} />
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Order Timeline */}
          <OrderTimeline
            status={order.status}
            createdAt={order.created_at}
            items={order.items}
          />

          {/* Items */}
          <ItemStatusList items={order.items} />

          {/* Price Breakdown */}
          <div className="mt-5 bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
              Price Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax (5%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-400">Free</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-white text-base border-t border-white/5 pt-2 mt-2">
                <span>Total</span>
                <span className="text-violet-400">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_name && (
            <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">
                Shipping Address
              </h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="text-white font-medium">{order.shipping_name}</p>
                {order.shipping_phone && <p>📞 {order.shipping_phone}</p>}
                {order.shipping_email && <p>✉️ {order.shipping_email}</p>}
                <p>
                  {[
                    order.shipping_address,
                    order.shipping_city,
                    order.shipping_state,
                    order.shipping_country,
                    order.shipping_zip,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Payment</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 capitalize">
                {order.payment_method || "Cash on Delivery"}
              </span>
              <Badge status={order.payment_status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState("all");
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    orderAPI
      .myOrders()
      .then((r) => setOrders(r.data.data || []))
      .catch(() => show("Failed to load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (uuid) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderAPI.cancel(uuid);
      setOrders((os) =>
        os.map((o) => (o.uuid === uuid ? { ...o, status: "cancelled" } : o)),
      );
      show("Order cancelled successfully");
      if (detail?.uuid === uuid)
        setDetail((d) => ({ ...d, status: "cancelled" }));
    } catch (ex) {
      show(ex.response?.data?.message || "Failed to cancel", "error");
    }
  };

  const openDetail = async (o) => {
    setLoadingDetail(true);
    try {
      const r = await orderAPI.detail(o.uuid);
      setDetail(r.data.data);
    } catch {
      setDetail(o);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusColor = {
    pending: "text-yellow-400",
    confirmed: "text-blue-400",
    processing: "text-purple-400",
    shipped: "text-orange-400",
    delivered: "text-emerald-400",
    cancelled: "text-red-400",
    refunded: "text-gray-400",
  };
  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-7 w-32 bg-white/5 rounded-xl animate-pulse mb-2" />
          <div className="h-4 w-24 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ToastContainer />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">My Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-white/5 mb-6 overflow-x-auto">
        {[
          "all",
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition capitalize font-medium
              ${
                filter === s
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1.5 text-xs">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div
              key={o.uuid}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:border-white/12 transition"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Order info */}
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0`}
                  >
                    {o.status === "delivered"
                      ? "📦"
                      : o.status === "shipped"
                        ? "🚚"
                        : o.status === "cancelled"
                          ? "❌"
                          : o.status === "processing"
                            ? "⚙️"
                            : o.status === "confirmed"
                              ? "✅"
                              : "🛒"}
                  </div>
                  <div>
                    <code className="text-violet-400 text-sm font-medium">
                      {o.order_number}
                    </code>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge status={o.status} />
                      <Badge status={o.payment_status} />
                    </div>
                  </div>
                </div>

                {/* Price + actions */}
                <div className="flex flex-col items-end gap-3">
                  <span className="text-xl font-bold text-white">
                    ₹{Number(o.total_amount).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetail(o)}
                      disabled={loadingDetail}
                      className="text-xs px-4 py-1.5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:border-white/20 transition"
                    >
                      {loadingDetail ? "Loading…" : "View Details"}
                    </button>
                    {o.status === "pending" && (
                      <button
                        onClick={() => cancel(o.uuid)}
                        className="text-xs px-4 py-1.5 border border-red-800/50 text-red-400 rounded-lg hover:bg-red-900/20 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mini timeline progress bar */}
              {o.status !== "cancelled" && o.status !== "refunded" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    {ORDER_STEPS.map((step, i) => {
                      const currentIdx = getStepIndex(o.status);
                      const isDone = i <= currentIdx;
                      return (
                        <div
                          key={step.key}
                          className="flex items-center flex-1"
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 transition-all
                            ${isDone ? "bg-violet-500" : "bg-white/10"}`}
                          />
                          {i < ORDER_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-px transition-all
                              ${i < currentIdx ? "bg-violet-500" : "bg-white/10"}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {ORDER_STEPS.map((step, i) => {
                      const currentIdx = getStepIndex(o.status);
                      return (
                        <span
                          key={step.key}
                          className={`text-[10px] ${i === 0 ? "text-left" : i === ORDER_STEPS.length - 1 ? "text-right" : "text-center"} flex-1
                            ${i <= currentIdx ? "text-violet-400" : "text-gray-700"}`}
                        >
                          {step.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled bar */}
              {(o.status === "cancelled" || o.status === "refunded") && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <div className="flex-1 h-px bg-red-900/40" />
                    <span>Order {o.status}</span>
                    <div className="flex-1 h-px bg-red-900/40" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <OrderDetailModal order={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
