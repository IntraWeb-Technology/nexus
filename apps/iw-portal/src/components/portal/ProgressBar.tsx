export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[var(--iw-text-3)]">{label ?? 'Overall completion'}</span>
        <span className="text-sm font-semibold text-[var(--iw-text)]">{v}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--iw-slate-2)]"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Overall completion'}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--iw-teal-dim)] to-[var(--iw-teal)] transition-[width] duration-700 ease-out"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  )
}
