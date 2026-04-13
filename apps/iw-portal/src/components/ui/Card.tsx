import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--iw-radius-card)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)] p-4 shadow-[var(--iw-shadow-1)] transition-[box-shadow,transform,border-color] duration-300 hover:shadow-[var(--iw-shadow-2)] ${className}`}
    >
      {children}
    </div>
  )
}
