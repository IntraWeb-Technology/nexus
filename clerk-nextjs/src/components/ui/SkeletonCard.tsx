export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4">
      <div className="mb-3 h-3 w-1/3 rounded bg-[var(--iw-slate-4)]" />
      <div className="mb-2 h-3 w-full rounded bg-[var(--iw-slate-4)]" />
      <div className="h-3 w-2/3 rounded bg-[var(--iw-slate-4)]" />
    </div>
  )
}
