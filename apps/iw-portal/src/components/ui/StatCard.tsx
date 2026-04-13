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
    <div className="rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-2)] p-4">
      <p className="iw-label mb-1">{label}</p>
      <p className="text-lg font-medium text-[var(--iw-text)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--iw-text-3)]">{hint}</p> : null}
    </div>
  )
}
