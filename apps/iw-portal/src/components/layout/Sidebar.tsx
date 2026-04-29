import Link from 'next/link'
import { NavItem } from '@/components/layout/NavItem'
import { portalNavGroups } from '@/components/layout/portal-nav'
import { ProjectSwitcher } from '@/components/portal/ProjectSwitcher'
import { IwLogo } from '@/components/layout/IwLogo'
import type { Project } from '@/lib/supabase/types'
import type { ReactNode } from 'react'

// ─── Nav SVG icons ───────────────────────────────────────────────────────────

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
      {children}
    </span>
  )
}

const icons = {
  dashboard: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </Icon>
  ),
  progress: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 11l3.5-4 3 2 3.5-5 3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 13.5h13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  messages: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M13 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2l2 2 2-2h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    </Icon>
  ),
  notifications: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M12.5 9V6a5 5 0 0 0-10 0v3L1.5 11h12L12.5 9Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M6 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  documents: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M4 1.5h5.5L12 4v9a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 3 13V2a.5.5 0 0 1 1-.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M9.5 1.5V4H12" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M5.5 7.5h4M5.5 10h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  changeOrders: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M10 1.5L13.5 5 5.5 13H2v-3.5L10 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8.5 3l3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  scope: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M4.5 5h6M4.5 7.5h6M4.5 10h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  billing: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M1 6h13" stroke="currentColor" strokeWidth="1.25" />
        <path d="M4 9.5h2M9 9.5h2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  settings: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.25" />
        <path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.2 3.2l.7.7M11.1 11.1l.7.7M3.2 11.8l.7-.7M11.1 3.9l.7-.7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </Icon>
  ),
  help: (
    <Icon>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5.5 5.5a2 2 0 1 1 2.83 1.83C7.83 7.66 7.5 8 7.5 8.5V9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="7.5" cy="11" r="0.75" fill="currentColor" />
      </svg>
    </Icon>
  ),
}

const iconByHref: Record<string, ReactNode> = {
  '/dashboard': icons.dashboard,
  '/progress': icons.progress,
  '/messages': icons.messages,
  '/notifications': icons.notifications,
  '/documents': icons.documents,
  '/change-orders': icons.changeOrders,
  '/scope': icons.scope,
  '/billing': icons.billing,
  '/settings': icons.settings,
  '/help': icons.help,
}

// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar({
  projects,
  activeSlug,
  unreadMessages,
  unreadNotifications,
}: {
  projects: Project[]
  activeSlug: string
  unreadMessages: number
  unreadNotifications: number
}) {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[var(--iw-sidebar-width)] flex-col border-r border-[var(--hairline)] bg-[var(--bg-1)] transition-[background-color,border-color] duration-300 md:flex">
      {/* Logo header — fills the same height as the topbar, aligned with it */}
      <div className="flex h-[var(--iw-topbar-height)] shrink-0 items-center border-b border-[var(--hairline)] px-4">
        <IwLogo height={26} />
      </div>
      <div className="border-b border-[var(--hairline)] p-4">
        <div className="mt-2">
          <ProjectSwitcher projects={projects} activeSlug={activeSlug} />
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-3 text-sm">
        {portalNavGroups.map((group) => (
          <div key={group.label}>
            <p className="iw-label mb-2 px-2">{group.label}</p>
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={iconByHref[item.href]}
                label={item.label}
                badge={
                  item.href === '/messages'
                    ? unreadMessages
                    : item.href === '/notifications'
                      ? unreadNotifications
                      : undefined
                }
              />
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-[var(--hairline)] p-3">
        <Link
          href="mailto:john.schibelli@intrawebtech.com"
          className="text-xs text-[var(--iw-teal-light)] transition-colors duration-200 hover:text-[var(--iw-teal)] hover:underline"
        >
          Contact support
        </Link>
      </div>
    </aside>
  )
}
