import type { ReactNode } from 'react'

export function EmptyState({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--iw-text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--iw-text-2)]">{description}</p>
    </div>
  )
}
