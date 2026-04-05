import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { IwLogoMark } from '@/components/layout/IwLogoMark'

export function Topbar({
  clientName,
  projectSlug,
  unreadNotifications,
}: {
  clientName: string
  projectSlug: string
  unreadNotifications: number
}) {
  const initials = clientName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[54px] items-center justify-between border-b border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-4 md:left-[210px]">
      <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-3">
        <div className="flex items-center gap-2">
          <IwLogoMark />
          <span className="truncate text-sm font-medium text-[var(--iw-text)]">
            IntraWeb OS — Client Portal
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative rounded border border-[var(--iw-border)] p-2 text-[var(--iw-text-2)] hover:text-[var(--iw-text)]"
          aria-label="Notifications"
        >
          <span className="text-base">🔔</span>
          {unreadNotifications > 0 ? (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--iw-red)]" />
          ) : null}
        </Link>
        <div className="hidden text-right text-xs sm:block">
          <p className="font-medium text-[var(--iw-text)]">{clientName}</p>
          <p className="iw-mono text-[var(--iw-text-3)]">{projectSlug}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded border border-[var(--iw-border)] bg-[var(--iw-slate-3)] text-xs font-medium text-[var(--iw-text)] md:hidden">
          {initials}
        </div>
        <UserButton />
      </div>
    </header>
  )
}
