import type { ReactNode } from 'react'

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="iw-page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--hairline-2)] bg-[var(--surface)] p-6 text-sm text-[var(--iw-text-2)]">
      {children}
    </div>
  )
}

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="iw-card">
      <p className="iw-label">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--iw-text)]">{value}</p>
    </div>
  )
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}
