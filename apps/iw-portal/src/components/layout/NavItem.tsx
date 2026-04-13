import Link from 'next/link'
import type { ReactNode } from 'react'

export function NavItem({
  href,
  icon,
  label,
  badge,
}: {
  href: string
  icon: ReactNode
  label: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--iw-text-2)] hover:bg-[var(--iw-slate-3)] hover:text-[var(--iw-text)]"
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="min-w-[1.25rem] rounded bg-[var(--iw-teal-dim)] px-1.5 text-center text-[10px] font-medium text-[var(--iw-teal-light)]">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  )
}
