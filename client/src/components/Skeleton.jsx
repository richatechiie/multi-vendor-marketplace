// ── Skeleton base animation wrapper ──────────────────────────────────────────
function SkeletonBox({ className = "" }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

// ── Product card skeleton ─────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
      {/* Image */}
      <SkeletonBox className="h-44 rounded-none" />
      <div className="p-4 space-y-3">
        {/* Category */}
        <SkeletonBox className="h-2.5 w-1/3" />
        {/* Title */}
        <SkeletonBox className="h-3.5 w-4/5" />
        <SkeletonBox className="h-3.5 w-3/5" />
        {/* Shop name */}
        <SkeletonBox className="h-2.5 w-2/5" />
        {/* Price + button */}
        <div className="flex justify-between items-center pt-2">
          <SkeletonBox className="h-5 w-1/4" />
          <SkeletonBox className="h-7 w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-4">
          <SkeletonBox className={`h-3.5 ${i === 0 ? "w-3/4" : i === cols - 1 ? "w-1/2" : "w-full"}`} />
        </td>
      ))}
    </tr>
  );
}

// ── Stat card skeleton ────────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
      <SkeletonBox className="h-2.5 w-1/2 mb-3" />
      <SkeletonBox className="h-7 w-2/3" />
    </div>
  );
}

// ── Order card skeleton ───────────────────────────────────────────────────────
export function OrderCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <SkeletonBox className="w-10 h-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-3.5 w-1/3" />
            <SkeletonBox className="h-2.5 w-1/4" />
            <div className="flex gap-2 mt-2">
              <SkeletonBox className="h-5 w-16 rounded-full" />
              <SkeletonBox className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <SkeletonBox className="h-7 w-24" />
          <SkeletonBox className="h-7 w-28" />
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <SkeletonBox className="h-2 w-full rounded-full" />
        <div className="flex justify-between mt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonBox key={i} className="h-2 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Product detail skeleton ───────────────────────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <SkeletonBox className="h-4 w-24 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <SkeletonBox className="h-72 md:h-[420px] rounded-2xl" />
        {/* Details */}
        <div className="space-y-4">
          <SkeletonBox className="h-3 w-1/4" />
          <SkeletonBox className="h-8 w-4/5" />
          <SkeletonBox className="h-8 w-3/5" />
          <SkeletonBox className="h-3 w-1/3" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBox key={i} className="h-4 w-4 rounded-full" />
            ))}
          </div>
          <SkeletonBox className="h-10 w-1/3" />
          <div className="space-y-2">
            <SkeletonBox className="h-3 w-full" />
            <SkeletonBox className="h-3 w-4/5" />
            <SkeletonBox className="h-3 w-3/5" />
          </div>
          <div className="flex gap-4 pt-4">
            <SkeletonBox className="h-12 w-32" />
            <SkeletonBox className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vendor dashboard skeleton ─────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Recent orders card */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <SkeletonBox className="h-4 w-32 mb-5" />
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
              <div className="space-y-2">
                <SkeletonBox className="h-3 w-32" />
                <SkeletonBox className="h-2.5 w-44" />
              </div>
              <div className="flex gap-3 items-center">
                <SkeletonBox className="h-3.5 w-16" />
                <SkeletonBox className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Analytics skeleton ────────────────────────────────────────────────────────
export function AnalyticsSkeleton() {
  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Chart placeholders */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6">
        <SkeletonBox className="h-4 w-36 mb-5" />
        <SkeletonBox className="h-56 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <SkeletonBox className="h-4 w-28 mb-5" />
          <SkeletonBox className="h-48 w-full rounded-xl" />
        </div>
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <SkeletonBox className="h-4 w-28 mb-5" />
          <SkeletonBox className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Profile skeleton ──────────────────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
      <SkeletonBox className="h-5 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={i < 2 ? "md:col-span-2" : ""}>
            <SkeletonBox className="h-3 w-24 mb-2" />
            <SkeletonBox className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <SkeletonBox className="h-10 w-32 mt-5" />
    </div>
  );
}

// ── Category list skeleton ────────────────────────────────────────────────────
export function CategorySkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
      <table className="w-full">
        <tbody>
          {Array.from({ length: 5 }, (_, i) => (
            <TableRowSkeleton key={i} cols={3} />
          ))}
        </tbody>
      </table>
    </div>
  );
}