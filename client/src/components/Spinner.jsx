// ─── Spinner.jsx ─────────────────────────────────────────────────────────────
// Replace your existing Spinner component with this.
 
export function Spinner({ text = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-5">
      <div className="relative w-12 h-12">
        {/* Track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid rgba(102,155,188,0.1)" }}
        />
        {/* Spinner arc */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "2px solid transparent",
            borderTopColor: "#C1121F",
            borderRightColor: "rgba(193,18,31,0.3)",
          }}
        />
        {/* Inner dot */}
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: "rgba(193,18,31,0.15)" }}
        />
      </div>
      <p className="text-sm font-medium" style={{ color: "#b8a88a" }}>{text}</p>
    </div>
  );
}
 
export default Spinner;
 