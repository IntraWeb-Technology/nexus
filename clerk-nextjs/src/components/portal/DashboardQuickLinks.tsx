import Link from 'next/link'

const linkClass =
  'rounded-lg border border-[var(--iw-border)] bg-[var(--iw-slate-3)] px-3 py-2 text-sm text-[var(--iw-text)] transition-colors hover:border-[var(--iw-teal)] hover:text-[var(--iw-teal-light)]'

export function DashboardQuickLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/progress" className={linkClass}>
        Project progress
      </Link>
      <Link href="/billing" className={linkClass}>
        Billing
      </Link>
      <Link href="/messages" className={linkClass}>
        Messages
      </Link>
      <Link href="/activity" className={linkClass}>
        Activity
      </Link>
      <Link href="/documents" className={linkClass}>
        Documents
      </Link>
    </div>
  )
}
