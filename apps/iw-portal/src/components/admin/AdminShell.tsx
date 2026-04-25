import { adminNavGroups } from '@/components/admin/admin-nav'
import { IwLogo } from '@/components/layout/IwLogo'
import type { StaffUser } from '@/lib/supabase/types'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AdminShell({ staff, children }: { staff: StaffUser; children: ReactNode }) {
  return (
    <div data-app="admin" className="min-h-screen bg-[var(--iw-slate)] text-[var(--iw-text)]">
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[var(--iw-sidebar-width)] flex-col border-r border-[var(--hairline)] bg-[var(--bg-1)] md:flex">
        <div className="flex h-[var(--iw-topbar-height)] items-center border-b border-[var(--hairline)] px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <IwLogo height={26} />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--iw-text-3)]">
              Admin OS
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {adminNavGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="iw-label mb-2 px-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex rounded-lg px-3 py-2 text-sm font-medium text-[var(--iw-text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--iw-text)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-[var(--hairline)] p-4 text-xs text-[var(--iw-text-3)]">
          <p className="font-medium text-[var(--iw-text)]">{staff.display_name || staff.email}</p>
          <p className="mt-1 uppercase tracking-[0.1em]">{staff.role}</p>
        </div>
      </aside>
      <header className="iw-topbar-glass fixed left-0 right-0 top-0 z-40 flex h-[var(--iw-topbar-height)] items-center justify-between border-b border-[var(--hairline)] px-4 md:left-[var(--iw-sidebar-width)]">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[var(--iw-text-3)]">Staff console</p>
          <p className="text-sm font-medium text-[var(--iw-text)]">Live operational data</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="iw-chip iw-chip-teal">
            Client portal
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="pt-[var(--iw-topbar-height)] md:ml-[var(--iw-sidebar-width)]">{children}</main>
    </div>
  )
}
