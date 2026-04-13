'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

function pathMatches(pathname: string, href: string) {
  if (pathname === href) return true
  if (href === '/') return false
  return pathname.startsWith(`${href}/`)
}

function Item({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const pathname = usePathname()
  const active = pathMatches(pathname, href)
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors duration-200 ${
        active ? 'text-[var(--iw-teal-light)]' : 'text-[var(--iw-text-2)] hover:text-[var(--iw-text)]'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--iw-border)] bg-[var(--iw-slate-2)] pb-safe transition-[background-color,border-color] duration-300 md:hidden">
      <Item
        href="/dashboard"
        label="Home"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="1.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
            <rect x="10.5" y="1.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
            <rect x="1.5" y="10.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
            <rect x="10.5" y="10.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        }
      />
      <Item
        href="/messages"
        label="Messages"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2l2 2 2-2h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          </svg>
        }
      />
      <Item
        href="/notifications"
        label="Alerts"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14.5 11V8a5.5 5.5 0 0 0-11 0v3L2 13.5h14L14.5 11Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
            <path d="M7 15.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        }
      />
      <Item
        href="/documents"
        label="Docs"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 2h7l4 4v10a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 4 16V2.5A.5.5 0 0 1 5 2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
            <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
            <path d="M7 9.5h4M7 12h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        }
      />
      <Item
        href="/billing"
        label="Billing"
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
            <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.25" />
            <path d="M5 11h2.5M11 11h2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        }
      />
    </nav>
  )
}
