'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

function pathMatches(pathname: string, href: string) {
  if (pathname === href) return true
  if (href === '/') return false
  return pathname.startsWith(`${href}/`)
}

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
  const pathname = usePathname()
  const active = pathMatches(pathname, href)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors duration-200 ${
        active
          ? 'border-l-2 border-[var(--iw-teal)] bg-[var(--iw-slate-3)] pl-[6px] text-[var(--iw-text)] shadow-[var(--iw-shadow-1)]'
          : 'border-l-2 border-transparent text-[var(--iw-text-2)] hover:bg-[var(--iw-slate-3)]/70 hover:text-[var(--iw-text)]'
      }`}
    >
      <span className={`shrink-0 ${active ? 'text-[var(--iw-teal-light)]' : 'opacity-70'}`}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="min-w-[1.25rem] rounded bg-[var(--iw-teal-dim)] px-1.5 text-center text-[10px] font-medium text-[var(--iw-teal-light)]">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  )
}
