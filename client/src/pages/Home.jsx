import { Link } from "react-router-dom";

const features = [
  { icon: "✦", title: "Verified Vendors",  desc: "Every seller is reviewed and approved by our admin team before going live." },
  { icon: "✦", title: "Smart Orders",      desc: "Multi-vendor cart — order from different shops in one seamless checkout." },
  { icon: "✦", title: "Commission System", desc: "Transparent earnings — vendors see exactly what they make on every sale." },
  { icon: "✦", title: "Live Analytics",    desc: "Vendors and admins get real-time dashboards with sales and performance data." },
];

const steps = [
  { num: "01", title: "Create Account",   desc: "Register as a customer or vendor in seconds." },
  { num: "02", title: "Browse or List",   desc: "Shop thousands of products or list your own." },
  { num: "03", title: "Order & Earn",     desc: "Place orders or receive them — both sides win." },
];

export default function Home() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center">

        {/* Layered background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep navy base handled by body */}
          {/* Crimson glow blob — top right */}
          <div
            className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(193,18,31,0.18) 0%, transparent 70%)" }}
          />
          {/* Steel blue glow — bottom left */}
          <div
            className="absolute bottom-0 -left-48 w-[480px] h-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(102,155,188,0.12) 0%, transparent 70%)" }}
          />
          {/* Diagonal rule lines for texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                #FDF0D5 0px,
                #FDF0D5 1px,
                transparent 1px,
                transparent 40px
              )`,
            }}
          />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{ background: "linear-gradient(to bottom, transparent, #001f30)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-28 w-full">
          <div className="max-w-4xl">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-10 animate-fade-up"
              style={{
                border: "1px solid rgba(193,18,31,0.35)",
                background: "rgba(193,18,31,0.08)",
                color: "#C1121F",
              }}
            >
              <span
                className="relative w-1.5 h-1.5 rounded-full pulse-ring"
                style={{ background: "#C1121F" }}
              />
              Multi-Vendor Marketplace Platform
            </div>

            {/* Headline */}
            <h1
              className="font-display font-black leading-[1.05] tracking-tight mb-8 animate-fade-up animate-delay-100"
              style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", color: "#FDF0D5" }}
            >
              The marketplace
              <br />
              for{" "}
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(135deg, #C1121F 0%, #e63946 50%, #780000 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                independent sellers
              </span>
            </h1>

            <p
              className="text-lg md:text-xl max-w-xl leading-relaxed mb-12 animate-fade-up animate-delay-200"
              style={{ color: "#b8a88a" }}
            >
              Buy from thousands of verified vendors or open your own shop.
              Built with a powerful commission system and real-time analytics.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap animate-fade-up animate-delay-300">
              <Link
                to="/shop"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[#FDF0D5] text-base transition-all duration-300 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 32px rgba(193,18,31,0.45)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                Browse Shop
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200"
                style={{
                  border: "1px solid rgba(253,240,213,0.2)",
                  color: "#e8d9b8",
                  background: "rgba(253,240,213,0.04)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.4)";
                  e.currentTarget.style.background = "rgba(253,240,213,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.2)";
                  e.currentTarget.style.background = "rgba(253,240,213,0.04)";
                }}
              >
                Start Selling
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 flex items-center gap-12 animate-fade-up animate-delay-400">
              {[["36+","API Endpoints"],["10","DB Tables"],["3","User Roles"]].map(([n, l]) => (
                <div key={l} className="flex flex-col">
                  <span
                    className="font-display font-bold text-3xl"
                    style={{ color: "#FDF0D5" }}
                  >
                    {n}
                  </span>
                  <span className="text-xs tracking-wider uppercase mt-1" style={{ color: "#b8a88a" }}>
                    {l}
                  </span>
                </div>
              ))}
              <div className="h-8 w-px ml-2" style={{ background: "rgba(253,240,213,0.1)" }} />
              <div
                className="text-xs uppercase tracking-wider"
                style={{ color: "rgba(253,240,213,0.35)" }}
              >
                Built from scratch
              </div>
            </div>
          </div>

          {/* Decorative floating card */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block w-72 rounded-2xl p-6 animate-fade-up animate-delay-500"
            style={{
              background: "rgba(0,48,73,0.6)",
              border: "1px solid rgba(102,155,188,0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-[#FDF0D5]"
                style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
              >
                ✦
              </div>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#FDF0D5" }}>Live Order</div>
                <div className="text-xs" style={{ color: "#669BBC" }}>Just now</div>
              </div>
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: "#e8d9b8" }}>
              Handcrafted Leather Bag
            </div>
            <div className="text-xs mb-4" style={{ color: "#b8a88a" }}>by Artisan Shop</div>
            <div className="flex items-center justify-between">
              <span className="font-bold font-display" style={{ color: "#FDF0D5" }}>₹4,299</span>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(102,155,188,0.15)", color: "#669BBC" }}
              >
                Confirmed ✓
              </span>
            </div>
            <div
              className="mt-4 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(253,240,213,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: "65%", background: "linear-gradient(to right, #780000, #C1121F)" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: "#669BBC" }}>Processing</span>
              <span className="text-[10px]" style={{ color: "#b8a88a" }}>65%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-28">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1" style={{ background: "rgba(253,240,213,0.08)" }} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#C1121F" }}
          >
            Platform Features
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(253,240,213,0.08)" }} />
        </div>

        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4" style={{ color: "#FDF0D5" }}>
            Everything you need
          </h2>
          <p style={{ color: "#b8a88a" }}>A complete marketplace built from scratch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card-hover rounded-2xl p-6 cursor-default"
              style={{
                background: "rgba(0,48,73,0.35)",
                border: "1px solid rgba(102,155,188,0.12)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-5"
                style={{ background: "rgba(193,18,31,0.12)", color: "#C1121F" }}
              >
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: "#FDF0D5" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#b8a88a" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "rgba(0,30,46,0.6)" }}
      >
        {/* Decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(102,155,188,0.2), transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(102,155,188,0.2), transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1" style={{ background: "rgba(253,240,213,0.08)" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#669BBC" }}>
              How It Works
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(253,240,213,0.08)" }} />
          </div>

          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4" style={{ color: "#FDF0D5" }}>
              Three simple steps
            </h2>
            <p style={{ color: "#b8a88a" }}>Get started in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div
              className="absolute top-8 left-[20%] right-[20%] h-px hidden md:block"
              style={{ background: "linear-gradient(to right, rgba(193,18,31,0.3), rgba(102,155,188,0.3))" }}
            />

            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center group">
                {/* Step number bubble */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 font-display font-black text-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: i === 0
                      ? "linear-gradient(135deg, #780000, #C1121F)"
                      : i === 1
                      ? "linear-gradient(135deg, #003049, #669BBC)"
                      : "rgba(253,240,213,0.08)",
                    color: "#FDF0D5",
                    border: i === 2 ? "1px solid rgba(253,240,213,0.15)" : "none",
                    boxShadow: i === 0 ? "0 8px 24px rgba(193,18,31,0.3)" : "none",
                  }}
                >
                  {s.num}
                </div>
                <h3 className="font-display font-bold text-xl mb-3" style={{ color: "#FDF0D5" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#b8a88a" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div
          className="relative rounded-3xl p-14 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(120,0,0,0.4) 0%, rgba(0,48,73,0.6) 50%, rgba(0,48,73,0.8) 100%)",
            border: "1px solid rgba(193,18,31,0.25)",
          }}
        >
          {/* Background effects */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 30% 50%, rgba(193,18,31,0.15) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 70% 50%, rgba(102,155,188,0.1) 0%, transparent 60%)",
            }}
          />
          {/* Top decorative rule */}
          <div
            className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(193,18,31,0.5), transparent)" }}
          />

          <div className="relative">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-5 px-3 py-1 rounded-full"
              style={{ background: "rgba(193,18,31,0.12)", color: "#C1121F" }}
            >
              Join Bazaar
            </span>

            <h2
              className="font-display font-black text-4xl md:text-5xl mb-4"
              style={{ color: "#FDF0D5" }}
            >
              Ready to start?
            </h2>
            <p className="mb-10 max-w-md mx-auto" style={{ color: "#b8a88a" }}>
              Join thousands of buyers and sellers on Bazaar — the marketplace that works for everyone.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="px-9 py-3.5 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 32px rgba(193,18,31,0.45)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                Create Account
              </Link>
              <Link
                to="/shop"
                className="px-9 py-3.5 rounded-xl font-semibold transition-all duration-200"
                style={{
                  border: "1px solid rgba(253,240,213,0.2)",
                  color: "#e8d9b8",
                  background: "rgba(253,240,213,0.04)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.4)";
                  e.currentTarget.style.background = "rgba(253,240,213,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(253,240,213,0.2)";
                  e.currentTarget.style.background = "rgba(253,240,213,0.04)";
                }}
              >
                Explore Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}