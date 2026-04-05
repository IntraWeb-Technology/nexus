import Link from 'next/link'
import { NavItem } from '@/components/layout/NavItem'
import { Badge } from '@/components/ui/Badge'

const icon = (d: string) => (
  <span className="inline-block h-4 w-4 text-center text-xs" aria-hidden>
    {d}
  </span>
)

export function Sidebar({
  projectSlug,
  planLabel,
  unreadMessages,
  unreadNotifications,
}: {
  projectSlug: string
  planLabel: string
  unreadMessages: number
  unreadNotifications: number
}) {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[210px] flex-col border-r border-[var(--iw-border)] bg-[var(--iw-slate-2)] pt-[54px] md:flex">
      <div className="border-b border-[var(--iw-border)] p-4">
        <p className="iw-mono text-sm font-medium text-[var(--iw-text)]">{projectSlug}</p>
        <Badge variant="teal">{planLabel}</Badge>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-3 text-sm">
        <div>
          <p className="iw-label mb-2 px-2">Overview</p>
          <NavItem href="/dashboard" icon={icon('◆')} label="Dashboard" />
          <NavItem href="/progress" icon={icon('▣')} label="Project Progress" />
          <NavItem href="/activity" icon={icon('☰')} label="Activity Log" />
        </div>
        <div>
          <p className="iw-label mb-2 px-2">Communication</p>
          <NavItem
            href="/messages"
            icon={icon('✉')}
            label="Messages"
            badge={unreadMessages}
          />
          <NavItem
            href="/notifications"
            icon={icon('◇')}
            label="Notifications"
            badge={unreadNotifications}
          />
        </div>
        <div>
          <p className="iw-label mb-2 px-2">Project</p>
          <NavItem href="/documents" icon={icon('▤')} label="Documents" />
          <NavItem href="/scope" icon={icon('◎')} label="Scope of Work" />
        </div>
        <div>
          <p className="iw-label mb-2 px-2">Account</p>
          <NavItem href="/billing" icon={icon('$')} label="Billing" />
          <NavItem href="/settings" icon={icon('⚙')} label="Settings" />
          <NavItem href="/help" icon={icon('?')} label="Help & FAQ" />
        </div>
      </nav>
      <div className="border-t border-[var(--iw-border)] p-3">
        <Link
          href="mailto:john.schibelli@intrawebtech.com"
          className="text-xs text-[var(--iw-teal-light)] hover:underline"
        >
          Contact support
        </Link>
      </div>
    </aside>
  )
}
