import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-5 shadow-[var(--iw-shadow-1)] transition-[box-shadow,transform,border-color] duration-300 hover:scale-[1.02] hover:shadow-[var(--iw-shadow-2)]">
      <p className="text-sm font-medium text-[var(--iw-text-2)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--iw-text)]">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-snug text-[var(--iw-text-3)]">{hint}</p> : null}
    </div>
  )
}
