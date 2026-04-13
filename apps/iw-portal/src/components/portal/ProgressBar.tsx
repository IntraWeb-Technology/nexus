export function ProgressBar({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div className="h-2 w-full overflow-hidden rounded border border-[var(--iw-border)] bg-[var(--iw-slate-2)]">
      <div
        className="h-full bg-[var(--iw-teal)] transition-[width]"
        style={{ width: `${v}%` }}
      />
    </div>
  )
}
