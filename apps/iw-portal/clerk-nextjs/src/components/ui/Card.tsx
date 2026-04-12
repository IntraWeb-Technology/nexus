import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[12px] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4 ${className}`}
    >
      {children}
    </div>
  )
}
