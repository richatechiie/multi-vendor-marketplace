// ════════════════════════════════════════════════════════
// NotFound.jsx  →  src/pages/NotFound.jsx
// ════════════════════════════════════════════════════════
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-6">
      {/* Big number */}
      <div
        className="font-display font-black mb-6 select-none"
        style={{
          fontSize: "clamp(6rem, 20vw, 12rem)",
          lineHeight: 1,
          background:
            "linear-gradient(135deg, rgba(193,18,31,0.25) 0%, rgba(102,155,188,0.15) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </div>

      <h1
        className="font-display font-bold text-3xl mb-3"
        style={{ color: "#FDF0D5" }}
      >
        Page Not Found
      </h1>
      <p className="mb-10 max-w-sm" style={{ color: "#b8a88a" }}>
        The page you're looking for has moved, was deleted, or never existed.
      </p>

      <Link
        to="/"
        className="px-8 py-3.5 rounded-xl font-semibold text-[#FDF0D5] transition-all duration-300"
        style={{ background: "linear-gradient(135deg, #780000, #C1121F)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "0 0 28px rgba(193,18,31,0.45)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      >
        ← Go Home
      </Link>
    </div>
  );
}
