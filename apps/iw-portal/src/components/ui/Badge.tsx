import type { ReactNode } from 'react'

const variants: Record<string, string> = {
  teal: 'bg-[var(--iw-teal-dim)] text-[var(--iw-teal-light)] border border-[var(--iw-border-2)]',
  green: 'bg-[var(--iw-slate-2)] text-[var(--iw-green)] border border-[var(--iw-border)]',
  amber: 'bg-[var(--iw-slate-2)] text-[var(--iw-amber)] border border-[var(--iw-border)]',
  red: 'bg-[var(--iw-slate-2)] text-[var(--iw-red)] border border-[var(--iw-border)]',
  gray: 'bg-[var(--iw-slate-2)] text-[var(--iw-text-2)] border border-[var(--iw-border)]',
}

export function Badge({
  variant = 'teal',
  children,
}: {
  variant?: keyof typeof variants
  children: ReactNode
}) {
  return (
    <span
      className={`iw-fade-in inline-block rounded px-2 py-0.5 text-[10px] font-medium leading-tight ${variants[variant] ?? variants.teal}`}
    >
      {children}
    </span>
  )
}
