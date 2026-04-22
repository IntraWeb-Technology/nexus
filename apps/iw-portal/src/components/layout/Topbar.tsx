import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { IwLogo } from '@/components/layout/IwLogo'
import { ProjectSwitcher } from '@/components/portal/ProjectSwitcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import type { Project } from '@/lib/supabase/types'

function topbarSlugLine(
  activeSlug: string,
  hubspotDealId: string | null | undefined,
  hubspotContactId: string | null | undefined,
): string {
  if (activeSlug.startsWith('cl-') && (hubspotDealId?.trim() || hubspotContactId?.trim())) {
    const parts: string[] = []
    if (hubspotContactId?.trim()) parts.push(`HubSpot contact ${hubspotContactId.trim()}`)
    if (hubspotDealId?.trim()) parts.push(`deal ${hubspotDealId.trim()}`)
    return parts.length ? `${parts.join(' · ')} · portal ${activeSlug}` : activeSlug
  }
  return activeSlug
}

export function Topbar({
  clientName,
  projects,
  activeSlug,
  activeHubspotDealId,
  activeHubspotContactId,
  unreadNotifications,
}: {
  clientName: string
  projects: Project[]
  activeSlug: string
  activeHubspotDealId?: string | null
  activeHubspotContactId?: string | null
  unreadNotifications: number
}) {
  const initials = clientName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[var(--iw-topbar-height)] items-center justify-between border-b border-[var(--iw-border)] bg-[var(--iw-slate-2)] px-4 transition-[background-color,border-color] duration-300 md:left-[var(--iw-sidebar-width)]">
      {/* Single-row layout on all screen sizes — prevents 2-row overflow in 64px header */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-3">
          {/* Logo visible on mobile only — desktop shows it in the sidebar header */}
          <IwLogo height={26} className="md:hidden" />
          <span className="hidden text-sm font-medium text-[var(--iw-text-2)] md:block">
            Client Portal
          </span>
        </div>
        {/* Project switcher visible on mobile only (desktop shows it in the sidebar) */}
        <div className="w-full max-w-[200px] md:hidden">
          <ProjectSwitcher projects={projects} activeSlug={activeSlug} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-[var(--iw-radius-control)] border border-[var(--iw-border)] bg-[var(--iw-slate-3)]/40 text-[var(--iw-text-2)] transition-[border-color,background-color,color] duration-200 hover:border-[var(--iw-border-2)] hover:bg-[var(--iw-slate-3)] hover:text-[var(--iw-text)]"
          aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M13 9.5V6.5a5 5 0 0 0-10 0v3l-1 2h12l-1-2Z"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 13.5a1.5 1.5 0 0 0 3 0"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          {unreadNotifications > 0 ? (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[var(--iw-red)]" aria-hidden="true" />
          ) : null}
        </Link>
        <div className="hidden max-w-[min(280px,40vw)] text-right text-xs sm:block">
          <p className="font-medium text-[var(--iw-text)]">{clientName}</p>
          <p className="iw-mono break-all text-[var(--iw-text-3)]" title={activeSlug}>
            {topbarSlugLine(activeSlug, activeHubspotDealId, activeHubspotContactId)}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded border border-[var(--iw-border)] bg-[var(--iw-slate-3)] text-xs font-medium text-[var(--iw-text)] md:hidden">
          {initials}
        </div>
        <UserButton />
      </div>
    </header>
  )
}
