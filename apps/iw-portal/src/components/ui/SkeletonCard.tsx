export function SkeletonCard({ lines = 3 }: { lines?: 2 | 3 | 4 }) {
  return (
    <div className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4">
      {/* Simulated label row */}
      <div className="iw-shimmer-bar mb-3 h-2.5 w-1/4 rounded-full" />
      {/* Simulated value row */}
      <div className="iw-shimmer-bar mb-3 h-6 w-1/2 rounded-md" />
      {/* Body lines */}
      <div className="iw-shimmer-bar mb-2 h-2.5 w-full rounded-full" />
      {lines >= 3 && <div className="iw-shimmer-bar mb-2 h-2.5 w-5/6 rounded-full" />}
      {lines >= 4 && <div className="iw-shimmer-bar h-2.5 w-2/3 rounded-full" />}
    </div>
  )
}
